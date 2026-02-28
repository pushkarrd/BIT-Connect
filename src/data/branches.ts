export interface Branch {
    id: string;
    name: string;
    shortName: string;
    icon: string; // Lucide icon name
}

export const branches: Branch[] = [
    {
        id: "civil-engineering",
        name: "Civil Engineering",
        shortName: "CE",
        icon: "Building2",
    },
    {
        id: "mechanical-engineering",
        name: "Mechanical Engineering",
        shortName: "ME",
        icon: "Cog",
    },
    {
        id: "electrical-electronics-engineering",
        name: "Electrical and Electronics Engineering",
        shortName: "EEE",
        icon: "Zap",
    },
    {
        id: "electronics-communication-engineering",
        name: "Electronics and Communication Engineering",
        shortName: "ECE",
        icon: "Radio",
    },
    {
        id: "computer-science-engineering",
        name: "Computer Science and Engineering",
        shortName: "CSE",
        icon: "Monitor",
    },
    {
        id: "electronics-instrumentation-engineering",
        name: "Electronics and Instrumentation Engineering",
        shortName: "EIE",
        icon: "Gauge",
    },
    {
        id: "industrial-engineering-management",
        name: "Industrial Engineering and Management",
        shortName: "IEM",
        icon: "Factory",
    },
    {
        id: "electronics-telecommunication-engineering",
        name: "Electronics and Telecommunication Engineering",
        shortName: "ETE",
        icon: "Satellite",
    },
    {
        id: "information-science-engineering",
        name: "Information Science and Engineering",
        shortName: "ISE",
        icon: "Database",
    },
    {
        id: "artificial-intelligence-machine-learning",
        name: "Artificial Intelligence and Machine Learning",
        shortName: "AIML",
        icon: "Brain",
    },
    {
        id: "cse-iot-cybersecurity-blockchain",
        name: "CSE (IOT & Cyber Security, Blockchain Technology)",
        shortName: "CSE-ICB",
        icon: "Shield",
    },
    {
        id: "cse-data-science",
        name: "Computer Science & Engineering (Data Science)",
        shortName: "CSE-DS",
        icon: "BarChart3",
    },
    {
        id: "robotics-artificial-intelligence",
        name: "Robotics & Artificial Intelligence",
        shortName: "RAI",
        icon: "Bot",
    },
];

export const semesters = [3, 4, 5, 6, 7, 8] as const;

export const categories = [
    { id: "class-notes", name: "Class Notes", icon: "BookOpen" },
    { id: "internal-papers", name: "Internal Question Papers", icon: "FileText" },
    { id: "see-pyqs", name: "SEE PYQs", icon: "GraduationCap" },
] as const;

export interface FirstYearStream {
    id: string;
    name: string;
    shortName: string;
    icon: string;
}

export const firstYearStreams: FirstYearStream[] = [
    { id: "electrical", name: "Electrical (EEE) Stream", shortName: "EEE", icon: "Zap" },
    { id: "cse", name: "Computer Science (CSE) Stream", shortName: "CSE", icon: "Monitor" },
    { id: "mechanical", name: "Mechanical (ME) Stream", shortName: "ME", icon: "Cog" },
    { id: "civil", name: "Civil (CV) Stream", shortName: "CV", icon: "Building2" },
];

export const cycles = [
    { id: "p-cycle", name: "P - Cycle" },
    { id: "c-cycle", name: "C - Cycle" },
] as const;

export type Semester = (typeof semesters)[number];
export type CategoryId = (typeof categories)[number]["id"];

