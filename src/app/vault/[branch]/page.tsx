import Link from "next/link";
import { notFound } from "next/navigation";
import { branches, semesters } from "@/data/branches";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowRight, BookOpen } from "lucide-react";

interface BranchPageProps {
    params: Promise<{ branch: string }>;
}

export default async function BranchPage({ params }: BranchPageProps) {
    const { branch: branchId } = await params;
    const branch = branches.find((b) => b.id === branchId);

    if (!branch) {
        notFound();
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
                        <BreadcrumbPage>{branch.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {branch.name}
                    </h1>
                    <Badge variant="outline">{branch.shortName}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">
                    Select a semester to browse notes, internals, and PYQs.
                </p>
            </div>

            {/* Semester Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {semesters.map((sem) => (
                    <Link key={sem} href={`/vault/${branchId}/${sem}`}>
                        <Card className="group h-full transition-all hover:shadow-md hover:border-primary/30">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg font-bold transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        {sem}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-base">Semester {sem}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 text-xs">
                                            <BookOpen className="h-3 w-3" />
                                            Notes, Internals & PYQs
                                            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
