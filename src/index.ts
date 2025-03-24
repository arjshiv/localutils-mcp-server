#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerHostnameTool } from "./mcp/hostname.js";
import { registerPublicIpTool } from "./mcp/public-ip.js";
import { registerDirectoryTool } from "./mcp/directory.js";
import { registerNodeVersionTool } from "./mcp/node-version.js";
import { registerPortCheckerTool } from "./mcp/port-checker.js";
import { registerTimeTool } from "./mcp/time.js";
import { registerThinkTool } from "./mcp/think.js";

// Create an MCP server
const server = new McpServer({
  name: "Local Utilities MCP Server",
  version: "1.0.0"
});

// Register all utilities
registerHostnameTool(server);
registerPublicIpTool(server);
registerDirectoryTool(server);
registerNodeVersionTool(server);
registerPortCheckerTool(server);
registerTimeTool(server);
registerThinkTool(server);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport); 