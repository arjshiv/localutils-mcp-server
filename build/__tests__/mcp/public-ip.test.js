import * as https from 'https';
import { getPublicIp } from '../../mcp/public-ip.js';
import { EventEmitter } from 'events';
// Mock the https module
jest.mock('https');
describe('Public IP Tool Logic', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });
    it('getPublicIp should fetch and return the IP address', async () => {
        const mockIp = '192.0.2.1';
        // Mock https.get implementation for success
        const mockResponse = new EventEmitter();
        https.get.mockImplementation((url, callback) => {
            expect(url).toBe('https://api.ipify.org');
            // Simulate receiving data and ending the response
            process.nextTick(() => {
                mockResponse.emit('data', mockIp);
                mockResponse.emit('end');
            });
            callback(mockResponse);
            // Return a mock request object (doesn't need to do much here)
            const mockRequest = new EventEmitter();
            return mockRequest;
        });
        const ip = await getPublicIp();
        expect(ip).toBe(mockIp);
        expect(https.get).toHaveBeenCalledTimes(1);
    });
    it('getPublicIp should reject with an error on network failure', async () => {
        const mockError = new Error('Network connection failed');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // Suppress console output
        // Mock https.get implementation for error
        https.get.mockImplementation(() => {
            const mockRequest = new EventEmitter();
            // Simulate an error event
            process.nextTick(() => {
                mockRequest.emit('error', mockError);
            });
            return mockRequest;
        });
        await expect(getPublicIp()).rejects.toThrow('Failed to fetch public IP address');
        expect(https.get).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching public IP from api.ipify.org:", mockError);
        consoleErrorSpy.mockRestore();
    });
    it('getPublicIp should handle empty response data', async () => {
        // Mock https.get implementation for empty response
        const mockResponse = new EventEmitter();
        https.get.mockImplementation((url, callback) => {
            process.nextTick(() => {
                mockResponse.emit('data', ''); // Empty data
                mockResponse.emit('end');
            });
            callback(mockResponse);
            const mockRequest = new EventEmitter();
            return mockRequest;
        });
        const ip = await getPublicIp();
        expect(ip).toBe(''); // Should return empty string
        expect(https.get).toHaveBeenCalledTimes(1);
    });
});
