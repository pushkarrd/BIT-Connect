import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as admin from "firebase-admin";
import { getFirebaseAdminApp } from "@/lib/firebaseAdmin";

type StorageListItem = {
    name: string;
    metadata?: {
        size?: number;
    } | null;
};

type ExtensionCounts = {
    pdf: number;
    image: number;
    document: number;
    other: number;
};

type StorageStats = {
    totalBytes: number;
    pdfBytes: number;
    pdfCount: number;
    fileCount: number;
    extensionCounts: ExtensionCounts;
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bitconnect2026";
const STORAGE_LIMIT_MB = Number(process.env.SUPABASE_STORAGE_LIMIT_MB || "1024");
const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || "50");
const SNAPSHOT_COLLECTION = "adminStorageSnapshots";
const SNAPSHOT_INTERVAL_MINUTES = Number(process.env.STORAGE_SNAPSHOT_INTERVAL_MINUTES || "30");

type StorageHistoryPoint = {
    generatedAt: string;
    generatedAtMs: number;
    usedBytes: number;
    usagePercent: number;
};

function getAdminSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, serviceRoleKey);
}

function getExtension(fileName: string): string {
    const idx = fileName.lastIndexOf(".");
    return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

function createEmptyStats(): StorageStats {
    return {
        totalBytes: 0,
        pdfBytes: 0,
        pdfCount: 0,
        fileCount: 0,
        extensionCounts: {
            pdf: 0,
            image: 0,
            document: 0,
            other: 0,
        },
    };
}

function mergeStats(target: StorageStats, source: StorageStats) {
    target.totalBytes += source.totalBytes;
    target.pdfBytes += source.pdfBytes;
    target.pdfCount += source.pdfCount;
    target.fileCount += source.fileCount;
    target.extensionCounts.pdf += source.extensionCounts.pdf;
    target.extensionCounts.image += source.extensionCounts.image;
    target.extensionCounts.document += source.extensionCounts.document;
    target.extensionCounts.other += source.extensionCounts.other;
}

async function walkFolder(prefix: string): Promise<StorageStats> {
    const supabaseAdmin = getAdminSupabase();
    return walkFolderWithClient(supabaseAdmin, prefix);
}

async function walkFolderWithClient(
    supabaseAdmin: ReturnType<typeof getAdminSupabase>,
    prefix: string
): Promise<StorageStats> {
    const stats = createEmptyStats();
    const limit = 100;
    let offset = 0;

    while (true) {
        const { data, error } = await supabaseAdmin.storage
            .from("resources")
            .list(prefix, {
                limit,
                offset,
                sortBy: { column: "name", order: "asc" },
            });

        if (error) {
            throw new Error(error.message);
        }

        const items = (data || []) as StorageListItem[];

        for (const item of items) {
            const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
            const size = item.metadata?.size;
            const isFile = typeof size === "number";

            if (isFile) {
                const ext = getExtension(item.name);
                stats.fileCount += 1;
                stats.totalBytes += size;

                if (ext === "pdf") {
                    stats.pdfCount += 1;
                    stats.pdfBytes += size;
                    stats.extensionCounts.pdf += 1;
                } else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
                    stats.extensionCounts.image += 1;
                } else if (["doc", "docx"].includes(ext)) {
                    stats.extensionCounts.document += 1;
                } else {
                    stats.extensionCounts.other += 1;
                }

                continue;
            }

            const nestedStats = await walkFolderWithClient(supabaseAdmin, itemPath);
            mergeStats(stats, nestedStats);
        }

        if (items.length < limit) {
            break;
        }

        offset += limit;
    }

    return stats;
}

async function persistSnapshotAndGetHistory(payload: {
    generatedAt: string;
    generatedAtMs: number;
    usedBytes: number;
    storageLimitBytes: number;
    fileCount: number;
    pdfCount: number;
}): Promise<StorageHistoryPoint[]> {
    if (!getFirebaseAdminApp()) {
        return [];
    }

    const firestore = admin.firestore();
    const snapshotsRef = firestore.collection(SNAPSHOT_COLLECTION);
    const nowMs = payload.generatedAtMs;
    const minIntervalMs = Math.max(1, SNAPSHOT_INTERVAL_MINUTES) * 60 * 1000;

    const latestSnapshot = await snapshotsRef
        .orderBy("generatedAtMs", "desc")
        .limit(1)
        .get();

    let shouldWriteSnapshot = true;

    if (!latestSnapshot.empty) {
        const latestMs = Number(latestSnapshot.docs[0].data().generatedAtMs || 0);
        shouldWriteSnapshot = nowMs - latestMs >= minIntervalMs;
    }

    if (shouldWriteSnapshot) {
        await snapshotsRef.add({
            ...payload,
            usagePercent:
                payload.storageLimitBytes > 0
                    ? (payload.usedBytes / payload.storageLimitBytes) * 100
                    : 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    const historySnapshot = await snapshotsRef
        .orderBy("generatedAtMs", "desc")
        .limit(36)
        .get();

    return historySnapshot.docs
        .map((d) => {
            const data = d.data();
            const storageLimitBytes = Number(data.storageLimitBytes || 0);
            const usedBytes = Number(data.usedBytes || 0);
            return {
                generatedAt: String(data.generatedAt || new Date(Number(data.generatedAtMs || 0)).toISOString()),
                generatedAtMs: Number(data.generatedAtMs || 0),
                usedBytes,
                usagePercent:
                    storageLimitBytes > 0
                        ? (usedBytes / storageLimitBytes) * 100
                        : 0,
            };
        })
        .sort((a, b) => a.generatedAtMs - b.generatedAtMs);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password } = body;

        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stats = await walkFolder("");
        const storageLimitBytes = Math.max(0, STORAGE_LIMIT_MB) * 1024 * 1024;
        const maxUploadBytes = Math.max(1, MAX_UPLOAD_MB) * 1024 * 1024;
        const remainingBytes = Math.max(storageLimitBytes - stats.totalBytes, 0);
        const avgPdfSizeBytes = stats.pdfCount > 0 ? stats.pdfBytes / stats.pdfCount : 0;
        const generatedAt = new Date().toISOString();
        const generatedAtMs = Date.now();
        let history: StorageHistoryPoint[] = [];

        try {
            history = await persistSnapshotAndGetHistory({
                generatedAt,
                generatedAtMs,
                usedBytes: stats.totalBytes,
                storageLimitBytes,
                fileCount: stats.fileCount,
                pdfCount: stats.pdfCount,
            });
        } catch (historyError) {
            console.error("Storage history persistence error:", historyError);
        }

        return NextResponse.json({
            generatedAt,
            storageLimitBytes,
            maxUploadBytes,
            usedBytes: stats.totalBytes,
            remainingBytes,
            fileCount: stats.fileCount,
            pdfCount: stats.pdfCount,
            avgPdfSizeBytes,
            extensionCounts: stats.extensionCounts,
            estimatedUploadsAtMaxSize: Math.floor(remainingBytes / maxUploadBytes),
            estimatedUploadsByAvgPdf:
                avgPdfSizeBytes > 0 ? Math.floor(remainingBytes / avgPdfSizeBytes) : 0,
            history,
        });
    } catch (error) {
        console.error("Storage stats API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}