export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-sand bg-white">
      <div className="aspect-square animate-pulse bg-sand" />
      <div className="space-y-3 px-5 py-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-sand" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-sand" />
        <div className="h-9 w-full animate-pulse rounded-full bg-sand" />
      </div>
    </div>
  );
}
