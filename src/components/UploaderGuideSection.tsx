"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Upload,
    ArrowRight,
    Images,
    FilePlus2,
    CheckCircle2,
    ListFilter,
    Sparkles,
    ShieldCheck,
    UserCircle2,
    BookOpen,
    FileText,
    ImageIcon,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: ListFilter,
        title: "Choose Your Category",
        description: (
            <>
                Click <strong>Upload</strong> and pick your <strong>Branch</strong> (Sem 3–8) or{" "}
                <strong>1st Year</strong>. Then select your <strong>Department</strong>,{" "}
                <strong>Semester</strong>, and most importantly — the{" "}
                <strong>Resource Type</strong>:
            </>
        ),
        tags: ["Class Notes", "Internal Papers", "SEE PYQs"],
        tagColors: ["bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"],
        highlight: null,
    },
    {
        number: "02",
        icon: Images,
        title: "Select Your Files — Even Multiple Images!",
        description: (
            <>
                Have <strong>photos of your Internal question paper</strong> or{" "}
                <strong>SEE PYQ</strong> clicked on your phone? No worries —{" "}
                <strong>just select all the images at once</strong>. For notes and other
                files, simply pick your <strong>PDF or DOCX</strong>. Max file size is{" "}
                <strong>50MB</strong>.
            </>
        ),
        tags: ["PDF", "JPG / PNG", "DOCX"],
        tagColors: ["bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
            "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"],
        highlight: {
            icon: Sparkles,
            text: (
                <>
                    🪄 <strong>Auto Image-to-PDF Magic:</strong> When you upload multiple JPG/PNG
                    images for <strong>Internal Papers</strong> or <strong>SEE PYQs</strong>, our
                    system <strong>automatically stitches all pages into a single clean PDF</strong>{" "}
                    — named after the subject you enter. No extra apps needed!
                </>
            ),
        },
    },
    {
        number: "03",
        icon: FileText,
        title: "Enter Subject Name & Your Alias",
        description: (
            <>
                Type the <strong>Subject Name</strong> (e.g., <em>"Operating Systems MOD 1"</em>{" "}
                or <em>"Process Control — SEE 2023"</em>). Optionally add an{" "}
                <strong>Uploader Alias</strong> like your name or a fun tag. Leave it blank to{" "}
                upload <strong>anonymously</strong> — no sign-up required!
            </>
        ),
        tags: ["No Sign-Up", "Anonymous OK", "Custom Alias"],
        tagColors: ["bg-primary/10 text-primary border-primary/20",
            "bg-primary/10 text-primary border-primary/20",
            "bg-primary/10 text-primary border-primary/20"],
        highlight: null,
    },
    {
        number: "04",
        icon: ShieldCheck,
        title: "Submit — We Review & Publish",
        description: (
            <>
                Hit <strong>Upload</strong> and you&apos;re done! Your resource is sent for a{" "}
                <strong>quick admin review</strong> to ensure quality. Once approved, it
                goes <strong>live for all students</strong> to access, download, and benefit
                from. Your contribution <strong>helps hundreds of peers</strong>!
            </>
        ),
        tags: ["Quick Review", "Live for All", "Quality Checked"],
        tagColors: ["bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"],
        highlight: null,
    },
];

const featureCards = [
    {
        icon: Images,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        title: "Multi-Image → PDF",
        desc: "Select multiple photo scans of a paper. We stitch them into one PDF automatically.",
    },
    {
        icon: UserCircle2,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        title: "Fully Anonymous",
        desc: "No account needed. Upload with a fun alias or go fully anonymous.",
    },
    {
        icon: BookOpen,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        title: "All Branches & 1st Year",
        desc: "Covers all 13 UG branches (Sem 3–8) and 1st Year P-Cycle & C-Cycle.",
    },
    {
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        title: "Admin-Verified Quality",
        desc: "Every upload is reviewed before going live, keeping the vault clean and reliable.",
    },
    {
        icon: FilePlus2,
        color: "text-red-500",
        bg: "bg-red-500/10",
        title: "PDF, DOCX & Images",
        desc: "Upload PDFs, Word docs, or raw phone images — up to 50MB per upload.",
    },
    {
        icon: Sparkles,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        title: "Instant Contribution",
        desc: "Your upload goes live quickly and benefits hundreds of fellow BIT students.",
    },
];

