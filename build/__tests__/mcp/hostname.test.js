import * as os from 'os';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerHostnameTool } from '../../mcp/hostname.js';
describe('Hostname Tool', () => {
    let server;
    let mockTool;
    beforeEach(() => {
        // Create a mock server
        server = new McpServer({
            name: "Test Server",
            version: "1.0.0"
        });
        // Mock the tool method
        mockTool = jest.fn();
        server.tool = mockTool;
    });
    it('should register the hostname tool with the server', () => {
        // Register the hostname tool
        registerHostnameTool(server);
        // Check if server.tool was called with the correct arguments
        expect(mockTool).toHaveBeenCalledTimes(1);
        expect(mockTool.mock.calls[0][0]).toBe('get_hostname');
        expect(mockTool.mock.calls[0][1]).toEqual({});
        expect(typeof mockTool.mock.calls[0][2]).toBe('function');
    });
    it('should return the hostname when called', async () => {
        // Mock os.hostname
        const mockHostname = 'test-hostname';
        jest.spyOn(os, 'hostname').mockReturnValue(mockHostname);
        // Register the hostname tool and get the handler function
        registerHostnameTool(server);
        const handler = mockTool.mock.calls[0][2];
        // Call the handler
        const result = await handler();
        // Check the result
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        // Parse the JSON response
        const response = JSON.parse(result.content[0].text);
        expect(response).toHaveProperty('hostname', mockHostname);
        // Restore the original implementation
        jest.restoreAllMocks();
    });
    it('should handle errors gracefully', async () => {
        // Mock os.hostname to throw an error
        const mockError = new Error('Test error');
        jest.spyOn(os, 'hostname').mockImplementation(() => {
            throw mockError;
        });
        // Mock console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        // Register the hostname tool and get the handler function
        registerHostnameTool(server);
        const handler = mockTool.mock.calls[0][2];
        // Call the handler
        const result = await handler();
        // Check the result
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        // Parse the JSON response
        const response = JSON.parse(result.content[0].text);
        expect(response).toHaveProperty('error', 'Failed to retrieve hostname');
        expect(response).toHaveProperty('details', 'Test error');
        // Check if console.error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting hostname:', mockError);
        // Restore the original implementations
        jest.restoreAllMocks();
    });
});
