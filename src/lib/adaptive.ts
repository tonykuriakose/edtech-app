export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

// Looks at the student's last 5 quiz scores (0-100) and picks the right difficulty.
// avg < 60 → BEGINNER, 60-85 → INTERMEDIATE, > 85 → ADVANCED
export function computeDifficulty(scores: number[]): Difficulty {
  if (scores.length === 0) return "BEGINNER";
  const recent = scores.slice(-5);
  const avg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
  if (avg < 60) return "BEGINNER";
  if (avg <= 85) return "INTERMEDIATE";
  return "ADVANCED";
}

// Adds a topic to the weak list when failed; removes it when the student passes.
export function updateWeakTopics(
  current: string[],
  topic: string,
  passed: boolean
): string[] {
  if (passed) return current.filter((t) => t !== topic);
  if (current.includes(topic)) return current;
  return [...current, topic];
}
