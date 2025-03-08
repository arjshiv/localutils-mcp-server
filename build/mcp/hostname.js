import * as os from 'os';
export function registerHostnameTool(server) {
    server.tool("get_hostname", {}, async () => {
        try {
            const hostname = os.hostname();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({ hostname }, null, 2)
                    }]
            };
        }
        catch (error) {
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
    });
}
