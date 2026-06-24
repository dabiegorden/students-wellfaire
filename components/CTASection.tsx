import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="bg-cug-green-dark py-16 text-white">
      <div className="container mx-auto px-6 text-center lg:px-12">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to be heard?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Create your account today and get the support you deserve from the
          Students Affairs Office.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {/* <Link href="/register">
            <Button
              size="lg"
              className="bg-cug-gold text-cug-green-dark hover:bg-cug-gold/90"
            >
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link> */}
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
