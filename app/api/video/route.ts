import { NextRequest, NextResponse } from 'next/server';
import { YouTubeAPI } from '@/lib/youtube-api';

export const runtime = 'edge';

// Simple sentiment analysis
function analyzeSentiment(text: string): number {
  const positive = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'best',
    'fantastic', 'wonderful', 'perfect', 'brilliant', 'outstanding',
    'helpful', 'thanks', 'thank', 'nice', 'beautiful', 'superb'
  ];
  
  const negative = [
    'bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'horrible',
    'disappointing', 'useless', 'waste', 'boring', 'annoying', 'stupid'
  ];

  const lowerText = text.toLowerCase();
  let score = 0;

  positive.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });

  negative.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });

  return score;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Video ID is required' },
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
    
    // Get video data
    const videos = await youtube.getVideosData([videoId]);
    if (!videos || videos.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Get comments
    const comments = await youtube.getVideoComments(videoId, 100);

    // Analyze sentiment
    const totalSentiment = comments.reduce(
      (sum, comment) => sum + analyzeSentiment(comment.text),
      0
    );
    const sentimentScore = comments.length > 0 
      ? totalSentiment / comments.length 
      : 0;

    // Find top commenters
    const commenterCounts = comments.reduce((acc, comment) => {
      acc[comment.author] = (acc[comment.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCommenters = Object.entries(commenterCounts)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const response = {
      video: videos[0],
      comments: comments,
      sentimentScore: sentimentScore,
      topCommenters: topCommenters,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error in video API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
