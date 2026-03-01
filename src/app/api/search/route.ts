import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { branches, firstYearStreams } from "@/data/branches";

// Define the Resource type
interface Resource {
    id: string;
    fileName: string;
    fileUrl: string;
    branch?: string;
    semester?: number;
    stream?: string;
    cycle?: string;
    category: string;
    subject: string;
    uploaderAlias: string;
    upvotes: number;
    status: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: any;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");

        if (!q || q.trim().length === 0) {
            return NextResponse.json({ results: [] });
        }

        const queryLower = q.toLowerCase().trim();
        const terms = queryLower.split(/\s+/);

        // Extract branch/stream filters
        const branchFilters = new Set<string>();
        const streamFilters = new Set<string>();
        const remainingTerms: string[] = [];

        for (const term of terms) {
            let isBranchTerm = false;

            // Check against regular branches
            for (const b of branches) {
                if (b.shortName.toLowerCase() === term || b.name.toLowerCase().includes(term)) {
                    branchFilters.add(b.id);
                    isBranchTerm = true;
                }
            }

            // Check against first-year streams
            for (const s of firstYearStreams) {
                if (s.shortName.toLowerCase() === term || s.name.toLowerCase().includes(term)) {
                    streamFilters.add(s.id);
                    isBranchTerm = true;
                }
            }

            if (!isBranchTerm) {
                remainingTerms.push(term);
            }
        }

        const keywordSearch = remainingTerms.join(" ");

        // Fetch all approved resources
        // For a very large production app, we would use an external search service like Algolia or Typesense.
        // For this scale, fetching the recent/all approved items and filtering in memory works well.
        const resourcesRef = collection(db, "resources");

        // We fetch up to 1000 latest approved resources to keep memory usage reasonable while having good search coverage
        const qDocs = query(
            resourcesRef,
            where("status", "==", "approved"),
            orderBy("timestamp", "desc"),
            limit(1000)
        );

        const snapshot = await getDocs(qDocs);
        const allResources: Resource[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Resource[];

        // Filter the results
        const filtered = allResources.filter((r) => {
            // Apply Branch / Stream Filters if Any
            if (branchFilters.size > 0 || streamFilters.size > 0) {
                // If it's a branch resource, its branch must be in branchFilters
                const matchesBranch = r.branch && branchFilters.has(r.branch);
                // If it's a first-year resource, its stream must be in streamFilters
                const matchesStream = r.stream && streamFilters.has(r.stream);

                if (!matchesBranch && !matchesStream) {
                    return false;
                }
            }

            // Apply Keyword Filter
            if (keywordSearch) {
                const subjectLower = (r.subject || "").toLowerCase();
                const fileNameLower = (r.fileName || "").toLowerCase();

                // Check if ALL remaining terms are present in either subject or filename
                const matchesAllTerms = remainingTerms.every(term =>
                    subjectLower.includes(term) || fileNameLower.includes(term)
                );

                if (!matchesAllTerms) {
                    return false;
                }
            }

            return true;
        });

        // Map format for UI to include location string
        const formattedResults = filtered.slice(0, 15).map(r => {
            let locationLabel = "";
            let linkUrl = "";
            let shortTag = "";

            if (r.branch && r.semester) {
                const b = branches.find(br => br.id === r.branch);
                locationLabel = `${b?.name || r.branch} • Sem ${r.semester}`;
                shortTag = `${b?.shortName || r.branch}`;
                linkUrl = `/vault/${r.branch}/${r.semester}`;
            } else if (r.branch === "first-year" && r.stream && r.cycle) {
                const s = firstYearStreams.find(st => st.id === r.stream);
                locationLabel = `1st Year • ${s?.name || r.stream} • ${r.cycle}`;
                shortTag = s?.shortName || r.stream;
                linkUrl = `/vault/first-year/${r.stream}/${r.cycle}`;
            }

            return {
                id: r.id,
                fileName: r.fileName,
                subject: r.subject,
                category: r.category,
                locationLabel,
                shortTag,
                linkUrl
            };
        });

        return NextResponse.json({ results: formattedResults });

    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
