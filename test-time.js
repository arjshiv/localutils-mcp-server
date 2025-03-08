import { spawn } from 'child_process';

const mcp = spawn('npx', ['localutils-mcp']);

// The request to get time
const request = {
  method: 'tools/call',
  params: {
    name: 'get_time_and_date'
  }
};

// Send the request
mcp.stdin.write(JSON.stringify(request) + '\n');

// Handle the response
mcp.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log('Time Tool Response:');
  console.log(response);
  process.exit(0);
});

mcp.stderr.on('data', (data) => {
  console.error(`Error: ${data}`);
});

// Close stdin to signal we're done sending requests
mcp.stdin.end(); 