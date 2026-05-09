import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, History, Users, LogOut, Table, SquareCheckBig  } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function SidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const allNavItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
      roles: ["staff", "hrd", "admin"],
    },
    {
      label: "History",
      icon: History,
      path: "/history",
      roles: ["staff", "hrd"],
    },
    {
      label: "Team",
      icon: Users,
      path: "/team",
      roles: ["staff", "hrd", "admin"],
    },
    {
      label: "Approvals",
      icon: SquareCheckBig,
      path: "/approvals",
      roles: ["hrd", "admin"],
    },
    {
      label: "Manage",
      icon: Table,
      path: "/manage",
      roles: ["hrd", "admin"],
    },
  ];

  const user = useAuthStore((state) => state.user);

  // then filter by role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <SidebarProvider>
      <Sidebar className="text-white">
        {/* Header */}
        <SidebarHeader className="px-4 py-5">
          <h1 className="text-lg font-semibold tracking-tight">
            Inc. Dashboard
          </h1>
        </SidebarHeader>

        {/* Nav Items */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[#6C6C6C]">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="px-4 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  clearAuth();
                  navigate("/login");
                }}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Page Content */}
      <main className="flex-1 p-4">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
