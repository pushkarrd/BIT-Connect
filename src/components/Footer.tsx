import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { GraduationCap } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                    {/* Left: Brand + Contact Us with vertical separator */}
                    <div className="flex items-center gap-2 text-sm md:gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                                    <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
                                </div>
                                BIT <span className="text-primary">Connect</span>
                            </span>
                            <span className="text-muted-foreground text-xs">
                                Academic Resource Hub
                            </span>
                        </div>
                        <Separator orientation="vertical" />
                        <Link href="/contact" className="flex flex-col gap-1 transition-colors hover:text-foreground">
                            <span className="font-medium">Contact Us</span>
                            <span className="text-muted-foreground text-xs">
                                Get in touch
                            </span>
                        </Link>
                    </div>

                    {/* Center: Copyright */}
                    <p className="text-xs text-muted-foreground">
                        &copy; 2026 BIT Connect. All rights reserved.
                    </p>

                    {/* Right: Credits with vertical separator */}
                    <div className="flex items-center gap-2 text-sm md:gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">Designed & Developed by</span>
                            <span className="text-foreground text-base tracking-wide font-bold font-fredoka">
                                Pushkar R Deshpande
                            </span>
                        </div>
                        <Separator orientation="vertical" />
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">Ideator</span>
                            <span className="text-foreground text-base tracking-wide font-bold font-fredoka">
                                Hemsagar B C
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
