import { supabaseRoute } from "@/supabase/server-types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const res = await supabaseRoute().auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${url.origin}/auth/callback`,
    },
  });

  if (res.error) {
    return new Response(null, {
      status: 400,
      statusText: res.error.message,
    });
  }

  return NextResponse.redirect(res.data.url, {
    status: 301,
  });
}
