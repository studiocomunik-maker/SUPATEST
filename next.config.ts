import type { NextConfig } from "next";

// En production (npm run build) : export statique pour un hébergement FTP
// dans le sous-dossier /TESTSUPA. En dev (npm run dev) : pas de basePath,
// on reste sur localhost:3002/ comme avant.
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export", // génère un dossier "out/" de HTML/CSS/JS statique
  basePath: isProd ? "/TESTSUPA" : "",
  trailingSlash: true, // sert /restaurant/ → restaurant/index.html (Apache)
  images: { unoptimized: true }, // pas d'optimisation serveur en statique
};

export default nextConfig;
