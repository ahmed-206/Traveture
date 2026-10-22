import type { IconType } from "react-icons";
import {
  FaGear,
  FaHeart,
  FaChartLine,
  FaMapLocationDot,
  FaSuitcaseRolling,
  FaTicketSimple,
} from "react-icons/fa6";

export type UserRole = "user" | "guide" | "lead-guide" | "admin";

export interface MenuItem {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const settings: MenuItem = {
  to: "/profile/settings",
  label: "Settings",
  icon: FaGear,
};
const favorites: MenuItem = {
  to: "/profile/favorites",
  label: "Favorites",
  icon: FaHeart,
};
const myBookings: MenuItem = {
  to: "/profile/bookings",
  label: "My Bookings",
  icon: FaSuitcaseRolling,
};

const overview: MenuItem = {
  to: "/admin",
  label: "Dashboard",
  icon: FaChartLine,
  end: true,
};
const manageTours: MenuItem = {
  to: "/admin/tours",
  label: "Tours",
  icon: FaMapLocationDot,
};
const manageBookings: MenuItem = {
  to: "/admin/bookings",
  label: "Bookings",
  icon: FaTicketSimple,
};

// Record<UserRole, ...> fails the build if a role has no menu.
export const menuConfig: Record<UserRole, MenuSection[]> = {
  user: [{ items: [settings, favorites, myBookings] }],
  guide: [{ items: [settings] }],
  "lead-guide": [
    { items: [settings] },
    { items: [manageTours] },
  ],
  admin: [
    { items: [settings] },
    { items: [overview, manageTours, manageBookings] },
  ],
};