export function gradeLabel(avgScore: number): string {
  if (avgScore >= 80) return 'A+'
  if (avgScore >= 75) return 'A'
  if (avgScore >= 70) return 'B+'
  if (avgScore >= 65) return 'B'
  if (avgScore >= 60) return 'C+'
  return 'C'
}
