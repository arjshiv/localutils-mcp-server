import { ThinkTool } from '../../mcp/think.js';
import type { Thought } from '../../mcp/think.js';

describe('Think Tool', () => {
  let tool: ThinkTool;
  let originalDate: typeof Date;
  const mockDate = new Date('2025-03-24T15:00:00.000Z');

  beforeAll(() => {
    originalDate = global.Date;
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as typeof Date;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  beforeEach(() => {
    tool = new ThinkTool();
  });

  describe('addThought', () => {
    it('should record a thought with timestamp', () => {
      tool.addThought('Test thought');
      const thoughts = tool.getAllThoughts();
      
      expect(thoughts).toHaveLength(1);
      expect(thoughts[0].content).toBe('Test thought');
      expect(thoughts[0].timestamp).toBe(mockDate.toISOString());
    });
  });

  describe('getAllThoughts', () => {
    it('should return empty array when no thoughts exist', () => {
      const thoughts = tool.getAllThoughts();
      expect(thoughts).toEqual([]);
    });

    it('should return recorded thoughts in order', () => {
      const thoughtTexts = ['First thought', 'Second thought', 'Third thought'];
      
      for (const text of thoughtTexts) {
        tool.addThought(text);
      }

      const thoughts = tool.getAllThoughts();
      expect(thoughts).toHaveLength(thoughtTexts.length);
      expect(thoughts.map((t: Thought) => t.content)).toEqual(thoughtTexts);
      
      // Verify timestamps
      thoughts.forEach((thought: Thought) => {
        expect(thought.timestamp).toBe(mockDate.toISOString());
      });
    });

    it('should return a copy of thoughts array', () => {
      tool.addThought('Original thought');
      const thoughts = tool.getAllThoughts();
      thoughts.push({
        timestamp: '2025-03-24T16:00:00.000Z',
        content: 'Modified thought'
      });

      expect(tool.getAllThoughts()).toHaveLength(1);
    });
  });

  describe('clearThoughts', () => {
    it('should remove all recorded thoughts', () => {
      tool.addThought('Thought 1');
      tool.addThought('Thought 2');
      expect(tool.getAllThoughts()).toHaveLength(2);

      tool.clearThoughts();
      expect(tool.getAllThoughts()).toHaveLength(0);
    });
  });

  describe('getThoughtStats', () => {
    it('should return zero stats when no thoughts exist', () => {
      const stats = tool.getThoughtStats();
      expect(stats).toEqual({
        totalThoughts: 0,
        averageLength: 0,
        oldestThought: null,
        newestThought: null
      });
    });

    it('should calculate correct statistics', () => {
      const thoughts = ['Short', 'Medium length thought', 'Very long thought for testing'];
      
      for (const thought of thoughts) {
        tool.addThought(thought);
      }

      const stats = tool.getThoughtStats();
      expect(stats.totalThoughts).toBe(thoughts.length);
      expect(stats.averageLength).toBe(
        thoughts.reduce((sum, t) => sum + t.length, 0) / thoughts.length
      );
      expect(stats.oldestThought).toBe(mockDate.toISOString());
      expect(stats.newestThought).toBe(mockDate.toISOString());
    });
  });
}); 