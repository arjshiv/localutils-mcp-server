# ProjectPlans/2025-03-08-local-utilities-planning.md

## Project Description

This project aims to expand the `localutils-mcp-server` with new, simple local utilities that are helpful for developers using Cursor and MCP tools. These utilities will provide quick access to common system and environment information, streamlining development workflows.  The initial focus will be on utilities similar in complexity to the existing "local time" utility.

## Project Checklist

Here's a checklist outlining the plan to add new local utilities:

**Phase 1: Planning and Design (This Document)**

- [x] Define the scope of "simple" local utilities. (Focus on system and environment info)
- [x] Brainstorm potential utility ideas. (Hostname, Public IP, Directory Listing, Node Version initially)
- [x] Prioritize utilities based on usefulness and ease of implementation. (Hostname, Public IP, Directory Listing, Node Version - initial priority)
- [x] Define the input and output format for each utility. (Simple text output for initial utilities)
- [x] Determine error handling strategy for utilities. (Return error messages in text output)
- [x] Plan for documentation of new utilities (README update).
- [x] Create Project Plan document (`2025-03-08-local-utilities-planning.md`).

**Phase 2: Implementation**

- [x] Create new MCP command handlers for each utility in `src/mcp/`.
    - [x] Implement `hostname` utility.
    - [x] Implement `public-ip` utility.
    - [x] Implement `list-directory` utility.
    - [x] Implement `node-version` utility.
    - [x] Implement `port-checker` utility (additional utility).
- [x] Update `src/protocols/` to define new MCP commands and message structures.
- [x] Implement necessary protocol handlers in `src/handlers/`.
- [x] Write unit tests for each new utility in `src/__tests__/mcp/`.
- [x] Update documentation in `src/mcp/**/README.md` and `docs/mcp/*.md` to include the new utilities.
- [x] Test the utilities thoroughly in a local Cursor development environment.

**Phase 3: Review and Refinement**

- [x] Code review of implemented utilities and tests.
- [ ] Gather feedback from potential users on utility usefulness and usability.
- [ ] Refine utilities based on feedback (error handling, output format, etc.).
- [ ] Consider adding more utilities based on user feedback and initial success.

**Initial Utility Ideas (To be prioritized and implemented in Phase 2):**

1.  **Hostname:**  Returns the system's hostname. Useful for identifying the machine you are working on.
2.  **Public IP Address:** Returns the machine's public IP address. Useful for network debugging and external access identification.
3.  **List Directory Contents:**  Allows listing the contents of a specified directory. Useful for quick file system inspection. (Initially, just list files and directories, no detailed info).
4.  **Node.js Version:** Returns the currently running Node.js version. Useful for ensuring environment compatibility.
5.  **Port Checker:** Checks what process is running on a specific port. Useful for debugging network issues and identifying services.

**Future Utility Ideas (Consider for later phases):**

1.  **Local IP Addresses:** List local network interface IP addresses.
2.  **Operating System Information:**  Returns OS name and version.
3.  **CPU/Memory Information:**  Basic CPU and memory stats.
4.  **Git Status:**  Returns the Git status of a directory (useful in project directories).
5.  **MCP Server Status:** Check if the MCP server is running and responsive. 