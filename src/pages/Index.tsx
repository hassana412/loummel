import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FlyerCarousel from "@/components/home/FlyerCarousel";
import DealsStrip from "@/components/home/DealsStrip";
import VIPShowcase from "@/components/home/VIPShowcase";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedShops from "@/components/home/FeaturedShops";
import HowItWorks from "@/components/home/HowItWorks";
import ServicesSection from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero with Search */}
        <HeroSection />
        
        {/* Flyer Carousel - Promos & New Shops */}
        <FlyerCarousel />
        
        {/* Flash Deals Strip */}
        <DealsStrip />
        
        {/* VIP Showcase */}
        <VIPShowcase />
        
        {/* Categories */}
        <CategoriesSection />
        
        {/* Featured Shops */}
        <FeaturedShops />
        
        {/* How It Works */}
        <HowItWorks />
        
        {/* Services */}
        <ServicesSection />
        
        {/* Testimonials */}
        <TestimonialsSection />
        
        {/* CTA */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
