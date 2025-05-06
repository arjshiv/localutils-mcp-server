import { getNodeVersionInfo } from '../../mcp/node-version.js'; // Import the function
describe('Node Version Tool Logic', () => {
    let originalProcessVersion;
    let originalProcessVersions;
    beforeAll(() => {
        // Save original process values
        originalProcessVersion = process.version;
        originalProcessVersions = process.versions;
    });
    afterAll(() => {
        // Restore original process values
        Object.defineProperty(process, 'version', {
            value: originalProcessVersion,
            writable: true // Make writable for potential future tests
        });
        Object.defineProperty(process, 'versions', {
            value: originalProcessVersions,
            writable: true // Make writable
        });
    });
    it('getNodeVersionInfo should return correct version information', () => {
        // Mock process.version and process.versions for this test
        const mockVersion = 'v20.0.0';
        const mockVersions = {
            node: '20.0.0',
            v8: '11.0.0.0',
            // Add other relevant properties if needed for assertion
        }; // Cast for simplicity in mock
        Object.defineProperty(process, 'version', { value: mockVersion, writable: true });
        Object.defineProperty(process, 'versions', { value: mockVersions, writable: true });
        const result = getNodeVersionInfo();
        // Check the result
        expect(result).toBeDefined();
        expect(result.nodeVersion).toBe(mockVersion);
        expect(result.details).toEqual(mockVersions);
        expect(result.details.node).toBe(mockVersions.node);
        expect(result.details.v8).toBe(mockVersions.v8);
    });
    it('getNodeVersionInfo should return actual process versions if not mocked', () => {
        // Restore originals for this specific test
        Object.defineProperty(process, 'version', { value: originalProcessVersion, writable: true });
        Object.defineProperty(process, 'versions', { value: originalProcessVersions, writable: true });
        const result = getNodeVersionInfo();
        expect(result.nodeVersion).toBe(process.version);
        expect(result.details).toEqual(process.versions);
    });
    // Error handling tests are removed as process.version/versions 
    // are unlikely to throw in normal operation, and the MCP SDK handles transport errors.
});
