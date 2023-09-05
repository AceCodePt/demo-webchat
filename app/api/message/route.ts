import { supabaseRoute } from "@/supabase/server-types";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const data = await req.json().then(bodySchema.parseAsync);
  const messageText = data.message?.toString();
  if (!messageText) {
    return NextResponse.json(
      { error: { message: "message must be defined in the form data" } },
      { status: 400 }
    );
  }

  const message = await supabaseRoute()
    .from("message")
    .insert({
      text: messageText,
    })
    .select("id")
    .limit(1)
    .single();

  if (message.error) throw message.error;
  return NextResponse.json({ data: message.data, error: null });
}
