"use client";

import Link from "next/link";
import ProfileCard from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Phone,
    Mail,
    GraduationCap,
    Github,
    Instagram,
    Linkedin,
    ArrowLeft,
} from "lucide-react";

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
                        <BreadcrumbPage>Contact Us</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
                <p className="mt-2 text-muted-foreground">
                    Have questions or suggestions? Reach out to the team behind BIT Connect.
                </p>
            </div>

            {/* Main layout */}
            <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-16">
                {/* Profile Card */}
                <div className="flex-shrink-0">
                    <ProfileCard
                        name="Pushkar R Deshpande"
                        title="4th SEM EIE — BIT"
                        handle="pushkarrd"
                        status="Developer"
                        contactText="Contact Me"
                        avatarUrl="/pushkar.png"
                        showUserInfo
                        enableTilt={true}
                        enableMobileTilt
                        onContactClick={() => {
                            window.open("mailto:pushkardeshpande876@gmail.com");
                        }}
                        behindGlowColor="rgba(125, 190, 255, 0.67)"
                        behindGlowEnabled
                        innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
                    />
                </div>

                {/* Contact Info */}
                <div className="w-full max-w-sm space-y-6">
                    <div>
                        <Badge className="mb-3">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Bangalore Institute of Technology
                        </Badge>
                        <h2 className="text-2xl font-bold">Pushkar R Deshpande</h2>
                        <p className="text-muted-foreground mt-1">
                            Designer & Developer — BIT Connect
                        </p>
                        <p className="text-sm text-muted-foreground">
                            4th Semester, EIE
                        </p>
                    </div>

                    <Separator />

                    {/* Contact details */}
                    <div className="space-y-3">
                        <a
                            href="tel:+917892349003"
                            className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium">+91 78923 49003</p>
                            </div>
                        </a>

                        <a
                            href="mailto:pushkardeshpande876@gmail.com"
                            className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium">pushkardeshpande876@gmail.com</p>
                            </div>
                        </a>
                    </div>

                    <Separator />

                    {/* Social Links */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                            Connect on Social
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" size="icon" className="h-11 w-11" asChild>
                                <a
                                    href="https://www.instagram.com/pushkar__deshpande"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="h-11 w-11" asChild>
                                <a
                                    href="https://www.linkedin.com/in/pushkar-r-deshpande-510177334"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="h-11 w-11" asChild>
                                <a
                                    href="https://github.com/pushkarrd"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GitHub"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back link */}
            <div className="mt-12 text-center">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
