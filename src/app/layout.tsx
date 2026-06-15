import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Backdrop from "@/components/Backdrop";
import Veil from "@/components/Veil";
import Nav from "@/components/Nav";
import { RaagProvider } from "@/components/RaagProvider";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";

const display = Cormorant_Garamond({
  variable: "--font-display",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gurupaurnima 2026 · Saurabh Dada",
  description: "A digital aangan for our guru and his shishyas.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let firstName: string | null = null;
  let showBell = false;
  let unreadCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, role, is_admin, notifications_read_at")
      .eq("id", user.id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;
    if (profile && (profile.role === "guru" || profile.is_admin)) {
      showBell = true;
      const since = profile.notifications_read_at ?? "1970-01-01T00:00:00Z";
      const { count } = await supabase
        .from("activity_log")
        .select("*", { count: "exact", head: true })
        .gt("created_at", since)
        .neq("actor_id", user.id);
      unreadCount = count ?? 0;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable}`}>
        <RaagProvider>
          <Backdrop />
          <Veil />
          <Nav signedIn={!!user} firstName={firstName} showBell={showBell} unreadCount={unreadCount} />
          <main className="container-x py-10">{children}</main>
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--bg-1)",
                color: "var(--ink-0)",
                border: "1px solid var(--line)",
              },
            }}
          />
        </RaagProvider>
      </body>
    </html>
  );
}
