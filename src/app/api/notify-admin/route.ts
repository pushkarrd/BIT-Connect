import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines for actual multiline private key parsing
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error("Firebase Admin Initialization Error", error);
    }
}

// Using Official Meta WhatsApp Cloud API (which powers Botpress/BotExpress and other official clients)
// You get 1,000 free notifications per month without risk of API downtime.
const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || "917892349003";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileName, subject, branch, uploaderAlias } = body;

        // 1) Send FCM Web Push Notification to Admins
        try {
            if (admin.apps.length > 0) {
                const db = admin.firestore();
                const tokensSnapshot = await db.collection("adminTokens").get();

                const tokens: string[] = [];
                tokensSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.token) tokens.push(data.token);
                });

                if (tokens.length > 0) {
                    await admin.messaging().sendEachForMulticast({
                        tokens,
                        notification: {
                            title: "New Upload Pending Approval 📥",
                            body: `${fileName} uploaded by ${uploaderAlias}.`,
                        },
                        webpush: {
                            fcmOptions: {
                                link: `${APP_URL}/admin`,
                            },
                        },
                    });
                    console.log(`Sent Web Push to ${tokens.length} admin devices.`);
                }
            }
        } catch (fcmError) {
            console.error("FCM Push Error:", fcmError);
        }

        // 2) WhatsApp Notification
        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
            console.warn("WhatsApp API credentials not set — skipping Whatsapp notification");
            return NextResponse.json({ success: true, pushSent: true, reason: "WhatsApp skipped" });
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

        // Use Official Meta Graph API
        const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: ADMIN_PHONE,
                type: "text",
                text: {
                    preview_url: false,
                    body: message
                }
            })
        });

        if (!response.ok) {
            console.error("WhatsApp API error:", await response.text());
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
