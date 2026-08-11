import { UserRole } from './index';

export type ReportType = 'COMMENT' | 'CHAPTER' | 'COMIC';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ReportReason = 'SPAM' | 'INAPPROPRIATE_CONTENT' | 'SPOILER' | 'COPYRIGHT' | 'HARASSMENT' | 'OTHER';
export type ReportAction = 'DISMISS' | 'DELETE_CONTENT' | 'WARN_USER' | 'BAN_USER';

export interface AdminOverviewData {
  totalUsers: number;
  totalComics: number;
  totalReads: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  pendingReportsCount: number;
  bannedUsersCount: number;
}

export interface TrendingComicItem {
  comicId: number;
  title: string;
  slug: string;
  coverImage?: string;
  author?: string;
  readCountInPeriod: number;
  totalViewCount: number;
  avgRating: number;
}

export interface UserGrowthDataPoint {
  date: string;
  count: number;
}

export interface AdminUserItem {
  userId: number;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  createdAt: string;
}

export interface BanUserPayload {
  reason: string;
}

export interface UpdateRolePayload {
  role: UserRole;
}

export interface ReportItem {
  id: number;
  reporterId?: number;
  reporterUsername: string;
  reportType: ReportType;
  targetId: number;
  targetTitle?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  handledByUsername?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportPayload {
  reportType: ReportType;
  targetId: number;
  reason: ReportReason;
  description?: string;
}

export interface ResolveReportPayload {
  action: ReportAction;
  resolutionNote?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}
