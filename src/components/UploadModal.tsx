"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { branches, semesters, categories, firstYearStreams, cycles } from "@/data/branches";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Upload, FileText, ImageIcon, X, CheckCircle2 } from "lucide-react";

interface UploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
    const [uploadType, setUploadType] = React.useState<"branch" | "first-year">("branch");
    // Branch fields
    const [branch, setBranch] = React.useState("");
    const [semester, setSemester] = React.useState("");
    // 1st Year fields
    const [stream, setStream] = React.useState("");
    const [cycle, setCycle] = React.useState("");
    // Common fields
    const [category, setCategory] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [alias, setAlias] = React.useState("");
    const [file, setFile] = React.useState<File | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const resetForm = () => {
        setUploadType("branch");
        setBranch("");
        setSemester("");
        setStream("");
        setCycle("");
        setCategory("");
        setSubject("");
        setAlias("");
        setFile(null);
        setProgress(0);
        setUploading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            toast.error("Invalid file type", {
                description: "Only PDF, PNG, and JPG files are allowed.",
            });
            return;
        }

        if (selectedFile.size > MAX_SIZE) {
            toast.error("File too large", {
                description: "Maximum file size is 15MB.",
            });
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate based on upload type
        if (uploadType === "branch") {
            if (!branch || !semester || !category || !subject || !file) {
                toast.error("Missing fields", {
                    description: "Please fill in all required fields and select a file.",
                });
                return;
            }
        } else {
            if (!stream || !cycle || !category || !subject || !file) {
                toast.error("Missing fields", {
                    description: "Please select stream, cycle, category, subject, and a file.",
                });
                return;
            }
        }

        setUploading(true);
        setProgress(0);

        try {
            // Build storage path based on type
            const storagePath =
                uploadType === "branch"
                    ? `${branch}/${semester}/${category}/${Date.now()}_${file!.name}`
                    : `first-year/${stream}/${cycle}/${category}/${Date.now()}_${file!.name}`;

            setProgress(10);

            const { data, error: uploadError } = await supabase.storage
                .from("resources")
                .upload(storagePath, file!, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            setProgress(80);

            const { data: urlData } = supabase.storage
                .from("resources")
                .getPublicUrl(data.path);

            const fileUrl = urlData.publicUrl;

            setProgress(90);

            // Build Firestore document based on type
            const docData: Record<string, unknown> = {
                fileName: file!.name,
                fileUrl,
                category,
                subject: subject.trim(),
                uploaderAlias: alias.trim() || "Anonymous",
                upvotes: 0,
                status: "pending",
                timestamp: serverTimestamp(),
            };

            if (uploadType === "branch") {
                docData.branch = branch;
                docData.semester = parseInt(semester);
            } else {
                docData.branch = "first-year";
                docData.stream = stream;
                docData.cycle = cycle;
            }

            await addDoc(collection(db, "resources"), docData);

            setProgress(100);

            // Build branch label for notification
            const branchLabel =
                uploadType === "branch"
                    ? branches.find((b) => b.id === branch)?.shortName || branch
                    : `1st Year ${firstYearStreams.find((s) => s.id === stream)?.shortName || stream} ${cycles.find((c) => c.id === cycle)?.name || cycle}`;

            // Send WhatsApp notification to admin (fire-and-forget)
            fetch("/api/notify-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file!.name,
                    subject: subject.trim(),
                    branch: branchLabel,
                    uploaderAlias: alias.trim() || "Anonymous",
                }),
            }).catch(() => { });

            toast.success("Upload submitted!", {
                description: `${file!.name} is pending admin approval. It will appear once approved.`,
                icon: <CheckCircle2 className="h-4 w-4" />,
            });

            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload failed", {
                description: "Something went wrong. Please try again.",
            });
            setUploading(false);
        }
    };

    const getFileIcon = () => {
        if (!file) return null;
        if (file.type === "application/pdf")
            return <FileText className="h-4 w-4 text-red-500" />;
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Resource
                        </DialogTitle>
                        <DialogDescription>
                            Share notes, question papers, or PYQs with your peers.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        {/* Upload Type Toggle */}
                        <Field>
                            <Label>Upload For</Label>
                            <Tabs
                                value={uploadType}
                                onValueChange={(v) => {
                                    setUploadType(v as "branch" | "first-year");
                                    setBranch("");
                                    setSemester("");
                                    setStream("");
                                    setCycle("");
                                }}
                            >
                                <TabsList className="w-full">
                                    <TabsTrigger value="branch" className="flex-1">
                                        Branch (Sem 3–8)
                                    </TabsTrigger>
                                    <TabsTrigger value="first-year" className="flex-1">
                                        1st Year
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </Field>

                        {uploadType === "branch" ? (
                            <>
                                {/* Branch Select */}
                                <Field>
                                    <Label>
                                        Branch <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={branch} onValueChange={setBranch}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your branch" />
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

                                {/* Semester Select */}
                                <Field>
                                    <Label>
                                        Semester <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={semester} onValueChange={setSemester}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Semesters</SelectLabel>
                                                {semesters.map((s) => (
                                                    <SelectItem key={s} value={s.toString()}>
                                                        Semester {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </>
                        ) : (
                            <>
                                {/* Stream Select */}
                                <Field>
                                    <Label>
                                        Stream <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={stream} onValueChange={setStream}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your stream" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>1st Year Streams</SelectLabel>
                                                {firstYearStreams.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {/* Cycle Select */}
                                <Field>
                                    <Label>
                                        Cycle <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={cycle} onValueChange={setCycle}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select cycle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Cycles</SelectLabel>
                                                {cycles.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </>
                        )}

                        {/* Category */}
                        <Field>
                            <Label>
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        {/* Subject */}
                        <Field>
                            <FieldLabel htmlFor="subject">
                                Subject <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                id="subject"
                                placeholder="e.g. Operating Systems, Process Control"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </Field>

                        {/* File Input */}
                        <Field>
                            <FieldLabel htmlFor="file-upload">
                                File <span className="text-destructive">*</span>
                            </FieldLabel>
                            {file ? (
                                <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                    {getFileIcon()}
                                    <span className="flex-1 truncate text-sm">{file.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {(file.size / 1024 / 1024).toFixed(1)}MB
                                    </Badge>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                />
                            )}
                            <FieldDescription>
                                PDF, PNG, or JPG only. Max 15MB.
                            </FieldDescription>
                        </Field>

                        {/* Uploader Alias */}
                        <Field>
                            <FieldLabel htmlFor="alias">Uploader Alias</FieldLabel>
                            <Input
                                id="alias"
                                placeholder='e.g. "Pushkar", "Sem 6 Survivor"'
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                            />
                            <FieldDescription>
                                Optional. Leave blank to upload anonymously.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>

                    {/* Progress */}
                    {uploading && (
                        <Field>
                            <FieldLabel>
                                <span>Upload progress</span>
                                <span className="ml-auto">{progress}%</span>
                            </FieldLabel>
                            <Progress value={progress} />
                        </Field>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-1.5 h-4 w-4" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
