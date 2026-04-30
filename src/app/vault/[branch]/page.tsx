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
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface BranchPageProps {
    params: Promise<{ branch: string }>;
}

/** Semester card — shared by both the 1st‑year and upper‑sem grids */
function SemCard({ branchId, sem }: { branchId: string; sem: number }) {
    return (
        <Link href={`/vault/${branchId}/${sem}`}>
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
                                Notes, Internals &amp; PYQs
                                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}

export default async function BranchPage({ params }: BranchPageProps) {
    const { branch: branchId } = await params;
    const branch = branches.find((b) => b.id === branchId);

    if (!branch) {
        notFound();
    }

    const firstYearSems = [1, 2] as const;

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
            <FadeIn direction="up">
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
            </FadeIn>

            {/* 1st & 2nd Sem — EIE only */}
            {branch.hasFirstYearSems && (
                <div className="mb-10">
                    <div className="mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            1st Year Semesters
                        </h2>
                        <Badge variant="secondary" className="ml-1">EIE</Badge>
                    </div>
                    <StaggerContainer className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {firstYearSems.map((sem) => (
                            <StaggerItem key={sem}>
                                <SemCard branchId={branchId} sem={sem} />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            )}

            {/* Sem 3–8 Grid */}
            <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">
                    {branch.hasFirstYearSems ? "2nd Year Onwards" : "Semesters"}
                </h2>
            </div>
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {semesters.map((sem) => (
                    <StaggerItem key={sem}>
                        <SemCard branchId={branchId} sem={sem} />
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </div>
    );
}
