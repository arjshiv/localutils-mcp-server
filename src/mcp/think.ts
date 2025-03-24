import type { MCPRequest, MCPResponse } from '../types/mcp.js';

interface Thought {
  timestamp: string;
  content: string;
}

interface ThoughtStats {
  [key: string]: number | string | null;
  totalThoughts: number;
  averageLength: number;
  oldestThought: string | null;
  newestThought: string | null;
}

class ThinkTool {
  private thoughts: Thought[] = [];

  private addThought(content: string): void {
    this.thoughts.push({
      timestamp: new Date().toISOString(),
      content
    });
  }

  private getAllThoughts(): Thought[] {
    return [...this.thoughts];
  }

  private clearThoughts(): void {
    this.thoughts = [];
  }

  private getThoughtStats(): ThoughtStats {
    const totalThoughts = this.thoughts.length;
    
    if (totalThoughts === 0) {
      return {
        totalThoughts: 0,
        averageLength: 0,
        oldestThought: null,
        newestThought: null
      };
    }

    const averageLength = this.thoughts.reduce((acc, thought) => 
      acc + thought.content.length, 0) / totalThoughts;

    return {
      totalThoughts,
      averageLength,
      oldestThought: this.thoughts[0].timestamp,
      newestThought: this.thoughts[this.thoughts.length - 1].timestamp
    };
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const { command, params } = request;

      switch (command) {
        case 'think':
          if (!params?.thought || typeof params.thought !== 'string') {
            throw new Error('Missing or invalid thought parameter');
          }
          this.addThought(params.thought);
          return {
            success: true,
            data: { message: 'Thought recorded successfully' }
          };

        case 'get_thoughts':
          return {
            success: true,
            data: { thoughts: this.getAllThoughts() }
          };

        case 'clear_thoughts':
          this.clearThoughts();
          return {
            success: true,
            data: { message: 'All thoughts cleared' }
          };

        case 'get_thought_stats':
          return {
            success: true,
            data: this.getThoughtStats()
          };

        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const thinkTool = new ThinkTool(); 