"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { is403AccountDeactivated } from "@/lib/host-auth-utils";
import { useAuthStore } from "@/store/auth-store";

const HOST_LOGIN_PATH = "/host/login";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (is403AccountDeactivated(error)) {
              useAuthStore.getState().clearAuth();
              toast.error(
                "Your account has been deactivated. You have been signed out.",
              );
              router.push(HOST_LOGIN_PATH);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (is403AccountDeactivated(error)) {
              useAuthStore.getState().clearAuth();
              toast.error(
                "Your account has been deactivated. You have been signed out.",
              );
              router.push(HOST_LOGIN_PATH);
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
