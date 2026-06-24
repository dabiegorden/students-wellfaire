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
  LayoutDashboard,
  Hand,
  MessageSquare,
  Megaphone,
  PlusCircle,
  Settings,
  LogOut,
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
  studentId?: string;
  programme?: string;
  level?: string;
}

interface StudentsSidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const menuItems = [
  { title: "Dashboard", url: "/students-dashboard", icon: LayoutDashboard },
  {
    title: "My Activity",
    items: [
      {
        title: "My Complaints",
        url: "/students-dashboard/complaints",
        icon: Hand,
      },
      {
        title: "New Complaint",
        url: "/students-dashboard/complaints/new",
        icon: PlusCircle,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        title: "Support Chat",
        url: "/students-dashboard/messages",
        icon: MessageSquare,
      },
      {
        title: "Announcements",
        url: "/students-dashboard/announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Settings", url: "/students-dashboard/settings", icon: Settings },
    ],
  },
];

export function StudentsSidebar({ user, onLogout }: StudentsSidebarProps) {
  const pathname = usePathname();

  const initials = `${user.firstName?.charAt(0) ?? ""}${
    user.lastName?.charAt(0) ?? ""
  }`.toUpperCase();

  const isActive = (url: string) =>
    url === "/students-dashboard" ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="rounded-lg bg-white/95 p-2">
          <Logo variant="dark" href="/students-dashboard" />
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
            {initials || "S"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user.studentId || user.email}
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
