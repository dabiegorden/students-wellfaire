import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const footerColumns = [
  {
    title: "Portal",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Features", href: "/features" },
      { label: "Announcements", href: "/announcements" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Submit a Complaint", href: "/complaints" },
      { label: "Message Support", href: "/messages" },
      { label: "Contact Us", href: "/contact" },
      { label: "Track a Response", href: "/track-response" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log In", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "Forgot Password", href: "/forgot-password" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-[var(--cug-green-dark)] text-white">
      {/* Top gold accent */}
      <div className="h-1 w-full bg-[var(--cug-gold)]" />

      <div className="container mx-auto px-6 py-14 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="rounded-lg bg-white/95 p-3 w-fit">
              <Logo variant="dark" href={undefined} />
            </div>
            <p className="mt-5 max-w-sm leading-relaxed text-white/70">
              Excellence in Christian Higher Education. Empowering student voices
              through transparent, responsive welfare support at the Catholic
              University of Ghana.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/80">
              <a
                href="mailto:cugadmin@cug.edu.gh"
                className="flex items-center gap-3 hover:text-[var(--cug-gold)]"
              >
                <Mail className="h-4 w-4 text-[var(--cug-gold)]" />
                cugadmin@cug.edu.gh
              </a>
              <a
                href="tel:+233352094658"
                className="flex items-center gap-3 hover:text-[var(--cug-gold)]"
              >
                <Phone className="h-4 w-4 text-[var(--cug-gold)]" />
                (+233) 352 094 658
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cug-gold)]" />
                <span>
                  P. O. Box 363, Fiapre — Sunyani, Bono Region, Ghana.
                </span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 inline-block bg-[var(--cug-red)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/75 transition-colors hover:text-[var(--cug-gold)]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-white/60 sm:flex-row lg:px-12">
          <p>
            © {new Date().getFullYear()} Catholic University of Ghana. All Rights
            Reserved.
          </p>
          <p className="text-xs">Students Wellfare Information System</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
