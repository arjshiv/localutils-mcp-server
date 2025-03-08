import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import https from 'https';

/**
 * Fetches the public IP address using a public API
 * @returns Promise with the public IP address
 */
async function getPublicIp(): Promise<string> {
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
      reject(err);
    });
  });
}

export function registerPublicIpTool(server: McpServer): void {
  server.tool(
    "get_public_ip",
    {},
    async () => {
      try {
        const publicIp = await getPublicIp();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ publicIp }, null, 2)
          }]
        };
      } catch (error: any) {
        console.error("Error getting public IP:", error);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ 
              error: "Failed to retrieve public IP address",
              details: error.message 
            }, null, 2)
          }]
        };
      }
    }
  );
} 