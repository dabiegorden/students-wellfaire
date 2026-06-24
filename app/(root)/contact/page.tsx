import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contact — CUG Students Wellfare",
};

const items = [
  {
    icon: Mail,
    label: "Email",
    value: "cugadmin@cug.edu.gh",
    href: "mailto:cugadmin@cug.edu.gh",
  },
  {
    icon: Phone,
    label: "Hot Line",
    value: "(+233) 352 094 658",
    href: "tel:+233352094658",
  },
  {
    icon: Phone,
    label: "WhatsApp",
    value: "(+233) 249 260 857",
    href: "https://wa.me/233249260857",
  },
  {
    icon: MapPin,
    label: "Postal Address",
    value: "P. O. Box 363, Fiapre — Sunyani, Bono Region, Ghana.",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-background">
      <section className="bg-cug-green py-16 text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-cug-gold">
            Contact
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            Get in touch with Students Affairs
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Reach the Students Affairs Office directly, or submit a complaint and
            chat with us inside the portal.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-6 py-16 lg:grid-cols-2 lg:px-12">
        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cug-green/10 text-cug-green">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="font-medium text-foreground hover:text-cug-green"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="font-medium text-foreground">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-cug-green/5 p-8">
          <MessageSquare className="h-10 w-10 text-cug-green" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">
            Prefer to chat?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Log in to message the Students Affairs Office in real time, or submit
            a formal complaint that we will track to resolution.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/messages">
              <Button>Open Support Chat</Button>
            </Link>
            <Link href="/complaints">
              <Button variant="outline">Submit a Complaint</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
