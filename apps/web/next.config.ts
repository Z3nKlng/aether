import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@aether/ui",
    "@aether/auth",
    "@aether/bi",
    "@aether/design-system",
    "@aether/agent-runtime",
    "@aether/model-router",
    "@aether/context-engine",
    "@aether/memory-system",
    "@aether/code-intelligence",
    "@aether/git-integration",
    "@aether/api-client",
    "@aether/database",
    "@aether/redis",
    "@aether/billing",
    "@aether/ci-cd",
  ],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
