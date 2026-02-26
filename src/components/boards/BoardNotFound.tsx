"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export function BoardNotFound() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Board not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This board doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Button onClick={() => router.push("/")} variant="primary">
          Back to Boards
        </Button>
      </div>
    </div>
  );
}
