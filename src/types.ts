/**
 * Google Drive API v3 - Type Definitions
 */

export interface DriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

// --- File ---

export interface DriveFile {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  parents?: string[];
  properties?: Record<string, string>;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: DriveUser[];
  lastModifyingUser?: DriveUser;
  shared?: boolean;
  capabilities?: Record<string, boolean>;
  permissions?: DrivePermission[];
  hasThumbnail?: boolean;
  fileExtension?: string;
  md5Checksum?: string;
  sha1Checksum?: string;
  sha256Checksum?: string;
  headRevisionId?: string;
  fullFileExtension?: string;
  originalFilename?: string;
  quotaBytesUsed?: string;
  spaces?: string[];
}

export interface DriveUser {
  kind: string;
  displayName: string;
  photoLink?: string;
  me?: boolean;
  permissionId?: string;
  emailAddress?: string;
}

// --- File List ---

export interface DriveFileList {
  kind: string;
  nextPageToken?: string;
  incompleteSearch?: boolean;
  files: DriveFile[];
}

// --- Permission ---

export interface DrivePermission {
  kind: string;
  id: string;
  type: string;
  emailAddress?: string;
  domain?: string;
  role: string;
  displayName?: string;
  photoLink?: string;
  deleted?: boolean;
  expirationTime?: string;
  pendingOwner?: boolean;
}

export interface DrivePermissionList {
  kind: string;
  nextPageToken?: string;
  permissions: DrivePermission[];
}

// --- Comment ---

export interface DriveComment {
  kind: string;
  id: string;
  createdTime: string;
  modifiedTime: string;
  author: DriveUser;
  content: string;
  htmlContent?: string;
  deleted: boolean;
  resolved: boolean;
  replies?: DriveReply[];
  quotedFileContent?: {
    mimeType: string;
    value: string;
  };
  anchor?: string;
}

export interface DriveCommentList {
  kind: string;
  nextPageToken?: string;
  comments: DriveComment[];
}

// --- Reply ---

export interface DriveReply {
  kind: string;
  id: string;
  createdTime: string;
  modifiedTime: string;
  author: DriveUser;
  content: string;
  htmlContent?: string;
  deleted: boolean;
  action?: string;
}

export interface DriveReplyList {
  kind: string;
  nextPageToken?: string;
  replies: DriveReply[];
}

// --- Shared Drive ---

export interface SharedDrive {
  kind: string;
  id: string;
  name: string;
  colorRgb?: string;
  createdTime?: string;
  hidden?: boolean;
  capabilities?: Record<string, boolean>;
  restrictions?: Record<string, boolean>;
  backgroundImageFile?: {
    id: string;
    xCoordinate: number;
    yCoordinate: number;
    width: number;
  };
  backgroundImageLink?: string;
  themeId?: string;
  orgUnitId?: string;
}

export interface SharedDriveList {
  kind: string;
  nextPageToken?: string;
  drives: SharedDrive[];
}

// --- Revision ---

export interface DriveRevision {
  kind: string;
  id: string;
  mimeType: string;
  modifiedTime: string;
  keepForever?: boolean;
  published?: boolean;
  publishedOutsideDomain?: boolean;
  publishAuto?: boolean;
  lastModifyingUser?: DriveUser;
  originalFilename?: string;
  md5Checksum?: string;
  size?: string;
  exportLinks?: Record<string, string>;
}

export interface DriveRevisionList {
  kind: string;
  nextPageToken?: string;
  revisions: DriveRevision[];
}

// --- About ---

export interface DriveAbout {
  kind: string;
  user: DriveUser;
  storageQuota: {
    limit?: string;
    usage: string;
    usageInDrive: string;
    usageInDriveTrash: string;
  };
  importFormats: Record<string, string[]>;
  exportFormats: Record<string, string[]>;
  maxImportSizes: Record<string, string>;
  maxUploadSize: string;
  appInstalled: boolean;
  folderColorPalette: string[];
  canCreateDrives: boolean;
  canCreateTeamDrives: boolean;
  driveThemes: Array<{
    id: string;
    backgroundImageLink: string;
    colorRgb: string;
  }>;
}
