import React from "react";
import { cn } from "../utils";

interface SkeletonProps {
  className?: string;
  /** Animation variant */
  variant?: "pulse" | "shimmer";
}

export const Skeleton = ({ className, variant = "pulse" }: SkeletonProps) => {
  return (
    <div 
      className={cn(
        variant === "pulse" ? "animate-pulse" : "animate-shimmer",
        "rounded-md bg-white/5 border border-white/5 relative overflow-hidden",
        className
      )} 
      aria-hidden="true"
    >
      {variant === "shimmer" && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      )}
    </div>
  );
};

export const LoadingState = () => {
  return (
    <div className="space-y-6 w-full p-8" role="status" aria-label="Loading content">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
};