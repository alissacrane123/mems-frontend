"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import { BoardList } from "@/components/boards/BoardList";
import { BoardsHeader } from "@/components/boards/BoardsHeader";

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <BoardsHeader />

      <BoardList />
    </div>
  );
}
