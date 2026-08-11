export type ComicStatus = 'ONGOING' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type UserRole = 'ADMIN' | 'USER' | 'TRANSLATOR';

export * from './admin';

export interface User {
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  isBanned?: boolean;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  tokenType?: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
  userRole?: UserRole;
  isBanned?: boolean;
}

export interface RegisterResponse {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  role: UserRole;
}

export interface ComicResponse {
  id: number;
  title: string;
  slug: string;
  description?: string;
  author?: string;
  uploader?: string;
  coverImage?: string;
  viewCount: number;
  likeCount: number;
  rating?: number;
  status: ComicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterResponse {
  id: number;
  comicId: number;
  comicTitle?: string;
  comicSlug?: string;
  chapterNumber: number;
  title?: string;
  slug: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterImageResponse {
  id?: number;
  pageNumber?: number;
  imageUrl?: string;
  imagePath?: string;
  imageOrder?: number;
}

export interface ChapterDetailResponse extends ChapterResponse {
  images: ChapterImageResponse[];
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
}

export interface CommentResponse {
  id: number;
  comicId?: number;
  chapterId?: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ComicRateResponse {
  id: number;
  comicId: number;
  username: string;
  score: number;
  createdAt?: string;
}

export interface ComicLikeResponse {
  comicId: number;
  liked: boolean;
  likeCount: number;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Record<string, string>;
}

export interface ComicRequestData {
  title: string;
  description?: string;
  author?: string;
  status?: ComicStatus;
}

export interface ChapterRequestData {
  chapterNumber: number;
  title?: string;
}

export type ShelfStatus = 'READING' | 'FAVORITE' | 'COMPLETED' | 'READ_LATER';

export interface ReadingHistoryRequest {
  comicId: number;
  chapterId: number;
  pageNumber?: number;
  percentage?: number;
}

export interface ReadingHistoryResponse {
  id: number;
  comicId: number;
  comicTitle: string;
  comicSlug: string;
  coverImage?: string;
  chapterId: number;
  chapterNumber: number;
  chapterTitle?: string;
  chapterSlug: string;
  pageNumber: number;
  percentage: number;
  updatedAt: string;
}

export interface LibraryStatusRequest {
  comicId: number;
  status?: ShelfStatus | null;
}

export interface UserComicLibraryResponse {
  id: number;
  comicId: number;
  comicTitle: string;
  comicSlug: string;
  coverImage?: string;
  author?: string;
  comicStatus: ComicStatus;
  status: ShelfStatus;
  lastReadChapterId?: number;
  lastReadChapterNumber?: number;
  lastReadChapterSlug?: string;
  lastReadPageNumber?: number;
  lastReadPercentage?: number;
  updatedAt: string;
}

export interface PageBookmarkRequest {
  comicId: number;
  chapterId: number;
  pageNumber: number;
  note?: string;
}

export interface PageBookmarkResponse {
  id: number;
  comicId: number;
  comicTitle: string;
  comicSlug: string;
  chapterId: number;
  chapterNumber: number;
  chapterTitle?: string;
  chapterSlug: string;
  pageNumber: number;
  note?: string;
  createdAt: string;
}

