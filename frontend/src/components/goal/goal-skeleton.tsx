import { Skeleton } from "@/components/ui/skeleton";

export function GoalSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
