export interface PaginationMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
  from?: number;
  to?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

export interface Translation {
  name?: string;
  currency?: string;
  [key: string]: string | undefined;
}

export interface MediaAttachment {
  id: number;
  media: string;
  type?: string;
  ext?: string;
}

export interface SelectOption {
  id: number | string;
  name: string;
  [key: string]: any;
}
