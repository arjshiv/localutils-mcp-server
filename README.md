# Local Utilities MCP Server

A Model Context Protocol (MCP) server that provides access to various local system utilities. This server can be used with Cursor and other MCP-compatible clients to provide quick access to system information.

## Features

The server provides the following utilities:

- **Time and Date**: Get the current local time and date, including day of the week, in various formats
- **Hostname**: Get the system's hostname
- **Public IP**: Get the machine's public IP address
- **Directory Listing**: List the contents of a specified directory
- **Node.js Version**: Get the currently running Node.js version
- **Port Checker**: Check what process is running on a specific port

## Installation

### Global Installation

```bash
pnpm add -g localutils-mcp-server
```

### Using with npx

You can also run the server directly using npx without installing it globally:

```bash
npx localutils-mcp-server
```

## Usage

### Starting the Server

If installed globally:

```bash
localutils-mcp
```

With npx:

```bash
npx localutils-mcp-server
```

### Using with Cursor

The server can be used with Cursor by configuring it as an MCP server in Cursor's settings.

1. Open Cursor settings
2. Navigate to the MCP section
3. Add a new MCP server with the following configuration:
   ```json
   {
     "name": "localutils",
     "command": "npx",
     "args": ["localutils-mcp-server"]
   }
   ```

### Using the MCP Inspector

You can test the server using the MCP Inspector:

```bash
pnpm run inspector
```

This will start the MCP Inspector at http://localhost:5173.

## Available Tools

### `get_time_and_date`

Returns the current local time and date in various formats, including:
- Local time
- Local date
- Day of the week
- ISO 8601 format
- Unix timestamp

### `get_hostname`

Returns the hostname of the machine running the MCP server.

### `get_public_ip`

Returns the public IP address of the machine running the MCP server.

### `list_directory`

Lists the contents of a specified directory.

**Parameters:**
- `path` (string, required): Directory path to list

### `get_node_version`

Returns the Node.js version information of the environment running the MCP server.

### `check_port`

Checks what process is running on a specific port.

**Parameters:**
- `port` (number or string, required): Port number to check (1-65535). String values will be automatically converted to numbers.

**Example Response (macOS/Linux):**
```json
{
  "processes": [
    {
      "command": "node",
      "pid": "12345",
      "user": "username",
      "fd": "12u",
      "type": "IPv4",
      "device": "0x1234567890",
      "size": "0t0",
      "node": "TCP",
      "name": "*:3000 (LISTEN)"
    }
  ],
  "message": "Found 1 process(es) using port 3000"
}
```

## Development

### Building

```bash
pnpm run build
```

### Running in Development Mode

```bash
pnpm run dev
```

### Testing

```bash
pnpm test
```

### Git Workflow

This repository includes a pre-commit hook that automatically builds the server before each commit. This ensures that the build files are always up-to-date in the repository.

The build folder is included in the git repository to make it easier to use the package with npx without having to build it first.

To set up the pre-commit hook after cloning the repository:

```bash
pnpm install
```

This will install dependencies and set up the pre-commit hook via Husky.

## License

MIT 