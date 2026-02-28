import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service_role key (bypasses RLS)
function getAdminSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, serviceRoleKey);
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bitconnect2026";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password, filePath } = body;

        // Verify admin password server-side
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!filePath) {
            return NextResponse.json(
                { error: "Missing filePath" },
                { status: 400 }
            );
        }

        // Delete from Supabase Storage using service_role (bypasses RLS)
        const supabaseAdmin = getAdminSupabase();
        const { error } = await supabaseAdmin.storage
            .from("resources")
            .remove([filePath]);

        if (error) {
            console.error("Storage delete error:", error);
            return NextResponse.json(
                { error: "Failed to delete file from storage" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
