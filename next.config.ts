import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    optimizePackageImports: ["lucide-react"],
    webpackBuildWorker: false,
    // cPanel Passenger imposes a strict worker-thread quota. Using child
    // processes for the static worker avoids ERR_WORKER_INIT_FAILED while
    // keeping the build sequential (cpus=1 and webpack parallelism=1).
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
