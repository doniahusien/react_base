export type FileType = "image" | "video" | "file";

export interface UploadedFile {
  id: string | number;
  src: string;
  file: File | null;
  type: FileType;
  ext: string;
  str: string | null;
  percentage: number;
  isUploading: boolean;
  isUploaded: boolean;
  isFailed: boolean;
  isSaved: boolean;
  abortController: AbortController | null;
}

export interface FileOutputItem {
  id: string | number;
  file: File | null;
  type: FileType;
  str: string | null;
}
