# Repo Guidelines for localutils-mcp-server

This project is a TypeScript implementation of an MCP (Model Context Protocol) server that exposes several local utilities. All source lives under `src/` and the compiled output is committed in `build/`.

## Development Workflow

- Use **pnpm** for dependency management. Install dependencies with `pnpm install` which also sets up the Husky pre-commit hook.
- Build compiled output with `pnpm run build`. The pre-commit hook automatically runs `npm run build` to ensure `build/` is up to date.
- Run tests with `pnpm test`. Aim for over 80% coverage as noted in `.cursor/rules/testing.mdc`.
- Node.js version 16 or higher is required.

## Coding Standards

TypeScript style guidelines are defined in `.cursor/rules/typescript.mdc` and include:
- Use named exports, avoid default exports.
- Order imports as: Node built-ins, external packages, internal modules. Separate groups with blank lines.
- Avoid `any`; prefer explicit types and interfaces.
- Use PascalCase for classes/interfaces and camelCase for variables/functions. Prefix interfaces with `I` and type aliases with `T`.
- Use arrow functions for callbacks, handle errors properly, and prefer async/await.
- Format with two-space indentation, 100 character line length, semicolons, single quotes, and trailing commas in multiline structures.

Documentation standards from `.cursor/rules/documentation.mdc` require thorough README files, JSDoc comments for public APIs, and Markdown with proper heading hierarchy. Keep comments focused on *why* and ensure all public functions are documented.

MCP-specific documentation must follow `.cursor/rules/mcp-docs.mdc` which mandates Mermaid diagrams describing workflows and protocol details. Each MCP implementation under `src/mcp/` should include these diagrams and explanations.

Testing guidelines in `.cursor/rules/testing.mdc` specify placing tests in `src/__tests__` with `.test.ts` suffix, following the Arrange/Act/Assert pattern, and keeping tests independent.

Package management rules from `.cursor/rules/package.mdc` expect up‑to‑date dependencies, documented custom scripts, and semantic versioning. Lockfiles should be committed.

## Commit and Review

- The repository uses a Husky pre-commit hook located in `.husky/pre-commit` to build the project before commits. Ensure the build succeeds before committing.
- Include unit tests for new functionality and update documentation when APIs change.
- Build output in `build/` must remain in sync with `src/` after changes.

Follow these guidelines alongside the detailed Cursor rules so future automated agents can work effectively in this repository.
