import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";

export const metadata = {
  title: "About — CUG Students Wellfare",
};

export default function AboutPage() {
  return (
    <div className="bg-background">
      <section className="bg-cug-green py-16 text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-cug-gold">
            About
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            The Students Wellfare Information System
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            The official welfare and complaints platform of the Catholic
            University of Ghana, connecting students with the Students Affairs
            Office.
          </p>
        </div>
      </section>
      <AboutSection />
      <HowItWorksSection />
    </div>
  );
}
