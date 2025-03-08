import * as fs from 'fs';
import * as path from 'path';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDirectoryTool } from '../../mcp/directory.js';
import { z } from 'zod';

// Mock the fs.promises methods
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readdir: jest.fn(),
    stat: jest.fn()
  }
}));

describe('Directory Tool', () => {
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
  
  it('should register the directory tool with the server', () => {
    // Register the directory tool
    registerDirectoryTool(server);
    
    // Check if server.tool was called with the correct arguments
    expect(mockTool).toHaveBeenCalledTimes(1);
    expect(mockTool.mock.calls[0][0]).toBe('list_directory');
    expect(mockTool.mock.calls[0][1]).toEqual({ path: expect.any(z.ZodString) });
    expect(typeof mockTool.mock.calls[0][2]).toBe('function');
  });
  
  it('should list directory contents when called', async () => {
    // Mock directory entries
    const mockEntries = [
      { name: 'file.txt', isDirectory: () => false, isFile: () => true },
      { name: 'folder', isDirectory: () => true, isFile: () => false },
      { name: 'other', isDirectory: () => false, isFile: () => false }
    ];
    
    // Mock fs.promises.readdir
    (fs.promises.readdir as jest.Mock).mockResolvedValue(mockEntries);
    
    // Mock fs.promises.stat
    (fs.promises.stat as jest.Mock).mockResolvedValue({ size: 1024 });
    
    // Register the directory tool and get the handler function
    registerDirectoryTool(server);
    const handler = mockTool.mock.calls[0][2];
    
    // Call the handler with a test path
    const testPath = '/test/path';
    const result = await handler({ path: testPath });
    
    // Check the result
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    // Parse the JSON response
    const response = JSON.parse(result.content[0].text);
    expect(response).toHaveProperty('path', testPath);
    expect(response).toHaveProperty('contents');
    expect(response.contents).toHaveLength(3);
    
    // Check file entry
    expect(response.contents[0]).toEqual({
      name: 'file.txt',
      type: 'file',
      size: 1024
    });
    
    // Check directory entry
    expect(response.contents[1]).toEqual({
      name: 'folder',
      type: 'directory'
    });
    
    // Check other entry
    expect(response.contents[2]).toEqual({
      name: 'other',
      type: 'other'
    });
    
    // Check if fs.promises.readdir was called correctly
    expect(fs.promises.readdir).toHaveBeenCalledWith(testPath, { withFileTypes: true });
  });
  
  it('should handle file system errors gracefully', async () => {
    // Mock an error from fs.promises.readdir
    const mockError = new Error('File system error');
    (fs.promises.readdir as jest.Mock).mockRejectedValue(mockError);
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Register the directory tool and get the handler function
    registerDirectoryTool(server);
    const handler = mockTool.mock.calls[0][2];
    
    // Call the handler with a test path
    const testPath = '/test/path';
    const result = await handler({ path: testPath });
    
    // Check the result
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    
    // Parse the JSON response
    const response = JSON.parse(result.content[0].text);
    expect(response).toHaveProperty('error', 'Failed to list directory contents');
    expect(response).toHaveProperty('details', 'File system error');
    
    // Check if console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error listing directory:', mockError);
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 