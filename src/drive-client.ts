/**
 * Google Drive API v3 Client
 * Uses OAuth 2.0 (Client ID + Client Secret + Refresh Token) for all operations.
 * Access tokens are auto-refreshed.
 */

import type {
  DriveConfig,
  DriveFile,
  DriveFileList,
  DrivePermission,
  DrivePermissionList,
  DriveComment,
  DriveCommentList,
  DriveReply,
  DriveReplyList,
  SharedDrive,
  SharedDriveList,
  DriveRevisionList,
  DriveAbout,
} from './types.js';

export class DriveClient {
  private config: DriveConfig;
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: DriveConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token refresh failed (${response.status}): ${error}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    params: Record<string, string> = {},
    rawResponse = false,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ''}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API Error (${response.status}): ${error}`);
    }

    if (rawResponse) {
      const text = await response.text();
      return { content: text, mimeType: response.headers.get('content-type') || 'text/plain' } as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ========== Files (10) ==========

  async searchFiles(params: {
    q?: string;
    fields?: string;
    pageSize?: number;
    pageToken?: string;
    orderBy?: string;
    spaces?: string;
    corpora?: string;
    driveId?: string;
    includeItemsFromAllDrives?: boolean;
    supportsAllDrives?: boolean;
  }): Promise<DriveFileList> {
    const queryParams: Record<string, string> = {};
    if (params.q) queryParams.q = params.q;
    if (params.fields) queryParams.fields = params.fields;
    else queryParams.fields = 'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents,webViewLink,owners,shared,trashed)';
    if (params.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.orderBy) queryParams.orderBy = params.orderBy;
    if (params.spaces) queryParams.spaces = params.spaces;
    if (params.corpora) queryParams.corpora = params.corpora;
    if (params.driveId) queryParams.driveId = params.driveId;
    if (params.includeItemsFromAllDrives) queryParams.includeItemsFromAllDrives = 'true';
    if (params.supportsAllDrives) queryParams.supportsAllDrives = 'true';
    return this.request('GET', '/files', undefined, queryParams);
  }

  async getFile(params: {
    fileId: string;
    fields?: string;
    supportsAllDrives?: boolean;
  }): Promise<DriveFile> {
    const queryParams: Record<string, string> = {};
    if (params.fields) queryParams.fields = params.fields;
    else queryParams.fields = '*';
    if (params.supportsAllDrives) queryParams.supportsAllDrives = 'true';
    return this.request('GET', `/files/${params.fileId}`, undefined, queryParams);
  }

  async readFile(params: {
    fileId: string;
  }): Promise<{ content: string; mimeType: string }> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/files/${params.fileId}?alt=media`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API Error (${response.status}): ${error}`);
    }

    const mimeType = response.headers.get('content-type') || 'application/octet-stream';

    if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('csv') || mimeType.includes('javascript') || mimeType.includes('html')) {
      const content = await response.text();
      return { content, mimeType };
    }

    const buffer = await response.arrayBuffer();
    return {
      content: `[Binary file: ${mimeType}, ${buffer.byteLength} bytes. Use gd_export_file for Google Workspace files or download via webContentLink.]`,
      mimeType,
    };
  }

  async createFile(params: {
    name: string;
    mimeType?: string;
    parents?: string[];
    description?: string;
    starred?: boolean;
    properties?: Record<string, string>;
  }): Promise<DriveFile> {
    const body: Record<string, unknown> = { name: params.name };
    if (params.mimeType) body.mimeType = params.mimeType;
    if (params.parents) body.parents = params.parents;
    if (params.description) body.description = params.description;
    if (params.starred !== undefined) body.starred = params.starred;
    if (params.properties) body.properties = params.properties;
    return this.request('POST', '/files', body, { fields: '*' });
  }

  async updateFile(params: {
    fileId: string;
    name?: string;
    description?: string;
    mimeType?: string;
    starred?: boolean;
    trashed?: boolean;
    addParents?: string;
    removeParents?: string;
    properties?: Record<string, string>;
  }): Promise<DriveFile> {
    const body: Record<string, unknown> = {};
    if (params.name) body.name = params.name;
    if (params.description !== undefined) body.description = params.description;
    if (params.mimeType) body.mimeType = params.mimeType;
    if (params.starred !== undefined) body.starred = params.starred;
    if (params.trashed !== undefined) body.trashed = params.trashed;
    if (params.properties) body.properties = params.properties;
    const queryParams: Record<string, string> = { fields: '*' };
    if (params.addParents) queryParams.addParents = params.addParents;
    if (params.removeParents) queryParams.removeParents = params.removeParents;
    return this.request('PATCH', `/files/${params.fileId}`, body, queryParams);
  }

  async copyFile(params: {
    fileId: string;
    name?: string;
    parents?: string[];
    description?: string;
  }): Promise<DriveFile> {
    const body: Record<string, unknown> = {};
    if (params.name) body.name = params.name;
    if (params.parents) body.parents = params.parents;
    if (params.description) body.description = params.description;
    return this.request('POST', `/files/${params.fileId}/copy`, body, { fields: '*' });
  }

  async deleteFile(params: {
    fileId: string;
    supportsAllDrives?: boolean;
  }): Promise<Record<string, unknown>> {
    const queryParams: Record<string, string> = {};
    if (params.supportsAllDrives) queryParams.supportsAllDrives = 'true';
    return this.request('DELETE', `/files/${params.fileId}`, undefined, queryParams);
  }

  async exportFile(params: {
    fileId: string;
    mimeType: string;
  }): Promise<{ content: string; mimeType: string }> {
    const token = await this.getAccessToken();
    const query = new URLSearchParams({ mimeType: params.mimeType }).toString();
    const url = `${this.baseUrl}/files/${params.fileId}/export?${query}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API Error (${response.status}): ${error}`);
    }

    const exportMime = params.mimeType;
    if (exportMime.startsWith('text/') || exportMime.includes('json') || exportMime.includes('xml') || exportMime.includes('csv') || exportMime.includes('html')) {
      const content = await response.text();
      return { content, mimeType: exportMime };
    }

    const buffer = await response.arrayBuffer();
    return {
      content: `[Binary export: ${exportMime}, ${buffer.byteLength} bytes. For binary formats like PDF/DOCX, use the webViewLink to download.]`,
      mimeType: exportMime,
    };
  }

  async createFolder(params: {
    name: string;
    parents?: string[];
    description?: string;
  }): Promise<DriveFile> {
    return this.createFile({
      name: params.name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: params.parents,
      description: params.description,
    });
  }

  async emptyTrash(): Promise<Record<string, unknown>> {
    return this.request('DELETE', '/files/trash');
  }

  // ========== Permissions (3) ==========

  async listPermissions(params: {
    fileId: string;
    fields?: string;
    pageSize?: number;
    pageToken?: string;
    supportsAllDrives?: boolean;
  }): Promise<DrivePermissionList> {
    const queryParams: Record<string, string> = {};
    if (params.fields) queryParams.fields = params.fields;
    else queryParams.fields = 'nextPageToken,permissions(id,type,emailAddress,domain,role,displayName,expirationTime,deleted,pendingOwner)';
    if (params.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.supportsAllDrives) queryParams.supportsAllDrives = 'true';
    return this.request('GET', `/files/${params.fileId}/permissions`, undefined, queryParams);
  }

  async shareFile(params: {
    fileId: string;
    type: string;
    role: string;
    emailAddress?: string;
    domain?: string;
    sendNotificationEmail?: boolean;
    emailMessage?: string;
    transferOwnership?: boolean;
    supportsAllDrives?: boolean;
  }): Promise<DrivePermission> {
    const body: Record<string, unknown> = {
      type: params.type,
      role: params.role,
    };
    if (params.emailAddress) body.emailAddress = params.emailAddress;
    if (params.domain) body.domain = params.domain;
    const queryParams: Record<string, string> = {};
    if (params.sendNotificationEmail !== undefined) queryParams.sendNotificationEmail = String(params.sendNotificationEmail);
    if (params.emailMessage) queryParams.emailMessage = params.emailMessage;
    if (params.transferOwnership) queryParams.transferOwnership = 'true';
    if (params.supportsAllDrives) queryParams.supportsAllDrives = 'true';
    return this.request('POST', `/files/${params.fileId}/permissions`, body, queryParams);
  }

  async unshareFile(params: {
    fileId: string;
    permissionId: string;
    supportsAllDrives?: boolean;
  }): Promise<Record<string, unknown>> {
    const queryParams: Record<string, string> = {};
    if (params.supportsAllDrives) queryParams.supportsAllDrives = 'true';
    return this.request('DELETE', `/files/${params.fileId}/permissions/${params.permissionId}`, undefined, queryParams);
  }

  // ========== Comments (3) ==========

  async listComments(params: {
    fileId: string;
    fields?: string;
    pageSize?: number;
    pageToken?: string;
    startModifiedTime?: string;
    includeDeleted?: boolean;
  }): Promise<DriveCommentList> {
    const queryParams: Record<string, string> = {};
    if (params.fields) queryParams.fields = params.fields;
    else queryParams.fields = 'nextPageToken,comments(id,createdTime,modifiedTime,author,content,deleted,resolved,replies)';
    if (params.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.startModifiedTime) queryParams.startModifiedTime = params.startModifiedTime;
    if (params.includeDeleted) queryParams.includeDeleted = 'true';
    return this.request('GET', `/files/${params.fileId}/comments`, undefined, queryParams);
  }

  async createComment(params: {
    fileId: string;
    content: string;
    anchor?: string;
    quotedFileContent?: { mimeType: string; value: string };
  }): Promise<DriveComment> {
    const body: Record<string, unknown> = { content: params.content };
    if (params.anchor) body.anchor = params.anchor;
    if (params.quotedFileContent) body.quotedFileContent = params.quotedFileContent;
    return this.request('POST', `/files/${params.fileId}/comments`, body, { fields: '*' });
  }

  async deleteComment(params: {
    fileId: string;
    commentId: string;
  }): Promise<Record<string, unknown>> {
    return this.request('DELETE', `/files/${params.fileId}/comments/${params.commentId}`);
  }

  // ========== Replies (2) ==========

  async listReplies(params: {
    fileId: string;
    commentId: string;
    fields?: string;
    pageSize?: number;
    pageToken?: string;
    includeDeleted?: boolean;
  }): Promise<DriveReplyList> {
    const queryParams: Record<string, string> = {};
    if (params.fields) queryParams.fields = params.fields;
    else queryParams.fields = 'nextPageToken,replies(id,createdTime,modifiedTime,author,content,deleted,action)';
    if (params.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.includeDeleted) queryParams.includeDeleted = 'true';
    return this.request('GET', `/files/${params.fileId}/comments/${params.commentId}/replies`, undefined, queryParams);
  }

  async createReply(params: {
    fileId: string;
    commentId: string;
    content: string;
    action?: string;
  }): Promise<DriveReply> {
    const body: Record<string, unknown> = { content: params.content };
    if (params.action) body.action = params.action;
    return this.request('POST', `/files/${params.fileId}/comments/${params.commentId}/replies`, body, { fields: '*' });
  }

  // ========== Shared Drives (3) ==========

  async listDrives(params: {
    pageSize?: number;
    pageToken?: string;
    q?: string;
  }): Promise<SharedDriveList> {
    const queryParams: Record<string, string> = {};
    if (params.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    if (params.q) queryParams.q = params.q;
    return this.request('GET', '/drives', undefined, queryParams);
  }

  async createDrive(params: {
    name: string;
    themeId?: string;
  }): Promise<SharedDrive> {
    const requestId = crypto.randomUUID();
    return this.request('POST', '/drives', { name: params.name, themeId: params.themeId }, { requestId });
  }

  async deleteDrive(params: {
    driveId: string;
  }): Promise<Record<string, unknown>> {
    return this.request('DELETE', `/drives/${params.driveId}`);
  }

  // ========== Revisions (1) ==========

  async listRevisions(params: {
    fileId: string;
    fields?: string;
    pageSize?: number;
    pageToken?: string;
  }): Promise<DriveRevisionList> {
    const queryParams: Record<string, string> = {};
    if (params.fields) queryParams.fields = params.fields;
    else queryParams.fields = 'nextPageToken,revisions(id,mimeType,modifiedTime,keepForever,published,lastModifyingUser,originalFilename,md5Checksum,size)';
    if (params.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params.pageToken) queryParams.pageToken = params.pageToken;
    return this.request('GET', `/files/${params.fileId}/revisions`, undefined, queryParams);
  }

  // ========== About (1) ==========

  async about(): Promise<DriveAbout> {
    return this.request('GET', '/about', undefined, {
      fields: 'user,storageQuota,importFormats,exportFormats,maxUploadSize,appInstalled,canCreateDrives,folderColorPalette',
    });
  }
}
