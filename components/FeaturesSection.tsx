import {
  ClipboardList,
  Brain,
  MessageSquare,
  Megaphone,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Easy Complaint Submission",
    desc: "Log welfare, academic, accommodation, finance or health complaints in minutes with optional AI help writing your description.",
  },
  {
    icon: Brain,
    title: "AI Priority Triage",
    desc: "Each complaint is automatically scored and prioritised so the most urgent cases reach the right officer first.",
  },
  {
    icon: MessageSquare,
    title: "Live Support Chat",
    desc: "Talk directly to the Students Affairs Office. When no officer is online, the assistant replies on their behalf.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    desc: "Receive official university notices in the portal and by email, sorted by category and importance.",
  },
  {
    icon: BarChart3,
    title: "Transparent Tracking",
    desc: "Follow the status of every complaint from Pending to Resolved, with replies kept on record.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Access",
    desc: "Only students with valid IDs in the university records can register, keeping the system secure.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-background py-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-cug-red">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything you need for student welfare
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete toolkit built for the Catholic University of Ghana
            community.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cug-green/10 text-cug-green">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
