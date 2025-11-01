'use client';

import { VideoData, VideoAnalytics } from '@/types/youtube';
import { calculateVideoAnalytics, getPerformanceRating, getSEORating } from '@/lib/analytics-calculator';
import { TrendingUp, Clock, Eye, Target, Search, Award, Zap, BarChart3 } from 'lucide-react';

interface VideoAnalyticsDisplayProps {
  video: VideoData;
  channelAverageViews?: number;
}

export function VideoAnalyticsDisplay({ video, channelAverageViews }: VideoAnalyticsDisplayProps) {
  const analytics = calculateVideoAnalytics(video, channelAverageViews);
  const performanceRating = getPerformanceRating(analytics.engagementRate);
  const titleSeoRating = getSEORating(analytics.titleSeoScore);
  const descSeoRating = getSEORating(analytics.descriptionSeoScore);

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Performance Overview
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</p>
              <p className={`text-2xl font-bold ${performanceRating.color}`}>
                {performanceRating.rating}
              </p>
            </div>
            <TrendingUp className={`w-12 h-12 ${performanceRating.color}`} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            {performanceRating.description}
          </p>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Engagement Metrics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Engagement Rate"
            value={`${analytics.engagementRate}%`}
            description="Likes + Comments / Views"
            color="blue"
          />
          <MetricCard
            label="Like Rate"
            value={`${analytics.likeToViewRatio}%`}
            description="Likes / Views"
            color="green"
          />
          <MetricCard
            label="Comment Rate"
            value={`${analytics.commentToViewRatio}%`}
            description="Comments / Views"
            color="purple"
          />
        </div>
      </div>

      {/* SEO Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            SEO Analysis
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* Title SEO */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title SEO Score
              </span>
              <span className={`text-lg font-bold ${titleSeoRating.color}`}>
                {analytics.titleSeoScore}/100 - {titleSeoRating.rating}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${analytics.titleSeoScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Length: {analytics.titleLength} characters (Optimal: 50-70)
            </p>
          </div>

          {/* Description SEO */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description SEO Score
              </span>
              <span className={`text-lg font-bold ${descSeoRating.color}`}>
                {analytics.descriptionSeoScore}/100 - {descSeoRating.rating}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${analytics.descriptionSeoScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Length: {analytics.descriptionLength} characters | Tags: {analytics.tagCount}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Estimates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Performance Estimates
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            label="Estimated CTR"
            value={`${analytics.estimatedCTR}%`}
            description="Click-Through Rate (Industry avg: 2-10%)"
            color="orange"
            icon={<Target className="w-5 h-5" />}
          />
          <MetricCard
            label="Avg. View Duration"
            value={`${analytics.averageViewDuration}%`}
            description="Estimated percentage watched"
            color="purple"
            icon={<Clock className="w-5 h-5" />}
          />
          <MetricCard
            label="Est. Watch Time"
            value={`${analytics.estimatedWatchTime}h`}
            description="Total estimated watch hours"
            color="blue"
            icon={<Eye className="w-5 h-5" />}
          />
          <MetricCard
            label="Virality Score"
            value={`${analytics.viralityScore}/100`}
            description="Growth potential indicator"
            color="red"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Time-Based Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Time-Based Metrics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Video Duration"
            value={analytics.videoDurationFormatted}
            description={`${analytics.videoDurationSeconds} seconds`}
            color="indigo"
          />
          <MetricCard
            label="Published"
            value={`${analytics.publishedDaysAgo} days ago`}
            description={new Date(video.publishedAt).toLocaleDateString()}
            color="pink"
          />
          <MetricCard
            label="Views/Day"
            value={analytics.viewsPerDay.toLocaleString()}
            description="Average daily views"
            color="cyan"
          />
        </div>
      </div>

      {/* Comparison Metrics */}
      {channelAverageViews && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Channel Comparison
            </h3>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Performance vs Channel Average
              </span>
              <span className={`text-2xl font-bold ${
                analytics.performanceVsAverage >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {analytics.performanceVsAverage >= 0 ? '+' : ''}
                {analytics.performanceVsAverage.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {analytics.performanceVsAverage >= 0 
                ? 'This video is performing above channel average!' 
                : 'This video is performing below channel average.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'pink' | 'cyan' | 'yellow';
  icon?: React.ReactNode;
}

function MetricCard({ label, value, description, color, icon }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {icon && <div className="text-gray-600 dark:text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
