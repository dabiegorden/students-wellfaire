import { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";

export default function StudentsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell variant="students" title="Student Dashboard">
      {children}
    </DashboardShell>
  );
}
