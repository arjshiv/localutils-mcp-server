# Local Utilities MCP Server

A Model Context Protocol (MCP) server that provides various local system utilities. This server can be used with Claude Desktop or any other MCP-compatible client to access system information and utilities.

## Features

- **Time and Date Utilities**
  - Get current time in local format
  - Get current date
  - Get ISO timestamp
  - Get Unix timestamp

## Installation

### Global Installation

```bash
npm install -g localutils-mcp-server
```

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/yourusername/localutils-mcp-server.git
cd localutils-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Usage

### With Claude Desktop

Add the following configuration to your Claude Desktop config file:

On MacOS (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "localutils": {
      "command": "node",
      "args": ["/absolute/path/to/localutils-mcp-server/build/index.js"]
    }
  }
}
```

### Direct Usage

You can run the server directly using:

```bash
npx localutils-mcp-server
```

### Development

To run the server in development mode with auto-reloading:
```bash
npm run dev
```

To watch for TypeScript changes:
```bash
npm run watch
```

To run tests:
```bash
npm test
```

## Available Tools

### get_time_and_date

Returns the current time and date in various formats:
- Local time (e.g., "4:30:00 PM")
- Local date (e.g., "3/8/2024")
- ISO string (e.g., "2024-03-08T16:30:00.000Z")
- Unix timestamp (e.g., 1709915400000)

No parameters required.

Example response:
```json
{
  "time": "4:30:00 PM",
  "date": "3/8/2024",
  "iso": "2024-03-08T16:30:00.000Z",
  "timestamp": 1709915400000
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- Uses TypeScript and Node.js 