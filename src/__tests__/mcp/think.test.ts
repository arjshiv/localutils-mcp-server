import { thinkTool } from '../../mcp/think.js';
import type { MCPRequest, MCPResponse } from '../../types/mcp.js';

describe('Think Tool MCP Tests', () => {
  // Helper function to make MCP requests
  const makeRequest = async (command: string, params?: Record<string, unknown>): Promise<MCPResponse> => {
    const request: MCPRequest = { command, params };
    return thinkTool.handleRequest(request);
  };

  beforeEach(async () => {
    // Clear thoughts before each test
    await makeRequest('clear_thoughts');
  });

  describe('think command', () => {
    it('should record a thought successfully', async () => {
      const response = await makeRequest('think', { thought: 'Test thought' });
      expect(response.success).toBe(true);
      expect(response.data?.message).toBe('Thought recorded successfully');
    });

    it('should reject empty thoughts', async () => {
      const response = await makeRequest('think', { thought: '' });
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should reject missing thought parameter', async () => {
      const response = await makeRequest('think');
      expect(response.success).toBe(false);
      expect(response.error).toMatch(/missing.*thought/i);
    });

    it('should reject invalid thought parameter type', async () => {
      const response = await makeRequest('think', { thought: 123 });
      expect(response.success).toBe(false);
      expect(response.error).toMatch(/invalid.*thought/i);
    });
  });

  describe('get_thoughts command', () => {
    it('should return empty array when no thoughts exist', async () => {
      const response = await makeRequest('get_thoughts');
      expect(response.success).toBe(true);
      expect(response.data?.thoughts).toEqual([]);
    });

    it('should return recorded thoughts in order', async () => {
      const thoughts = ['First thought', 'Second thought', 'Third thought'];
      
      for (const thought of thoughts) {
        await makeRequest('think', { thought });
      }

      const response = await makeRequest('get_thoughts');
      expect(response.success).toBe(true);
      
      const returnedThoughts = response.data?.thoughts as Array<{ content: string, timestamp: string }>;
      expect(returnedThoughts).toHaveLength(thoughts.length);
      expect(returnedThoughts.map(t => t.content)).toEqual(thoughts);
      
      // Verify timestamps are in ascending order
      const timestamps = returnedThoughts.map(t => new Date(t.timestamp).getTime());
      expect([...timestamps].sort((a, b) => a - b)).toEqual(timestamps);
    });
  });

  describe('clear_thoughts command', () => {
    it('should clear all recorded thoughts', async () => {
      // Record some thoughts
      await makeRequest('think', { thought: 'Thought 1' });
      await makeRequest('think', { thought: 'Thought 2' });

      // Verify thoughts were recorded
      let response = await makeRequest('get_thoughts');
      expect(response.data?.thoughts).toHaveLength(2);

      // Clear thoughts
      response = await makeRequest('clear_thoughts');
      expect(response.success).toBe(true);
      expect(response.data?.message).toBe('All thoughts cleared');

      // Verify thoughts were cleared
      response = await makeRequest('get_thoughts');
      expect(response.data?.thoughts).toHaveLength(0);
    });
  });

  describe('get_thought_stats command', () => {
    it('should return zero stats when no thoughts exist', async () => {
      const response = await makeRequest('get_thought_stats');
      expect(response.success).toBe(true);
      expect(response.data).toEqual({
        totalThoughts: 0,
        averageLength: 0,
        oldestThought: null,
        newestThought: null
      });
    });

    it('should calculate correct statistics', async () => {
      const thoughts = ['Short', 'Medium length thought', 'Very long thought for testing'];
      
      for (const thought of thoughts) {
        await makeRequest('think', { thought });
      }

      const response = await makeRequest('get_thought_stats');
      expect(response.success).toBe(true);
      
      const stats = response.data as {
        totalThoughts: number;
        averageLength: number;
        oldestThought: string;
        newestThought: string;
      };

      expect(stats.totalThoughts).toBe(thoughts.length);
      expect(stats.averageLength).toBe(
        thoughts.reduce((sum, t) => sum + t.length, 0) / thoughts.length
      );
      
      // Verify timestamps are valid dates and in correct order
      const oldestTime = new Date(stats.oldestThought).getTime();
      const newestTime = new Date(stats.newestThought).getTime();
      expect(Number.isFinite(oldestTime)).toBe(true);
      expect(Number.isFinite(newestTime)).toBe(true);
      expect(oldestTime).toBeLessThanOrEqual(newestTime);
    });
  });

  describe('error handling', () => {
    it('should handle unknown commands gracefully', async () => {
      const response = await makeRequest('invalid_command');
      expect(response.success).toBe(false);
      expect(response.error).toMatch(/unknown command/i);
    });

    it('should handle invalid parameters gracefully', async () => {
      const response = await makeRequest('think', { invalid: 'parameter' });
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });
}); 