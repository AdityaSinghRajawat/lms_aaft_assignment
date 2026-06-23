export interface UpsertProgressInput {
  lessonId: string;
  /** Resume position within the video, in seconds. */
  lastPositionSeconds: number;
  /** Watched fraction, 0–100. */
  percentage: number;
  /** Optional explicit completion flag; auto-derived at the 90% threshold otherwise. */
  completed?: boolean;
  /** Optional additional watch time to accumulate, in seconds. */
  timeSpentDeltaSeconds?: number;
}
