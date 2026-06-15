import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Backdrop from "@/components/Backdrop";
import Veil from "@/components/Veil";
import Nav from "@/components/Nav";
import { RaagProvider } from "@/components/RaagProvider";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import AuthErrorCatcher from "@/components/AuthErrorCatcher";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saurabh Dada's Gurupaurnima 2026",
  description: "A quiet space to coordinate the Gurupaurnima evening — date picks, compositions, and the people gathering.",
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1420",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let firstName: string | null = null;
  let profilePicUrl: string | null = null;
  let showBell = false;
  let unreadCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, profile_pic_url, role, is_admin, notifications_read_at")
      .eq("id", user.id)
      .maybeSingle();
    firstName = profile?.first_name ?? null;
    profilePicUrl = profile?.profile_pic_url ?? null;
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
          <Nav signedIn={!!user} firstName={firstName} profilePicUrl={profilePicUrl} showBell={showBell} unreadCount={unreadCount} />
          <AuthErrorCatcher />
          <main className="container-x py-8 md:py-12">{children}</main>
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
