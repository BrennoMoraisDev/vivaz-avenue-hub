import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-pulse rounded-lg', className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonKPICard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAppointmentCard() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1 text-center">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-7 w-10 mx-auto" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border/50 py-3 px-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-20 ml-auto" />
    </div>
  );
}

export function SkeletonBarberCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 page-enter">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
        <div className="glass rounded-2xl p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
      </div>
      {/* List */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonAppointmentCard key={i} />
        ))}
      </div>
    </div>
  );
}
