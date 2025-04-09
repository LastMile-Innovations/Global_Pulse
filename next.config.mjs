import { createRequire } from 'module'; 
const require = createRequire(import.meta.url); 

let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error if user config doesn't exist
  }
}

/** @type {import('next').NextConfig} */
// Define the base configuration
const baseNextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // unoptimized: true, // Removed to enable optimization
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

// Merge user config into the base config if it exists
if (userConfig) {
  const config = userConfig.default || userConfig; // Handle ESM/CJS export
  for (const key in config) {
    if (
      typeof baseNextConfig[key] === 'object' &&
      !Array.isArray(baseNextConfig[key]) &&
      baseNextConfig[key] !== null // Ensure it's not null
    ) {
      // Deep merge objects
      baseNextConfig[key] = {
        ...baseNextConfig[key],
        ...config[key],
      };
    } else {
      // Overwrite arrays or primitives
      baseNextConfig[key] = config[key];
    }
  }
}

// --- Bundle Analyzer Integration --- 
// Configure the analyzer wrapper
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Wrap the fully prepared and merged config object
const finalConfig = withBundleAnalyzer(baseNextConfig);

export default finalConfig;
