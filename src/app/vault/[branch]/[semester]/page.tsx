"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { branches, categories } from "@/data/branches";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, FileText, GraduationCap, Inbox } from "lucide-react";

interface Resource {
    id: string;
    fileName: string;
    fileUrl: string;
    branch: string;
    semester: number;
    category: string;
    subject: string;
    uploaderAlias: string;
    upvotes: number;
    timestamp: { seconds: number } | null;
}

const categoryIcons: Record<string, React.ElementType> = {
    "class-notes": BookOpen,
    "internal-papers": FileText,
    "see-pyqs": GraduationCap,
};

function FileCardSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    );
}

export default function SemesterPage() {
    const params = useParams();
    const branchId = params.branch as string;
    const semesterNum = parseInt(params.semester as string);
    const branch = branches.find((b) => b.id === branchId);

    const [resources, setResources] = React.useState<Resource[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeCategory, setActiveCategory] = React.useState<string>(categories[0].id);

    // Real-time Firestore listener
    React.useEffect(() => {
        if (!branchId || !semesterNum) return;

        setLoading(true);

        const q = query(
            collection(db, "resources"),
            where("branch", "==", branchId),
            where("semester", "==", semesterNum),
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
                console.error("Firestore listener error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [branchId, semesterNum]);

    const filteredResources = resources.filter(
        (r) => r.category === activeCategory
    );

    if (!branch) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 text-center">
                <p className="text-muted-foreground">Branch not found.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/vault/${branchId}`}>{branch.shortName}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Semester {semesterNum}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {branch.name}
                    </h1>
                    <Badge variant="outline">Semester {semesterNum}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">
                    Browse and download resources uploaded by your peers.
                </p>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="mb-6">
                    {categories.map((cat) => {
                        const Icon = categoryIcons[cat.id] || BookOpen;
                        const count = resources.filter((r) => r.category === cat.id).length;
                        return (
                            <TabsTrigger key={cat.id} value={cat.id}>
                                <Icon className="mr-1.5 h-4 w-4" />
                                {cat.name}
                                {count > 0 && (
                                    <Badge variant="secondary" className="ml-1.5 text-xs">
                                        {count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {categories.map((cat) => (
                    <TabsContent key={cat.id} value={cat.id}>
                        <ScrollArea className="w-full">
                            {loading ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <FileCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredResources.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                        <Inbox className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">No resources yet</h3>
                                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                        Be the first to upload {cat.name.toLowerCase()} for{" "}
                                        {branch.shortName} Semester {semesterNum}!
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredResources.map((resource) => (
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
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
