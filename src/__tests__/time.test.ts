import { getCurrentTimeAndDate } from '../utils/time.js';

describe('Time Utilities', () => {
  let originalDate: typeof Date;
  const mockDate = new Date('2024-03-08T16:30:00.000Z');

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

  it('should return current time and date in all formats', () => {
    const result = getCurrentTimeAndDate();
    
    expect(result).toHaveProperty('time');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('iso');
    expect(result).toHaveProperty('timestamp');
    
    expect(typeof result.time).toBe('string');
    expect(typeof result.date).toBe('string');
    expect(typeof result.iso).toBe('string');
    expect(typeof result.timestamp).toBe('number');
  });

  it('should return valid time string', () => {
    const result = getCurrentTimeAndDate();
    expect(result.time).toMatch(/^\d{1,2}:\d{2}:\d{2}(?:\s?[AaPp][Mm])?$/);
  });

  it('should return valid date string', () => {
    const result = getCurrentTimeAndDate();
    expect(result.date).toBeTruthy();
    expect(typeof result.date).toBe('string');
  });

  it('should return valid ISO string', () => {
    const result = getCurrentTimeAndDate();
    expect(() => new Date(result.iso)).not.toThrow();
  });

  it('should return valid timestamp', () => {
    const result = getCurrentTimeAndDate();
    expect(result.timestamp).toBeLessThanOrEqual(Date.now());
    expect(result.timestamp).toBeGreaterThan(0);
  });
}); 