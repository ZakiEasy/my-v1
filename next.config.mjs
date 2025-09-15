// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // n'échoue pas le build si ESLint trouve des erreurs
  },
  typescript: {
    ignoreBuildErrors: true,  // (optionnel) n'échoue pas le build sur erreurs TS
  },
};

export default nextConfig;
