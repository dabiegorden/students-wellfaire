import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const points = [
  "Built specifically for the Catholic University of Ghana community",
  "Faster resolution through AI-assisted prioritisation",
  "A transparent record of every complaint and reply",
  "Secure, verified access for genuine students only",
];

const AboutSection = () => {
  return (
    <section id="about" className="bg-background py-20">
      <div className="container mx-auto grid items-center gap-12 px-6 lg:grid-cols-2 lg:px-12">
        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-cug-red">
            About the Portal
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Excellence in Christian Higher Education, online
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The Students Wellfare Information System is the official channel for
            students to raise concerns and get support from the Students Affairs
            Office. We bring complaints, live support, and announcements together
            so no student is left unheard.
          </p>

          <ul className="mt-6 space-y-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cug-green" />
                <span className="text-sm text-foreground/80">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">Join the Portal</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "5", label: "Faculties supported" },
            { value: "24/7", label: "Always-on support chat" },
            { value: "AI", label: "Powered triage and replies" },
            { value: "100%", label: "Verified student access" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-black text-cug-green">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
