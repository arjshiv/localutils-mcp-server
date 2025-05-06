import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

interface INodeVersionInfo {
  nodeVersion: string;
  details: NodeJS.ProcessVersions;
}

/**
 * Gets the current Node.js version information.
 * @returns An object containing the Node.js version string and detailed versions object.
 */
export function getNodeVersionInfo(): INodeVersionInfo { // Export for testing
  return {
    nodeVersion: process.version,
    details: process.versions,
  };
}

export function registerNodeVersionTool(server: McpServer): void {
  server.tool(
    "get_node_version",
    "Returns the Node.js version information of the environment running the MCP server.",
    async () => {
      // Error handling simplified, process.version/versions are generally safe
      const versionInfo = getNodeVersionInfo();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(versionInfo, null, 2) // Keep JSON for structured data
        }]
      };
    }
  );
} 