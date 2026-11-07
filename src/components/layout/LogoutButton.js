"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button variant="secondary" onClick={onLogout} loading={loading}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}