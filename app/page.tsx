import Navbar from "./restaurant/components/Navbar";
import Hero from "./restaurant/components/Hero";
import Features from "./restaurant/components/Features";
import Menu from "./restaurant/components/Menu";
import Events from "./restaurant/components/Events";
import Gallery from "./restaurant/components/Gallery";
import Reservation from "./restaurant/components/Reservation";
import Footer from "./restaurant/components/Footer";
import { fetchMenuData } from "./restaurant/menu-data";

// ISR : la page est régénérée au plus toutes les 60 s avec les données fraîches
// de Supabase (le menu vient du serveur → vraies données dans le HTML, pas de flash).
export const revalidate = 60;

// Page d'accueil = landing restaurant « Maison Margaux ».
export default async function Home() {
  const { sections, mentions } = await fetchMenuData();

  return (
    <div className="bg-ivory text-ink">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Menu initialSections={sections} initialMentions={mentions} />
        <Gallery />
        <Events />
        <Reservation />
      </main>
      <Footer />
    </div>
  );
}
