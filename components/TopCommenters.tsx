'use client';

import { Award, User, MessageSquare, Download } from 'lucide-react';
import { downloadCSV, prepareTopCommentersForExport } from '@/lib/export-utils';

interface TopCommentersProps {
  topCommenters: Array<{ author: string; count: number }>;
}

export function TopCommenters({ topCommenters }: TopCommentersProps) {
  const handleDownloadCSV = () => {
    const exportData = prepareTopCommentersForExport(topCommenters);
    downloadCSV(exportData, 'top_commenters');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Commenters
        </h3>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          title="Download as CSV"
        >
          <Download className="w-3 h-3 mr-1" />
          CSV
        </button>
      </div>
      
      <div className="space-y-3">
        {topCommenters.slice(0, 10).map((commenter, index) => (
          <div
            key={commenter.author}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index === 0 ? 'bg-yellow-400' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-400' :
                'bg-blue-500'
              } text-white font-bold text-sm`}>
                {index < 3 ? <Award className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {commenter.author}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold">{commenter.count}</span>
              <span className="text-sm">comments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
