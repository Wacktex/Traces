"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Notification } from "@/types";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null = null;

    try {
      const db = createSupabaseBrowserClient();

      db.from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.error("[useNotifications]", error.message);
            return;
          }
          setNotifications(data ?? []);
          setHasNew((data?.length ?? 0) > 0);
        });

      channel = db
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            setHasNew(true);
          }
        )
        .subscribe();
    } catch (err) {
      console.error("[useNotifications]", err);
    }

    return () => {
      cancelled = true;
      if (channel) {
        try {
          const db = createSupabaseBrowserClient();
          db.removeChannel(channel);
        } catch {
          /* noop */
        }
      }
    };
  }, [userId]);

  return {
    notifications,
    hasNew,
    setHasNew,
  };
}
