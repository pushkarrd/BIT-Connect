"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
    CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VoteButton } from "@/components/VoteButton";
import { Download, FileText, ImageIcon, User, Clock } from "lucide-react";

interface FileCardProps {
    id: string;
    fileName: string;
    fileUrl: string;
    subject: string;
    uploaderAlias: string;
    upvotes: number;
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

function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
}

export function FileCard({
    id,
    fileName,
    fileUrl,
    subject,
    uploaderAlias,
    upvotes,
    timestamp,
}: FileCardProps) {
    return (
        <Card className="group transition-all hover:shadow-sm">
            <CardHeader>
                <CardAction>
                    <Badge variant="secondary" className="text-xs">
                        {fileName.split(".").pop()?.toUpperCase()}
                    </Badge>
                </CardAction>
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getFileIcon(fileName)}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <CardTitle className="truncate text-sm">{fileName}</CardTitle>
                        <CardDescription className="text-xs">{subject}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardFooter className="flex-col gap-3">
                {/* Meta info */}
                <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {uploaderAlias}
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

                <Separator />

                {/* Actions */}
                <div className="flex w-full items-center justify-between">
                    <VoteButton resourceId={id} currentVotes={upvotes} />
                    <Button variant="outline" size="sm" asChild>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Download
                        </a>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
