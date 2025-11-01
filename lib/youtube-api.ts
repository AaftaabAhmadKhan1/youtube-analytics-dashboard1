import axios from 'axios';
import type { ChannelData, VideoData, CommentData } from '@/types/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Cache duration in seconds
const CACHE_DURATION = 3600; // 1 hour

export class YouTubeAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get channel ID from channel name/handle
  async getChannelIdByName(channelName: string): Promise<string | null> {
    try {
      const cleanName = channelName.replace('@', '');
      
      // Try search first
      const searchUrl = `${YOUTUBE_API_BASE}/search`;
      const searchResponse = await axios.get(searchUrl, {
        params: {
          part: 'snippet',
          q: cleanName,
          type: 'channel',
          maxResults: 1,
          key: this.apiKey,
        },
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        return searchResponse.data.items[0].snippet.channelId;
      }

      // Try by forUsername if search fails
      const channelUrl = `${YOUTUBE_API_BASE}/channels`;
      const channelResponse = await axios.get(channelUrl, {
        params: {
          part: 'id',
          forUsername: cleanName,
          key: this.apiKey,
        },
      });

      if (channelResponse.data.items && channelResponse.data.items.length > 0) {
        return channelResponse.data.items[0].id;
      }

      return null;
    } catch (error) {
      console.error('Error fetching channel ID:', error);
      return null;
    }
  }

  // Get channel details
  async getChannelData(channelId: string): Promise<ChannelData | null> {
    try {
      const url = `${YOUTUBE_API_BASE}/channels`;
      const response = await axios.get(url, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: channelId,
          key: this.apiKey,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const channel = response.data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl || '',
        thumbnail: channel.snippet.thumbnails.medium.url,
        viewCount: channel.statistics.viewCount,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
      };
    } catch (error) {
      console.error('Error fetching channel data:', error);
      return null;
    }
  }

  // Get all videos from a playlist (uploads)
  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<string[]> {
    try {
      const videoIds: string[] = [];
      let nextPageToken: string | undefined;

      do {
        const url = `${YOUTUBE_API_BASE}/playlistItems`;
        const response = await axios.get(url, {
          params: {
            part: 'contentDetails',
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: this.apiKey,
          },
        });

        const items = response.data.items || [];
        videoIds.push(...items.map((item: any) => item.contentDetails.videoId));

        nextPageToken = response.data.nextPageToken;

        if (videoIds.length >= maxResults) break;
      } while (nextPageToken);

      return videoIds.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      return [];
    }
  }

  // Get detailed video data with parallel batch processing
  async getVideosData(videoIds: string[]): Promise<VideoData[]> {
    try {
      // YouTube API allows max 50 IDs per request
      const chunks = this.chunkArray(videoIds, 50);

      // Process all chunks in parallel for faster loading
      const promises = chunks.map(async (chunk) => {
        const url = `${YOUTUBE_API_BASE}/videos`;
        const response = await axios.get(url, {
          params: {
            part: 'snippet,statistics,contentDetails',
            id: chunk.join(','),
            key: this.apiKey,
          },
        });

        const items = response.data.items || [];
        return items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails.medium.url,
          viewCount: item.statistics.viewCount || '0',
          likeCount: item.statistics.likeCount || '0',
          commentCount: item.statistics.commentCount || '0',
          duration: item.contentDetails.duration,
          tags: item.snippet.tags || [],
        }));
      });

      // Wait for all parallel requests to complete
      const results = await Promise.all(promises);
      
      // Flatten the array of arrays into a single array
      const videos = results.flat();

      return videos;
    } catch (error) {
      console.error('Error fetching videos data:', error);
      return [];
    }
  }

  // Get video comments
  async getVideoComments(videoId: string, maxResults: number = 100): Promise<CommentData[]> {
    try {
      const comments: CommentData[] = [];
      let nextPageToken: string | undefined;

      do {
        const url = `${YOUTUBE_API_BASE}/commentThreads`;
        const response = await axios.get(url, {
          params: {
            part: 'snippet',
            videoId: videoId,
            maxResults: 100,
            order: 'relevance',
            pageToken: nextPageToken,
            key: this.apiKey,
          },
        });

        const items = response.data.items || [];
        comments.push(
          ...items.map((item: any) => {
            const comment = item.snippet.topLevelComment.snippet;
            return {
              id: item.id,
              author: comment.authorDisplayName,
              authorProfileImageUrl: comment.authorProfileImageUrl,
              text: comment.textDisplay,
              likeCount: comment.likeCount,
              publishedAt: comment.publishedAt,
            };
          })
        );

        nextPageToken = response.data.nextPageToken;

        if (comments.length >= maxResults) break;
      } while (nextPageToken && comments.length < maxResults);

      return comments.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Utility function to chunk arrays
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
