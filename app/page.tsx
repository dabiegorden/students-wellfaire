import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  AboutSection,
  CTASection,
  Footer,
} from "@/constants";
import { CampusCarousel } from "@/components/CampusCarousel";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CampusCarousel />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
