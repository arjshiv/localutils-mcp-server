import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCurrentTimeAndDate } from "./utils/time.js";
async function main() {
    // Create a server instance
    const server = new McpServer({
        name: "Test Server",
        version: "1.0.0"
    });
    // Add the time tool
    const toolFn = server.tool("get_time_and_date", {}, async () => {
        const result = getCurrentTimeAndDate();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
        };
    });
    // Call the tool handler directly
    const result = getCurrentTimeAndDate();
    console.log('Current Time and Date:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
main().catch(console.error);
