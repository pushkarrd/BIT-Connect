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
} from "firebase/firestore";
import { branches } from "@/data/branches";
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
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

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

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bitconnect2026";

function formatTime(seconds: number): string {
    return new Date(seconds * 1000).toLocaleString();
}

function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
}

export default function AdminPage() {
    const [authenticated, setAuthenticated] = React.useState(false);
    const [password, setPassword] = React.useState("");
    const [pending, setPending] = React.useState<Resource[]>([]);
    const [approved, setApproved] = React.useState<Resource[]>([]);
    const [loadingPending, setLoadingPending] = React.useState(true);
    const [loadingApproved, setLoadingApproved] = React.useState(true);
    const [actioningId, setActioningId] = React.useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setAuthenticated(true);
            sessionStorage.setItem("admin-auth", "true");
        } else {
            toast.error("Wrong password");
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
            toast.success(`Approved: ${resource.fileName}`);
        } catch (error) {
            console.error("Approve error:", error);
            toast.error("Failed to approve");
        }
        setActioningId(null);
    };

    const deleteFile = async (resource: Resource) => {
        setActioningId(resource.id);
        try {
            // Extract file path from Supabase URL
            const url = new URL(resource.fileUrl);
            const pathMatch = url.pathname.match(/\/object\/public\/resources\/(.+)/);
            const filePath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;

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

            toast.success(`Deleted: ${resource.fileName}`);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete");
        }
        setActioningId(null);
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
                            {resource.fileName}
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

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Toaster richColors position="top-center" />

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
            </Tabs>
        </div>
    );
}
