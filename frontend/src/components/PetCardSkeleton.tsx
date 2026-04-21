export function PetCardSkeleton({ variant = "default" }: { variant?: "default" | "carousel" }) {
  if (variant === "carousel") {
    return (
      <div className="rounded-3xl overflow-hidden bg-white shadow-lg w-full max-w-[340px] mx-auto">
        <div className="relative w-full pt-[75%] overflow-hidden bg-gray-200 animate-pulse" />
        <div className="p-5 md:p-6 space-y-3">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded-full mt-4 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden bg-white flex flex-col shadow-md">
      <div className="relative w-full pt-[72%] bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded-full mt-2 animate-pulse" />
      </div>
    </div>
  );
}

export function PetCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "28px",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PetCardSkeleton key={i} variant="default" />
      ))}
    </div>
  );
}

export function PetCardSkeletonCarousel({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PetCardSkeleton key={i} variant="carousel" />
      ))}
    </div>
  );
}
