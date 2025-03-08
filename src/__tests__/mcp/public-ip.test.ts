import * as https from 'https';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPublicIpTool } from '../../mcp/public-ip.js';
import { EventEmitter } from 'events';

// Mock the https.get method
jest.mock('https', () => ({
  get: jest.fn()
}));

describe('Public IP Tool', () => {
  let server: McpServer;
  let mockTool: jest.Mock;
  
  beforeEach(() => {
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
  
  it('should register the public IP tool with the server', () => {
    // Register the public IP tool
    registerPublicIpTool(server);
    
    // Check if server.tool was called with the correct arguments
    expect(mockTool).toHaveBeenCalledTimes(1);
    expect(mockTool.mock.calls[0][0]).toBe('get_public_ip');
    expect(mockTool.mock.calls[0][1]).toEqual({});
    expect(typeof mockTool.mock.calls[0][2]).toBe('function');
  });
  
  it('should return the public IP when called', async () => {
    // Mock the response from ipify
    const mockIp = '203.0.113.1';
    
    // Create mock request and response objects
    const mockResponse = new EventEmitter();
    mockResponse.on = jest.fn().mockImplementation(function(this: EventEmitter, event, callback) {
      if (event === 'data') {
        callback(mockIp);
      } else if (event === 'end') {
        callback();
      }
      return this;
    });
    
    const mockRequest = new EventEmitter();
    mockRequest.on = jest.fn().mockImplementation(function(this: EventEmitter, event, callback) {
      return this;
    });
    
    // Mock https.get to call the callback with the mock response
    (https.get as jest.Mock).mockImplementation((url, callback) => {
      callback(mockResponse);
      return mockRequest;
    });
    
    // Register the public IP tool and get the handler function
    registerPublicIpTool(server);
    const handler = mockTool.mock.calls[0][2];
    
    // Call the handler
    const result = await handler();
    
    // Check the result
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    // Parse the JSON response
    const response = JSON.parse(result.content[0].text);
    expect(response).toHaveProperty('publicIp', mockIp);
  });
  
  it('should handle network errors gracefully', async () => {
    // Mock an error from the request
    const mockError = new Error('Network error');
    
    // Create mock request
    const mockRequest = new EventEmitter();
    mockRequest.on = jest.fn().mockImplementation(function(this: EventEmitter, event, callback) {
      if (event === 'error') {
        callback(mockError);
      }
      return this;
    });
    
    // Mock https.get to return the mock request
    (https.get as jest.Mock).mockImplementation(() => {
      return mockRequest;
    });
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Register the public IP tool and get the handler function
    registerPublicIpTool(server);
    const handler = mockTool.mock.calls[0][2];
    
    // Call the handler
    const result = await handler();
    
    // Check the result
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    // Parse the JSON response
    const response = JSON.parse(result.content[0].text);
    expect(response).toHaveProperty('error', 'Failed to retrieve public IP address');
    expect(response).toHaveProperty('details', 'Network error');
    
    // Check if console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting public IP:', mockError);
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 