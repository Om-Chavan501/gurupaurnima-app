"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Supabase puts auth errors in the URL hash (#error=...&error_code=...&error_description=...).
 * The server can't see fragments, so this client component reads the hash on any page
 * and redirects to /auth/error with the details as query params.
 */
export default function AuthErrorCatcher() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash;
    if (!h || !h.includes("error=")) return;
    const params = new URLSearchParams(h.startsWith("#") ? h.slice(1) : h);
    const code = params.get("error_code") ?? params.get("error") ?? "unknown";
    const desc = params.get("error_description") ?? "";
    // Clear the hash so it doesn't loop on refresh
    history.replaceState(null, "", window.location.pathname + window.location.search);
    router.replace(`/auth/error?code=${encodeURIComponent(code)}&description=${encodeURIComponent(desc)}`);
  }, [router]);
  return null;
}
