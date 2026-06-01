import type { NextConfig } from "next";

// Config pour déploiement Vercel (Next natif) : site servi à la racine.
// (L'ancienne config d'export statique /TESTSUPA pour FTP a été retirée.)
const nextConfig: NextConfig = {
  images: {
    // Hôtes autorisés pour l'optimiseur d'images de Vercel/Next
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
