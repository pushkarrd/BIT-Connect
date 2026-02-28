import Link from "next/link";
import { branches } from "@/data/branches";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Cog,
  Zap,
  Radio,
  Monitor,
  Gauge,
  Factory,
  Satellite,
  Database,
  Brain,
  Shield,
  BarChart3,
  Bot,
  ArrowRight,
  BookOpen,
  Upload,
  Users,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Cog,
  Zap,
  Radio,
  Monitor,
  Gauge,
  Factory,
  Satellite,
  Database,
  Brain,
  Shield,
  BarChart3,
  Bot,
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-4">
              By the students, for the students
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your{" "}
              <span className="text-primary">Academic Resource Hub</span> at
              BIT
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Instantly access notes, internal question papers, and SEE PYQs for
              all 13 UG branches. No sign-up required — just browse and
              download.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <a href="#browse">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Resources
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/community">
                  <Users className="mr-2 h-4 w-4" />
                  Community Board
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">13</strong> UG Branches
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">Anonymous</strong> Uploads
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">Zero</strong> Friction
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Background grid pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </section>

      {/* Browse Resource Vault */}
      <section id="browse" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* 1st Year Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              1st Year
            </h2>
            <p className="mt-1 text-muted-foreground">
              Common resources for 1st year students — choose your stream and cycle.
            </p>
          </div>

          <Link href="/vault/first-year">
            <Card className="group transition-all hover:shadow-md hover:border-primary/30 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardAction>
                  <Badge>4 Streams</Badge>
                </CardAction>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">
                      1st Year — All Streams
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      EEE • CSE • ME • CV — P-Cycle & C-Cycle
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Branch Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Select Your Branch
          </h2>
          <p className="mt-1 text-muted-foreground">
            Choose your department to browse study materials (Sem 3–8).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {branches.map((branch) => {
            const Icon = iconMap[branch.icon] || BookOpen;
            return (
              <Link key={branch.id} href={`/vault/${branch.id}`}>
                <Card className="group h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardHeader>
                    <CardAction>
                      <Badge variant="outline">{branch.shortName}</Badge>
                    </CardAction>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-sm leading-tight">
                          {branch.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          Sem 3–8
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-primary">&ldquo;Built by the Students, for the Students.&rdquo;</span>
            </h2>
          </div>

          <div className="space-y-10">
            {/* About Us */}
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-3">
                The Exam-Season Panic is Real.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We have all been there. It is the night before an internal test
                or the dreaded Semester End Examinations (SEE), and the college
                WhatsApp groups are in pure chaos. Everyone is stressed,
                scrambling, and endlessly scrolling just to find that one
                elusive set of previous year question papers or the right
                module notes.
              </p>
            </div>

            {/* Our Vision */}
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-3">
                Our Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                That shared frustration sparked a simple idea: what if there
                was a single, organized place for all of us? This platform was
                built to completely eliminate that pre-exam panic for every
                student at Bangalore Institute of Technology. We wanted to
                create a centralized, frictionless hub where finding study
                materials is no longer a scavenger hunt.
              </p>
            </div>

            {/* What We Offer */}
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-3">
                What We Offer
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We have gathered and organized academic resources across all
                13 UG branches. Whether you are looking for specific
                department class notes, internal test papers, or SEE PYQs,
                everything is neatly categorized and instantly accessible. No
                gatekeeping, no endless searching—just the exact materials you
                need to succeed, exactly when you need them.
              </p>
            </div>

            {/* Call to action */}
            <div className="text-center pt-4 border-t">
              <p className="text-lg font-semibold">
                Let&apos;s ace these exams together.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
