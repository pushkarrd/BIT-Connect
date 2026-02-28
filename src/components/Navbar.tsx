"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuItem,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    Menu,
    MessageSquare,
    Search,
    Upload,
    X,
    GraduationCap,
} from "lucide-react";

interface NavbarProps {
    onUploadClick: () => void;
}

export function Navbar({ onUploadClick }: NavbarProps) {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const navLinks = [
        { href: "/", label: "Resource Vault", icon: BookOpen },
        { href: "/community", label: "Community", icon: MessageSquare },
        { href: "/#about", label: "About", icon: GraduationCap },
        { href: "/contact", label: "Contact Us", icon: MessageSquare },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <GraduationCap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        BIT <span className="text-primary">Connect</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {navLinks.map((link) => (
                            <NavigationMenuItem key={link.href}>
                                <NavigationMenuLink
                                    asChild
                                    className={navigationMenuTriggerStyle()}
                                    data-active={pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))}
                                >
                                    <Link href={link.href}>
                                        <link.icon className="mr-1.5 h-4 w-4" />
                                        {link.label}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-2 md:flex">
                    {/* Search */}
                    {searchOpen ? (
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search notes, papers..."
                                className="w-64 pl-9 pr-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button
                                onClick={() => {
                                    setSearchOpen(false);
                                    setSearchQuery("");
                                }}
                                className="absolute right-2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setSearchOpen(true)}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Search resources</TooltipContent>
                        </Tooltip>
                    )}

                    {/* Upload CTA */}
                    <Button onClick={onUploadClick}>
                        <Upload className="mr-1.5 h-4 w-4" />
                        Upload
                    </Button>
                </div>

                {/* Mobile Menu */}
                <div className="flex items-center gap-2 md:hidden">
                    <Button variant="outline" size="icon" onClick={onUploadClick}>
                        <Upload className="h-4 w-4" />
                    </Button>
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    BIT Connect
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 flex flex-col gap-1">
                                {/* Mobile Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search resources..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Separator className="mb-2" />
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent ${pathname === link.href ||
                                            (link.href !== "/" && pathname.startsWith(link.href))
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
