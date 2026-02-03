"use client";

import { useParams } from "next/navigation";

import EditEventForm from "@/components/host/event-form/EditEventForm";

const EditExperiencePage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  if (!id) {
    return <div className="p-6 text-muted-foreground">Missing event id.</div>;
  }

  return <EditEventForm eventId={id} />;
};

export default EditExperiencePage;
