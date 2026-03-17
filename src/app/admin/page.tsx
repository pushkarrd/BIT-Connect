"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { branches } from "@/data/branches";
import { getClassNotesSubjectError } from "@/lib/resourceNaming";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
    Shield,
    CheckCircle2,
    XCircle,
    FileText,
    ImageIcon,
    User,
    Clock,
    Lock,
    Download,
    Inbox,
    LogOut,
    Trash2,
    Bell,
    Pencil,
    HardDrive,
    Gauge,
    RefreshCcw,
    Files,
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Bar,
    LineChart,
    Line,
    Legend,
} from "recharts";

interface Resource {
    id: string;
    fileName: string;
    fileUrl: string;
    branch: string;
    semester: number;
    category: string;
    subject: string;
    uploaderAlias: string;
    status: string;
    timestamp: { seconds: number } | null;
}

interface StorageStats {
    generatedAt: string;
    storageLimitBytes: number;
    maxUploadBytes: number;
    usedBytes: number;
    remainingBytes: number;
    fileCount: number;
    pdfCount: number;
    avgPdfSizeBytes: number;
    extensionCounts: {
        pdf: number;
        image: number;
        document: number;
        other: number;
    };
    estimatedUploadsAtMaxSize: number;
    estimatedUploadsByAvgPdf: number;
    history: {
        generatedAt: string;
        generatedAtMs: number;
        usedBytes: number;
        usagePercent: number;
    }[];
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bitconnect2026";

function formatTime(seconds: number): string {
    return new Date(seconds * 1000).toLocaleString();
}

function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
}

function getFilePathFromUrl(fileUrl: string): string | null {
    try {
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/object\/public\/resources\/(.+)/);
        return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch {
        return null;
    }
}

function getFileNameWithoutExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName;
}

function stripGeneratedPrefix(fileName: string): string {
    return fileName.replace(/^(\d+_)+/, "");
}

function getDisplayFileName(fileName: string): string {
    return stripGeneratedPrefix(fileName).replace(/_/g, " ");
}

function getDisplayFileBase(fileName: string): string {
    return getFileNameWithoutExtension(getDisplayFileName(fileName));
}

function getFileExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex >= 0 ? fileName.slice(dotIndex) : "";
}

