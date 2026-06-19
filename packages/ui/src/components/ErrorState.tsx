import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { GlassCard, NeonButton } from "@aether/ui";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while processing your request. Please try again.",
  onRetry 
}: ErrorStateProps) => {
  return (
    <GlassCard className="max-w-md mx-auto p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-neutral-500">{message}</p>
      </div>
      {onRetry && (
        <NeonButton onClick={onRetry} className="w-full py-3">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Retry Request
        </NeonButton>
      )}
    </GlassCard>
  );
};
