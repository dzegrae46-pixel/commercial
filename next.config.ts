import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    optimizePackageImports: ["lucide-react"],
    webpackBuildWorker: false,
    workerThreads: false,
  },
  webpack(config) {
    // Shared cPanel hosting enforces a very small process/thread quota.
    // Keeping loader work sequential prevents EAGAIN failures while compiling CSS.
    config.parallelism = 1;
    return config;
  },
};

export default nextConfig;
