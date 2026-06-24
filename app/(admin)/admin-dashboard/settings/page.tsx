import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account security.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
