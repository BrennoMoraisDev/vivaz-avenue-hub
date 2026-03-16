'use client';

import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]',
        'animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 p-4 rounded-lg border border-slate-700 bg-slate-800/50">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <Skeleton className="h-10 w-full rounded-lg" />;
}

export function SkeletonAvatar() {
  return <Skeleton className="h-12 w-12 rounded-full" />;
}
