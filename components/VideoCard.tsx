'use client';

import Image from 'next/image';
import { memo } from 'react';
import { VideoData } from '@/types/youtube';
import { formatNumber, formatDuration, formatDate } from '@/lib/utils';
import { Eye, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';

interface VideoCardProps {
  video: VideoData;
  onClick?: () => void;
  priority?: boolean;
}

export const VideoCard = memo(function VideoCard({ video, onClick, priority = false }: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer group"
    >
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          quality={75}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(video.publishedAt)}
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Eye className="w-4 h-4 mr-1" />
            <span>{formatNumber(video.viewCount)}</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span>{formatNumber(video.likeCount)}</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>{formatNumber(video.commentCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
