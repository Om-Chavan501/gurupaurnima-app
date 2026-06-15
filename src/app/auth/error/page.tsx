import Link from "next/link";
import PageTransition from "@/components/PageTransition";

const KNOWN: Record<string, { title: string; body: string }> = {
  otp_expired: {
    title: "This link has set with the sun.",
    body: "Magic links last only a short while for safety. Request a fresh one — we'll send it right away.",
  },
  access_denied: {
    title: "That didn't open.",
    body: "The link couldn't be honoured. It may have been used already, or expired. Try again.",
  },
  unknown: {
    title: "Something didn't go through.",
    body: "We couldn't complete that sign-in. Try once more, or sign in with your password.",
  },
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ code?: string; description?: string }> }) {
  const sp = await searchParams;
  const code = sp.code ?? "unknown";
  const info = KNOWN[code] ?? KNOWN.unknown;

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-12">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          A small detour
        </div>
        <h1 className="font-display text-4xl md:text-5xl">{info.title}</h1>
        <p className="mt-6 text-lg" style={{ color: "var(--ink-1)" }}>{info.body}</p>
        {sp.description && (
          <p className="mt-3 text-xs" style={{ color: "var(--ink-2)" }}>({sp.description})</p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/signup" className="btn">Send a new link</Link>
          <Link href="/login" className="btn btn-ghost">Sign in with password</Link>
        </div>
        <Link href="/" className="mt-10 btn-link text-sm inline-block">← Home</Link>
      </div>
    </PageTransition>
  );
}
