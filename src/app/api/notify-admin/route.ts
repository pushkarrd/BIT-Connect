import { NextRequest, NextResponse } from "next/server";

const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || "917892349003";
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileName, subject, branch, uploaderAlias } = body;

        if (!CALLMEBOT_API_KEY) {
            console.warn("CALLMEBOT_API_KEY not set — skipping WhatsApp notification");
            return NextResponse.json({ success: false, reason: "API key not set" });
        }

        const message = [
            "📥 *BIT Connect — New Upload*",
            "",
            `📄 *File:* ${fileName}`,
            `📚 *Subject:* ${subject}`,
            `🏛️ *Branch:* ${branch}`,
            `👤 *Uploaded by:* ${uploaderAlias}`,
            "",
            `🔗 *Review & Approve:*`,
            `${APP_URL}/admin`,
        ].join("\n");

        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_PHONE}&text=${encodedMessage}&apikey=${CALLMEBOT_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error("CallMeBot error:", await response.text());
            return NextResponse.json(
                { success: false, reason: "WhatsApp API error" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notification error:", error);
        return NextResponse.json(
            { success: false, reason: "Internal error" },
            { status: 500 }
        );
    }
}