export function UploaderGuideSection() {
    const [activeStep, setActiveStep] = React.useState(0);

    return (
        <section
            id="upload-guide"
            className="border-t bg-gradient-to-b from-primary/5 via-background to-background"
        >
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-14 flex flex-col items-center text-center">
                    <Badge
                        variant="secondary"
                        className="mb-4 bg-primary/10 text-primary border-primary/20 px-5 py-1.5 text-sm font-semibold"
                    >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        For Uploaders
                    </Badge>
                    <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                        Share Your Resources —{" "}
                        <span className="text-primary">It Takes Under 2 Minutes</span>
                    </h2>
                    <p className="mt-3 max-w-xl text-muted-foreground">
                        Got notes, internal papers, or question papers? <strong>Upload them in 4 easy steps</strong>.
                        No sign-up. No hassle. Just pure giving back to your community.
                    </p>
                </div>

                {/* Step-by-step workflow */}
                <div className="mb-16">
                    {/* Step indicators */}
                    <div className="flex items-start justify-center gap-0 mb-8 overflow-x-auto py-4">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = activeStep === i;
                            const isDone = i < activeStep;
                            return (
                                <React.Fragment key={i}>
                                    <button
                                        onClick={() => setActiveStep(i)}
                                        className={`group flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[100px] px-2 transition-all`}
                                    >
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive
                                                ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                                : isDone
                                                    ? "border-primary/50 bg-primary/10 text-primary"
                                                    : "border-border bg-muted text-muted-foreground group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary/70"
                                                }`}
                                        >
                                            {isDone ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <Icon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs font-semibold text-center leading-tight transition-colors ${isActive ? "text-primary" : isDone ? "text-primary/70" : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        >
                                            {step.title.split(" ")[0]}{" "}
                                            {step.title.split(" ")[1] ?? ""}
                                        </span>
                                    </button>
                                    {i < steps.length - 1 && (
                                        <div className="flex items-center self-start mt-6 px-1">
                                            <ArrowRight
                                                className={`h-5 w-5 transition-colors ${i < activeStep ? "text-primary" : "text-border"
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Active step detail card */}
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        if (i !== activeStep) return null;
                        return (
                            <Card
                                key={i}
                                className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <CardContent className="pt-6 pb-6 px-6 sm:px-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
                                        {/* Step number + icon */}
                                        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:w-20">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <span className="text-3xl font-black text-primary/20 sm:text-center">
                                                {step.number}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col gap-3 flex-1">
                                            <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {step.description}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {step.tags.map((tag, ti) => (
                                                    <span
                                                        key={ti}
                                                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${step.tagColors[ti]}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Highlight box */}
                                            {step.highlight && (
                                                <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground leading-relaxed">
                                                    {step.highlight.text}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="mt-6 flex justify-between gap-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setActiveStep(Math.max(0, i - 1))}
                                            disabled={i === 0}
                                        >
                                            ← Previous
                                        </Button>
                                        {i < steps.length - 1 ? (
                                            <Button size="sm" onClick={() => setActiveStep(i + 1)}>
                                                Next Step <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-primary"
                                                onClick={() => window.dispatchEvent(new Event("open-upload-modal"))}
                                            >
                                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                                Upload Now!
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Feature grid */}
                <div className="mb-10">
                    <h3 className="text-center text-xl font-bold tracking-tight mb-2">
                        ✨ Everything Built for You
                    </h3>
                    <p className="text-center text-sm text-muted-foreground mb-8">
                        Features we have packed in to make sharing as frictionless as possible.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {featureCards.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={i}
                                    className="group flex items-start gap-4 rounded-xl border bg-background p-5 transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${f.bg} transition-transform group-hover:scale-110`}
                                    >
                                        <Icon className={`h-5 w-5 ${f.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{f.title}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center gap-3 text-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Upload className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold">
                        Ready to contribute? <span className="text-primary">Upload your first resource!</span>
                    </h3>
                    <p className="max-w-md text-sm text-muted-foreground">
                        <strong>No sign-up. No account.</strong> Just click Upload in the top-right corner and help a fellow BIT student ace their exams.
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                        📸 Got phone pics of your internals? Select all images — we auto-stitch them into a PDF!
                    </p>
                </div>
            </div>
        </section>
    );
}
