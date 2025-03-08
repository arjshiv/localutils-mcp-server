export function getCurrentTimeAndDate() {
    const now = new Date();
    return {
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        iso: now.toISOString(),
        timestamp: now.getTime(),
    };
}
