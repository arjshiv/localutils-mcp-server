import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
describe('MCP Server', () => {
    let server;
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
            server.tool("get_time_and_date", "Returns the current time, date, day of week, and timestamp in various formats", async () => {
                const now = new Date();
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                time: now.toLocaleTimeString(),
                                date: now.toLocaleDateString(),
                                dayOfWeek: days[now.getDay()],
                                iso: now.toISOString(),
                                timestamp: now.getTime(),
                            }, null, 2)
                        }]
                };
            });
        }).not.toThrow();
    });
});
