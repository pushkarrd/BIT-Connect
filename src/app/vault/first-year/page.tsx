"use client";

import * as React from "react";
import Link from "next/link";
import { firstYearStreams, cycles } from "@/data/branches";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Building2,
    Cog,
    Zap,
    Monitor,
    ArrowRight,
    GraduationCap,
    BookOpen,
    type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    Building2,
    Cog,
    Zap,
    Monitor,
};

export default function FirstYearPage() {
    const [selectedStream, setSelectedStream] = React.useState<string | null>(null);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>1st Year</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-8">
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    1st Year Resources
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Select your stream first, then choose P-Cycle or C-Cycle to browse resources.
                </p>
            </div>

            {/* Stream Selection */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold">
                    Step 1: Select Your Stream
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {firstYearStreams.map((stream) => {
                        const Icon = iconMap[stream.icon] || BookOpen;
                        const isSelected = selectedStream === stream.id;
                        return (
                            <button
                                key={stream.id}
                                onClick={() => setSelectedStream(stream.id)}
                                className="w-full text-left"
                            >
                                <Card
                                    className={`group h-full transition-all hover:shadow-md ${isSelected
                                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                                            : "hover:border-primary/30"
                                        }`}
                                >
                                    <CardHeader>
                                        <CardAction>
                                            <Badge variant={isSelected ? "default" : "outline"}>
                                                {stream.shortName}
                                            </Badge>
                                        </CardAction>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                                    }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <CardTitle className="text-sm">
                                                    {stream.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {isSelected ? "✓ Selected" : "Tap to select"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Cycle Selection — only visible when a stream is selected */}
            {selectedStream && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="mb-4 text-lg font-semibold">
                        Step 2: Select Your Cycle
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {cycles.map((cycle) => (
                            <Link
                                key={cycle.id}
                                href={`/vault/first-year/${selectedStream}/${cycle.id}`}
                            >
                                <Button
                                    variant="outline"
                                    className="h-auto w-full flex-col gap-2 py-6 text-base font-semibold transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md"
                                >
                                    <BookOpen className="h-6 w-6" />
                                    {cycle.name}
                                    <span className="text-xs font-normal opacity-70">
                                        Browse resources →
                                    </span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
