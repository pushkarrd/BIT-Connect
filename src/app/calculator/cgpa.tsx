"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type GradeLetter,
  type CalculationResult,
  GRADE_MAP,
  CREDIT_OPTIONS,
  MIN_SEE_RAW,
  calculateRequiredSEE,
} from "@/lib/grades";
import {
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Info,
} from "lucide-react";

export default function CGPACalculator() {
  const [cie, setCie] = React.useState("");
  const [credits, setCredits] = React.useState("");
  const [desiredGrade, setDesiredGrade] = React.useState("");
  const [result, setResult] = React.useState<CalculationResult | null>(null);
  const [error, setError] = React.useState("");

  function handleCalculate() {
    setError("");
    setResult(null);

    const cieNum = Number(cie);

    if (cie === "" || isNaN(cieNum)) {
      setError("Please enter valid CIE marks.");
      return;
    }
    if (cieNum < 0 || cieNum > 50) {
      setError("CIE marks must be between 0 and 50.");
      return;
    }
    if (!credits) {
      setError("Please select subject credits.");
      return;
    }
    if (!desiredGrade) {
      setError("Please select a desired grade.");
      return;
    }

    const res = calculateRequiredSEE(cieNum, desiredGrade as GradeLetter);
    setResult(res);
  }

  function handleReset() {
    setCie("");
    setCredits("");
    setDesiredGrade("");
    setResult(null);
    setError("");
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-4">
              VTU Grade System
            </Badge>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              SEE{" "}
              <span className="text-primary">Grade Calculator</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Enter your CIE marks and desired grade to find out exactly how
              much you need in the SEE exam.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </section>

      {/* Calculator */}
      <section className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Calculate Required SEE Marks</CardTitle>
                <CardDescription>
                  Based on VTU&apos;s grading scheme (SEE out of 100, scaled to 50)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* CIE Marks */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cie">Finalized CIE Marks (out of 50)</Label>
              <Input
                id="cie"
                type="number"
                min={0}
                max={50}
                placeholder="e.g. 35"
                value={cie}
                onChange={(e) => setCie(e.target.value)}
              />
            </div>

            {/* Credits */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="credits">Subject Credits</Label>
              <Select value={credits} onValueChange={setCredits}>
                <SelectTrigger id="credits" className="w-full">
                  <SelectValue placeholder="Select credits" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_OPTIONS.map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      {c} Credit{c !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desired Grade */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="grade">Desired Grade</Label>
              <Select value={desiredGrade} onValueChange={setDesiredGrade}>
                <SelectTrigger id="grade" className="w-full">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_MAP.map((g) => (
                    <SelectItem key={g.grade} value={g.grade}>
                      {g.grade} — {g.points} pts (≥ {g.minTotal}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCalculate} className="flex-1">
                <Calculator className="mr-1.5 h-4 w-4" />
                Calculate
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Result</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Status */}
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  {result.status === "possible" && (
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  )}
                  {result.status === "not-possible" && (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  {result.status === "min-see-required" && (
                    <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                  )}
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      result.status === "possible"
                        ? "default"
                        : result.status === "min-see-required"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {result.status === "possible" && "Possible"}
                    {result.status === "not-possible" && "Not Possible"}
                    {result.status === "min-see-required" && "Min SEE Required"}
                  </Badge>
                </div>

                {/* Required SEE Marks */}
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  <span className="text-2xl font-bold">
                    {result.status === "not-possible"
                      ? "—"
                      : result.requiredSEERaw}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Required SEE Marks (out of 100)
                  </span>
                </div>

                {/* Grade & Points */}
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  <span className="text-2xl font-bold">{result.grade}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.gradePoints} Grade Points
                  </span>
                </div>
              </div>

              {/* Min-SEE helper text */}
              {result.status === "min-see-required" && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Grade requirement already met by CIE, but a minimum of{" "}
                    <strong>{MIN_SEE_RAW} marks</strong> in SEE (out of 100) is
                    mandatory to pass under VTU rules.
                  </span>
                </div>
              )}

              {/* General VTU rule note */}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                VTU requires a minimum of {MIN_SEE_RAW}/100 in SEE to pass, regardless of total marks.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grade Reference Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">VTU Grade Reference</CardTitle>
            <CardDescription>
              Minimum total percentage required for each grade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Grade</th>
                    <th className="pb-2 font-medium text-muted-foreground">Min Total %</th>
                    <th className="pb-2 font-medium text-muted-foreground">Grade Points</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADE_MAP.map((g) => (
                    <tr key={g.grade} className="border-b last:border-0">
                      <td className="py-2 font-medium">{g.grade}</td>
                      <td className="py-2">≥ {g.minTotal}</td>
                      <td className="py-2">{g.points}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 font-medium text-destructive">F</td>
                    <td className="py-2">&lt; 40</td>
                    <td className="py-2">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
