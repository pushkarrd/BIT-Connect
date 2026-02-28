"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

interface VoteButtonProps {
    resourceId: string;
    currentVotes: number;
}

type VoteState = "up" | "down" | null;

export function VoteButton({ resourceId, currentVotes }: VoteButtonProps) {
    const [votes, setVotes] = React.useState(currentVotes);
    const [userVote, setUserVote] = React.useState<VoteState>(null);

    // Load vote state from localStorage
    React.useEffect(() => {
        const stored = localStorage.getItem(`vote-${resourceId}`);
        if (stored === "up" || stored === "down") {
            setUserVote(stored);
        }
    }, [resourceId]);

    const handleVote = async (direction: "up" | "down") => {
        const resourceRef = doc(db, "resources", resourceId);
        let delta = 0;

        if (userVote === direction) {
            // Remove vote
            delta = direction === "up" ? -1 : 1;
            setUserVote(null);
            localStorage.removeItem(`vote-${resourceId}`);
        } else if (userVote === null) {
            // New vote
            delta = direction === "up" ? 1 : -1;
            setUserVote(direction);
            localStorage.setItem(`vote-${resourceId}`, direction);
        } else {
            // Switch vote
            delta = direction === "up" ? 2 : -2;
            setUserVote(direction);
            localStorage.setItem(`vote-${resourceId}`, direction);
        }

        setVotes((prev) => prev + delta);

        try {
            await updateDoc(resourceRef, {
                upvotes: increment(delta),
            });
        } catch (error) {
            // Revert on error
            setVotes((prev) => prev - delta);
            console.error("Vote update failed:", error);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={userVote === "up" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleVote("up")}
                    >
                        <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Upvote</TooltipContent>
            </Tooltip>

            <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums">
                {votes}
            </span>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={userVote === "down" ? "destructive" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleVote("down")}
                    >
                        <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Downvote</TooltipContent>
            </Tooltip>
        </div>
    );
}
