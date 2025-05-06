/**
 * Gets the current Node.js version information.
 * @returns An object containing the Node.js version string and detailed versions object.
 */
export function getNodeVersionInfo() {
    return {
        nodeVersion: process.version,
        details: process.versions,
    };
}
export function registerNodeVersionTool(server) {
    server.tool("get_node_version", "Returns the Node.js version information of the environment running the MCP server.", async () => {
        // Error handling simplified, process.version/versions are generally safe
        const versionInfo = getNodeVersionInfo();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(versionInfo, null, 2) // Keep JSON for structured data
                }]
        };
    });
}
