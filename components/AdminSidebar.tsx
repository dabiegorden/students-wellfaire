"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  Hand,
  LogOut,
  Megaphone,
  MessageSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "students";
  staffId?: string;
  department?: string;
}

interface AdminSidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const menuItems = [
  { title: "Dashboard", url: "/admin-dashboard", icon: BarChart3 },
  {
    title: "Community",
    items: [
      { title: "Messages", url: "/admin-dashboard/messages", icon: MessageSquare },
      { title: "Complaints", url: "/admin-dashboard/complaints", icon: Hand },
      { title: "Students", url: "/admin-dashboard/students", icon: Users },
      {
        title: "Announcements",
        url: "/admin-dashboard/announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Analytics", url: "/admin-dashboard/analytics", icon: TrendingUp },
      { title: "Reports", url: "/admin-dashboard/reports", icon: BookOpen },
      { title: "Settings", url: "/admin-dashboard/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const initials = `${user.firstName?.charAt(0) ?? ""}${
    user.lastName?.charAt(0) ?? ""
  }`.toUpperCase();

  const isActive = (url: string) =>
    url === "/admin-dashboard" ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="rounded-lg bg-white/95 p-2">
          <Logo variant="dark" href="/admin-dashboard" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((item, index) => (
          <SidebarGroup key={index}>
            {item.url && !item.items && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}

            {item.items && (
              <>
                <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/60">
                  {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(subItem.url)}
                        >
                          <Link href={subItem.url}>
                            <subItem.icon className="h-5 w-5" />
                            <span className="font-medium">{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cug-gold text-sm font-bold text-cug-green-dark">
            {initials || "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
