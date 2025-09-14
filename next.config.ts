import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ne bloque pas le build Vercel si ESLint trouve des warnings/erreurs
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;