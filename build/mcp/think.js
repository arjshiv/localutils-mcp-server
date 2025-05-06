import { z } from "zod";
// Export this again for the reverted test file
export class ThinkToolInternalLogic {
    thoughts = []; // Make public for test access if needed, or add methods
    addThought(content) {
        this.thoughts.push({
            timestamp: new Date().toISOString(),
            content
        });
    }
    getAllThoughts() {
        return [...this.thoughts];
    }
    clearThoughts() {
        this.thoughts = [];
    }
    getThoughtStats() {
        const totalThoughts = this.thoughts.length;
        if (totalThoughts === 0) {
            return {
                totalThoughts: 0,
                averageLength: 0,
                oldestThought: null,
                newestThought: null
            };
        }
        const averageLength = this.thoughts.reduce((acc, thought) => acc + thought.content.length, 0) / totalThoughts;
        return {
            totalThoughts,
            averageLength: parseFloat(averageLength.toFixed(2)), // Keep formatted
            oldestThought: this.thoughts[0].timestamp,
            newestThought: this.thoughts[this.thoughts.length - 1].timestamp
        };
    }
}
export function registerThinkTool(server) {
    // Use closure state, but keep the class exported for the old test
    let thoughts = [];
    // Register think command
    server.tool("think", { thought: z.string().min(1, "Thought cannot be empty").describe("The thought content to record") }, async ({ thought }) => {
        thoughts.push({
            timestamp: new Date().toISOString(),
            content: thought
        });
        return {
            content: [{
                    type: "text",
                    text: "Thought recorded successfully"
                }]
        };
    });
    // Register get_thoughts command
    server.tool("get_thoughts", "Retrieve all recorded thoughts", async () => {
        const currentThoughts = [...thoughts];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(currentThoughts, null, 2)
                }]
        };
    });
    // Register clear_thoughts command
    server.tool("clear_thoughts", "Clear all recorded thoughts", async () => {
        const count = thoughts.length;
        thoughts = []; // Reset the array
        return {
            content: [{
                    type: "text",
                    text: `Cleared ${count} recorded thoughts.`
                }]
        };
    });
    // Register get_thought_stats command
    server.tool("get_thought_stats", "Get statistics about recorded thoughts", async () => {
        const totalThoughts = thoughts.length;
        let statsData; // Renamed to avoid conflict with exported interface
        if (totalThoughts === 0) {
            statsData = {
                totalThoughts: 0,
                averageLength: 0,
                oldestThought: null,
                newestThought: null
            };
        }
        else {
            const averageLength = thoughts.reduce((acc, thought) => acc + thought.content.length, 0) / totalThoughts;
            statsData = {
                totalThoughts,
                averageLength: parseFloat(averageLength.toFixed(2)),
                oldestThought: thoughts[0].timestamp,
                newestThought: thoughts[thoughts.length - 1].timestamp
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(statsData, null, 2)
                }]
        };
    });
}
