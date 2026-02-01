import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CollegesSection from "@/components/landing/CollegesSection";
import BranchesSection from "@/components/landing/BranchesSection";
import WhyFutureEdge from "@/components/landing/WhyFutureEdge";
import AboutSection from "@/components/landing/AboutSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CollegesSection />
        <BranchesSection />
        <WhyFutureEdge />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
