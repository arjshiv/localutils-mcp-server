import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface Thought {
  timestamp: string;
  content: string;
}

export interface ThoughtStats {
  [key: string]: number | string | null;
  totalThoughts: number;
  averageLength: number;
  oldestThought: string | null;
  newestThought: string | null;
}

export class ThinkTool {
  private thoughts: Thought[] = [];

  addThought(content: string): void {
    this.thoughts.push({
      timestamp: new Date().toISOString(),
      content
    });
  }

  getAllThoughts(): Thought[] {
    return [...this.thoughts];
  }

  clearThoughts(): void {
    this.thoughts = [];
  }

  getThoughtStats(): ThoughtStats {
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
}

export function registerThinkTool(server: McpServer) {
  const tool = new ThinkTool();

  // Register think command
  server.tool(
    "think",
    { thought: z.string().describe("The thought content to record") },
    async (params) => {
      tool.addThought(params.thought);
      return {
        content: [{
          type: "text",
          text: "Thought recorded successfully"
        }]
      };
    }
  );

  // Register get_thoughts command
  server.tool(
    "get_thoughts",
    "Retrieve all recorded thoughts",
    async () => {
      const thoughts = tool.getAllThoughts();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(thoughts, null, 2)
        }]
      };
    }
  );

  // Register clear_thoughts command
  server.tool(
    "clear_thoughts",
    "Clear all recorded thoughts",
    async () => {
      tool.clearThoughts();
      return {
        content: [{
          type: "text",
          text: "All thoughts cleared"
        }]
      };
    }
  );

  // Register get_thought_stats command
  server.tool(
    "get_thought_stats",
    "Get statistics about recorded thoughts",
    async () => {
      const stats = tool.getThoughtStats();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(stats, null, 2)
        }]
      };
    }
  );
} 