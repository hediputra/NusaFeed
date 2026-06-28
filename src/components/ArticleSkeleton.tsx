import React from 'react';
import { motion } from 'motion/react';

export default function ArticleSkeleton() {
  // We render a grid resembling a bento layout of skeleton items
  return (
    <div className="space-y-6">
      {/* Featured Skeleton (1 large card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-slate-200/60 dark:border-gray-850 bg-white dark:bg-gray-950 p-6 md:p-8 space-y-4 overflow-hidden relative">
          {/* Shimmer overlay */}
          <div className="flex items-center gap-2">
            <div className="h-4.5 w-16 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="space-y-2.5">
            <div className="h-7 w-3/4 rounded-lg bg-slate-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-7 w-1/2 rounded-lg bg-slate-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-gray-900">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>

        {/* 3 standard card skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="rounded-xl border border-slate-200/60 dark:border-gray-850 bg-white dark:bg-gray-950 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-12 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-16 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-11/12 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-3.5 w-11/12 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-900">
              <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
