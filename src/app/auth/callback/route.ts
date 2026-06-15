import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (token_hash && type) {
    await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "magiclink" | "recovery" | "invite" | "email" | "email_change",
    });
  }
  return NextResponse.redirect(new URL(next, request.url));
}
