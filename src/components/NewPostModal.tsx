"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { branches } from "@/data/branches";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquarePlus } from "lucide-react";

// Simple profanity filter - dynamically loaded
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FilterClass: any = null;
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("bad-words").then((mod: any) => {
        FilterClass = mod.default || mod.Filter || mod;
    }).catch(() => {
        // bad-words not available, skip profanity filtering
    });
}

interface NewPostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewPostModal({ open, onOpenChange }: NewPostModalProps) {
    const [title, setTitle] = React.useState("");
    const [body, setBody] = React.useState("");
    const [branch, setBranch] = React.useState("");
    const [alias, setAlias] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    const resetForm = () => {
        setTitle("");
        setBody("");
        setBranch("");
        setAlias("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !body.trim() || !branch) {
            toast.error("Missing fields", {
                description: "Please fill in the title, body, and select a branch.",
            });
            return;
        }

        // Profanity filter
        try {
            if (FilterClass) {
                const filter = new FilterClass();
                if (filter.isProfane(title) || filter.isProfane(body)) {
                    toast.error("Content moderation", {
                        description:
                            "Your post contains inappropriate language. Please revise.",
                    });
                    return;
                }
            }
        } catch {
            // Filter not loaded, skip
        }

        setSubmitting(true);

        try {
            await addDoc(collection(db, "communityPosts"), {
                title: title.trim(),
                body: body.trim(),
                branch,
                authorAlias: alias.trim() || "Anonymous",
                timestamp: serverTimestamp(),
            });

            toast.success("Post created!", {
                description: "Your request has been posted to the community board.",
            });

            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error("Post creation failed:", error);
            toast.error("Something went wrong", {
                description: "Failed to create post. Please try again.",
            });
        }

        setSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquarePlus className="h-5 w-5" />
                            New Request
                        </DialogTitle>
                        <DialogDescription>
                            Post a resource request or ask a syllabus question. Your peers
                            will see it and can help!
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="post-title">
                                Title <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                id="post-title"
                                placeholder='e.g. "Need 2024 Internals for Control Systems"'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <Label>
                                Branch Tag <span className="text-destructive">*</span>
                            </Label>
                            <Select value={branch} onValueChange={setBranch}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>UG Branches</SelectLabel>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.shortName} — {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="post-body">
                                Description <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Textarea
                                id="post-body"
                                placeholder="Describe what you need in detail..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                required
                            />
                            <FieldDescription>Be as specific as possible.</FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="post-alias">Your Alias</FieldLabel>
                            <Input
                                id="post-alias"
                                placeholder='e.g. "Pushkar", "AnonStudent"'
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                            />
                            <FieldDescription>
                                Optional. Leave blank to post anonymously.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={submitting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    Posting...
                                </>
                            ) : (
                                "Post Request"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
