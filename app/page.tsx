import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  AboutSection,
  CTASection,
  Footer,
} from "@/constants";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
