/**
 * Google Drive API v3 - MCP Tool Definitions (23 tools)
 */

export interface ToolAnnotation {
  title: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations: ToolAnnotation;
  inputSchema: Record<string, unknown>;
}

export const TOOLS: MCPToolDefinition[] = [
  // ========== Files (10) ==========
  {
    name: 'gd_search_files',
    description:
      'Search and list files in Google Drive. Use the q parameter for powerful search queries: name contains, mimeType, parent folder, trashed status, date filters. Returns file metadata with pagination support.',
    annotations: {
      title: 'Search Files',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description: 'Search query using Drive query syntax. Examples: "name contains \'report\'", "mimeType = \'application/vnd.google-apps.folder\'", "\'folderId\' in parents", "trashed = false", "modifiedTime > \'2024-01-01\'"',
        },
        page_size: {
          type: 'number',
          description: 'Maximum results per page (1-1000, default: 100)',
        },
        page_token: {
          type: 'string',
          description: 'Pagination token from previous response',
        },
        order_by: {
          type: 'string',
          description: 'Sort order. Options: "createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime". Append " desc" for descending.',
        },
        spaces: {
          type: 'string',
          description: 'Spaces to query: "drive", "appDataFolder" (default: "drive")',
        },
        corpora: {
          type: 'string',
          description: 'Bodies of items to search: "user", "drive", "domain", "allDrives"',
        },
        drive_id: {
          type: 'string',
          description: 'ID of the shared drive to search (requires corpora="drive")',
        },
        include_items_from_all_drives: {
          type: 'boolean',
          description: 'Include items from shared drives (default: false)',
        },
        fields: {
          type: 'string',
          description: 'Fields to include in response (default: id,name,mimeType,size,modifiedTime,parents,webViewLink,owners,shared,trashed)',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
    },
  },
  {
    name: 'gd_get_file',
    description:
      'Get detailed metadata for a specific file or folder by ID. Returns all available metadata fields including size, owners, permissions, timestamps, and links.',
    annotations: {
      title: 'Get File Metadata',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file or folder',
        },
        fields: {
          type: 'string',
          description: 'Fields to include (default: all fields with *)',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_read_file',
    description:
      'Read/download file content. Returns text content for text-based files (txt, csv, json, html, xml, code). For binary files, returns file info. For Google Workspace files (Docs, Sheets, Slides), use gd_export_file instead.',
    annotations: {
      title: 'Read File Content',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file to read',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_create_file',
    description:
      'Create a new file or Google Workspace document (metadata only, no content upload). To create a folder, use gd_create_folder. For Google Docs, set mimeType to "application/vnd.google-apps.document".',
    annotations: {
      title: 'Create File',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'File name',
        },
        mime_type: {
          type: 'string',
          description: 'MIME type. Google Workspace: "application/vnd.google-apps.document" (Docs), "application/vnd.google-apps.spreadsheet" (Sheets), "application/vnd.google-apps.presentation" (Slides)',
        },
        parents: {
          type: 'array',
          items: { type: 'string' },
          description: 'Parent folder ID(s). If empty, file is created in root.',
        },
        description: {
          type: 'string',
          description: 'File description',
        },
        starred: {
          type: 'boolean',
          description: 'Whether to star the file',
        },
        properties: {
          type: 'object',
          description: 'Custom key-value properties for the file',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'gd_update_file',
    description:
      'Update file metadata — rename, change description, star/unstar, move between folders, or trash/untrash. Use add_parents/remove_parents to move files.',
    annotations: {
      title: 'Update File',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file to update',
        },
        name: {
          type: 'string',
          description: 'New file name',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        starred: {
          type: 'boolean',
          description: 'Star or unstar the file',
        },
        trashed: {
          type: 'boolean',
          description: 'Move to trash (true) or restore from trash (false)',
        },
        add_parents: {
          type: 'string',
          description: 'Comma-separated parent folder IDs to add (moves file to these folders)',
        },
        remove_parents: {
          type: 'string',
          description: 'Comma-separated parent folder IDs to remove (moves file out of these folders)',
        },
        properties: {
          type: 'object',
          description: 'Custom key-value properties to set',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_copy_file',
    description:
      'Create a copy of a file. Optionally specify a new name, destination folder, or description for the copy.',
    annotations: {
      title: 'Copy File',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file to copy',
        },
        name: {
          type: 'string',
          description: 'Name for the copy (default: "Copy of {original}")',
        },
        parents: {
          type: 'array',
          items: { type: 'string' },
          description: 'Parent folder ID(s) for the copy',
        },
        description: {
          type: 'string',
          description: 'Description for the copy',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_delete_file',
    description:
      'Permanently delete a file or folder. This action is irreversible — the file will NOT go to trash. Use gd_update_file with trashed=true to move to trash instead.',
    annotations: {
      title: 'Delete File',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file or folder to permanently delete',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_export_file',
    description:
      'Export a Google Workspace file (Docs, Sheets, Slides, Drawings) to a standard format. Use this for Google-native files; use gd_read_file for regular files. Supported exports: Docs→text/plain,text/html,application/pdf; Sheets→text/csv,application/pdf; Slides→application/pdf,text/plain.',
    annotations: {
      title: 'Export File',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the Google Workspace file to export',
        },
        mime_type: {
          type: 'string',
          description: 'Export MIME type. Docs: "text/plain", "text/html", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document". Sheets: "text/csv", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet". Slides: "application/pdf", "text/plain".',
        },
      },
      required: ['file_id', 'mime_type'],
    },
  },
  {
    name: 'gd_create_folder',
    description:
      'Create a new folder in Google Drive. Optionally specify a parent folder to create it as a subfolder.',
    annotations: {
      title: 'Create Folder',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Folder name',
        },
        parents: {
          type: 'array',
          items: { type: 'string' },
          description: 'Parent folder ID(s). If empty, created in root.',
        },
        description: {
          type: 'string',
          description: 'Folder description',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'gd_empty_trash',
    description:
      'Permanently delete ALL files in the trash. This action is irreversible. All trashed files for the authenticated user will be permanently removed.',
    annotations: {
      title: 'Empty Trash',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========== Permissions (3) ==========
  {
    name: 'gd_list_permissions',
    description:
      'List all permissions (sharing settings) for a file or folder. Shows who has access, their role (owner, writer, commenter, reader), and sharing type (user, group, domain, anyone).',
    annotations: {
      title: 'List Permissions',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file or folder',
        },
        page_size: {
          type: 'number',
          description: 'Maximum results per page (1-100)',
        },
        page_token: {
          type: 'string',
          description: 'Pagination token from previous response',
        },
        fields: {
          type: 'string',
          description: 'Fields to include in response',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_share_file',
    description:
      'Share a file or folder by creating a permission. Share with a specific user (email), domain, or make public (anyone). Set role to control access level.',
    annotations: {
      title: 'Share File',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file or folder to share',
        },
        type: {
          type: 'string',
          description: 'Permission type: "user", "group", "domain", "anyone"',
        },
        role: {
          type: 'string',
          description: 'Access level: "owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"',
        },
        email_address: {
          type: 'string',
          description: 'Email address of the user or group (required for type "user" or "group")',
        },
        domain: {
          type: 'string',
          description: 'Domain name (required for type "domain")',
        },
        send_notification_email: {
          type: 'boolean',
          description: 'Send notification email to the user (default: true)',
        },
        email_message: {
          type: 'string',
          description: 'Custom message in the notification email',
        },
        transfer_ownership: {
          type: 'boolean',
          description: 'Transfer ownership to the specified user (role must be "owner")',
        },
      },
      required: ['file_id', 'type', 'role'],
    },
  },
  {
    name: 'gd_unshare_file',
    description:
      'Remove a permission from a file or folder, revoking access for a user, group, or domain. Use gd_list_permissions to find the permission_id first.',
    annotations: {
      title: 'Unshare File',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file or folder',
        },
        permission_id: {
          type: 'string',
          description: 'The ID of the permission to remove (from gd_list_permissions)',
        },
      },
      required: ['file_id', 'permission_id'],
    },
  },

  // ========== Comments (3) ==========
  {
    name: 'gd_list_comments',
    description:
      'List comments on a file. Returns comment text, author, timestamps, resolved status, and inline replies.',
    annotations: {
      title: 'List Comments',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file',
        },
        page_size: {
          type: 'number',
          description: 'Maximum results per page (1-100, default: 20)',
        },
        page_token: {
          type: 'string',
          description: 'Pagination token from previous response',
        },
        start_modified_time: {
          type: 'string',
          description: 'Only return comments modified after this time (RFC3339)',
        },
        include_deleted: {
          type: 'boolean',
          description: 'Include deleted comments (default: false)',
        },
        fields: {
          type: 'string',
          description: 'Fields to include in response',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'gd_create_comment',
    description:
      'Add a comment to a file. The comment will be attributed to the authenticated user.',
    annotations: {
      title: 'Create Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file to comment on',
        },
        content: {
          type: 'string',
          description: 'The comment text (plain text)',
        },
      },
      required: ['file_id', 'content'],
    },
  },
  {
    name: 'gd_delete_comment',
    description:
      'Delete a comment from a file. Only the comment author or file owner can delete comments.',
    annotations: {
      title: 'Delete Comment',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file',
        },
        comment_id: {
          type: 'string',
          description: 'The ID of the comment to delete',
        },
      },
      required: ['file_id', 'comment_id'],
    },
  },

  // ========== Replies (2) ==========
  {
    name: 'gd_list_replies',
    description:
      'List replies to a specific comment on a file.',
    annotations: {
      title: 'List Replies',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file',
        },
        comment_id: {
          type: 'string',
          description: 'The ID of the comment',
        },
        page_size: {
          type: 'number',
          description: 'Maximum results per page (1-100, default: 20)',
        },
        page_token: {
          type: 'string',
          description: 'Pagination token from previous response',
        },
        include_deleted: {
          type: 'boolean',
          description: 'Include deleted replies (default: false)',
        },
        fields: {
          type: 'string',
          description: 'Fields to include in response',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
      required: ['file_id', 'comment_id'],
    },
  },
  {
    name: 'gd_create_reply',
    description:
      'Reply to a comment on a file. Optionally resolve the comment thread with action="resolve".',
    annotations: {
      title: 'Create Reply',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file',
        },
        comment_id: {
          type: 'string',
          description: 'The ID of the comment to reply to',
        },
        content: {
          type: 'string',
          description: 'The reply text (plain text)',
        },
        action: {
          type: 'string',
          description: 'Action to perform: "resolve" (resolve the comment thread) or "reopen" (reopen a resolved thread)',
        },
      },
      required: ['file_id', 'comment_id', 'content'],
    },
  },

  // ========== Shared Drives (3) ==========
  {
    name: 'gd_list_drives',
    description:
      'List shared drives (formerly Team Drives) that the user has access to. Supports search query for filtering by name.',
    annotations: {
      title: 'List Shared Drives',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_size: {
          type: 'number',
          description: 'Maximum results per page (1-100, default: 10)',
        },
        page_token: {
          type: 'string',
          description: 'Pagination token from previous response',
        },
        q: {
          type: 'string',
          description: 'Search query to filter shared drives (e.g., "name contains \'project\'")',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
    },
  },
  {
    name: 'gd_create_drive',
    description:
      'Create a new shared drive (requires Google Workspace account). The authenticated user becomes the organizer.',
    annotations: {
      title: 'Create Shared Drive',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the shared drive',
        },
        theme_id: {
          type: 'string',
          description: 'Theme ID for the shared drive background (from gd_about driveThemes)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'gd_delete_drive',
    description:
      'Permanently delete a shared drive. The drive must be empty (no files) before it can be deleted. This action is irreversible.',
    annotations: {
      title: 'Delete Shared Drive',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        drive_id: {
          type: 'string',
          description: 'The ID of the shared drive to delete',
        },
      },
      required: ['drive_id'],
    },
  },

  // ========== Revisions (1) ==========
  {
    name: 'gd_list_revisions',
    description:
      'List revision history for a file. Shows who modified the file, when, file size at each revision, and checksums.',
    annotations: {
      title: 'List Revisions',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'The ID of the file',
        },
        page_size: {
          type: 'number',
          description: 'Maximum results per page (1-200, default: 200)',
        },
        page_token: {
          type: 'string',
          description: 'Pagination token from previous response',
        },
        fields: {
          type: 'string',
          description: 'Fields to include in response',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
      required: ['file_id'],
    },
  },

  // ========== About (1) ==========
  {
    name: 'gd_about',
    description:
      'Get information about the authenticated user and their Google Drive — storage quota, import/export formats, and capabilities.',
    annotations: {
      title: 'About Drive',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
    },
  },
];
