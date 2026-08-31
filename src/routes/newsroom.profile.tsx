import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, inputClass, textareaClass } from "@/components/admin/AdminUI";
import { ImageUploader } from "@/components/newsroom/ImageUploader";
import { useCurrentUser } from "@/hooks/useAuth";
import { db } from "@/lib/queries";
import { myStoriesQuery } from "@/lib/newsroom";

export const Route = createFileRoute("/newsroom/profile")({
  component: JournalistProfile;
});

function JournalistProfile() {
  return null;
}
