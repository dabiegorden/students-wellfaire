import { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell variant="admin" title="Admin Dashboard">
      {children}
    </DashboardShell>
  );
}
