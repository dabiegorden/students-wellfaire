import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  MessagesSquare,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/HeroBackground";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-cug-green text-white">
      <HeroBackground />
      <div className="absolute inset-0 z-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <div className="container relative z-10 mx-auto px-6 py-20 lg:px-12 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cug-gold ring-1 ring-white/20">
              Catholic University of Ghana
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Your Voice. Your Welfare.{" "}
              <span className="text-cug-gold">Heard and Resolved.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              The Students Wellfare Information System lets you submit
              complaints, chat with the Students Affairs Office in real time,
              and stay up to date with official announcements — all in one
              place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {/* <Link href="/register">
                <Button
                  size="lg"
                  className="bg-cug-gold text-cug-green-dark hover:bg-cug-gold/90"
                >
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link> */}
              <Link href="/complaints">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Submit a Complaint
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "AI-Triaged Complaints",
                desc: "Every complaint is automatically prioritised so urgent issues are handled first.",
              },
              {
                icon: MessagesSquare,
                title: "Real-time Support Chat",
                desc: "Message the Students Affairs Office and get instant, even automated, replies.",
              },
              {
                icon: Megaphone,
                title: "Official Announcements",
                desc: "Never miss an important notice from the university.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Students Only",
                desc: "Registration is checked against the official student records.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur"
              >
                <card.icon className="h-7 w-7 text-cug-gold" />
                <h3 className="mt-3 font-bold">{card.title}</h3>
                <p className="mt-1 text-sm text-white/70">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
