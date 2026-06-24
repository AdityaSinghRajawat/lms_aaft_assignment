export interface CreateLessonInput {
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  sortOrder?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  sortOrder?: number;
}
