import {
  BarChart3,
  Building2,
  Contact,
  FileText,
  Handshake,
  Inbox,
  Kanban,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  Users,
  Workflow,
  Clock,
} from "lucide-react";
import type { NavGroup } from "@/types";

export const navigationGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Sales",
    items: [
      { title: "Customers", href: "/customers", icon: "Building2" },
      { title: "Contacts", href: "/contacts", icon: "Contact" },
      { title: "Deals", href: "/deals", icon: "Handshake" },
      { title: "Pipeline", href: "/pipeline", icon: "Kanban" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Purchase Orders", href: "/purchase-orders", icon: "Package" },
      { title: "Follow-ups", href: "/follow-ups", icon: "Clock" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Inbox", href: "/inbox", icon: "Inbox", badge: 3 },
      { title: "Sent", href: "/inbox/sent", icon: "Mail" },
      { title: "Drafts", href: "/inbox/drafts", icon: "FileText" },
    ],
  },
  {
    label: "Automation",
    items: [{ title: "Workflows", href: "/automation", icon: "Workflow" }],
  },
  {
    label: "Analytics",
    items: [{ title: "Reports", href: "/reports", icon: "BarChart3" }],
  },
  {
    label: "Admin",
    items: [
      { title: "Users", href: "/users", icon: "Users" },
      { title: "Settings", href: "/settings", icon: "Settings" },
    ],
  },
];

export const iconMap = {
  LayoutDashboard,
  Building2,
  Contact,
  Handshake,
  Kanban,
  Package,
  Clock,
  Inbox,
  Mail,
  FileText,
  Workflow,
  BarChart3,
  Users,
  Settings,
} as const;

export type IconName = keyof typeof iconMap;
