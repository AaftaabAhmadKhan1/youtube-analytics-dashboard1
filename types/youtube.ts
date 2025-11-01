// Types for YouTube API responses
export interface ChannelData {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnail: string;
  viewCount: string;
  subscriberCount: string;
  videoCount: string;
  uploadsPlaylistId: string;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  tags: string[];
  // Advanced metrics
  dislikeCount?: string;
  favoriteCount?: string;
  categoryId?: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
}

export interface VideoAnalytics {
  // Engagement metrics
  engagementRate: number;
  likeToViewRatio: number;
  commentToViewRatio: number;
  averageViewDuration?: number;
  
  // SEO metrics
  titleLength: number;
  descriptionLength: number;
  tagCount: number;
  hasCustomThumbnail: boolean;
  titleSeoScore: number;
  descriptionSeoScore: number;
  
  // Performance estimates
  estimatedCTR?: number;
  estimatedWatchTime?: number;
  viralityScore: number;
  
  // Time-based metrics
  videoDurationSeconds: number;
  videoDurationFormatted: string;
  publishedDaysAgo: number;
  viewsPerDay: number;
  
  // Comparison metrics
  performanceVsAverage: number; // percentage above/below channel average
}

export interface CommentData {
  id: string;
  author: string;
  authorProfileImageUrl: string;
  text: string;
  likeCount: number;
  publishedAt: string;
}

export interface VideoStats {
  video: VideoData;
  comments: CommentData[];
  sentimentScore: number;
  topCommenters: Array<{ author: string; count: number }>;
}

export interface DashboardData {
  channel: ChannelData;
  videos: VideoData[];
  totalVideos: number;
  hasMore?: boolean;
}
