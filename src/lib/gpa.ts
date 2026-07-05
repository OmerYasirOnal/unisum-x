import { Grade } from './api';

// Default Turkish letter scale (min average → letter/gpa).
const SCALE: [string, number, number][] = [
  ['AA', 90, 4.0], ['BA', 85, 3.5], ['BB', 75, 3.0], ['CB', 65, 2.5],
  ['CC', 60, 2.0], ['DC', 50, 1.5], ['DD', 45, 1.0], ['FD', 40, 0.5], ['FF', 0, 0.0],
];

export function letterFor(avg: number) {
  for (const [letter, min, gpa] of SCALE) if (avg >= min) return { letter, gpa };
  return { letter: 'FF', gpa: 0 };
}

export const usedWeight = (grades: Grade[]) => grades.reduce((s, g) => s + g.weight, 0);
export const currentAverage = (grades: Grade[]) => grades.reduce((s, g) => s + g.score * (g.weight / 100), 0);

/** What average will you have if you score `score` across all remaining weight? */
export function whatIf(grades: Grade[], score: number) {
  const remaining = 100 - usedWeight(grades);
  return currentAverage(grades) + score * (remaining / 100);
}

/** Score needed on the remaining weight to reach `targetAvg`. */
export function requiredScore(grades: Grade[], targetAvg: number) {
  const used = usedWeight(grades);
  const remaining = 100 - used;
  const current = currentAverage(grades);
  if (remaining <= 0) return { remaining: 0, needed: null as number | null, alreadyMet: current >= targetAvg };
  const needed = (targetAvg - current) / (remaining / 100);
  return { remaining, needed, feasible: needed <= 100, alreadyMet: needed <= 0 };
}

export function termGPA(courses: { gpa?: number; credits: number }[]) {
  const credits = courses.reduce((s, c) => s + c.credits, 0);
  if (!credits) return 0;
  return courses.reduce((s, c) => s + (c.gpa || 0) * c.credits, 0) / credits;
}
export const totalCredits = (courses: { credits: number }[]) => courses.reduce((s, c) => s + c.credits, 0);

/** Cumulative GPA across all courses of all terms. */
export function cumulativeGPA(all: { gpa?: number; credits: number }[]) {
  return termGPA(all);
}
