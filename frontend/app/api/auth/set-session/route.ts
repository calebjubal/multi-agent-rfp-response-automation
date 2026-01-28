import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/server-client";

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken } = await req.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Access and refresh tokens are required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to set session" },
      { status: 500 }
    );
  }
}
