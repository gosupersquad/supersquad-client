import { HostLoginForm } from "@/components/host/HostLoginForm";

export const metadata = {
  title: "Host login",
  description: "Sign in to your Supersquad host dashboard",
};

export default function HostLoginPage() {
  return <HostLoginForm />;
}
