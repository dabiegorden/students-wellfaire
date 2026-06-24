import { UserPlus, FileText, Bell } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register and verify",
    desc: "Sign up with your university email and Student ID. We confirm your ID against the official student records before activating your account.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Submit your complaint",
    desc: "Describe your issue and pick a category. Our AI assistant can help you write it clearly and assigns a priority automatically.",
  },
  {
    icon: Bell,
    step: "03",
    title: "Get a response",
    desc: "Chat with the Students Affairs Office, track your complaint status, and receive replies and announcements by email.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-secondary py-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-cug-red">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Three simple steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative rounded-xl border border-border bg-card p-8 shadow-sm"
            >
              <span className="absolute right-6 top-6 text-4xl font-black text-cug-green/10">
                {s.step}
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cug-green text-white">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
