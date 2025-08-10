// lib/MediaUploader.ts

export type ProgressHandler = (progressEvent: {
  loaded: number;
  total: number;
  lengthComputable?: boolean;
}) => void;

export type ErrorHandler = (error: string) => void;

export type CompleteHandler = (responseText: string) => void;

export interface MediaUploaderOptions {
  baseUrl: string;
  file: File;
  token: string;
  metadata?: any;
  params?: { [key: string]: string };
  onError?: ErrorHandler;
  onProgress?: ProgressHandler;
  onComplete?: CompleteHandler;
}

export declare class MediaUploader {
  baseUrl: string;
  file: File;
  token: string;
  metadata?: any;
  params?: { [key: string]: string };
  onError?: ErrorHandler;
  onProgress?: ProgressHandler;
  onComplete?: CompleteHandler;
  xhr: XMLHttpRequest | null;

  constructor(options: MediaUploaderOptions);

  upload(): void;

  // Optional method if implemented
  abort?(): void;
}
