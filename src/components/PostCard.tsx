"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UploadModal } from "@/components/UploadModal";
import { branches } from "@/data/branches";
import {
    User,
    Clock,
    Upload,
    Trash2,
} from "lucide-react";

interface PostCardProps {
    id: string;
    title: string;
    body: string;
    branch: string;
    authorAlias: string;
    timestamp: { seconds: number } | null;
}

function formatRelativeTime(seconds: number): string {
    const now = Date.now() / 1000;
    const diff = now - seconds;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(seconds * 1000).toLocaleDateString();
}

export function PostCard({
    id,
    title,
    body,
    branch,
    authorAlias,
    timestamp,
}: PostCardProps) {
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const branchData = branches.find((b) => b.id === branch);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            setIsAdmin(sessionStorage.getItem("admin-auth") === "true");
        }
    }, []);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "communityPosts", id));
            toast.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {authorAlias}
                            </span>
                            {timestamp && (
                                <>
                                    <Separator orientation="vertical" className="h-3" />
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatRelativeTime(timestamp.seconds)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {branchData && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                                {branchData.shortName}
                            </Badge>
                        )}
                        {isAdmin && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <CardDescription className="whitespace-pre-wrap text-sm">
                    {body}
                </CardDescription>
            </CardContent>

            <CardFooter className="flex-col gap-3">
                <Separator />

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setUploadOpen(true)}
                >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload File
                </Button>

                <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
            </CardFooter>
        </Card>
    );
}
