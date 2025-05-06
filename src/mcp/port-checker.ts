import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';

const execPromise = promisify(exec);

// Define a more specific type for the result (optional but good practice)
interface PortCheckResult {
  message: string;
  processes?: Array<{ [key: string]: string }>;
  raw?: string[]; // For Windows
}

/**
 * Checks what process is using a specific port
 * @param port The port number to check
 * @returns Information about the process using the port
 */
export async function checkPort(port: number): Promise<PortCheckResult> { // Export and use specific type
  let command = '';
  if (process.platform === 'win32') {
    command = `netstat -ano | findstr :${port}`;
  } else if (process.platform === 'darwin') {
    command = `lsof -i :${port} -P -n -sTCP:LISTEN`;
  } else {
    command = `lsof -i :${port} -P -n | grep LISTEN`;
  }

  try {
    const { stdout } = await execPromise(command);
    
    if (!stdout.trim()) {
      return { message: `No process found using port ${port}` };
    }
    
    // Parse the output based on the platform
    let result: PortCheckResult;
    if (process.platform === 'win32') {
      const lines = stdout.trim().split('\n');
      result = {
        raw: lines,
        message: `Found ${lines.length} connection(s) on port ${port}`
      };
    } else {
      const lines = stdout.trim().split('\n');
      const processes = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        // Basic parsing, might need adjustment based on actual lsof output variations
        return {
          command: parts[0] || 'N/A',
          pid: parts[1] || 'N/A',
          user: parts[2] || 'N/A',
          fd: parts[3] || 'N/A',
          type: parts[4] || 'N/A',
          device: parts[5] || 'N/A',
          size: parts[6] || 'N/A',
          node: parts[7] || 'N/A',
          name: parts.slice(8).join(' ') || 'N/A' // Handle names with spaces
        };
      });
      
      result = {
        processes,
        message: `Found ${processes.length} process(es) using port ${port}`
      };
    }
    return result;
  } catch (error: any) {
    // If the command fails (e.g., port not used), lsof/netstat often exit with error code.
    // Check the error output or code if necessary, but often it just means no process found.
    // For simplicity, we assume command failure implies no process found.
    console.debug(`Port check command for ${port} failed (likely no process found):`, error.message);
    return { message: `No process found using port ${port}` };
    // Re-throw only if it's an unexpected error (optional)
    // if (!error.message.includes('Command failed')) { throw error; }
  }
}

// Define the Zod schema for the port parameter
const PortSchema = z.union([
  z.number().int().min(1).max(65535),
  z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Port must be a number between 1 and 65535" 
      });
      return z.NEVER; // Indicates validation failure
    }
    return parsed;
  })
]).describe("Port number to check (1-65535)");

export function registerPortCheckerTool(server: McpServer): void {
  server.tool(
    "check_port",
    { port: PortSchema },
    async (params) => {
      // Let SDK handle errors from checkPort if they are re-thrown
      // and Zod handle parameter validation errors.
      const result = await checkPort(params.port);
        
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );
} 