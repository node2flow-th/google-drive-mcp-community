#!/usr/bin/env node
/**
 * Google Drive MCP Server
 *
 * Community edition — connects directly to Google Drive API v3.
 *
 * Usage (stdio - for Claude Desktop / Cursor / VS Code):
 *   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=xxx GOOGLE_REFRESH_TOKEN=xxx npx @node2flow/google-drive-mcp
 *
 * Usage (HTTP - Streamable HTTP transport):
 *   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=xxx GOOGLE_REFRESH_TOKEN=xxx npx @node2flow/google-drive-mcp --http
 */

import { randomUUID } from 'node:crypto';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  StreamableHTTPServerTransport,
} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import { createServer } from './server.js';
import { TOOLS } from './tools.js';

function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

async function startStdio() {
  const config = getConfig();
  const server = createServer(config ?? undefined);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Google Drive MCP Server running on stdio');
  console.error(`OAuth: ${config ? '***configured***' : '(not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)'}`);
  console.error(`Tools available: ${TOOLS.length}`);
  console.error('Ready for MCP client\n');
}

async function startHttp() {
  const port = parseInt(process.env.PORT || '3000', 10);
  const app = createMcpExpressApp({ host: '0.0.0.0' });

  const transports: Record<string, StreamableHTTPServerTransport> = {};

  app.post('/mcp', async (req: any, res: any) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const qClientId = url.searchParams.get('GOOGLE_CLIENT_ID');
    const qClientSecret = url.searchParams.get('GOOGLE_CLIENT_SECRET');
    const qRefreshToken = url.searchParams.get('GOOGLE_REFRESH_TOKEN');
    if (qClientId) process.env.GOOGLE_CLIENT_ID = qClientId;
    if (qClientSecret) process.env.GOOGLE_CLIENT_SECRET = qClientSecret;
    if (qRefreshToken) process.env.GOOGLE_REFRESH_TOKEN = qRefreshToken;

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid: string) => {
            transports[sid] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        const config = getConfig();
        const server = createServer(config ?? undefined);
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  app.get('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.delete('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.get('/', (_req: any, res: any) => {
    res.json({
      name: 'google-drive-mcp',
      version: '1.0.0',
      status: 'ok',
      tools: TOOLS.length,
      transport: 'streamable-http',
      endpoints: { mcp: '/mcp' },
    });
  });

  const config = getConfig();
  app.listen(port, () => {
    console.log(`Google Drive MCP Server (HTTP) listening on port ${port}`);
    console.log(`OAuth: ${config ? '***configured***' : '(not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)'}`);
    console.log(`Tools available: ${TOOLS.length}`);
    console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    for (const sessionId in transports) {
      try {
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch { /* ignore */ }
    }
    process.exit(0);
  });
}

async function main() {
  const useHttp = process.argv.includes('--http');
  if (useHttp) {
    await startHttp();
  } else {
    await startStdio();
  }
}

export default function createSmitheryServer(opts?: {
  config?: {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_REFRESH_TOKEN?: string;
  };
}) {
  if (opts?.config?.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = opts.config.GOOGLE_CLIENT_ID;
  if (opts?.config?.GOOGLE_CLIENT_SECRET) process.env.GOOGLE_CLIENT_SECRET = opts.config.GOOGLE_CLIENT_SECRET;
  if (opts?.config?.GOOGLE_REFRESH_TOKEN) process.env.GOOGLE_REFRESH_TOKEN = opts.config.GOOGLE_REFRESH_TOKEN;
  const config = getConfig();
  return createServer(config ?? undefined);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
