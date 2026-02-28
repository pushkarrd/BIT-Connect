"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadModal } from "@/components/UploadModal";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [uploadOpen, setUploadOpen] = React.useState(false);

    return (
        <TooltipProvider>
            <div className="flex min-h-screen flex-col">
                <Navbar onUploadClick={() => setUploadOpen(true)} />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
            <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
            <Toaster richColors position="bottom-right" />
        </TooltipProvider>
    );
}