function formatBytes(bytes: number): string {
    if (bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

export default function AdminPage() {
    const [authenticated, setAuthenticated] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [pending, setPending] = React.useState<Resource[]>([]);
    const [approved, setApproved] = React.useState<Resource[]>([]);
    const [loadingPending, setLoadingPending] = React.useState(true);
    const [loadingApproved, setLoadingApproved] = React.useState(true);
    const [actioningId, setActioningId] = React.useState<string | null>(null);
    const [renameOpen, setRenameOpen] = React.useState(false);
    const [renameTarget, setRenameTarget] = React.useState<Resource | null>(null);
    const [renameName, setRenameName] = React.useState("");
    const [storageStats, setStorageStats] = React.useState<StorageStats | null>(null);
    const [storageLoading, setStorageLoading] = React.useState(false);
    const [storageRefreshing, setStorageRefreshing] = React.useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const isPushkar = email === "pushkardeshpande8055@gmail.com" && password === "Pushkar@BIT8055";
        const isHemsagar = email === "hemsagarbc1@gmail.com" && password === "Hemsagar@BIT8055";
        const isFallbackAdmin = password === ADMIN_PASSWORD;

        if (isPushkar || isHemsagar || isFallbackAdmin) {
            setAuthenticated(true);
            sessionStorage.setItem("admin-auth", "true");
        } else {
            toast.error("Invalid email or password");
        }
    };

    // Restore session
    React.useEffect(() => {
        if (sessionStorage.getItem("admin-auth") === "true") {
            setAuthenticated(true);
        }
    }, []);

    // Fetch pending resources with real-time notifications
    React.useEffect(() => {
        if (!authenticated) return;

        let isInitialLoad = true;

        const q = query(
            collection(db, "resources"),
            where("status", "==", "pending"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as Resource[];
                setPending(docs);
                setLoadingPending(false);

                // Show toast for newly added uploads (skip initial load)
                if (!isInitialLoad) {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            const data = change.doc.data();
                            toast.info("📥 New upload pending approval!", {
                                description: `${data.fileName} — ${data.subject} (${branches.find((b) => b.id === data.branch)?.shortName || data.branch})`,
                                duration: 8000,
                            });

                            // Browser notification (if permission granted)
                            if (Notification.permission === "granted") {
                                new Notification("BIT Connect — New Upload", {
                                    body: `${data.fileName} needs approval`,
                                    icon: "/favicon.ico",
                                });
                            }
                        }
                    });
                }
                isInitialLoad = false;
            },
            (error) => {
                console.error("Admin listener error:", error);
                setLoadingPending(false);
            }
        );

        // Request browser notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => unsubscribe();
    }, [authenticated]);

    const fetchStorageStats = React.useCallback(
        async (options?: { manualRefresh?: boolean }) => {
            if (!authenticated) return;

            const isManual = options?.manualRefresh === true;
            if (!storageStats && !isManual) {
                setStorageLoading(true);
            }
            if (isManual) {
                setStorageRefreshing(true);
            }

            try {
                const res = await fetch("/api/admin/storage-stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        password: ADMIN_PASSWORD,
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch storage analytics");
                }

                setStorageStats(data);
            } catch (error) {
                console.error("Storage analytics error:", error);
                if (isManual) {
                    toast.error("Failed to refresh storage analytics");
                }
            } finally {
                setStorageLoading(false);
                setStorageRefreshing(false);
            }
        },
        [authenticated, storageStats]
    );

    React.useEffect(() => {
        if (!authenticated) return;

        fetchStorageStats();
        const interval = window.setInterval(() => {
            fetchStorageStats();
        }, 15000);

        return () => window.clearInterval(interval);
    }, [authenticated, fetchStorageStats]);

    // Fetch approved resources
    React.useEffect(() => {
        if (!authenticated) return;

        const q = query(
            collection(db, "resources"),
            where("status", "==", "approved"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as Resource[];
                setApproved(docs);
                setLoadingApproved(false);
            },
            (error) => {
                console.error("Approved listener error:", error);
                setLoadingApproved(false);
            }
        );

        return () => unsubscribe();
    }, [authenticated]);

    const handleApprove = async (resource: Resource) => {
        setActioningId(resource.id);
        try {
            await updateDoc(doc(db, "resources", resource.id), {
                status: "approved",
            });
            toast.success(`Approved: ${getDisplayFileName(resource.fileName)}`);
        } catch (error) {
            console.error("Approve error:", error);
            toast.error("Failed to approve");
        }
        setActioningId(null);
    };

    const openRenameDialog = (resource: Resource) => {
        setRenameTarget(resource);
        setRenameName(getDisplayFileBase(resource.fileName));
        setRenameOpen(true);
    };

    const handleRename = async () => {
        if (!renameTarget) return;

        const nextName = renameName.trim();

        if (!nextName) {
            toast.error("Missing rename details", {
                description: "Enter the new resource name.",
            });
            return;
        }

        if (renameTarget.category === "class-notes") {
            const classNotesSubjectError = getClassNotesSubjectError(nextName);

            if (classNotesSubjectError) {
                toast.error("Module number required", {
                    description: classNotesSubjectError,
                });
                return;
            }
        }

        const filePath = getFilePathFromUrl(renameTarget.fileUrl);
        if (!filePath) {
            toast.error("Failed to rename", {
                description: "Could not resolve the current storage path for this file.",
            });
            return;
        }

        setActioningId(renameTarget.id);
        try {
            const res = await fetch("/api/admin/rename-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: ADMIN_PASSWORD,
                    filePath,
                    newBaseName: nextName,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to rename file");
            }

            await updateDoc(doc(db, "resources", renameTarget.id), {
                subject: nextName,
                fileName: `${nextName}${getFileExtension(renameTarget.fileName)}`,
                fileUrl: data.fileUrl,
            });

            toast.success(`Renamed: ${nextName}${getFileExtension(renameTarget.fileName)}`);
            setRenameOpen(false);
            setRenameTarget(null);
        } catch (error) {
            console.error("Rename error:", error);
            toast.error("Failed to rename");
        }
        setActioningId(null);
    };

    const deleteFile = async (resource: Resource) => {
        setActioningId(resource.id);
        try {
            const filePath = getFilePathFromUrl(resource.fileUrl);

            // Delete file via server-side API (uses service_role, admin-only)
            if (filePath) {
                const res = await fetch("/api/admin/delete-file", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        password: ADMIN_PASSWORD,
                        filePath,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to delete file");
                }
            }

            // Delete metadata from Firestore
            await deleteDoc(doc(db, "resources", resource.id));

            toast.success(`Deleted: ${getDisplayFileName(resource.fileName)}`);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete");
        }
        setActioningId(null);
    };

    const subscribeToPush = async () => {
        try {
            const msg = messaging();
            if (!msg) {
                toast.error("Push notifications are not supported in this browser.");
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error("You blocked notification permissions.");
                return;
            }

            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                toast.error("VAPID Key missing. Please check your .env variables.");
                return;
            }

            let registration;
            if ('serviceWorker' in navigator) {
                try {
                    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                    await navigator.serviceWorker.ready;
                } catch (swError) {
                    console.error("Service Worker registration failed:", swError);
                    toast.error("Service Worker registration failed. Please try again.");
                    return;
                }
            }

            const token = await getToken(msg, {
                vapidKey,
                serviceWorkerRegistration: registration
            });

            if (token) {
                await setDoc(doc(db, "adminTokens", token), {
                    token,
                    environment: "production",
                    updatedAt: new Date(),
                });
                toast.success("Subscribed to push notifications!");
            } else {
                toast.error("FCM Token generation failed: No token returned.");
            }
        } catch (error: unknown) {
            console.error("FCM Token error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to generate FCM token.";
            toast.error(`Error: ${errorMessage}`);
        }
    };

    // Login screen
    if (!authenticated) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <Toaster richColors position="top-center" />
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Admin Panel</CardTitle>
                        <CardDescription>
                            Enter the admin password to manage uploads.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="flex flex-col gap-3">
                            <Input
                                type="email"
                                placeholder="Admin Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full">
                                <Lock className="mr-1.5 h-4 w-4" />
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const branchName = (id: string) =>
        branches.find((b) => b.id === id)?.shortName || id;
    const categoryName = (id: string) =>
        id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    // Reusable resource card
    const ResourceCard = ({
        resource,
        mode,
    }: {
        resource: Resource;
        mode: "pending" | "approved";
    }) => (
        <Card key={resource.id} className="transition-all">
            <CardHeader>
                <CardAction>
                    <Badge variant="outline" className="text-xs">
                        {resource.fileName.split(".").pop()?.toUpperCase()}
                    </Badge>
                </CardAction>
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getFileIcon(resource.fileName)}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <CardTitle className="truncate text-sm">
                            {getDisplayFileName(resource.fileName)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {resource.subject}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{branchName(resource.branch)}</Badge>
                    <Badge variant="secondary">Sem {resource.semester}</Badge>
                    <Badge variant="secondary">{categoryName(resource.category)}</Badge>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {resource.uploaderAlias}
                    </span>
                    {resource.timestamp && (
                        <>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(resource.timestamp.seconds)}
                            </span>
                        </>
                    )}
                </div>
            </CardContent>

            <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild>
                    <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Preview
                    </a>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={actioningId === resource.id}
                    onClick={() => openRenameDialog(resource)}
                >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Rename
                </Button>
                <div className="ml-auto flex gap-2">
                    {mode === "pending" ? (
                        <>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={actioningId === resource.id}
                                onClick={() => deleteFile(resource)}
                            >
                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                disabled={actioningId === resource.id}
                                onClick={() => handleApprove(resource)}
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Approve
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={actioningId === resource.id}
                            onClick={() => deleteFile(resource)}
                        >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">All clear!</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );

    const usagePercent = storageStats
        ? Math.min(
            100,
            storageStats.storageLimitBytes > 0
                ? (storageStats.usedBytes / storageStats.storageLimitBytes) * 100
                : 0
        )
        : 0;

    const usageChartData = storageStats
        ? [
            { name: "Used", value: storageStats.usedBytes, color: "#ef4444" },
            { name: "Available", value: storageStats.remainingBytes, color: "#22c55e" },
        ]
        : [];

    const filesChartData = storageStats
        ? [
            { name: "PDF", count: storageStats.extensionCounts.pdf },
            { name: "Images", count: storageStats.extensionCounts.image },
            { name: "Docs", count: storageStats.extensionCounts.document },
            { name: "Other", count: storageStats.extensionCounts.other },
        ]
        : [];

    const allResources = [...pending, ...approved];
    const counts = new Map<string, number>();

    allResources.forEach((resource) => {
        const label = categoryName(resource.category);
        counts.set(label, (counts.get(label) || 0) + 1);
    });

    const categoryBreakdownData = Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    const growthChartData = storageStats
        ? storageStats.history.map((point) => ({
            time: new Date(point.generatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            usedMb: Number((point.usedBytes / (1024 * 1024)).toFixed(2)),
            usagePercent: Number(point.usagePercent.toFixed(2)),
        }))
        : [];

    const usageLevel = usagePercent >= 95 ? "critical" : usagePercent >= 80 ? "warning" : "healthy";
    const usageBadgeClass =
        usageLevel === "critical"
            ? "border-red-500/40 bg-red-500/10 text-red-600"
            : usageLevel === "warning"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600";

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Toaster richColors position="top-center" />
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename Resource</DialogTitle>
                        <DialogDescription>
                            Admins can update the displayed title and the stored file name for both pending and approved resources.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rename-name">Resource name</Label>
                            <Input
                                id="rename-name"
                                value={renameName}
                                onChange={(e) => setRenameName(e.target.value)}
                                placeholder="Enter the new resource name"
                            />
                            {renameTarget && (
                                <p className="text-xs text-muted-foreground">
                                    This updates both title and file name. Extension stays as {getFileExtension(renameTarget.fileName) || "the current format"}.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setRenameOpen(false);
                                setRenameTarget(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={!renameTarget || actioningId === renameTarget.id}
                            onClick={handleRename}
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Shield className="h-6 w-6 text-primary" />
                        Admin Panel
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Review, approve, and manage uploaded resources.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={subscribeToPush}
                    >
                        <Bell className="mr-1.5 h-3.5 w-3.5" />
                        Enable Drop Alerts
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            sessionStorage.removeItem("admin-auth");
                            setAuthenticated(false);
                        }}
                    >
                        <LogOut className="mr-1.5 h-3.5 w-3.5" />
                        Logout
                    </Button>
                </div>
            </div>

            <Separator className="mb-6" />

            {/* Tabs */}
            <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending" className="gap-2">
                        Pending
                        {pending.length > 0 && (
                            <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                                {pending.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="gap-2">
                        Approved
                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                            {approved.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="storage" className="gap-2">
                        Storage Analytics
                        <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">
                            Live
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Pending Tab */}
                <TabsContent value="pending">
                    {loadingPending ? (
                        <LoadingSkeleton />
                    ) : pending.length === 0 ? (
                        <EmptyState message="No pending uploads to review." />
                    ) : (
                        <div className="space-y-4">
                            {pending.map((r) => (
                                <ResourceCard key={r.id} resource={r} mode="pending" />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Approved Tab */}
                <TabsContent value="approved">
                    {loadingApproved ? (
                        <LoadingSkeleton />
                    ) : approved.length === 0 ? (
                        <EmptyState message="No approved resources yet." />
                    ) : (
                        <div className="space-y-4">
                            {approved.map((r) => (
                                <ResourceCard key={r.id} resource={r} mode="approved" />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="storage">
                    {storageLoading && !storageStats ? (
                        <LoadingSkeleton />
                    ) : !storageStats ? (
                        <EmptyState message="Storage analytics are unavailable right now." />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground">Last Updated</h3>
                                    <p className="text-sm">{new Date(storageStats.generatedAt).toLocaleString()}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchStorageStats({ manualRefresh: true })}
                                    disabled={storageRefreshing}
                                >
                                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                                    {storageRefreshing ? "Refreshing..." : "Refresh now"}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                                <p className="text-sm font-medium">
                                    Storage health is {usageLevel} at {usagePercent.toFixed(2)}% usage.
                                </p>
                                <Badge variant="outline" className={usageBadgeClass}>
                                    {usageLevel === "critical" ? "Critical 95%+" : usageLevel === "warning" ? "Warning 80%+" : "Healthy"}
                                </Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <HardDrive className="h-4 w-4" /> Storage Used
                                        </CardTitle>
                                        <CardDescription>{usagePercent.toFixed(2)}% utilized</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg font-semibold">{formatBytes(storageStats.usedBytes)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Available: {formatBytes(storageStats.remainingBytes)} of {formatBytes(storageStats.storageLimitBytes)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <FileText className="h-4 w-4" /> PDFs in Storage
                                        </CardTitle>
                                        <CardDescription>Total files: {storageStats.fileCount}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg font-semibold">{storageStats.pdfCount}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Avg PDF size: {formatBytes(storageStats.avgPdfSizeBytes)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Gauge className="h-4 w-4" /> Expected Uploads
                                        </CardTitle>
                                        <CardDescription>Based on max upload size</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg font-semibold">{storageStats.estimatedUploadsAtMaxSize}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Max file size assumed: {formatBytes(storageStats.maxUploadBytes)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Files className="h-4 w-4" /> Expected PDF Uploads
                                        </CardTitle>
                                        <CardDescription>Based on average PDF size</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg font-semibold">{storageStats.estimatedUploadsByAvgPdf}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Uses current PDF average for projection.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Storage Usage</CardTitle>
                                        <CardDescription>Used vs available storage space</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={usageChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={95}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    paddingAngle={2}
                                                >
                                                    {usageChartData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value: number) => formatBytes(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Storage Growth</CardTitle>
                                        <CardDescription>Historical usage snapshots from Firestore</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={growthChartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="time" minTickGap={24} />
                                                <YAxis yAxisId="left" allowDecimals={false} />
                                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                                                <RechartsTooltip />
                                                <Legend />
                                                <Line yAxisId="left" type="monotone" dataKey="usedMb" name="Used (MB)" stroke="#2563eb" strokeWidth={2} dot={false} />
                                                <Line yAxisId="right" type="monotone" dataKey="usagePercent" name="Usage %" stroke="#ef4444" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>File Type Distribution</CardTitle>
                                        <CardDescription>Count of files by type in Supabase</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={filesChartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis allowDecimals={false} />
                                                <RechartsTooltip />
                                                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Category Breakdown</CardTitle>
                                        <CardDescription>Pending + approved resources by category</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={categoryBreakdownData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} interval={0} />
                                                <YAxis allowDecimals={false} />
                                                <RechartsTooltip />
                                                <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
