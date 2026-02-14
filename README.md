# @node2flow/google-drive-mcp

[![smithery badge](https://smithery.ai/badge/node2flow/google-drive)](https://smithery.ai/server/node2flow/google-drive)
[![npm version](https://img.shields.io/npm/v/@node2flow/google-drive-mcp.svg)](https://www.npmjs.com/package/@node2flow/google-drive-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for **Google Drive** — search, read, create, share, comment, and manage files through 23 tools via the Model Context Protocol.

## Quick Start

### Claude Desktop / Cursor

Add to your MCP config:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@node2flow/google-drive-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

### HTTP Mode

```bash
GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=xxx GOOGLE_REFRESH_TOKEN=xxx npx @node2flow/google-drive-mcp --http
```

MCP endpoint: `http://localhost:3000/mcp`

### Cloudflare Worker

Available at: `https://google-drive-mcp-community.node2flow.net/mcp`

```
POST https://google-drive-mcp-community.node2flow.net/mcp?GOOGLE_CLIENT_ID=xxx&GOOGLE_CLIENT_SECRET=xxx&GOOGLE_REFRESH_TOKEN=xxx
```

---

## Tools (23)

### Files (10)

| Tool | Description |
|------|-------------|
| `gd_search_files` | Search/list files with powerful query syntax (name, type, folder, date) |
| `gd_get_file` | Get detailed metadata for a file or folder |
| `gd_read_file` | Read/download file content (text files) |
| `gd_create_file` | Create a new file or Google Workspace document |
| `gd_update_file` | Update metadata — rename, move, star, trash/untrash |
| `gd_copy_file` | Copy a file to a new location |
| `gd_delete_file` | Permanently delete a file (irreversible) |
| `gd_export_file` | Export Google Workspace files (Docs→text, Sheets→csv, etc.) |
| `gd_create_folder` | Create a new folder |
| `gd_empty_trash` | Permanently delete all trashed files |

### Permissions (3)

| Tool | Description |
|------|-------------|
| `gd_list_permissions` | List who has access to a file |
| `gd_share_file` | Share with user, group, domain, or anyone |
| `gd_unshare_file` | Remove access for a user or group |

### Comments (3)

| Tool | Description |
|------|-------------|
| `gd_list_comments` | List comments on a file |
| `gd_create_comment` | Add a comment to a file |
| `gd_delete_comment` | Delete a comment |

### Replies (2)

| Tool | Description |
|------|-------------|
| `gd_list_replies` | List replies to a comment |
| `gd_create_reply` | Reply to a comment (optionally resolve thread) |

### Shared Drives (3)

| Tool | Description |
|------|-------------|
| `gd_list_drives` | List shared drives |
| `gd_create_drive` | Create a shared drive (Workspace only) |
| `gd_delete_drive` | Delete an empty shared drive |

### Revisions (1)

| Tool | Description |
|------|-------------|
| `gd_list_revisions` | List revision history for a file |

### About (1)

| Tool | Description |
|------|-------------|
| `gd_about` | Get user info, storage quota, and Drive capabilities |

---

## Search Query Syntax

The `q` parameter in `gd_search_files` supports powerful queries:

```
# By name
name = 'exact-name.txt'
name contains 'report'

# By type
mimeType = 'application/vnd.google-apps.folder'
mimeType = 'application/vnd.google-apps.document'
mimeType = 'application/pdf'

# By location
'folderId' in parents

# By status
trashed = false
starred = true

# By date
modifiedTime > '2024-01-01'
createdTime > '2024-06-01T00:00:00'

# Full-text search
fullText contains 'quarterly report'

# Combine with and/or
name contains 'report' and mimeType = 'application/pdf'
trashed = false and modifiedTime > '2024-01-01'
```

---

## Export Formats

Use `gd_export_file` to convert Google Workspace files:

| Source | Export To |
|--------|----------|
| Google Docs | `text/plain`, `text/html`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx) |
| Google Sheets | `text/csv`, `application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (xlsx) |
| Google Slides | `application/pdf`, `text/plain`, `application/vnd.openxmlformats-officedocument.presentationml.presentation` (pptx) |
| Google Drawings | `image/png`, `image/svg+xml`, `application/pdf` |

---

## Configuration

| Parameter | Required | Description |
|-----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Client Secret |
| `GOOGLE_REFRESH_TOKEN` | Yes | Refresh token (obtained via OAuth consent flow) |

### Getting Your Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Drive API**
3. Create **OAuth 2.0 Client ID** (Desktop app type)
4. Use the [OAuth Playground](https://developers.google.com/oauthplayground/) or your app to get a refresh token with scope `https://www.googleapis.com/auth/drive`

### OAuth Scopes

| Scope | Access |
|-------|--------|
| `drive` | Full access (read/write/delete) |
| `drive.readonly` | Read-only access |
| `drive.file` | Only files created by or explicitly granted to the app |

---

## License

MIT
