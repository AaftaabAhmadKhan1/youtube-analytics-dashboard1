'use client';

import { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { Search, Youtube, TrendingUp, Eye, Users, Video as VideoIcon, Filter, Calendar, RotateCcw, MessageSquare } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { VideoCard } from '@/components/VideoCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { DashboardData, VideoData } from '@/types/youtube';
import { formatNumber } from '@/lib/utils';

// Lazy load heavy chart component
const VideoCharts = lazy(() => import('@/components/VideoCharts').then(mod => ({ default: mod.VideoCharts })));

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper functions for localStorage
const getStoredFilters = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('dashboardFilters');
  return stored ? JSON.parse(stored) : null;
};

const saveFilters = (filters: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dashboardFilters', JSON.stringify(filters));
};

export default function Home() {
  // Initialize with default values (will be updated from localStorage after mount)
  const [channelName, setChannelName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topVideosCount, setTopVideosCount] = useState<number | 'all'>(20);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Load filters from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredFilters();
      if (stored) {
        if (stored.channelName !== undefined) setChannelName(stored.channelName);
        if (stored.startDate !== undefined) setStartDate(stored.startDate);
        if (stored.endDate !== undefined) setEndDate(stored.endDate);
        if (stored.topVideosCount !== undefined) setTopVideosCount(stored.topVideosCount);
        if (stored.videoSearchQuery !== undefined) setVideoSearchQuery(stored.videoSearchQuery);
      }
      setIsHydrated(true);
      // Small delay to ensure state is set before allowing saves
      setTimeout(() => setIsInitialLoad(false), 100);
    }
  }, []);
  
  // Save filters and channel to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (isHydrated && !isInitialLoad) {
      saveFilters({
        channelName,
        startDate,
        endDate,
        topVideosCount,
        videoSearchQuery,
      });
    }
  }, [channelName, startDate, endDate, topVideosCount, videoSearchQuery, isHydrated, isInitialLoad]);

  // Always fetch all videos to ensure date filters work correctly
  // The API has caching, so repeated requests are fast
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    channelName && isHydrated ? `/api/channel?name=${encodeURIComponent(channelName)}&maxResults=10000` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour - even longer deduping
      revalidateOnMount: true, // Revalidate on mount to fetch new searches
      keepPreviousData: true, // Keep showing old data while fetching new
      revalidateIfStale: false, // Don't revalidate if cache is still fresh
      fallbackData: undefined, // Use cache if available
    }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newChannelName = searchQuery.trim();
      setChannelName(newChannelName);
      // Force revalidation for new search
      await mutate();
    }
  };

  // Apply filters with useMemo for performance
  const filteredVideos = useMemo(() => {
    if (!data?.videos) return [];
    
    return data.videos.filter((video) => {
      // Search query filter
      const matchesSearch = video.title.toLowerCase().includes(videoSearchQuery.toLowerCase());
      
      // Date range filter
      if (startDate || endDate) {
        const videoDate = new Date(video.publishedAt);
        const matchesStartDate = !startDate || videoDate >= new Date(startDate);
        const matchesEndDate = !endDate || videoDate <= new Date(endDate);
        
        return matchesSearch && matchesStartDate && matchesEndDate;
      }
      
      return matchesSearch;
    });
  }, [data?.videos, videoSearchQuery, startDate, endDate]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 100; // Max 100 videos per page to prevent hanging
  
  // Apply top videos count filter with pagination
  const displayVideos = useMemo(() => {
    let videos = topVideosCount === 'all' 
      ? filteredVideos 
      : filteredVideos.slice(0, topVideosCount);
    
    // If showing all videos, apply pagination to prevent hanging
    if (topVideosCount === 'all' && videos.length > videosPerPage) {
      const startIndex = (currentPage - 1) * videosPerPage;
      const endIndex = startIndex + videosPerPage;
      return videos.slice(startIndex, endIndex);
    }
    
    return videos;
  }, [filteredVideos, topVideosCount, currentPage]);
  
  // Calculate total pages
  const totalVideos = topVideosCount === 'all' ? filteredVideos.length : Math.min(filteredVideos.length, topVideosCount);
  const totalPages = topVideosCount === 'all' ? Math.ceil(filteredVideos.length / videosPerPage) : 1;
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, topVideosCount, videoSearchQuery]);

  // Calculate total metrics based on filtered videos
  const metrics = useMemo(() => {
    const totalViews = filteredVideos.reduce((sum, v) => sum + parseInt(v.viewCount), 0) || 0;
    const totalLikes = filteredVideos.reduce((sum, v) => sum + parseInt(v.likeCount), 0) || 0;
    const totalComments = filteredVideos.reduce((sum, v) => sum + parseInt(v.commentCount), 0) || 0;
    const avgViewsPerVideo = filteredVideos.length ? Math.round(totalViews / filteredVideos.length) : 0;
    
    return { totalViews, totalLikes, totalComments, avgViewsPerVideo };
  }, [filteredVideos]);

  // Get min and max dates from videos
  const dateRange = useMemo(() => {
    if (!data?.videos.length) {
      return { minDate: new Date(), maxDate: new Date() };
    }
    
    return {
      minDate: new Date(Math.min(...data.videos.map(v => new Date(v.publishedAt).getTime()))),
      maxDate: new Date(Math.max(...data.videos.map(v => new Date(v.publishedAt).getTime())))
    };
  }, [data?.videos]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTopVideosCount('all'); // Changed to 'all' to show all videos
    setVideoSearchQuery('');
    // Save to localStorage (keep channel name, clear only filters)
    if (typeof window !== 'undefined') {
      saveFilters({
        channelName, // Keep the channel
        startDate: '',
        endDate: '',
        topVideosCount: 'all',
        videoSearchQuery: '',
      });
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Youtube className="w-10 h-10" />
              <h1 className="text-3xl font-bold">YouTube Analytics Dashboard</h1>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter channel name (e.g., @PhysicsWallah)"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!channelName && !isLoading && !data && (
          <div className="text-center py-20">
            <Youtube className="w-24 h-24 mx-auto text-red-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to YouTube Analytics Dashboard
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Enter a YouTube channel name above to get started with comprehensive analytics
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Video Analytics
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Sentiment Analysis
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Metrics
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !data && <LoadingSkeleton />}
        
        {error && !data && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm">{error.message || 'Failed to fetch channel data'}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-fade-in">
            {/* Channel Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-6">
                <Image
                  src={data.channel.thumbnail}
                  alt={data.channel.title}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-red-500"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {data.channel.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {data.channel.description}
                  </p>
                  <a
                    href={`https://youtube.com/${data.channel.customUrl || 'channel/' + data.channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-4 h-4 mr-2" />
                    Visit Channel
                  </a>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Subscribers"
                value={formatNumber(data.channel.subscriberCount)}
                icon={<Users className="w-6 h-6 text-blue-600" />}
              />
              <MetricCard
                title={`Total Views ${filteredVideos.length !== data.videos.length ? '(Filtered)' : ''}`}
                value={formatNumber(metrics.totalViews)}
                icon={<Eye className="w-6 h-6 text-green-600" />}
              />
              <MetricCard
                title={`Total Videos ${filteredVideos.length !== data.videos.length ? '(Filtered)' : ''}`}
                value={formatNumber(filteredVideos.length)}
                icon={<VideoIcon className="w-6 h-6 text-purple-600" />}
              />
              <MetricCard
                title={`Avg Views/Video ${filteredVideos.length !== data.videos.length ? '(Filtered)' : ''}`}
                value={formatNumber(metrics.avgViewsPerVideo)}
                icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
              />
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Filter Videos
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Date Range - Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={dateRange.minDate.toISOString().split('T')[0]}
                    max={dateRange.maxDate.toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Date Range - End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={dateRange.minDate.toISOString().split('T')[0]}
                    max={dateRange.maxDate.toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Top Videos Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Videos
                  </label>
                  <select
                    value={topVideosCount}
                    onChange={(e) => setTopVideosCount(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="10">Top 10</option>
                    <option value="20">Top 20</option>
                    <option value="30">Top 30</option>
                    <option value="50">Top 50</option>
                    <option value="100">Top 100</option>
                    <option value="all">All Videos ({filteredVideos.length})</option>
                  </select>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleResetFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="mt-4 flex flex-wrap gap-2">
                {startDate && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                    From: {new Date(startDate).toLocaleDateString()}
                  </span>
                )}
                {endDate && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                    To: {new Date(endDate).toLocaleDateString()}
                  </span>
                )}
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                  Showing: {displayVideos.length} of {filteredVideos.length} videos
                </span>
                {data?.videos && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm font-medium">
                    Total Loaded: {data.videos.length} videos
                  </span>
                )}
              </div>
            </div>

            {/* Charts */}
            {displayVideos.length > 0 && (
              <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>}>
                <VideoCharts videos={displayVideos} topVideosCount={topVideosCount} />
              </Suspense>
            )}

            {/* Videos Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Videos 
                  {topVideosCount === 'all' 
                    ? ` (${totalVideos} total${totalPages > 1 ? `, page ${currentPage} of ${totalPages}` : ''})` 
                    : ` (Top ${topVideosCount})`}
                </h2>
                <input
                  type="text"
                  placeholder="Search videos by title..."
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayVideos.map((video, index) => (
                  <div key={video.id} className="relative group">
                    <VideoCard
                      video={video}
                      onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                      priority={index < 8}
                    />
                    <a
                      href={`/video?id=${video.id}`}
                      className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-blue-600 text-white text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700 font-medium"
                    >
                      📊 Show Complete Analysis
                    </a>
                  </div>
                ))}
              </div>

              {displayVideos.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No videos found matching your filters
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          1
                        </button>
                        <span className="px-2">...</span>
                      </>
                    )}
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === currentPage || Math.abs(page - currentPage) <= 1)
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            page === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                  
                  <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * videosPerPage) + 1} - {Math.min(currentPage * videosPerPage, totalVideos)} of {totalVideos} videos
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Built with Next.js 14 • Optimized for Vercel • Lightning Fast ⚡
          </p>
        </div>
      </footer>
    </main>
  );
}
