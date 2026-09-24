import React from "react";

export default function CatalogoLoading() {
  return (
    <div className="py-14 sm:py-20 bg-dark-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3 border-b border-zinc-850 pb-8">
          <div className="h-3 w-48 bg-zinc-850 rounded" />
          <div className="h-8 w-80 bg-zinc-800 rounded" />
          <div className="h-4 w-full max-w-xl bg-zinc-850 rounded" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-full max-w-md bg-zinc-850 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-zinc-850 rounded" />
            <div className="h-8 w-28 bg-zinc-850 rounded" />
            <div className="h-8 w-28 bg-zinc-850 rounded" />
          </div>
        </div>

        {/* Product Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-dark-900 border border-zinc-850 rounded-lg overflow-hidden"
            >
              <div className="w-full aspect-[4/3] bg-zinc-850" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-5 w-full bg-zinc-800 rounded" />
                <div className="h-4 w-32 bg-zinc-800 rounded pt-3" />
                <div className="h-9 w-full bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
