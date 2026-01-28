import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/server-client";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData } = await supabase.auth.getUser();

    return NextResponse.json({
      user: userData.user ?? null,
      accessToken: sessionData.session?.access_token ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load session" },
      { status: 500 }
    );
  }
}
