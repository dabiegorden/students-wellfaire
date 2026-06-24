import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";

export const metadata = {
  title: "Features — CUG Students Wellfare",
};

export default function FeaturesPage() {
  return (
    <div className="bg-background">
      <section className="bg-cug-green py-16 text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-cug-gold">
            Features
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            Built for student welfare
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Explore everything the portal offers — from AI-triaged complaints to
            real-time support chat.
          </p>
        </div>
      </section>
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
