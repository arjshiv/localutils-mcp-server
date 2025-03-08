import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPortCheckerTool } from '../../mcp/port-checker.js';
import * as childProcess from 'child_process';
import { z } from 'zod';
// Mock the child_process.exec function
jest.mock('child_process', () => ({
    exec: jest.fn()
}));
describe('Port Checker Tool', () => {
    let server;
    let mockTool;
    let originalPlatform;
    beforeEach(() => {
        // Save original process.platform
        originalPlatform = process.platform;
        // Create a mock server
        server = new McpServer({
            name: "Test Server",
            version: "1.0.0"
        });
        // Mock the tool method
        mockTool = jest.fn();
        server.tool = mockTool;
        // Clear all mocks
        jest.clearAllMocks();
    });
    afterEach(() => {
        // Restore original process.platform
        Object.defineProperty(process, 'platform', {
            value: originalPlatform
        });
    });
    it('should register the port checker tool with the server', () => {
        // Register the port checker tool
        registerPortCheckerTool(server);
        // Check if server.tool was called with the correct arguments
        expect(mockTool).toHaveBeenCalledTimes(1);
        expect(mockTool.mock.calls[0][0]).toBe('check_port');
        expect(mockTool.mock.calls[0][1]).toEqual({
            port: expect.any(z.ZodNumber)
        });
        expect(typeof mockTool.mock.calls[0][2]).toBe('function');
    });
    it('should check port on macOS correctly', async () => {
        // Mock process.platform to be macOS
        Object.defineProperty(process, 'platform', {
            value: 'darwin'
        });
        // Mock exec to return a successful result
        const mockStdout = 'node      12345 username   12u  IPv4 0x1234567890      0t0  TCP *:3000 (LISTEN)';
        childProcess.exec.mockImplementation((command, callback) => {
            callback(null, { stdout: mockStdout, stderr: '' });
            return {};
        });
        // Register the port checker tool and get the handler function
        registerPortCheckerTool(server);
        const handler = mockTool.mock.calls[0][2];
        // Call the handler with a test port
        const testPort = 3000;
        const result = await handler({ port: testPort });
        // Check the result
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        // Parse the JSON response
        const response = JSON.parse(result.content[0].text);
        expect(response).toHaveProperty('processes');
        expect(response.processes).toHaveLength(1);
        expect(response.processes[0]).toHaveProperty('command', 'node');
        expect(response.processes[0]).toHaveProperty('pid', '12345');
        expect(response).toHaveProperty('message', 'Found 1 process(es) using port 3000');
        // Check if exec was called with the correct command
        expect(childProcess.exec).toHaveBeenCalledWith('lsof -i :3000 -P -n -sTCP:LISTEN', expect.any(Function));
    });
    it('should check port on Windows correctly', async () => {
        // Mock process.platform to be Windows
        Object.defineProperty(process, 'platform', {
            value: 'win32'
        });
        // Mock exec to return a successful result
        const mockStdout = '  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345';
        childProcess.exec.mockImplementation((command, callback) => {
            callback(null, { stdout: mockStdout, stderr: '' });
            return {};
        });
        // Register the port checker tool and get the handler function
        registerPortCheckerTool(server);
        const handler = mockTool.mock.calls[0][2];
        // Call the handler with a test port
        const testPort = 3000;
        const result = await handler({ port: testPort });
        // Check the result
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        // Parse the JSON response
        const response = JSON.parse(result.content[0].text);
        expect(response).toHaveProperty('raw');
        expect(response.raw).toHaveLength(1);
        expect(response.raw[0]).toBe(mockStdout);
        expect(response).toHaveProperty('message', 'Found 1 connection(s) on port 3000');
        // Check if exec was called with the correct command
        expect(childProcess.exec).toHaveBeenCalledWith('netstat -ano | findstr :3000', expect.any(Function));
    });
    it('should handle empty results correctly', async () => {
        // Mock exec to return an empty result
        childProcess.exec.mockImplementation((command, callback) => {
            callback(null, { stdout: '', stderr: '' });
            return {};
        });
        // Register the port checker tool and get the handler function
        registerPortCheckerTool(server);
        const handler = mockTool.mock.calls[0][2];
        // Call the handler with a test port
        const testPort = 3000;
        const result = await handler({ port: testPort });
        // Check the result
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        // Parse the JSON response
        const response = JSON.parse(result.content[0].text);
        expect(response).toHaveProperty('message', 'No process found using port 3000');
    });
    it('should handle command errors gracefully', async () => {
        // Mock exec to return an error
        const mockError = new Error('Command failed');
        childProcess.exec.mockImplementation((command, callback) => {
            callback(mockError, { stdout: '', stderr: 'Command failed' });
            return {};
        });
        // Mock console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        // Register the port checker tool and get the handler function
        registerPortCheckerTool(server);
        const handler = mockTool.mock.calls[0][2];
        // Call the handler with a test port
        const testPort = 3000;
        const result = await handler({ port: testPort });
        // Check the result
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        // Parse the JSON response
        const response = JSON.parse(result.content[0].text);
        expect(response).toHaveProperty('message', 'No process found using port 3000');
        // Restore console.error
        consoleErrorSpy.mockRestore();
    });
});
