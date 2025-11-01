import { VideoData, VideoAnalytics } from '@/types/youtube';

/**
 * Calculate comprehensive analytics for a video
 */
export function calculateVideoAnalytics(
  video: VideoData,
  channelAverageViews?: number
): VideoAnalytics {
  // Safety checks for undefined values
  if (!video) {
    throw new Error('Video data is required');
  }
  
  const views = parseInt(video.viewCount || '0') || 0;
  const likes = parseInt(video.likeCount || '0') || 0;
  const comments = parseInt(video.commentCount || '0') || 0;
  
  // Parse duration (ISO 8601 format: PT1H2M10S)
  const durationSeconds = parseDuration(video.duration || 'PT0S');
  
  // Calculate days since published
  const publishedDate = new Date(video.publishedAt || Date.now());
  const now = new Date();
  const daysAgo = Math.max(1, Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Engagement metrics
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
  const likeToViewRatio = views > 0 ? (likes / views) * 100 : 0;
  const commentToViewRatio = views > 0 ? (comments / views) * 100 : 0;
  
  // SEO Analysis
  const titleLength = (video.title || '').length;
  const descriptionLength = (video.description || '').length;
  const tagCount = (video.tags || []).length;
  
  // SEO Scoring
  const titleSeoScore = calculateTitleSEO(video.title || '');
  const descriptionSeoScore = calculateDescriptionSEO(video.description || '', video.tags || []);
  
  // Performance metrics
  const viewsPerDay = views / daysAgo;
  const performanceVsAverage = channelAverageViews 
    ? ((views - channelAverageViews) / channelAverageViews) * 100 
    : 0;
  
  // Virality Score (based on views per day and engagement)
  const viralityScore = calculateViralityScore(viewsPerDay, engagementRate, daysAgo);
  
  // Estimated CTR (industry average is 2-10% for YouTube)
  // Higher engagement usually correlates with higher CTR
  const estimatedCTR = estimateCTR(engagementRate, likeToViewRatio, titleSeoScore);
  
  // Estimated watch time (views * estimated average view duration)
  // Assume 40-60% average view duration based on engagement
  const avgViewDurationPercent = Math.min(80, 30 + (engagementRate * 2));
  const estimatedWatchTime = (views * durationSeconds * avgViewDurationPercent) / 100;
  
  return {
    engagementRate: parseFloat(engagementRate.toFixed(2)),
    likeToViewRatio: parseFloat(likeToViewRatio.toFixed(2)),
    commentToViewRatio: parseFloat(commentToViewRatio.toFixed(2)),
    averageViewDuration: parseFloat(avgViewDurationPercent.toFixed(1)),
    
    titleLength,
    descriptionLength,
    tagCount,
    hasCustomThumbnail: true, // Assume custom thumbnail (can't verify via API)
    titleSeoScore: parseFloat(titleSeoScore.toFixed(1)),
    descriptionSeoScore: parseFloat(descriptionSeoScore.toFixed(1)),
    
    estimatedCTR: parseFloat(estimatedCTR.toFixed(2)),
    estimatedWatchTime: Math.round(estimatedWatchTime / 3600), // Convert to hours
    viralityScore: parseFloat(viralityScore.toFixed(1)),
    
    videoDurationSeconds: durationSeconds,
    videoDurationFormatted: formatDuration(durationSeconds),
    publishedDaysAgo: daysAgo,
    viewsPerDay: parseFloat(viewsPerDay.toFixed(0)),
    
    performanceVsAverage: parseFloat(performanceVsAverage.toFixed(1)),
  };
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds to readable duration
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Calculate Title SEO Score (0-100)
 */
function calculateTitleSEO(title: string): number {
  let score = 0;
  const length = title.length;
  
  // Optimal length: 50-70 characters
  if (length >= 50 && length <= 70) {
    score += 30;
  } else if (length >= 40 && length < 50) {
    score += 20;
  } else if (length > 70 && length <= 100) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Contains numbers (good for engagement)
  if (/\d/.test(title)) score += 15;
  
  // Contains power words
  const powerWords = ['best', 'top', 'how to', 'guide', 'tutorial', 'tips', 'tricks', 'secrets', 'ultimate', 'complete'];
  if (powerWords.some(word => title.toLowerCase().includes(word))) score += 15;
  
  // Contains brackets/parentheses (good for CTR)
  if (/[\[\(\{]/.test(title)) score += 10;
  
  // Not too many special characters
  const specialChars = title ? ((title.match(/[!?@#$%^&*]/g) || []).length) : 0;
  if (specialChars <= 2) score += 10;
  
  // Starts with capital letter
  if (/^[A-Z]/.test(title)) score += 10;
  
  // Not all caps
  if (title !== title.toUpperCase()) score += 10;
  
  return Math.min(100, score);
}

/**
 * Calculate Description SEO Score (0-100)
 */
function calculateDescriptionSEO(description: string, tags: string[]): number {
  let score = 0;
  const length = description.length;
  
  // Length score (optimal: 150-300 characters)
  if (length >= 150 && length <= 300) {
    score += 25;
  } else if (length >= 100 && length < 150) {
    score += 15;
  } else if (length > 300 && length <= 500) {
    score += 20;
  } else if (length > 500) {
    score += 10;
  }
  
  // Contains links
  if (/https?:\/\//.test(description)) score += 15;
  
  // Contains hashtags
  const hashtags = description ? ((description.match(/#\w+/g) || []).length) : 0;
  if (hashtags >= 1 && hashtags <= 5) score += 15;
  
  // Contains timestamps
  if (/\d{1,2}:\d{2}/.test(description)) score += 10;
  
  // Contains call-to-action keywords
  const ctaWords = ['subscribe', 'like', 'comment', 'share', 'follow', 'check out', 'visit'];
  if (ctaWords.some(word => description.toLowerCase().includes(word))) score += 10;
  
  // Has adequate tags
  if (tags.length >= 5 && tags.length <= 15) {
    score += 15;
  } else if (tags.length >= 3 && tags.length < 5) {
    score += 10;
  }
  
  // Multiple paragraphs (better readability)
  const paragraphs = description.split('\n\n').filter(p => p.trim().length > 0).length;
  if (paragraphs >= 2) score += 10;
  
  return Math.min(100, score);
}

/**
 * Calculate Virality Score (0-100)
 */
function calculateViralityScore(viewsPerDay: number, engagementRate: number, daysAgo: number): number {
  // Recent videos with high views per day are more viral
  const recencyFactor = Math.max(0, 1 - (daysAgo / 365)); // Decay over a year
  const viewScore = Math.min(50, Math.log10(viewsPerDay + 1) * 10);
  const engagementScore = Math.min(30, engagementRate * 3);
  const recencyBonus = recencyFactor * 20;
  
  return Math.min(100, viewScore + engagementScore + recencyBonus);
}

/**
 * Estimate Click-Through Rate (2-10% is typical)
 */
function estimateCTR(engagementRate: number, likeRatio: number, titleScore: number): number {
  // Base CTR of 3%
  let ctr = 3.0;
  
  // High engagement suggests good CTR
  ctr += (engagementRate / 10) * 2;
  
  // Good like ratio suggests appealing content
  ctr += (likeRatio / 5) * 1;
  
  // Good title SEO suggests better CTR
  ctr += (titleScore / 100) * 3;
  
  // Cap between 1% and 15%
  return Math.max(1, Math.min(15, ctr));
}

/**
 * Get performance rating based on engagement
 */
export function getPerformanceRating(engagementRate: number): {
  rating: string;
  color: string;
  description: string;
} {
  if (engagementRate >= 5) {
    return {
      rating: 'Excellent',
      color: 'text-green-600 dark:text-green-400',
      description: 'Outstanding engagement! Your audience loves this content.',
    };
  } else if (engagementRate >= 3) {
    return {
      rating: 'Very Good',
      color: 'text-blue-600 dark:text-blue-400',
      description: 'Great engagement! Keep up the good work.',
    };
  } else if (engagementRate >= 2) {
    return {
      rating: 'Good',
      color: 'text-yellow-600 dark:text-yellow-400',
      description: 'Solid engagement. Room for improvement.',
    };
  } else if (engagementRate >= 1) {
    return {
      rating: 'Fair',
      color: 'text-orange-600 dark:text-orange-400',
      description: 'Below average engagement. Consider improving content strategy.',
    };
  } else {
    return {
      rating: 'Needs Improvement',
      color: 'text-red-600 dark:text-red-400',
      description: 'Low engagement. Focus on audience retention and interaction.',
    };
  }
}

/**
 * Get SEO rating
 */
export function getSEORating(score: number): {
  rating: string;
  color: string;
} {
  if (score >= 80) {
    return { rating: 'Excellent', color: 'text-green-600 dark:text-green-400' };
  } else if (score >= 60) {
    return { rating: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  } else if (score >= 40) {
    return { rating: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
  } else {
    return { rating: 'Poor', color: 'text-red-600 dark:text-red-400' };
  }
}
