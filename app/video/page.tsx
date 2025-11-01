'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { ArrowLeft, Calendar, Eye, ThumbsUp, MessageSquare, Clock, TrendingUp, User, Award } from 'lucide-react';
import { VideoStats } from '@/types/youtube';
import { formatNumber, formatDate, formatDateDetailed, formatDuration } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { CommentsList } from '@/components/CommentsList';
import { SentimentChart } from '@/components/SentimentChart';
import { CommentTrendsChart } from '@/components/CommentTrendsChart';
import { TopCommenters } from '@/components/TopCommenters';
import { VideoAnalyticsDisplay } from '@/components/VideoAnalyticsDisplay';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VideoAnalysisPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams?.get('id') || null;

  const { data, error, isLoading } = useSWR<VideoStats>(
    videoId ? `/api/video?id=${videoId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  if (!videoId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Video Selected
          </h2>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Video Analysis & Comments</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error loading video data</p>
            <p className="text-sm">{error.message || 'Failed to fetch video data'}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-fade-in">
            {/* Video Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Video Thumbnail and Info */}
                <div className="lg:col-span-1">
                  <div className="relative aspect-video mb-4">
                    <Image
                      src={data.video.thumbnail}
                      alt={data.video.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(data.video.duration)}
                    </div>
                  </div>
                  <a
                    href={`https://youtube.com/watch?v=${data.video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Watch on YouTube
                  </a>
                </div>

                {/* Video Stats */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {data.video.title}
                  </h2>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    Published: {formatDate(data.video.publishedAt)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                        <Eye className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Views</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(data.video.viewCount)}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Likes</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(data.video.likeCount)}
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-center text-purple-600 dark:text-purple-400 mb-2">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Comments</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(data.video.commentCount)}
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <div className="flex items-center text-orange-600 dark:text-orange-400 mb-2">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Engagement</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {((parseInt(data.video.likeCount) / parseInt(data.video.viewCount)) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {data.video.tags && data.video.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Tags:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.video.tags.slice(0, 10).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Analytics Section */}
            <VideoAnalyticsDisplay video={data.video} />

            {/* Comments Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <SentimentChart comments={data.comments} />

              {/* Top Commenters */}
              <TopCommenters topCommenters={data.topCommenters} />
            </div>

            {/* Comment Trends */}
            <CommentTrendsChart comments={data.comments} />

            {/* Sentiment Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Overall Sentiment Score
              </h3>
              <div className="flex items-center justify-center">
                <div className={`text-6xl font-bold ${
                  data.sentimentScore > 0 
                    ? 'text-green-600' 
                    : data.sentimentScore < 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {data.sentimentScore.toFixed(2)}
                </div>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                {data.sentimentScore > 0 
                  ? '😊 Positive sentiment overall' 
                  : data.sentimentScore < 0 
                  ? '😞 Negative sentiment overall' 
                  : '😐 Neutral sentiment overall'}
              </p>
            </div>

            {/* Comments List */}
            <CommentsList comments={data.comments} />
          </div>
        )}
      </div>
    </main>
  );
}
