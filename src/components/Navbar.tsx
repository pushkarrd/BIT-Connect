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
    Calculator,
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

    // Search state
    interface SearchResult {
        id: string;
        fileName: string;
        subject: string;
        category: string;
        locationLabel: string;
        shortTag: string;
        linkUrl: string;
    }
    const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    // Ref for click-outside
    const searchRefDesktop = React.useRef<HTMLDivElement>(null);
    const searchRefMobile = React.useRef<HTMLDivElement>(null);

    // Handle click outside to close search and scroll to close
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickInsideDesktop = searchRefDesktop.current?.contains(event.target as Node);
            const isClickInsideMobile = searchRefMobile.current?.contains(event.target as Node);

            if (!isClickInsideDesktop && !isClickInsideMobile) {
                setSearchOpen(false);
                setSearchQuery("");
            }
        };

        const handleScroll = () => {
            // Only close if it's open, to prevent unnecessary state updates
            if (searchOpen) {
                setSearchOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        // Use capture phase for scroll to detect scrolling on any element, not just window
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [searchOpen]);

    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.results || []);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const SearchResultsList = () => {
        if (searchQuery.trim().length === 0) return null;

        return (
            <div className="mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md p-2 max-h-[300px] overflow-y-auto z-50">
                {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No resources found</div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {searchResults.map((result) => (
                            <Link
                                key={result.id}
                                href={result.linkUrl}
                                onClick={() => {
                                    setSearchOpen(false);
                                    setMobileOpen(false);
                                    setSearchQuery("");
                                }}
                                className="flex flex-col gap-1 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <div className="font-medium line-clamp-1">{result.fileName}</div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="truncate max-w-[120px]">{result.subject}</span>
                                    <span>•</span>
                                    <span className="text-primary truncate">{result.locationLabel}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const navLinks = [
        { href: "/", label: "Resource Vault", icon: BookOpen },
        { href: "/community", label: "Community", icon: MessageSquare },
        { href: "/calculator", label: "Calculator", icon: Calculator },
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
                        <div ref={searchRefDesktop} className="relative flex items-center">
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
                            <div className="absolute top-full right-0 w-[350px]">
                                <SearchResultsList />
                            </div>
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
                                <div ref={searchRefMobile} className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search resources..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <div className="absolute top-full left-0 w-full z-50">
                                        <SearchResultsList />
                                    </div>
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
