export function registerNodeVersionTool(server) {
    server.tool("get_node_version", {}, async () => {
        try {
            const nodeVersion = process.version;
            const nodeVersions = process.versions;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            nodeVersion,
                            details: nodeVersions
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error("Error getting Node.js version:", error);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Failed to retrieve Node.js version",
                            details: error.message
                        }, null, 2)
                    }]
            };
        }
    });
}
