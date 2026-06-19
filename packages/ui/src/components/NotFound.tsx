import React from "react";
import Link from "next/link";
import { NeonButton } from "@aether/ui";
import { Home, AlertTriangle } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="absolute inset-0 bg-neon-blue/5 blur-[120px] rounded-full w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="space-y-2">
          <div className="text-[120px] font-black tracking-tighter leading-none opacity-20 select-none">404</div>
          <div className="flex items-center justify-center gap-2 text-neon-blue">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono uppercase tracking-[0.2em] text-sm">Path Not Found</span>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <h1 className="text-4xl font-bold">Lost in the void?</h1>
          <p className="text-neutral-500">
            The resource you are looking for has been moved, deleted, or never existed in this sector of the Aether.
          </p>
        </div>

        <Link href="/dashboard" className="inline-block">
          <NeonButton className="px-8 py-4">
            <Home className="w-4 h-4 mr-2" />
            Back to Mission Control
          </NeonButton>
        </Link>
      </div>

      {/* Grid Pattern overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
};
