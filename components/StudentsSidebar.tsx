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
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  Award,
  Signal,
  Hand,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "students";
  studentId?: string;
  programme?: string;
  level?: string;
  faculty?: string;
  staffId?: string;
  department?: string;
}

interface StudentsSidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: BarChart3,
  },
  {
    title: "Community",
    items: [
      {
        title: "Complaints",
        url: "/admin-dashboard/complaints",
        icon: Hand,
      },
    ],
  },
];

export function StudentsSidebar({ user, onLogout }: StudentsSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await onLogout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };

  const getDisplayName = () => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getUserInitials = () => {
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Sidebar className="bg-zinc-950 border-r border-zinc-800/50">
      <SidebarHeader className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl blur-md opacity-50" />
            <div className="relative w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-zinc-950"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="currentColor"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-white text-base">SWIS</h2>
            <p className="text-xs text-zinc-400">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950">
        {menuItems.map((item, index) => (
          <SidebarGroup key={index}>
            {item.title && !item.items && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="w-full hover:bg-zinc-800/80 hover:text-white data-[active=true]:bg-linear-to-r data-[active=true]:from-emerald-400 data-[active=true]:to-teal-500 text-zinc-300 data-[active=true]:text-zinc-950 transition-all duration-200 mx-2 rounded-xl data-[active=true]:shadow-lg data-[active=true]:shadow-emerald-500/25"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}

            {item.items && (
              <>
                <SidebarGroupLabel className="text-zinc-500 text-xs font-bold uppercase tracking-wider px-5 py-3 mt-2">
                  {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.startsWith(subItem.url)}
                          className="hover:bg-zinc-800/80 hover:text-white data-[active=true]:bg-linear-to-r data-[active=true]:from-emerald-400 data-[active=true]:to-teal-500 text-zinc-300 data-[active=true]:text-zinc-950 transition-all duration-200 mx-2 rounded-xl data-[active=true]:shadow-lg data-[active=true]:shadow-emerald-500/25"
                        >
                          <Link
                            href={subItem.url}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <subItem.icon className="w-5 h-5" />
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

      <SidebarFooter className="p-4 border-t border-zinc-800/50 bg-zinc-950">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full outline-none">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer group">
                  <Avatar className="h-10 w-10 border-2 border-linear-to-br from-emerald-400 to-teal-600">
                    <AvatarFallback className="bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 font-bold text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Settings className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-zinc-900 border-zinc-800 text-zinc-200"
                align="end"
                side="top"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-12 w-12 border-2 border-linear-to-br from-emerald-400 to-teal-600">
                      <AvatarFallback className="bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-none text-white truncate">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-zinc-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-bold uppercase tracking-wider">
                          {user.role === "students" ? "Student" : "Admin"}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />

                {/* Role-specific info */}
                {user.role === "students" && (
                  <div className="px-4 py-3 border-b border-zinc-800 text-xs space-y-1">
                    {user.studentId && (
                      <p className="text-zinc-300">
                        <span className="text-zinc-500">ID:</span>{" "}
                        <span className="text-emerald-400 font-medium">
                          {user.studentId}
                        </span>
                      </p>
                    )}
                    {user.programme && (
                      <p className="text-zinc-300 truncate">
                        <span className="text-zinc-500">Programme:</span>{" "}
                        {user.programme}
                      </p>
                    )}
                    {user.level && (
                      <p className="text-zinc-300">
                        <span className="text-zinc-500">Level:</span>{" "}
                        {user.level}
                      </p>
                    )}
                  </div>
                )}

                {user.role === "admin" && (
                  <div className="px-4 py-3 border-b border-zinc-800 text-xs space-y-1">
                    {user.staffId && (
                      <p className="text-zinc-300">
                        <span className="text-zinc-500">Staff ID:</span>{" "}
                        <span className="text-emerald-400 font-medium">
                          {user.staffId}
                        </span>
                      </p>
                    )}
                    {user.department && (
                      <p className="text-zinc-300 truncate">
                        <span className="text-zinc-500">Department:</span>{" "}
                        {user.department}
                      </p>
                    )}
                  </div>
                )}

                <DropdownMenuItem className="cursor-pointer text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
