"use client";

import * as React from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { VoteButton } from "@/components/VoteButton";
import { Download, ExternalLink, FileText, ImageIcon, Minus, Plus, RotateCcw, User, Clock } from "lucide-react";

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

function stripGeneratedPrefix(fileName: string): string {
    return fileName.replace(/^(\d+_)+/, "");
}

function getDisplayFileName(fileName: string): string {
    return stripGeneratedPrefix(fileName).replace(/_/g, " ");
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
    const MIN_ZOOM = 0.6;
    const MAX_ZOOM = 2;
    const normalizedFileName = fileName.toLowerCase();
    const isPdf = normalizedFileName.endsWith(".pdf");
    const isDocx = normalizedFileName.endsWith(".docx");
    const isPreviewable = isPdf || isDocx;
    const docxViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = React.useState<string | null>(null);
    const [previewError, setPreviewError] = React.useState<string | null>(null);
    const [zoom, setZoom] = React.useState(1);
    const displayFileName = getDisplayFileName(fileName);

    const handleDirectDownload = React.useCallback(() => {
        const anchor = document.createElement("a");
        anchor.href = fileUrl;
        anchor.download = displayFileName;
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }, [displayFileName, fileUrl]);

    const handleOpenInNewTab = React.useCallback(() => {
        const url = isPdf ? (previewBlobUrl ?? fileUrl) : isDocx ? docxViewerUrl : fileUrl;
        window.open(url, "_blank", "noopener,noreferrer");
    }, [docxViewerUrl, fileUrl, isDocx, isPdf, previewBlobUrl]);

    const preloadPreview = React.useCallback(async () => {
        if (!isPreviewable) return;

        if (isDocx) {
            setPreviewError(null);
            return;
        }

        if (previewBlobUrl || isPreviewLoading) return;

        setIsPreviewLoading(true);
        setPreviewError(null);

        try {
            const response = await fetch(fileUrl, { cache: "force-cache" });
            if (!response.ok) {
                throw new Error("Failed to fetch file for preview");
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setPreviewBlobUrl((previousUrl) => {
                if (previousUrl) URL.revokeObjectURL(previousUrl);
                return objectUrl;
            });
        } catch {
            setPreviewError("Unable to load preview right now.");
        } finally {
            setIsPreviewLoading(false);
        }
    }, [fileUrl, isDocx, isPreviewLoading, isPreviewable, previewBlobUrl]);

    React.useEffect(() => {
        return () => {
            if (previewBlobUrl) {
                URL.revokeObjectURL(previewBlobUrl);
            }
        };
    }, [previewBlobUrl]);

    React.useEffect(() => {
        if (!isPreviewOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            if (key === "escape") {
                setIsPreviewOpen(false);
                return;
            }

            if (key === "d") {
                event.preventDefault();
                handleDirectDownload();
                return;
            }

            if (key === "o") {
                event.preventDefault();
                handleOpenInNewTab();
                return;
            }

            if (!isPdf || !event.altKey) return;

            if (key === "=" || key === "+") {
                event.preventDefault();
                setZoom((currentZoom) => Math.min(MAX_ZOOM, Number((currentZoom + 0.1).toFixed(2))));
                return;
            }

            if (key === "-") {
                event.preventDefault();
                setZoom((currentZoom) => Math.max(MIN_ZOOM, Number((currentZoom - 0.1).toFixed(2))));
                return;
            }

            if (key === "0") {
                event.preventDefault();
                setZoom(1);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [MAX_ZOOM, MIN_ZOOM, handleDirectDownload, handleOpenInNewTab, isPdf, isPreviewOpen]);

    const handlePreviewClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setIsPreviewOpen(true);
        setZoom(1);
        await preloadPreview();
    };

    return (
        <>
            <Card className="group transition-all hover:shadow-sm">
                <CardHeader>
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            {getFileIcon(fileName)}
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <CardTitle className="truncate text-sm pr-2">{displayFileName}</CardTitle>
                            <CardDescription className="text-xs truncate">{subject}</CardDescription>
                        </div>
                    </div>
                    <CardAction>
                        <Badge variant="secondary" className="text-xs shrink-0">
                            {fileName.split(".").pop()?.toUpperCase() || "FILE"}
                        </Badge>
                    </CardAction>
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
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={isPreviewable ? handlePreviewClick : undefined}
                                    onMouseEnter={isPreviewable ? preloadPreview : undefined}
                                    onFocus={isPreviewable ? preloadPreview : undefined}
                                >
                                    Preview
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={displayFileName}
                                >
                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent
                    className="max-w-6xl p-0 overflow-hidden"
                    onInteractOutside={() => setIsPreviewOpen(false)}
                >
                    <DialogHeader className="border-b bg-linear-to-r from-sky-50 via-cyan-50 to-emerald-50 px-4 py-3 dark:from-sky-950/30 dark:via-cyan-950/30 dark:to-emerald-950/30">
                        <div className="flex items-center justify-between gap-3">
                            <DialogTitle className="truncate text-base">{displayFileName}</DialogTitle>
                            <div className="hidden items-center gap-1.5 md:flex">
                                {isPdf && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setZoom((currentZoom) => Math.max(MIN_ZOOM, Number((currentZoom - 0.1).toFixed(2))))}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setZoom((currentZoom) => Math.min(MAX_ZOOM, Number((currentZoom + 0.1).toFixed(2))))}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setZoom(1)}
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </Button>
                                    </>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={handleOpenInNewTab}>
                                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                    New tab
                                </Button>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Shortcuts: D download, O open in new tab, Esc close{isPdf ? ", Alt + + zoom in, Alt + - zoom out, Alt + 0 reset." : "."}
                        </p>
                    </DialogHeader>
                    <div className="h-[80vh] w-full bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,transparent_60%)]">
                        {isPreviewLoading && (
                            <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Spinner className="size-4" />
                                Loading preview...
                            </div>
                        )}

                        {!isPreviewLoading && previewError && (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-destructive">
                                {previewError}
                            </div>
                        )}

                        {!isPreviewLoading && !previewError && isPdf && previewBlobUrl && (
                            <div className="h-full w-full overflow-auto p-4">
                                <div className="mx-auto h-full w-full max-w-275 rounded-xl border bg-background shadow-lg transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
                                    <iframe
                                        src={previewBlobUrl}
                                        title={`${displayFileName} preview`}
                                        className="h-full w-full rounded-xl"
                                    />
                                </div>
                            </div>
                        )}

                        {!isPreviewLoading && !previewError && isDocx && (
                            <div className="h-full w-full p-3 md:p-4">
                                <div className="h-full w-full overflow-hidden rounded-xl border bg-background shadow-lg">
                                    <iframe
                                        src={docxViewerUrl}
                                        title={`${displayFileName} preview`}
                                        className="h-full w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
