import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { listDirectory } from '../../mcp/directory.js';
describe('Directory Tool Logic - listDirectory', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    it('should list directory contents correctly', async () => {
        const testPath = '/mock/dir';
        const mockEntries = [
            { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
            { name: 'subdir', isDirectory: () => true, isFile: () => false },
            { name: 'link', isDirectory: () => false, isFile: () => false },
            { name: 'file2.log', isDirectory: () => false, isFile: () => true },
        ];
        const mockFileSize1 = 1234;
        const mockFileSize2 = 567;
        const readdirSpy = jest.spyOn(fs.promises, 'readdir').mockResolvedValue(mockEntries);
        const statSpy = jest.spyOn(fs.promises, 'stat').mockImplementation(async (filePath) => {
            if (filePath === path.join(testPath, 'file1.txt')) {
                return { size: mockFileSize1 };
            }
            if (filePath === path.join(testPath, 'file2.log')) {
                return { size: mockFileSize2 };
            }
            throw new Error('Unexpected path for stat');
        });
        const contents = await listDirectory(testPath);
        expect(readdirSpy).toHaveBeenCalledWith(testPath, { withFileTypes: true });
        expect(statSpy).toHaveBeenCalledTimes(2);
        expect(statSpy).toHaveBeenCalledWith(path.join(testPath, 'file1.txt'));
        expect(statSpy).toHaveBeenCalledWith(path.join(testPath, 'file2.log'));
        expect(contents).toHaveLength(4);
        expect(contents).toEqual([
            { name: 'file1.txt', type: 'file', size: mockFileSize1 },
            { name: 'subdir', type: 'directory' },
            { name: 'link', type: 'other' },
            { name: 'file2.log', type: 'file', size: mockFileSize2 },
        ]);
    });
    it('should handle readdir errors', async () => {
        const testPath = '/error/dir';
        const mockError = new Error('Permission denied');
        const readdirSpy = jest.spyOn(fs.promises, 'readdir').mockRejectedValue(mockError);
        await expect(listDirectory(testPath)).rejects.toThrow(mockError);
        expect(readdirSpy).toHaveBeenCalledWith(testPath, { withFileTypes: true });
    });
    it('should handle stat errors gracefully', async () => {
        const testPath = '/stat/error/dir';
        const mockEntries = [
            { name: 'goodfile.txt', isDirectory: () => false, isFile: () => true },
            { name: 'brokenlink.txt', isDirectory: () => false, isFile: () => true }
        ];
        const mockGoodFileSize = 999;
        const statError = new Error('Stat failed - EACCES');
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const readdirSpy = jest.spyOn(fs.promises, 'readdir').mockResolvedValue(mockEntries);
        const statSpy = jest.spyOn(fs.promises, 'stat').mockImplementation(async (filePath) => {
            if (filePath === path.join(testPath, 'goodfile.txt')) {
                return { size: mockGoodFileSize };
            }
            if (filePath === path.join(testPath, 'brokenlink.txt')) {
                throw statError;
            }
            throw new Error('Unexpected path for stat');
        });
        const contents = await listDirectory(testPath);
        expect(readdirSpy).toHaveBeenCalledWith(testPath, { withFileTypes: true });
        expect(statSpy).toHaveBeenCalledTimes(2);
        expect(consoleWarnSpy).toHaveBeenCalledWith(`Could not stat file ${path.join(testPath, 'brokenlink.txt')}:`, statError);
        expect(contents).toHaveLength(2);
        expect(contents).toEqual([
            { name: 'goodfile.txt', type: 'file', size: mockGoodFileSize },
            { name: 'brokenlink.txt', type: 'file', size: undefined },
        ]);
    });
});
