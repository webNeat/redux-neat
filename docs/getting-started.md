# Getting Started

This guide covers everything you need to set up your development environment and start contributing to redux-neat.

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool        | Version | Purpose            |
| ----------- | ------- | ------------------ |
| **Node.js** | >=20    | JavaScript runtime |
| **pnpm**    | >=10    | Package manager    |
| **Git**     | Latest  | Version control    |

### Optional Tools

- **devenv** - Nix-based development environment (automatically provides Node.js and pnpm)
- **direnv** - Automatic environment loading when entering project directory

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/webNeat/redux-neat.git
cd redux-neat
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies defined in `package.json`, including:

**Runtime Dependencies:**

- `redux` - Core Redux library
- `react-redux` - React bindings for Redux
- `just-types` - TypeScript utility types

**Development Dependencies:**

- `typescript` - TypeScript compiler
- `tsup` - Build tool
- `vitest` - Test framework
- `prettier` - Code formatter
- `@changesets/cli` - Release management

### 3. Verify Setup

Run the following commands to verify your setup:

```bash
# Type check
pnpm typecheck

# Run tests
pnpm test

# Build the project
pnpm build
```

## Using Devenv (Recommended)

The project includes [devenv](https://devenv.sh/) configuration for reproducible development environments using Nix.

### Setup with Devenv

1. **Install devenv** following [official instructions](https://devenv.sh/getting-started/)

2. **Enter the environment:**

   ```bash
   devenv shell
   ```

   Or with direnv (automatic):

   ```bash
   direnv allow
   ```

3. **Devenv provides:**
   - Node.js 24
   - pnpm

### Configuration Files

| File          | Purpose                            |
| ------------- | ---------------------------------- |
| `devenv.nix`  | Defines packages (nodejs_24, pnpm) |
| `devenv.yaml` | Specifies Nix input sources        |
| `devenv.lock` | Locks Nix package versions         |
| `.envrc`      | direnv integration                 |

## Project Structure

```
redux-neat/
├── src/                    # Source code
│   ├── index.ts           # Main entry point (exports)
│   ├── types.ts           # TypeScript type definitions
│   ├── create.ts          # Main create() function
│   ├── makeActions.ts     # Action creators generator
│   ├── makeReducer.ts     # Reducer generator
│   ├── makeSelectors.ts   # Selector hooks generator
│   ├── flattenHandlers.ts # Handler flattening utility
│   ├── flattenHandlers.test.ts  # In-source test
│   └── utils.ts           # Utility functions
├── tests/                  # Test files
│   └── simple.test.ts     # Integration tests
├── docs/                   # Documentation
├── dist/                   # Build output (generated)
├── .github/
│   └── workflows/         # CI/CD pipelines
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── tsup.config.ts         # Build configuration
├── vitest.config.ts       # Test configuration
└── .prettierrc            # Code formatting rules
```

## Available Scripts

| Script       | Command           | Description                   |
| ------------ | ----------------- | ----------------------------- |
| `build`      | `pnpm build`      | Build the project with tsup   |
| `test`       | `pnpm test`       | Run tests once                |
| `test-watch` | `pnpm test-watch` | Run tests in watch mode       |
| `typecheck`  | `pnpm typecheck`  | Run TypeScript type checking  |
| `format`     | `pnpm format`     | Format code with Prettier     |
| `version`    | `pnpm version`    | Bump version using changesets |
| `release`    | `pnpm release`    | Build and publish to npm      |

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in the `src/` directory. The codebase is small and focused:

- Modify existing functionality in the appropriate file
- Add new functionality following existing patterns
- Ensure type safety is maintained

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test-watch
```

### 4. Type Check

```bash
pnpm typecheck
```

### 5. Format Code

```bash
pnpm format
```

### 6. Build

```bash
pnpm build
```

### 7. Create a Changeset

For changes that should be released:

```bash
pnpm changeset
```

Follow the prompts to describe your changes.

### 8. Submit a Pull Request

Push your branch and create a PR against `main`.

## IDE Setup

### VS Code

Recommended extensions:

- **ESLint** - Linting (if added in future)
- **Prettier** - Code formatting
- **TypeScript and JavaScript Language Features** - Built-in

### Settings

The project uses Prettier for formatting. Configure your editor to format on save using the `.prettierrc` configuration.

## Troubleshooting

### Common Issues

**Issue: `pnpm install` fails**

```bash
# Clear pnpm cache and retry
pnpm store prune
pnpm install
```

**Issue: TypeScript errors in IDE**

```bash
# Restart TypeScript server in your IDE
# VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

**Issue: Tests failing unexpectedly**

```bash
# Run with verbose output
pnpm test -- --reporter=verbose
```

**Issue: Build errors**

```bash
# Clean dist and rebuild
rm -rf dist
pnpm build
```

## Next Steps

- Read the [Architecture Overview](./architecture.md) to understand the codebase design
- Explore the [Source Code Guide](./source-code.md) for detailed file explanations
- Check the [Contributing Guidelines](./contributing.md) before submitting changes
