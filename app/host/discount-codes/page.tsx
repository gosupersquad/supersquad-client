"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import DiscountCodeFormModal from "@/components/host/DiscountCodeFormModal";
import DiscountCodesCards from "@/components/host/DiscountCodesCards";
import DiscountCodesTable from "@/components/host/DiscountCodesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteDiscountCode,
  listDiscountCodes,
  toggleDiscountCodeStatus,
  type DiscountCodeResponse,
} from "@/lib/discount-codes-client";
import { useAuthStore } from "@/store/auth-store";

const DISCOUNT_CODES_QUERY_KEY = ["discount-codes"];

const HostDiscountCodesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCodeResponse | null>(null);

  const {
    data: codes = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: DISCOUNT_CODES_QUERY_KEY,
    queryFn: () => {
      const tkn = useAuthStore.getState().token;
      if (!tkn) throw new Error("Not signed in");
      return listDiscountCodes(tkn);
    },
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      toggleDiscountCodeStatus(id, token!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_CODES_QUERY_KEY });
      toast.success(data.isActive ? "Code activated" : "Code deactivated");
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDiscountCode(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_CODES_QUERY_KEY });
      toast.success("Discount code deleted");
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete code";
      toast.error(message);
    },
  });

  const fuse = useMemo(() => {
    if (codes.length === 0) return null;
    return new Fuse(codes, {
      keys: ["code"],
      threshold: 0.3,
    });
  }, [codes]);

  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return codes;
    if (!fuse) return codes;

    const results = fuse.search(searchQuery);
    return results.map((r) => r.item);
  }, [codes, searchQuery, fuse]);

  const handleToggleStatus = (id: string) => {
    if (!token) return;
    toggleMutation.mutate({ id });
  };

  const handleCreateClick = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEditClick = (item: DiscountCodeResponse) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDeleteClick = (item: DiscountCodeResponse) => {
    if (
      !window.confirm(
        `Delete discount code "${item.code}"? This cannot be undone.`,
      )
    )
      return;

    if (!token) return;
    deleteMutation.mutate({ id: item._id });
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: DISCOUNT_CODES_QUERY_KEY });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading discount codes…</span>
        </div>
      </div>
    );
  }

  if (isError && error) {
    const is401 =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401;

    if (is401) {
      clearAuth();
      toast.error("Session expired. Please sign in again.");
      router.push("/host/login");
      return null;
    }

    return (
      <div className="p-6">
        <p className="text-destructive">
          Failed to load discount codes. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Discount codes</h1>

          <p className="text-muted-foreground mt-1">
            Create and manage discount codes for your events.
          </p>
        </div>

        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          Create discount code
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

        <Input
          placeholder="Search by code…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:w-80"
        />
      </div>

      {filteredCodes.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          {codes.length === 0
            ? "No discount codes yet. Create one to get started."
            : "No codes match your search."}
        </div>
      ) : (
        <>
          <div className="md:hidden">
            <DiscountCodesCards
              codes={filteredCodes}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeletingId={
                deleteMutation.isPending && deleteMutation.variables
                  ? deleteMutation.variables.id
                  : null
              }
            />
          </div>

          <div className="hidden md:block">
            <DiscountCodesTable
              codes={filteredCodes}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isTogglingId={
                toggleMutation.isPending && toggleMutation.variables
                  ? toggleMutation.variables.id
                  : null
              }
              isDeletingId={
                deleteMutation.isPending && deleteMutation.variables
                  ? deleteMutation.variables.id
                  : null
              }
            />
          </div>
        </>
      )}

      {token && (
        <DiscountCodeFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          editing={editing}
          token={token}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default HostDiscountCodesPage;
