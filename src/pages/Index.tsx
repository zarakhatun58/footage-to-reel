
import { CTASection } from "@/components/CTASection";
import { FeaturesSection } from "@/components/FeaturesSection";
import HeroSection from "@/components/HeroSection";
import { Navigation } from "@/components/Navigation";
import ProcessSteps from "@/components/ProcessSteps";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProcessSteps />
      <FeaturesSection />
    </div>
  );
};

export default Index;
