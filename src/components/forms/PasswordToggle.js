"use client";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordToggle({ shown, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-label={shown ? "Hide password" : "Show password"}
      className="rounded-md p-2 text-muted transition-colors hover:bg-canvas hover:text-ink">
      {shown ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
