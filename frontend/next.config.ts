import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's persistent database can be created by a different Windows
    // account (for example, a sandbox or elevated shell), which makes later
    // dev-server starts fail with "Access is denied". The in-memory cache and
    // hot reloading still work when filesystem persistence is disabled.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
