import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
/**
 * Lists the contents of a directory
 * @param dirPath The directory path to list
 * @returns Array of file and directory names with their types
 */
async function listDirectory(dirPath) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            return { name: entry.name, type: 'directory' };
        }
        else if (entry.isFile()) {
            const stats = await fs.promises.stat(entryPath);
            return {
                name: entry.name,
                type: 'file',
                size: stats.size
            };
        }
        else {
            return { name: entry.name, type: 'other' };
        }
    }));
}
export function registerDirectoryTool(server) {
    server.tool("list_directory", { path: z.string().describe("Directory path to list") }, async (params) => {
        try {
            const dirPath = params.path;
            const contents = await listDirectory(dirPath);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            path: dirPath,
                            contents
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error("Error listing directory:", error);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Failed to list directory contents",
                            details: error.message
                        }, null, 2)
                    }]
            };
        }
    });
}
