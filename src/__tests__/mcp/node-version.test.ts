import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNodeVersionTool } from '../../mcp/node-version.js';

describe('Node Version Tool', () => {
  let server: McpServer;
  let mockTool: jest.Mock;
  let originalProcessVersion: string;
  let originalProcessVersions: NodeJS.ProcessVersions;
  
  beforeEach(() => {
    // Save original process.version and process.versions
    originalProcessVersion = process.version;
    originalProcessVersions = process.versions;
    
    // Create a mock server
    server = new McpServer({
      name: "Test Server",
      version: "1.0.0"
    });
    
    // Mock the tool method
    mockTool = jest.fn();
    server.tool = mockTool;
  });
  
  afterEach(() => {
    // Restore original process.version and process.versions
    Object.defineProperty(process, 'version', {
      value: originalProcessVersion
    });
    
    Object.defineProperty(process, 'versions', {
      value: originalProcessVersions
    });
  });
  
  it('should register the Node.js version tool with the server', () => {
    // Register the Node.js version tool
    registerNodeVersionTool(server);
    
    // Check if server.tool was called with the correct arguments
    expect(mockTool).toHaveBeenCalledTimes(1);
    expect(mockTool.mock.calls[0][0]).toBe('get_node_version');
    expect(mockTool.mock.calls[0][1]).toEqual({});
    expect(typeof mockTool.mock.calls[0][2]).toBe('function');
  });
  
  it('should return the Node.js version when called', async () => {
    // Mock process.version and process.versions
    const mockVersion = 'v18.15.0';
    const mockVersions = {
      node: '18.15.0',
      v8: '10.2.154.26',
      uv: '1.44.2',
      zlib: '1.2.13',
      brotli: '1.0.9',
      ares: '1.19.0',
      modules: '108',
      nghttp2: '1.52.0',
      napi: '8',
      llhttp: '6.0.10',
      openssl: '3.0.8',
      cldr: '42.0',
      icu: '72.1',
      tz: '2022g',
      unicode: '15.0'
    };
    
    Object.defineProperty(process, 'version', {
      value: mockVersion
    });
    
    Object.defineProperty(process, 'versions', {
      value: mockVersions
    });
    
    // Register the Node.js version tool and get the handler function
    registerNodeVersionTool(server);
    const handler = mockTool.mock.calls[0][2];
    
    // Call the handler
    const result = await handler();
    
    // Check the result
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    // Parse the JSON response
    const response = JSON.parse(result.content[0].text);
    expect(response).toHaveProperty('nodeVersion', mockVersion);
    expect(response).toHaveProperty('details', mockVersions);
  });
  
  it('should handle errors gracefully', async () => {
    // Mock an error by making process.version a getter that throws
    Object.defineProperty(process, 'version', {
      get: () => { throw new Error('Version error'); }
    });
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Register the Node.js version tool and get the handler function
    registerNodeVersionTool(server);
    const handler = mockTool.mock.calls[0][2];
    
    // Call the handler
    const result = await handler();
    
    // Check the result
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    // Parse the JSON response
    const response = JSON.parse(result.content[0].text);
    expect(response).toHaveProperty('error', 'Failed to retrieve Node.js version');
    expect(response).toHaveProperty('details', 'Version error');
    
    // Check if console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting Node.js version:', expect.any(Error));
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 