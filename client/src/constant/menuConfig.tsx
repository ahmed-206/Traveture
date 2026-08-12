import type { UserRole } from "../features/auth/types/user.types";

interface sidebarItem {
  id: string;
  label: string;
}
export const menuConfig: Record<UserRole, sidebarItem[]> = {
  user: [
    { id: "settings", label: "Settings" },
    { id: "bookings", label: "My Bookings" },
    { id: "reviews", label: "My Reviews" },
    { id: "billing", label: "Billing" },
  ],

  admin: [
    { id: "dashboard", label: "Dashboard" },
    { id: "tours", label: "Tours" },
    { id: "users", label: "Users" },
    { id: "reviews", label: "Reviews" },
    { id: "settings", label: "Settings" },
  ],
};
