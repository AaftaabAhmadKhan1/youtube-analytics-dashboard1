'use client';

import { CommentData } from '@/types/youtube';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download } from 'lucide-react';
import { downloadCSV, prepareSentimentSummary, downloadChartAsImage } from '@/lib/export-utils';

interface SentimentChartProps {
  comments: CommentData[];
}

// Simple sentiment analysis function
function analyzeSentiment(text: string): 'Positive' | 'Negative' | 'Neutral' {
  const positive = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'best',
    'fantastic', 'wonderful', 'perfect', 'brilliant', 'outstanding',
    'helpful', 'thanks', 'thank', 'nice', 'beautiful', 'superb', 'incredible',
    '👍', '❤️', '🔥', '💯', '😊', '😍', '🙏', '✨'
  ];
  
  const negative = [
    'bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'horrible',
    'disappointing', 'useless', 'waste', 'boring', 'annoying', 'stupid',
    'trash', 'sucks', '👎', '😡', '😢', '💩'
  ];

  const lowerText = text.toLowerCase();
  let score = 0;

  positive.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) score += matches.length;
  });

  negative.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) score -= matches.length;
  });

  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
}

export function SentimentChart({ comments }: SentimentChartProps) {
  // Analyze sentiment for all comments
  const sentiments = comments.map(comment => analyzeSentiment(comment.text));
  
  // Count sentiments
  const sentimentCounts = {
    Positive: sentiments.filter(s => s === 'Positive').length,
    Negative: sentiments.filter(s => s === 'Negative').length,
    Neutral: sentiments.filter(s => s === 'Neutral').length,
  };

  const data = [
    { name: 'Positive', value: sentimentCounts.Positive, color: '#10B981' },
    { name: 'Neutral', value: sentimentCounts.Neutral, color: '#6B7280' },
    { name: 'Negative', value: sentimentCounts.Negative, color: '#EF4444' },
  ];

  const handleDownloadCSV = () => {
    const exportData = prepareSentimentSummary(sentimentCounts);
    downloadCSV(exportData, 'sentiment_analysis');
  };

  const handleDownloadChart = () => {
    downloadChartAsImage('sentiment-chart', 'sentiment_chart');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Sentiment Analysis
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
      <div id="sentiment-chart">
        <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {sentimentCounts.Positive}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {sentimentCounts.Neutral}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {sentimentCounts.Negative}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
        </div>
      </div>
    </div>
  );
}
