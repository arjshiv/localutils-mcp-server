import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerThinkTool } from '../../mcp/think.js';
import { z } from 'zod';
describe('Think Tool Registration and Logic', () => {
    let server;
    let mockToolMethod;
    let registeredTools;
    beforeEach(() => {
        // Create a mock server to capture registrations
        server = new McpServer({
            name: "Test Think Server",
            version: "1.0.0"
        });
        // Mock the internal tool method to store registration details
        registeredTools = new Map();
        mockToolMethod = jest.fn((name, schemaOrDesc, callbackOrSchema, options) => {
            let schema;
            let callback;
            // Handle different overloads of server.tool
            if (typeof schemaOrDesc === 'object') { // Schema provided first
                schema = schemaOrDesc;
                callback = callbackOrSchema;
            }
            else { // Description provided first
                schema = options?.parameters; // Schema might be in options
                callback = callbackOrSchema;
            }
            registeredTools.set(name, { schema, callback });
        });
        server.tool = mockToolMethod;
        // Register the tools
        registerThinkTool(server);
    });
    it('should register all four think tools', () => {
        expect(mockToolMethod).toHaveBeenCalledTimes(4);
        expect(registeredTools.has('think')).toBe(true);
        expect(registeredTools.has('get_thoughts')).toBe(true);
        expect(registeredTools.has('clear_thoughts')).toBe(true);
        expect(registeredTools.has('get_thought_stats')).toBe(true);
    });
    it('should register "think" tool with correct schema', () => {
        const thinkRegistration = registeredTools.get('think');
        expect(thinkRegistration).toBeDefined();
        // Check if the schema has the 'thought' property of type ZodString
        expect(thinkRegistration?.schema?.thought).toBeInstanceOf(z.ZodString);
    });
    it('should register other tools without schemas (implicitly)', () => {
        expect(registeredTools.get('get_thoughts')?.schema).toBeUndefined();
        expect(registeredTools.get('clear_thoughts')?.schema).toBeUndefined();
        expect(registeredTools.get('get_thought_stats')?.schema).toBeUndefined();
    });
    describe('Tool Callbacks (Simulated)', () => {
        let originalDate;
        const mockTimestamp = '2025-05-05T10:00:00.000Z';
        beforeAll(() => {
            originalDate = global.Date;
            global.Date = class extends Date {
                toISOString() {
                    return mockTimestamp;
                }
            };
        });
        afterAll(() => {
            global.Date = originalDate;
        });
        it('"think" callback should add thought and return success', async () => {
            const thinkRegistration = registeredTools.get('think');
            expect(thinkRegistration?.callback).toBeDefined();
            if (!thinkRegistration?.callback)
                return; // Type guard
            // Simulate calling the registered callback
            const result = await thinkRegistration.callback({ thought: 'A new test thought' });
            expect(result.content[0].text).toBe('Thought recorded successfully');
            // Check internal state via get_thoughts (needs another call)
            const getThoughtsRegistration = registeredTools.get('get_thoughts');
            expect(getThoughtsRegistration?.callback).toBeDefined();
            if (!getThoughtsRegistration?.callback)
                return; // Type guard
            const thoughtsResult = await getThoughtsRegistration.callback({});
            const thoughts = JSON.parse(thoughtsResult.content[0].text);
            expect(thoughts).toHaveLength(1);
            expect(thoughts[0]).toEqual({ timestamp: mockTimestamp, content: 'A new test thought' });
        });
        it('"get_thoughts" callback should return current thoughts', async () => {
            const thinkRegistration = registeredTools.get('think');
            const getThoughtsRegistration = registeredTools.get('get_thoughts');
            expect(thinkRegistration?.callback).toBeDefined();
            expect(getThoughtsRegistration?.callback).toBeDefined();
            if (!thinkRegistration?.callback || !getThoughtsRegistration?.callback)
                return;
            await thinkRegistration.callback({ thought: 'Thought 1' });
            await thinkRegistration.callback({ thought: 'Thought 2' });
            const result = await getThoughtsRegistration.callback({});
            const thoughts = JSON.parse(result.content[0].text);
            expect(thoughts).toHaveLength(2);
            expect(thoughts[1].content).toBe('Thought 2');
        });
        it('"clear_thoughts" callback should reset thoughts', async () => {
            const thinkRegistration = registeredTools.get('think');
            const getThoughtsRegistration = registeredTools.get('get_thoughts');
            const clearThoughtsRegistration = registeredTools.get('clear_thoughts');
            expect(thinkRegistration?.callback).toBeDefined();
            expect(getThoughtsRegistration?.callback).toBeDefined();
            expect(clearThoughtsRegistration?.callback).toBeDefined();
            if (!thinkRegistration?.callback || !getThoughtsRegistration?.callback || !clearThoughtsRegistration?.callback)
                return;
            await thinkRegistration.callback({ thought: 'To be cleared' });
            let thoughtsResult = await getThoughtsRegistration.callback({});
            expect(JSON.parse(thoughtsResult.content[0].text)).toHaveLength(1);
            const clearResult = await clearThoughtsRegistration.callback({});
            expect(clearResult.content[0].text).toBe('Cleared 1 recorded thoughts.');
            thoughtsResult = await getThoughtsRegistration.callback({});
            expect(JSON.parse(thoughtsResult.content[0].text)).toHaveLength(0);
        });
        it('"get_thought_stats" callback should calculate stats', async () => {
            const thinkRegistration = registeredTools.get('think');
            const getStatsRegistration = registeredTools.get('get_thought_stats');
            expect(thinkRegistration?.callback).toBeDefined();
            expect(getStatsRegistration?.callback).toBeDefined();
            if (!thinkRegistration?.callback || !getStatsRegistration?.callback)
                return;
            await thinkRegistration.callback({ thought: 'Short' }); // 5
            await thinkRegistration.callback({ thought: 'Medium one' }); // 10
            const result = await getStatsRegistration.callback({});
            const stats = JSON.parse(result.content[0].text);
            expect(stats.totalThoughts).toBe(2);
            expect(stats.averageLength).toBe(7.5);
            expect(stats.oldestThought).toBe(mockTimestamp);
            expect(stats.newestThought).toBe(mockTimestamp);
        });
        it('"get_thought_stats" callback should handle zero thoughts', async () => {
            const getStatsRegistration = registeredTools.get('get_thought_stats');
            expect(getStatsRegistration?.callback).toBeDefined();
            if (!getStatsRegistration?.callback)
                return;
            const result = await getStatsRegistration.callback({});
            const stats = JSON.parse(result.content[0].text);
            expect(stats.totalThoughts).toBe(0);
            expect(stats.averageLength).toBe(0);
            expect(stats.oldestThought).toBeNull();
            expect(stats.newestThought).toBeNull();
        });
    });
});
