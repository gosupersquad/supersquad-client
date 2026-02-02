import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Host dashboard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return children;
};

export default DashboardLayout;
