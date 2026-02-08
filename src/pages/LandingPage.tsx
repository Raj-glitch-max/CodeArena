import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CodeEditorPreview from "@/components/landing/CodeEditorPreview";
import StatsShowcase from "@/components/landing/StatsShowcase";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <LeaderboardPreview />
        <CodeEditorPreview />
        <FeaturesSection />
        <StatsShowcase />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
