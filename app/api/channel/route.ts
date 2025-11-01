import { NextRequest, NextResponse } from 'next/server';
import { YouTubeAPI } from '@/lib/youtube-api';

export const runtime = 'edge'; // Use edge runtime for faster responses

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channelName = searchParams.get('name');

  if (!channelName) {
    return NextResponse.json(
      { error: 'Channel name is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API key not configured' },
      { status: 500 }
    );
  }

  try {
    const youtube = new YouTubeAPI(apiKey);
    
    // Get channel ID
    const channelId = await youtube.getChannelIdByName(channelName);
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Get channel data
    const channelData = await youtube.getChannelData(channelId);
    if (!channelData) {
      return NextResponse.json(
        { error: 'Failed to fetch channel data' },
        { status: 404 }
      );
    }

    // Optimize: Smart fetching based on request
    const requestedMax = searchParams.get('maxResults');
    const maxResults = requestedMax ? parseInt(requestedMax) : 200;
    
    // Get video IDs from uploads playlist (this is fast, just IDs)
    const videoIds = await youtube.getPlaylistVideos(
      channelData.uploadsPlaylistId,
      maxResults
    );

    // Get detailed video data in optimized batches
    // For large requests, process in parallel for faster loading
    const videos = await youtube.getVideosData(videoIds);

    const response = {
      channel: channelData,
      videos: videos,
      totalVideos: videos.length,
      hasMore: videos.length >= maxResults,
    };

    // Aggressive caching: 6 hours for large datasets, 2 hours for small
    const cacheMaxAge = maxResults > 200 ? 21600 : 7200; // 6 hours or 2 hours
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}, stale-while-revalidate=86400, immutable`,
        'CDN-Cache-Control': `public, s-maxage=${cacheMaxAge}, immutable`,
      },
    });
  } catch (error) {
    console.error('Error in channel API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
