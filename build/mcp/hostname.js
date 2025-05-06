import * as os from 'os';
/**
 * Gets the system hostname.
 * @returns The system hostname.
 */
export function getHostname() {
    return os.hostname();
}
export function registerHostnameTool(server) {
    server.tool("get_hostname", "Returns the hostname of the machine running the MCP server.", async () => {
        // Note: Error handling is simplified; the MCP SDK handles basic errors.
        // More complex tools might still need try/catch.
        const hostname = getHostname();
        return {
            content: [{
                    type: "text",
                    // Return plain text for simple values
                    text: hostname
                }]
        };
    });
}
