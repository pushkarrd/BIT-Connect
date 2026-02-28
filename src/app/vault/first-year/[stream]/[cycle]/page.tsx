"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { firstYearStreams, cycles, categories } from "@/data/branches";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { FileCard } from "@/components/FileCard";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import { BookOpen, FileText, GraduationCap, Inbox } from "lucide-react";

interface Resource {
    id: string;
    fileName: string;
    fileUrl: string;
    category: string;
    subject: string;
    uploaderAlias: string;
    upvotes: number;
    timestamp: { seconds: number } | null;
}

export default function CyclePage() {
    const params = useParams();
    const streamId = params.stream as string;
    const cycleId = params.cycle as string;

    const stream = firstYearStreams.find((s) => s.id === streamId);
    const cycle = cycles.find((c) => c.id === cycleId);

    const [resources, setResources] = React.useState<Resource[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeCategory, setActiveCategory] = React.useState<string>("class-notes");

    React.useEffect(() => {
        if (!streamId || !cycleId) return;

        setLoading(true);

        const q = query(
            collection(db, "resources"),
            where("branch", "==", "first-year"),
            where("stream", "==", streamId),
            where("cycle", "==", cycleId),
            where("status", "==", "approved"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Resource[];
                setResources(docs);
                setLoading(false);
            },
            (error) => {
                console.error("Resources listener error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [streamId, cycleId]);

    if (!stream || !cycle) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-muted-foreground">Stream or cycle not found.</p>
            </div>
        );
    }

    const categoryIcons: Record<string, React.ReactNode> = {
        "class-notes": <BookOpen className="h-4 w-4" />,
        "internal-papers": <FileText className="h-4 w-4" />,
        "see-pyqs": <GraduationCap className="h-4 w-4" />,
    };

    const filtered = resources.filter((r) => r.category === activeCategory);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/vault/first-year">1st Year</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            {stream.shortName} — {cycle.name}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <Badge>{stream.shortName}</Badge>
                    <Badge variant="outline">{cycle.name}</Badge>
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight">
                    {stream.name} — {cycle.name}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    1st Year resources for {stream.shortName} stream, {cycle.name}.
                </p>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="mb-6">
                    {categories.map((cat) => {
                        const count = resources.filter(
                            (r) => r.category === cat.id
                        ).length;
                        return (
                            <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
                                {categoryIcons[cat.id]}
                                {cat.name}
                                <Badge
                                    variant="secondary"
                                    className="ml-1 px-1.5 py-0 text-xs"
                                >
                                    {count}
                                </Badge>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {categories.map((cat) => (
                    <TabsContent key={cat.id} value={cat.id}>
                        {loading ? (
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
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Inbox className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">
                                    No resources yet
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Be the first to upload {cat.name.toLowerCase()} for{" "}
                                    {stream.shortName} {cycle.name}!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((resource) => (
                                    <FileCard
                                        key={resource.id}
                                        id={resource.id}
                                        fileName={resource.fileName}
                                        fileUrl={resource.fileUrl}
                                        subject={resource.subject}
                                        uploaderAlias={resource.uploaderAlias}
                                        upvotes={resource.upvotes}
                                        timestamp={resource.timestamp}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
