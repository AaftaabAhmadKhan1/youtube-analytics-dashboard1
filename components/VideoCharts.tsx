'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { VideoData } from '@/types/youtube';
import { formatNumber } from '@/lib/utils';
import { downloadCSV, downloadChartAsImage } from '@/lib/export-utils';

interface ChartData {
  date: string;
  views: number;
  likes: number;
  comments: number;
}

interface VideoChartsProps {
  videos: VideoData[];
  topVideosCount: number | 'all';
}

export function VideoCharts({ videos, topVideosCount }: VideoChartsProps) {
  // The videos array is already filtered and limited by displayVideos
  const videoCount = videos.length;
  
  // Prepare data for timeline chart (use all videos passed, they're already limited)
  const timelineData: ChartData[] = videos
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    .map((video) => ({
      date: new Date(video.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      views: parseInt(video.viewCount),
      likes: parseInt(video.likeCount),
      comments: parseInt(video.commentCount),
    }));

  // Prepare data for top videos by views
  const topVideosByViews = [...videos]
    .sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount))
    .map((video) => ({
      title: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title,
      fullTitle: video.title,
      views: parseInt(video.viewCount),
      likes: parseInt(video.likeCount),
      comments: parseInt(video.commentCount),
    }));

  // Prepare data for top videos by likes
  const topVideosByLikes = [...videos]
    .sort((a, b) => parseInt(b.likeCount) - parseInt(a.likeCount))
    .map((video) => ({
      title: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title,
      fullTitle: video.title,
      likes: parseInt(video.likeCount),
      views: parseInt(video.viewCount),
    }));

  // Prepare data for top videos by comments
  const topVideosByComments = [...videos]
    .sort((a, b) => parseInt(b.commentCount) - parseInt(a.commentCount))
    .map((video) => ({
      title: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title,
      fullTitle: video.title,
      comments: parseInt(video.commentCount),
      views: parseInt(video.viewCount),
    }));

  // Download handlers
  const handleDownloadTimelineCSV = () => {
    downloadCSV(
      timelineData.map(item => ({
        Date: item.date,
        Views: item.views,
        Likes: item.likes,
        Comments: item.comments,
      })),
      'views-over-time.csv'
    );
  };

  const handleDownloadViewsCSV = () => {
    downloadCSV(
      topVideosByViews.map(item => ({
        Title: item.fullTitle,
        Views: item.views,
        Likes: item.likes,
        Comments: item.comments,
      })),
      'top-videos-by-views.csv'
    );
  };

  const handleDownloadLikesCSV = () => {
    downloadCSV(
      topVideosByLikes.map(item => ({
        Title: item.fullTitle,
        Likes: item.likes,
        Views: item.views,
      })),
      'top-videos-by-likes.csv'
    );
  };

  const handleDownloadCommentsCSV = () => {
    downloadCSV(
      topVideosByComments.map(item => ({
        Title: item.fullTitle,
        Comments: item.comments,
        Views: item.views,
      })),
      'top-videos-by-comments.csv'
    );
  };

  const handleDownloadEngagementCSV = () => {
    downloadCSV(
      timelineData.map(item => ({
        Date: item.date,
        Likes: item.likes,
        Comments: item.comments,
      })),
      'engagement-metrics.csv'
    );
  };

  return (
    <div className="space-y-8">
      {/* Views Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Views Over Time 
            {topVideosCount === 'all' ? ` (All ${videoCount} Videos)` : ` (Last ${videoCount} Videos)`}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => downloadChartAsImage('views-timeline-chart', 'views-over-time.png')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={handleDownloadTimelineCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
        <div id="views-timeline-chart">
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Top Videos by Views */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {topVideosCount === 'all' 
              ? `Top Videos by Views (All ${videoCount})` 
              : `Top ${videoCount} Videos by Views`}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => downloadChartAsImage('top-views-chart', 'top-videos-by-views.png')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={handleDownloadViewsCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
        <div id="top-views-chart">
          <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topVideosByViews} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <YAxis
              type="category"
              dataKey="title"
              stroke="#9CA3AF"
              style={{ fontSize: '11px' }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
            <Bar dataKey="views" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Top Videos by Likes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {topVideosCount === 'all' 
              ? `Top Videos by Likes (All ${videoCount})` 
              : `Top ${videoCount} Videos by Likes`}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => downloadChartAsImage('top-likes-chart', 'top-videos-by-likes.png')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={handleDownloadLikesCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
        <div id="top-likes-chart">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topVideosByLikes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis
                type="category"
                dataKey="title"
                stroke="#9CA3AF"
                style={{ fontSize: '11px' }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend />
              <Bar dataKey="likes" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Videos by Comments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {topVideosCount === 'all' 
              ? `Top Videos by Comments (All ${videoCount})` 
              : `Top ${videoCount} Videos by Comments`}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => downloadChartAsImage('top-comments-chart', 'top-videos-by-comments.png')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={handleDownloadCommentsCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
        <div id="top-comments-chart">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topVideosByComments} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis
                type="category"
                dataKey="title"
                stroke="#9CA3AF"
                style={{ fontSize: '11px' }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend />
              <Bar dataKey="comments" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Engagement Metrics 
            {topVideosCount === 'all' ? ` (All ${videoCount} Videos)` : ` (Last ${videoCount} Videos)`}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => downloadChartAsImage('engagement-chart', 'engagement-metrics.png')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={handleDownloadEngagementCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
        <div id="engagement-chart">
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="likes"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="comments"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
