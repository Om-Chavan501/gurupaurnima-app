"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markActivityRead } from "@/lib/actions";

export default function MarkRead() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(async () => {
      await markActivityRead();
      router.refresh();
    }, 800);
    return () => clearTimeout(t);
  }, [router]);
  return null;
}
