export function getCurrentTimeAndDate() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        dayOfWeek: days[now.getDay()],
        iso: now.toISOString(),
        timestamp: now.getTime(),
    };
}
export function registerTimeTool(server) {
    server.tool("get_time_and_date", "Returns the current time, date, day of week, and timestamp in various formats", async () => {
        const result = getCurrentTimeAndDate();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
        };
    });
}
