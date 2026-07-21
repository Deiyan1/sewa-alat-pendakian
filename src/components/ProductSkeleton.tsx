export default function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
      <div className="aspect-square w-full shimmer" />
      <div className="p-5 space-y-3 flex-1">
        <div className="h-5 w-3/4 rounded-lg shimmer" />
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-2/3 rounded shimmer" />
        <div className="h-px bg-border mt-4" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-24 rounded shimmer" />
          <div className="h-8 w-8 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
