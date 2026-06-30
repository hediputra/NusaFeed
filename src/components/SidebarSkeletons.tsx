import React from 'react';
import { motion } from 'motion/react';

export function RelatedArticlesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col gap-2 relative overflow-hidden"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/10 dark:via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '1.5s' }} />
          
          {/* Category/Source tag skeleton */}
          <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
          
          {/* Title lines */}
          <div className="space-y-1.5">
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PopularArticlesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 relative overflow-hidden"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/10 dark:via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '1.5s' }} />
          
          {/* Rank Number placeholder */}
          <div className="h-6 w-4 bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse shrink-0" />
          
          {/* Text content details */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {/* Source label */}
            <div className="h-2.5 w-14 bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
            {/* Title */}
            <div className="space-y-1">
              <div className="h-3.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
              <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
