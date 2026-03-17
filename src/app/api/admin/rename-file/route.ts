import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, serviceRoleKey);
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bitconnect2026";

function sanitizeFileBaseName(value: string): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9.\- ]/g, "_")
        .replace(/\s+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password, filePath, newBaseName } = body;

        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!filePath || !newBaseName) {
            return NextResponse.json(
                { error: "Missing filePath or newBaseName" },
                { status: 400 }
            );
        }

        const sanitizedBaseName = sanitizeFileBaseName(newBaseName);
        if (!sanitizedBaseName) {
            return NextResponse.json(
                { error: "Invalid file name" },
                { status: 400 }
            );
        }

        const pathParts = String(filePath).split("/");
        const originalFileName = pathParts.pop();

        if (!originalFileName) {
            return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
        }

        const extensionIndex = originalFileName.lastIndexOf(".");
        const extension = extensionIndex >= 0 ? originalFileName.slice(extensionIndex) : "";
        const renamedFileName = `${sanitizedBaseName}${extension}`;
        const renamedFilePath = [...pathParts, renamedFileName].join("/");

        const supabaseAdmin = getAdminSupabase();

        if (renamedFilePath !== filePath) {
            const { error: copyError } = await supabaseAdmin.storage
                .from("resources")
                .copy(filePath, renamedFilePath);

            if (copyError) {
                console.error("Storage copy error:", copyError);
                return NextResponse.json(
                    { error: "Failed to rename file in storage" },
                    { status: 500 }
                );
            }

            const { error: removeError } = await supabaseAdmin.storage
                .from("resources")
                .remove([filePath]);

            if (removeError) {
                console.error("Storage remove error after rename:", removeError);
                return NextResponse.json(
                    { error: "Renamed file, but failed to remove old file" },
                    { status: 500 }
                );
            }
        }

        const { data: publicUrlData } = supabaseAdmin.storage
            .from("resources")
            .getPublicUrl(renamedFilePath);

        return NextResponse.json({
            success: true,
            fileName: renamedFileName,
            filePath: renamedFilePath,
            fileUrl: publicUrlData.publicUrl,
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}