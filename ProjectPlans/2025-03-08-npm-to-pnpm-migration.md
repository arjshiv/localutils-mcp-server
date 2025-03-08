# npm to pnpm Migration - March 8, 2025

## Project Description

This document outlines the migration of the localutils-mcp-server project from npm to pnpm package manager. The goal was to improve package installation speed and efficiency while maintaining compatibility with existing npx commands.

## Migration Checklist

- [x] Install pnpm globally
- [x] Update package.json scripts to work with pnpm
- [x] Create pnpm configuration files
  - [x] .npmrc with pnpm-specific settings
  - [x] pnpm-workspace.yaml for workspace configuration
  - [x] Update .gitignore to include pnpm-specific files
- [x] Remove package-lock.json
- [x] Generate pnpm-lock.yaml file
- [x] Verify build functionality
- [x] Verify inspector command functionality
- [x] Document the migration process

## Implementation Details

### 1. Package Manager Installation

```bash
npm install -g pnpm
```

### 2. Configuration Files

#### .npmrc
```
engine-strict=true
resolution-mode=highest
save-exact=false
auto-install-peers=true
strict-peer-dependencies=false
```

#### pnpm-workspace.yaml
```yaml
packages:
  - '.'
  - 'src/**'
```

#### .gitignore additions
```
.pnpm-store/
.pnpm-debug.log
```

### 3. Package.json Updates

```json
"scripts": {
  "build": "tsc && chmod +x build/index.js",
  "prepare": "pnpm run build && husky",
  "watch": "tsc --watch",
  "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/index.ts",
  "start": "node build/index.js",
  "inspector": "npx @modelcontextprotocol/inspector build/index.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### 4. Dependency Installation

```bash
pnpm install
```

## Benefits

1. **Faster installations** - pnpm is significantly faster than npm due to its efficient package storage mechanism.
2. **Disk space efficiency** - pnpm uses a content-addressable store to save disk space by not duplicating packages.
3. **Strict dependency management** - pnpm creates a more accurate dependency tree, preventing phantom dependencies.
4. **Compatibility** - Maintained compatibility with npx commands as requested, providing the best of both worlds.

## Verification

The migration was verified by:
1. Successfully running the build script with pnpm
2. Successfully running the inspector command with pnpm
3. Confirming that all npx commands continue to work as expected

## Known Issues

- Test scripts need further configuration to work properly with pnpm and Jest
- CI/CD pipelines may need updates if they're currently using npm

## Next Steps

- Update CI/CD pipelines to use pnpm if applicable
- Fix test configuration to work properly with pnpm
- Consider adding pnpm-specific optimizations for monorepo support in the future

## References

- [pnpm Documentation](https://pnpm.io/motivation)
- [npm vs pnpm Performance Comparison](https://pnpm.io/benchmarks)
- [pnpm Workspace Features](https://pnpm.io/workspaces) 