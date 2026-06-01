import Navbar from "./restaurant/components/Navbar";
import Hero from "./restaurant/components/Hero";
import Features from "./restaurant/components/Features";
import Menu from "./restaurant/components/Menu";
import Events from "./restaurant/components/Events";
import Gallery from "./restaurant/components/Gallery";
import Reservation from "./restaurant/components/Reservation";
import Footer from "./restaurant/components/Footer";

// Page d'accueil = landing restaurant « Maison Margaux ».
// Contenu du Hero piloté par Supabase (voir components/Hero.tsx).
export default function Home() {
  return (
    <div className="bg-ivory text-ink">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Menu />
        <Gallery />
        <Events />
        <Reservation />
      </main>
      <Footer />
    </div>
  );
}
