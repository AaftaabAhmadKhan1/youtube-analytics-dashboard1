'use client';

import { CommentData } from '@/types/youtube';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { downloadCSV, downloadChartAsImage } from '@/lib/export-utils';

interface CommentTrendsChartProps {
  comments: CommentData[];
}

export function CommentTrendsChart({ comments }: CommentTrendsChartProps) {
  // Group comments by date
  const commentsByDate = comments.reduce((acc, comment) => {
    const date = new Date(comment.publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    if (!acc[date]) {
      acc[date] = { date, count: 0, totalLikes: 0 };
    }
    
    acc[date].count += 1;
    acc[date].totalLikes += comment.likeCount;
    
    return acc;
  }, {} as Record<string, { date: string; count: number; totalLikes: number }>);

  const data = Object.values(commentsByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 date points

  const handleDownloadCSV = () => {
    downloadCSV(data, 'comment_trends');
  };

  const handleDownloadChart = () => {
    downloadChartAsImage('comment-trends-chart', 'comment_trends_chart');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Comment Trends Over Time
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            title="Download as CSV"
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </button>
          <button
            onClick={handleDownloadChart}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            title="Download as Image"
          >
            <Download className="w-3 h-3 mr-1" />
            PNG
          </button>
        </div>
      </div>
      <div id="comment-trends-chart">
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Number of Comments"
            dot={{ fill: '#3B82F6', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="totalLikes"
            stroke="#F59E0B"
            strokeWidth={2}
            name="Total Likes on Comments"
            dot={{ fill: '#F59E0B', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
