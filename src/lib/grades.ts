/**
 * VTU Grade System utilities
 *
 * SEE exam is conducted for 100 marks and scaled down to 50.
 * Final Total = CIE (out of 50) + (SEE_raw / 100) * 50
 */

export type GradeLetter = "O" | "A+" | "A" | "B+" | "B" | "C" | "P";

export interface GradeInfo {
  grade: GradeLetter;
  minTotal: number;
  points: number;
}

/** Ordered from highest to lowest */
export const GRADE_MAP: GradeInfo[] = [
  { grade: "O", minTotal: 90, points: 10 },
  { grade: "A+", minTotal: 80, points: 9 },
  { grade: "A", minTotal: 70, points: 8 },
  { grade: "B+", minTotal: 60, points: 7 },
  { grade: "B", minTotal: 55, points: 6 },
  { grade: "C", minTotal: 50, points: 5 },
  { grade: "P", minTotal: 40, points: 4 },
];

export const CREDIT_OPTIONS = [0, 1, 3, 4] as const;

export type CalculationStatus = "possible" | "not-possible" | "already-secured";

export interface CalculationResult {
  requiredSEERaw: number;
  status: CalculationStatus;
  gradePoints: number;
  grade: GradeLetter;
}

/**
 * Get grade info for a given grade letter.
 */
export function getGradeInfo(grade: GradeLetter): GradeInfo {
  const info = GRADE_MAP.find((g) => g.grade === grade);
  if (!info) throw new Error(`Invalid grade: ${grade}`);
  return info;
}

/**
 * Calculate the required raw SEE marks (out of 100) to achieve
 * the desired grade, given finalized CIE marks (out of 50).
 */
export function calculateRequiredSEE(
  cie: number,
  desiredGrade: GradeLetter
): CalculationResult {
  const { minTotal, points, grade } = getGradeInfo(desiredGrade);

  // requiredSEE_scaled = minTotal - CIE
  const requiredScaled = minTotal - cie;

  // requiredSEE_raw = (requiredScaled / 50) * 100
  const requiredRaw = (requiredScaled / 50) * 100;

  let status: CalculationStatus;

  if (requiredRaw <= 0) {
    status = "already-secured";
  } else if (requiredRaw > 100) {
    status = "not-possible";
  } else {
    status = "possible";
  }

  return {
    requiredSEERaw: Math.round(requiredRaw * 100) / 100, // 2 decimal places
    status,
    gradePoints: points,
    grade,
  };
}
