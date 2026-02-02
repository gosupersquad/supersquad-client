export const metadata = {
  title: "Dashboard",
  description: "Host dashboard",
};

export default function HostDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <p className="text-muted-foreground mt-1">
        Welcome. Experiences and other tabs will go here.
      </p>
    </div>
  );
}
