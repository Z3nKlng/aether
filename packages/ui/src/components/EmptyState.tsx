import React from "react";
import { Search } from "lucide-react";
import { GlassCard, NeonButton } from "@aether/ui";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  title, 
  message, 
  icon: Icon = Search, 
  actionLabel, 
  onAction 
}: EmptyStateProps) => {
  return (
    <div className="py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
        <Icon className="w-10 h-10 text-neutral-600" />
      </div>
      <div className="space-y-2 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-neutral-500">{message}</p>
      </div>
      {actionLabel && onAction && (
        <NeonButton onClick={onAction} className="px-8 py-4">
          {actionLabel}
        </NeonButton>
      )}
    </div>
  );
};
