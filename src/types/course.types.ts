export interface CreateCourseInput {
  title: string;
  description?: string;
  isPublished?: boolean;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  isPublished?: boolean;
}
