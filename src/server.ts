/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DriveClient } from './drive-client.js';
import { TOOLS } from './tools.js';

export interface DriveMcpConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  client: DriveClient
) {
  switch (toolName) {
    // ========== Files ==========
    case 'gd_search_files':
      return client.searchFiles({
        q: args.q as string | undefined,
        pageSize: args.page_size as number | undefined,
        pageToken: args.page_token as string | undefined,
        orderBy: args.order_by as string | undefined,
        spaces: args.spaces as string | undefined,
        corpora: args.corpora as string | undefined,
        driveId: args.drive_id as string | undefined,
        includeItemsFromAllDrives: args.include_items_from_all_drives as boolean | undefined,
        fields: (args.fields || args._fields) as string | undefined,
      });
    case 'gd_get_file':
      return client.getFile({
        fileId: args.file_id as string,
        fields: (args.fields || args._fields) as string | undefined,
      });
    case 'gd_read_file':
      return client.readFile({ fileId: args.file_id as string });
    case 'gd_create_file':
      return client.createFile({
        name: args.name as string,
        mimeType: args.mime_type as string | undefined,
        parents: args.parents as string[] | undefined,
        description: args.description as string | undefined,
        starred: args.starred as boolean | undefined,
        properties: args.properties as Record<string, string> | undefined,
      });
    case 'gd_update_file':
      return client.updateFile({
        fileId: args.file_id as string,
        name: args.name as string | undefined,
        description: args.description as string | undefined,
        starred: args.starred as boolean | undefined,
        trashed: args.trashed as boolean | undefined,
        addParents: args.add_parents as string | undefined,
        removeParents: args.remove_parents as string | undefined,
        properties: args.properties as Record<string, string> | undefined,
      });
    case 'gd_copy_file':
      return client.copyFile({
        fileId: args.file_id as string,
        name: args.name as string | undefined,
        parents: args.parents as string[] | undefined,
        description: args.description as string | undefined,
      });
    case 'gd_delete_file':
      return client.deleteFile({
        fileId: args.file_id as string,
      });
    case 'gd_export_file':
      return client.exportFile({
        fileId: args.file_id as string,
        mimeType: args.mime_type as string,
      });
    case 'gd_create_folder':
      return client.createFolder({
        name: args.name as string,
        parents: args.parents as string[] | undefined,
        description: args.description as string | undefined,
      });
    case 'gd_empty_trash':
      if (!args.confirm) throw new Error('Set confirm=true to permanently delete all trashed files');
      return client.emptyTrash();

    // ========== Permissions ==========
    case 'gd_list_permissions':
      return client.listPermissions({
        fileId: args.file_id as string,
        pageSize: args.page_size as number | undefined,
        pageToken: args.page_token as string | undefined,
        fields: (args.fields || args._fields) as string | undefined,
      });
    case 'gd_share_file':
      return client.shareFile({
        fileId: args.file_id as string,
        type: args.type as string,
        role: args.role as string,
        emailAddress: args.email_address as string | undefined,
        domain: args.domain as string | undefined,
        sendNotificationEmail: args.send_notification_email as boolean | undefined,
        emailMessage: args.email_message as string | undefined,
        transferOwnership: args.transfer_ownership as boolean | undefined,
      });
    case 'gd_unshare_file':
      return client.unshareFile({
        fileId: args.file_id as string,
        permissionId: args.permission_id as string,
      });

    // ========== Comments ==========
    case 'gd_list_comments':
      return client.listComments({
        fileId: args.file_id as string,
        pageSize: args.page_size as number | undefined,
        pageToken: args.page_token as string | undefined,
        startModifiedTime: args.start_modified_time as string | undefined,
        includeDeleted: args.include_deleted as boolean | undefined,
        fields: (args.fields || args._fields) as string | undefined,
      });
    case 'gd_create_comment':
      return client.createComment({
        fileId: args.file_id as string,
        content: args.content as string,
      });
    case 'gd_delete_comment':
      return client.deleteComment({
        fileId: args.file_id as string,
        commentId: args.comment_id as string,
      });

    // ========== Replies ==========
    case 'gd_list_replies':
      return client.listReplies({
        fileId: args.file_id as string,
        commentId: args.comment_id as string,
        pageSize: args.page_size as number | undefined,
        pageToken: args.page_token as string | undefined,
        includeDeleted: args.include_deleted as boolean | undefined,
        fields: (args.fields || args._fields) as string | undefined,
      });
    case 'gd_create_reply':
      return client.createReply({
        fileId: args.file_id as string,
        commentId: args.comment_id as string,
        content: args.content as string,
        action: args.action as string | undefined,
      });

    // ========== Shared Drives ==========
    case 'gd_list_drives':
      return client.listDrives({
        pageSize: args.page_size as number | undefined,
        pageToken: args.page_token as string | undefined,
        q: args.q as string | undefined,
      });
    case 'gd_create_drive':
      return client.createDrive({
        name: args.name as string,
        themeId: args.theme_id as string | undefined,
      });
    case 'gd_delete_drive':
      return client.deleteDrive({ driveId: args.drive_id as string });

    // ========== Revisions ==========
    case 'gd_list_revisions':
      return client.listRevisions({
        fileId: args.file_id as string,
        pageSize: args.page_size as number | undefined,
        pageToken: args.page_token as string | undefined,
        fields: (args.fields || args._fields) as string | undefined,
      });

    // ========== About ==========
    case 'gd_about':
      return client.about();

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function createServer(config?: DriveMcpConfig) {
  const server = new McpServer({
    name: 'google-drive-mcp',
    version: '1.0.0',
  });

  let client: DriveClient | null = null;

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        const clientId =
          config?.clientId ||
          (args as Record<string, unknown>).GOOGLE_CLIENT_ID as string;
        const clientSecret =
          config?.clientSecret ||
          (args as Record<string, unknown>).GOOGLE_CLIENT_SECRET as string;
        const refreshToken =
          config?.refreshToken ||
          (args as Record<string, unknown>).GOOGLE_REFRESH_TOKEN as string;

        if (!clientId || !clientSecret || !refreshToken) {
          return {
            content: [{ type: 'text' as const, text: 'Error: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are all required.' }],
            isError: true,
          };
        }

        if (!client || config?.clientId !== clientId) {
          client = new DriveClient({ clientId, clientSecret, refreshToken });
        }

        try {
          const result = await handleToolCall(tool.name, args, client);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            isError: false,
          };
        } catch (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }
    );
  }

  // Register prompts
  server.prompt(
    'search-and-organize',
    'Guide for searching, browsing, and organizing files in Google Drive',
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are a Google Drive file management assistant.',
            '',
            'Available file operations:',
            '1. **Search** — Use gd_search_files with query syntax: name contains, mimeType, parent folder, trashed status',
            '2. **Read metadata** — Use gd_get_file for full file details',
            '3. **Read content** — Use gd_read_file for text files, gd_export_file for Google Workspace files',
            '4. **Create** — Use gd_create_file for files, gd_create_folder for folders',
            '5. **Organize** — Use gd_update_file to rename, move (add/remove parents), star, or trash files',
            '6. **Copy** — Use gd_copy_file to duplicate files',
            '7. **Share** — Use gd_share_file to share, gd_list_permissions to check access',
            '',
            'Search query examples:',
            '- name contains \'report\' — find files with "report" in name',
            '- mimeType = \'application/vnd.google-apps.folder\' — list folders only',
            '- \'folderId\' in parents — list files in a specific folder',
            '- trashed = false and modifiedTime > \'2024-01-01\' — recent non-trashed files',
            '- fullText contains \'keyword\' — full-text search in file content',
          ].join('\n'),
        },
      }],
    }),
  );

  server.prompt(
    'collaborate-and-comment',
    'Guide for sharing files, managing permissions, and working with comments',
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are a Google Drive collaboration assistant.',
            '',
            'Sharing & permissions:',
            '1. **List access** — gd_list_permissions to see who has access',
            '2. **Share with user** — gd_share_file with type="user", role="writer"/"reader"/"commenter"',
            '3. **Share publicly** — gd_share_file with type="anyone", role="reader"',
            '4. **Share with domain** — gd_share_file with type="domain", domain="example.com"',
            '5. **Remove access** — gd_unshare_file with the permission ID',
            '',
            'Comments & replies:',
            '1. **View comments** — gd_list_comments on a file',
            '2. **Add comment** — gd_create_comment with your text',
            '3. **Reply** — gd_create_reply to respond or resolve (action="resolve")',
            '4. **Delete** — gd_delete_comment to remove a comment',
          ].join('\n'),
        },
      }],
    }),
  );

  // Register resource
  server.resource(
    'server-info',
    'google-drive://server-info',
    {
      description: 'Connection status and available tools for this Google Drive MCP server',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [{
        uri: 'google-drive://server-info',
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'google-drive-mcp',
          version: '1.0.0',
          connected: !!config,
          has_oauth: !!(config?.clientId),
          tools_available: TOOLS.length,
          tool_categories: {
            files: 10,
            permissions: 3,
            comments: 3,
            replies: 2,
            shared_drives: 3,
            revisions: 1,
            about: 1,
          },
        }, null, 2),
      }],
    }),
  );

  // Override tools/list handler to return raw JSON Schema with property descriptions
  (server as any).server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  }));

  return server;
}
