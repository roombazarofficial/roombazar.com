/** Envelope shared by every list endpoint. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  /** Field-level messages, keyed by form field name. */
  fields?: Record<string, string>;
}
