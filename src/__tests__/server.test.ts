import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe('MCP Server', () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({
      name: "Test Server",
      version: "1.0.0"
    });
  });

  it('should create a server with correct configuration', () => {
    expect(server).toBeDefined();
    expect(server).toBeInstanceOf(McpServer);
  });

  it('should register the time tool without errors', () => {
    expect(() => {
      server.tool(
        "get_time_and_date",
        {},
        async () => {
          const now = new Date();
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                time: now.toLocaleTimeString(),
                date: now.toLocaleDateString(),
                iso: now.toISOString(),
                timestamp: now.getTime(),
              }, null, 2)
            }]
          };
        }
      );
    }).not.toThrow();
  });
}); 