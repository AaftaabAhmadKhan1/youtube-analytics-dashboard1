'use client';

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Channel header skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Video grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
          >
            <div className="aspect-video bg-gray-300 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
              <div className="flex gap-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
