import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import https from 'https';

/**
 * Fetches the public IP address using a public API
 * @returns Promise with the public IP address
 */
export async function getPublicIp(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data.trim());
      });
    }).on('error', (err) => {
      console.error("Error fetching public IP from api.ipify.org:", err);
      reject(new Error("Failed to fetch public IP address"));
    });
  });
}

export function registerPublicIpTool(server: McpServer): void {
  server.tool(
    "get_public_ip",
    "Returns the public IP address of the machine running the MCP server.",
    async () => {
      const publicIp = await getPublicIp();
      return {
        content: [{
          type: "text",
          text: publicIp
        }]
      };
    }
  );
} 