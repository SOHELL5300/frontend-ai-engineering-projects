/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse v2 uses a PDF.js worker and optional native canvas integration.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};
export default nextConfig;
