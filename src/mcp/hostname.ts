import * as os from 'os';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerHostnameTool(server: McpServer): void {
  server.tool(
    "get_hostname",
    {},
    async () => {
      try {
        const hostname = os.hostname();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ hostname }, null, 2)
          }]
        };
      } catch (error: any) {
        console.error("Error getting hostname:", error);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ 
              error: "Failed to retrieve hostname",
              details: error.message 
            }, null, 2)
          }]
        };
      }
    }
  );
} 