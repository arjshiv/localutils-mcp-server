import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';
const execPromise = promisify(exec);
/**
 * Checks what process is using a specific port
 * @param port The port number to check
 * @returns Information about the process using the port
 */
async function checkPort(port) {
    try {
        let command = '';
        if (process.platform === 'win32') {
            // Windows
            command = `netstat -ano | findstr :${port}`;
        }
        else if (process.platform === 'darwin') {
            // macOS
            command = `lsof -i :${port} -P -n -sTCP:LISTEN`;
        }
        else {
            // Linux and others
            command = `lsof -i :${port} -P -n | grep LISTEN`;
        }
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            throw new Error(stderr);
        }
        if (!stdout.trim()) {
            return { message: `No process found using port ${port}` };
        }
        // Parse the output based on the platform
        let result;
        if (process.platform === 'win32') {
            // Windows parsing
            const lines = stdout.trim().split('\n');
            result = {
                raw: lines,
                message: `Found ${lines.length} connection(s) on port ${port}`
            };
        }
        else {
            // macOS and Linux parsing
            const lines = stdout.trim().split('\n');
            const processes = lines.map(line => {
                const parts = line.trim().split(/\s+/);
                return {
                    command: parts[0],
                    pid: parts[1],
                    user: parts[2],
                    fd: parts[3],
                    type: parts[4],
                    device: parts[5],
                    size: parts[6],
                    node: parts[7],
                    name: parts[8]
                };
            });
            result = {
                processes,
                message: `Found ${processes.length} process(es) using port ${port}`
            };
        }
        return result;
    }
    catch (error) {
        if (error.message.includes('Command failed') || error.message.includes('No such file or directory')) {
            return { message: `No process found using port ${port}` };
        }
        throw error;
    }
}
export function registerPortCheckerTool(server) {
    server.tool("check_port", {
        port: z.union([
            z.number().int().min(1).max(65535),
            z.string().transform((val) => {
                const parsed = parseInt(val, 10);
                if (isNaN(parsed)) {
                    throw new Error("Port must be a valid number");
                }
                if (parsed < 1 || parsed > 65535) {
                    throw new Error("Port must be between 1 and 65535");
                }
                return parsed;
            })
        ]).describe("Port number to check (1-65535)")
    }, async (params) => {
        try {
            const port = params.port;
            const result = await checkPort(port);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error("Error checking port:", error);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Failed to check port",
                            details: error.message
                        }, null, 2)
                    }]
            };
        }
    });
}
