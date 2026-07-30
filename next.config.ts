import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.29.66", "businesscard.ae"],
  experimental: {
    // Next.js Server Actions require explicitly allowed origins if you are accessing the app 
    // from a device on your local network (e.g., your phone) using an IP address.
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.29.66:3000", "businesscard.ae"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all external images (like Supabase storage) if you switch to next/image
      },
    ],
  },
};

export default nextConfig;
