"use client";

import * as React from "react";
import { PostCard } from "@/components/PostCard";
import { NewPostModal } from "@/components/NewPostModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { branches } from "@/data/branches";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { MessageSquarePlus, Inbox, Filter } from "lucide-react";

interface Post {
    id: string;
    title: string;
    body: string;
    branch: string;
    authorAlias: string;
    timestamp: { seconds: number } | null;
}

function PostSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardHeader>
        </Card>
    );
}

export default function CommunityPage() {
    const [posts, setPosts] = React.useState<Post[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newPostOpen, setNewPostOpen] = React.useState(false);
    const [activeBranch, setActiveBranch] = React.useState<string | null>(null);

    // Real-time Firestore listener — only fetch posts from last 60 days
    React.useEffect(() => {
        const sixtyDaysAgo = Timestamp.fromDate(
            new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        );

        let q;
        if (activeBranch) {
            q = query(
                collection(db, "communityPosts"),
                where("branch", "==", activeBranch),
                where("timestamp", ">=", sixtyDaysAgo),
                orderBy("timestamp", "desc")
            );
        } else {
            q = query(
                collection(db, "communityPosts"),
                where("timestamp", ">=", sixtyDaysAgo),
                orderBy("timestamp", "desc")
            );
        }

        setLoading(true);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[];
                setPosts(docs);
                setLoading(false);
            },
            (error) => {
                console.error("Community posts listener error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeBranch]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Community Board
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Post resource requests, ask questions, and help your peers.
                    </p>
                </div>
                <Button onClick={() => setNewPostOpen(true)} className="shrink-0">
                    <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                    New Request
                </Button>
            </div>

            {/* Branch Filters */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Filter className="h-3.5 w-3.5" />
                    Filter by branch
                </div>
                <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                        <Badge
                            variant={activeBranch === null ? "default" : "outline"}
                            className="shrink-0 cursor-pointer"
                            onClick={() => setActiveBranch(null)}
                        >
                            All Branches
                        </Badge>
                        {branches.map((b) => (
                            <Badge
                                key={b.id}
                                variant={activeBranch === b.id ? "default" : "outline"}
                                className="shrink-0 cursor-pointer"
                                onClick={() =>
                                    setActiveBranch(activeBranch === b.id ? null : b.id)
                                }
                            >
                                {b.shortName}
                            </Badge>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {activeBranch
                                ? "No posts found for this branch. Try a different filter or create a new request!"
                                : "Be the first to post a resource request!"}
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => setNewPostOpen(true)}
                        >
                            <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                            Create First Post
                        </Button>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            body={post.body}
                            branch={post.branch}
                            authorAlias={post.authorAlias}
                            timestamp={post.timestamp}
                        />
                    ))
                )}
            </div>

            {/* New Post Modal */}
            <NewPostModal open={newPostOpen} onOpenChange={setNewPostOpen} />
        </div>
    );
}
