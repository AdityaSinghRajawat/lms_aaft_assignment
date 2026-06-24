export interface UpsertProgressInput {
  lessonId: string;
  lastPositionSeconds: number;
  percentage: number;
  /** Auto-derived at the 90% threshold when omitted. */
  completed?: boolean;
  timeSpentDeltaSeconds?: number;
}
