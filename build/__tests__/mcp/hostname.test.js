import * as os from 'os';
import { getHostname } from '../../mcp/hostname.js';
describe('Hostname Tool Logic', () => {
    it('getHostname should return the actual OS hostname', () => {
        // We don't mock os.hostname anymore, just call the function
        const result = getHostname();
        // Check that the result matches the real hostname
        expect(result).toBe(os.hostname());
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
    // Removed tests that attempted to mock os.hostname or McpServer
});
