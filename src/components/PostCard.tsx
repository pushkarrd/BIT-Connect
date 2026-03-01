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
import { UploadModal } from "@/components/UploadModal";
import { branches } from "@/data/branches";
import {
    User,
    Clock,
    Upload,
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
    const branchData = branches.find((b) => b.id === branch);

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
