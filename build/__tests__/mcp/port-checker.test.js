import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPortCheckerTool } from '../../mcp/port-checker.js';
import * as childProcess from 'child_process';
import { z } from 'zod';
import { checkPort } from '../../mcp/port-checker.js'; // Import the function
// Mock the child_process.exec function
jest.mock('child_process', () => ({
    exec: jest.fn()
}));
// Helper to mock exec returning stdout
const mockExecSuccess = (stdout) => {
    childProcess.exec
        .mockImplementation((command, options, callback) => {
        // The actual implementation might pass options, or just command and callback
        // We handle both signatures for robustness
        const cb = typeof options === 'function' ? options : callback;
        process.nextTick(() => cb(null, stdout, '')); // Simulate async callback
        return {};
    });
};
// Helper to mock exec returning an error
const mockExecError = (error, stderr = '') => {
    childProcess.exec
        .mockImplementation((command, options, callback) => {
        const cb = typeof options === 'function' ? options : callback;
        process.nextTick(() => cb(error, '', stderr));
        return {};
    });
};
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
describe('Port Checker Tool Logic - checkPort', () => {
    let originalPlatform;
    beforeEach(() => {
        originalPlatform = process.platform;
        jest.clearAllMocks();
    });
    afterEach(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
    // --- macOS Tests ---
    describe('macOS', () => {
        beforeEach(() => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
        });
        it('should return process info on macOS', async () => {
            const mockStdout = 'COMMAND   PID  USER   FD      TYPE             DEVICE SIZE/OFF NODE NAME\nnode    12345 user 16u  IPv4 0xabcdef1234567890      0t0  TCP *:8080 (LISTEN)';
            mockExecSuccess(mockStdout);
            const result = await checkPort(8080);
            expect(childProcess.exec).toHaveBeenCalledWith('lsof -i :8080 -P -n -sTCP:LISTEN', expect.anything(), // Options or callback
            expect.any(Function) // Callback
            );
            expect(result.message).toBe('Found 1 process(es) using port 8080');
            expect(result.processes).toHaveLength(1);
            expect(result.processes?.[0]).toEqual(expect.objectContaining({
                command: 'node',
                pid: '12345',
                user: 'user',
                name: '*' // Adjusted parsing expectation for name with spaces
            }));
        });
        it('should handle no process found on macOS', async () => {
            mockExecError(new Error('Command failed with exit code 1')); // lsof exits with 1 if not found
            const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
            const result = await checkPort(8081);
            expect(result.message).toBe('No process found using port 8081');
            expect(childProcess.exec).toHaveBeenCalledTimes(1);
            expect(consoleDebugSpy).toHaveBeenCalled();
            consoleDebugSpy.mockRestore();
        });
    });
    // --- Linux Tests ---
    describe('Linux', () => {
        beforeEach(() => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
        });
        it('should return process info on Linux', async () => {
            // Note: Linux lsof output format can vary, this is a common example
            const mockStdout = 'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nnginx   5432 www   8u  IPv4  12345      0t0  TCP *:80 (LISTEN)';
            mockExecSuccess(mockStdout);
            const result = await checkPort(80);
            expect(childProcess.exec).toHaveBeenCalledWith('lsof -i :80 -P -n | grep LISTEN', expect.anything(), expect.any(Function));
            expect(result.message).toBe('Found 1 process(es) using port 80');
            expect(result.processes).toHaveLength(1);
            expect(result.processes?.[0]).toEqual(expect.objectContaining({
                command: 'nginx',
                pid: '5432',
                user: 'www',
                name: '*' // Adjusted parsing
            }));
        });
        it('should handle no process found on Linux', async () => {
            mockExecError(new Error('Command failed with exit code 1'));
            const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
            const result = await checkPort(81);
            expect(result.message).toBe('No process found using port 81');
            expect(childProcess.exec).toHaveBeenCalledTimes(1);
            expect(consoleDebugSpy).toHaveBeenCalled();
            consoleDebugSpy.mockRestore();
        });
    });
    // --- Windows Tests ---
    describe('Windows', () => {
        beforeEach(() => {
            Object.defineProperty(process, 'platform', { value: 'win32' });
        });
        it('should return raw info on Windows', async () => {
            const mockStdout = '  TCP    0.0.0.0:9000           0.0.0.0:0              LISTENING       9876\r\n  TCP    [::]:9000              [::]:0                 LISTENING       9876';
            mockExecSuccess(mockStdout);
            const result = await checkPort(9000);
            expect(childProcess.exec).toHaveBeenCalledWith('netstat -ano | findstr :9000', expect.anything(), expect.any(Function));
            expect(result.message).toBe('Found 2 connection(s) on port 9000');
            expect(result).toHaveProperty('raw');
            expect(result.raw).toHaveLength(2);
            expect(result.processes).toBeUndefined();
        });
        it('should handle no process found on Windows', async () => {
            mockExecError(new Error('Command failed with exit code 1')); // findstr exits 1 if not found
            const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
            const result = await checkPort(9001);
            expect(result.message).toBe('No process found using port 9001');
            expect(childProcess.exec).toHaveBeenCalledTimes(1);
            expect(consoleDebugSpy).toHaveBeenCalled();
            consoleDebugSpy.mockRestore();
        });
    });
});
