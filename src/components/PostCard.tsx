"use client";

import * as React from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { branches } from "@/data/branches";
import {
    MessageSquare,
    Send,
    User,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface Reply {
    id: string;
    replyText: string;
    authorAlias: string;
    timestamp: { seconds: number } | null;
}

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
    const [repliesOpen, setRepliesOpen] = React.useState(false);
    const [replies, setReplies] = React.useState<Reply[]>([]);
    const [loadingReplies, setLoadingReplies] = React.useState(false);
    const [replyText, setReplyText] = React.useState("");
    const [replyAlias, setReplyAlias] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    const branchData = branches.find((b) => b.id === branch);

    // Load replies when expanded
    React.useEffect(() => {
        if (!repliesOpen) return;

        setLoadingReplies(true);

        const q = query(
            collection(db, "communityPosts", id, "replies"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Reply[];
                setReplies(docs);
                setLoadingReplies(false);
            },
            (error) => {
                console.error("Replies listener error:", error);
                setLoadingReplies(false);
            }
        );

        return () => unsubscribe();
    }, [repliesOpen, id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "communityPosts", id, "replies"), {
                replyText: replyText.trim(),
                authorAlias: replyAlias.trim() || "Anonymous",
                timestamp: serverTimestamp(),
            });
            setReplyText("");
        } catch (error) {
            console.error("Reply failed:", error);
        }
        setSubmitting(false);
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
                    {branchData && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                            {branchData.shortName}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <CardDescription className="whitespace-pre-wrap text-sm">
                    {body}
                </CardDescription>
            </CardContent>

            <CardFooter className="flex-col gap-3">
                <Separator />

                {/* Reply Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setRepliesOpen(!repliesOpen)}
                >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    {repliesOpen ? "Hide" : "Show"} Replies
                    {replies.length > 0 && (
                        <Badge variant="secondary" className="ml-1.5 text-xs">
                            {replies.length}
                        </Badge>
                    )}
                    {repliesOpen ? (
                        <ChevronUp className="ml-auto h-3.5 w-3.5" />
                    ) : (
                        <ChevronDown className="ml-auto h-3.5 w-3.5" />
                    )}
                </Button>

                {/* Replies Section */}
                {repliesOpen && (
                    <div className="w-full space-y-3">
                        {loadingReplies ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : replies.length === 0 ? (
                            <p className="py-2 text-center text-xs text-muted-foreground">
                                No replies yet. Be the first to help!
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className="rounded-md bg-muted/50 px-3 py-2"
                                    >
                                        <p className="text-sm">{reply.replyText}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="h-2.5 w-2.5" />
                                                {reply.authorAlias}
                                            </span>
                                            {reply.timestamp && (
                                                <>
                                                    <span>·</span>
                                                    <span>
                                                        {formatRelativeTime(reply.timestamp.seconds)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Reply Form */}
                        <form onSubmit={handleReply} className="flex flex-col gap-2">
                            <Input
                                placeholder="Your alias (optional)"
                                value={replyAlias}
                                onChange={(e) => setReplyAlias(e.target.value)}
                                className="text-xs"
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    required
                                />
                                <Button type="submit" size="icon" disabled={submitting}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
