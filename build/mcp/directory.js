import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
/**
 * Lists the contents of a directory
 * @param dirPath The directory path to list
 * @returns Array of file and directory names with their types
 */
export async function listDirectory(dirPath) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            return { name: entry.name, type: 'directory' };
        }
        else if (entry.isFile()) {
            try {
                const stats = await fs.promises.stat(entryPath);
                return {
                    name: entry.name,
                    type: 'file',
                    size: stats.size
                };
            }
            catch (statError) {
                // Handle potential stat errors (e.g., broken symlinks)
                console.warn(`Could not stat file ${entryPath}:`, statError);
                return { name: entry.name, type: 'file', size: undefined }; // Indicate file, but size unknown
            }
        }
        else {
            return { name: entry.name, type: 'other' };
        }
    }));
}
export function registerDirectoryTool(server) {
    server.tool("list_directory", { path: z.string().describe("Directory path to list") }, async (params) => {
        // Let SDK handle errors like directory not found
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
    });
}
