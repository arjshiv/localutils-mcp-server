# Contributing to localutils-mcp-server

We love your input! We want to make contributing to localutils-mcp-server as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github
We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. This will set up the pre-commit hook that automatically builds the project before each commit.

## Package Management

This project uses pnpm for package management. If you don't have pnpm installed, you can install it globally:

```bash
npm install -g pnpm
```

## Build Process

The build process compiles TypeScript to JavaScript and makes the CLI executable:

```bash
pnpm run build
```

This project includes a pre-commit hook that automatically runs the build process before each commit. This ensures that the build files are always up-to-date in the repository.

The build folder is included in the git repository to make it easier to use the package with npx without having to build it first.

## Adding New Utilities

When adding a new utility:

1. Create a new file in `src/mcp/` for your utility
2. Follow the pattern of existing utilities
3. Register your utility in `src/index.ts`
4. Add tests in `src/__tests__/mcp/`
5. Update documentation in `src/mcp/README.md` and the main `README.md`

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/yourusername/localutils-mcp-server/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/localutils-mcp-server/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

* Use TypeScript for all source files
* 2 spaces for indentation rather than tabs
* You can try running `pnpm run lint` for style unification
* Follow the TypeScript coding standards in the `.cursorrules` file

## License
By contributing, you agree that your contributions will be licensed under its MIT License. 