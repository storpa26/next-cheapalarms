import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import ProductCategories from '../components/landing/ProductCategories';
import InteractiveDemo from '../components/landing/InteractiveDemo';
import WhoIsThisForSection from '../components/landing/WhoIsThisForSection';
import TrustSection from '../components/landing/TrustSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProductCategories />
        <InteractiveDemo />
        <WhoIsThisForSection />
        <TrustSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
