import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user folder confuses Next's root
  // detection; pin the tracing root to this project.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
