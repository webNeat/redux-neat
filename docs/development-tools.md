# Development Tools

This document covers the development tools and environment configuration used in redux-neat.

## Tool Overview

| Tool           | Purpose                           |
| -------------- | --------------------------------- |
| **pnpm**       | Package manager                   |
| **Devenv**     | Nix-based development environment |
| **direnv**     | Automatic environment loading     |
| **Prettier**   | Code formatting                   |
| **TypeScript** | Type checking                     |

## Package Manager: pnpm

### Why pnpm?

- **Fast** - Efficient package installation
- **Disk efficient** - Content-addressable storage
- **Strict** - No phantom dependencies
- **Workspace support** - Monorepo-ready

### Version Requirement

```json
{
  "engines": {
    "pnpm": ">=10"
  }
}
```

### Key Commands

| Command             | Description          |
| ------------------- | -------------------- |
| `pnpm install`      | Install dependencies |
| `pnpm add <pkg>`    | Add dependency       |
| `pnpm add -D <pkg>` | Add dev dependency   |
| `pnpm remove <pkg>` | Remove dependency    |
| `pnpm update`       | Update dependencies  |
| `pnpm run <script>` | Run package script   |

### Lockfile

**File:** `pnpm-lock.yaml`

- Locks exact dependency versions
- Should be committed to git
- Use `--frozen-lockfile` in CI

### Workspace Configuration

**File:** `pnpm-workspace.yaml`

```yaml
onlyBuiltDependencies:
  - esbuild
```

This limits which dependencies can run postinstall scripts (security feature).

## Development Environment: Devenv

[Devenv](https://devenv.sh/) provides reproducible development environments using Nix.

### Configuration Files

**`devenv.nix`** - Main configuration:

```nix
{ pkgs, lib, config, inputs, ... }:
{
  packages = [ pkgs.nodejs_24 pkgs.pnpm ];
}
```

Provides:

- Node.js 24
- pnpm

**`devenv.yaml`** - Input sources:

```yaml
inputs:
  nixpkgs:
    url: github:cachix/devenv-nixpkgs/rolling
```

Uses rolling release Nixpkgs for latest packages.

**`devenv.lock`** - Version lock:

- Locks Nix package versions
- Ensures reproducibility across machines

### Using Devenv

**Enter environment:**

```bash
devenv shell
```

**Check environment:**

```bash
node --version  # Should show v24.x
pnpm --version  # Should show v10.x
```

### Installing Devenv

1. Install Nix:

   ```bash
   sh <(curl -L https://nixos.org/nix/install) --daemon
   ```

2. Install devenv:

   ```bash
   nix-env -iA devenv -f https://github.com/NixOS/nixpkgs/tarball/nixpkgs-unstable
   ```

3. Enter project and shell:
   ```bash
   cd redux-neat
   devenv shell
   ```

## Automatic Environment: direnv

[direnv](https://direnv.net/) automatically loads the development environment when entering the project directory.

### Configuration

**File:** `.envrc`

```bash
#!/usr/bin/env bash

eval "$(devenv direnvrc)"
use devenv
```

### Setup

1. **Install direnv:**

   ```bash
   # macOS
   brew install direnv

   # Ubuntu/Debian
   sudo apt install direnv
   ```

2. **Hook into shell** (add to ~/.bashrc or ~/.zshrc):

   ```bash
   eval "$(direnv hook bash)"  # or zsh
   ```

3. **Allow in project:**
   ```bash
   cd redux-neat
   direnv allow
   ```

### Benefits

- **Automatic** - Environment loads on `cd`
- **Isolated** - Environment unloads on exit
- **Fast** - Cached after first load

## Code Formatting: Prettier

### Configuration

**File:** `.prettierrc`

```json
{
  "semi": false,
  "printWidth": 144,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": false
}
```

### Format Rules

| Rule             | Value   | Effect                             |
| ---------------- | ------- | ---------------------------------- |
| `semi`           | `false` | No semicolons                      |
| `printWidth`     | `144`   | Max line length                    |
| `singleQuote`    | `true`  | Use `'` not `"`                    |
| `trailingComma`  | `es5`   | Trailing commas where valid in ES5 |
| `bracketSpacing` | `false` | No spaces in `{a: 1}`              |

### Usage

**Format all files:**

```bash
pnpm format
```

**Check formatting (no write):**

```bash
pnpm prettier --check .
```

**Format specific file:**

```bash
pnpm prettier --write src/create.ts
```

### IDE Integration

**VS Code:**

1. Install Prettier extension
2. Set as default formatter
3. Enable format on save

**Settings (.vscode/settings.json):**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

## TypeScript

### Type Checking

```bash
pnpm typecheck
```

Runs `tsc --noEmit` to check types without emitting files.

### Configuration

**File:** `tsconfig.json`

```json
{
  "extends": "@total-typescript/tsconfig/bundler/dom",
  "exclude": ["node_modules", "dist"]
}
```

Uses Matt Pocock's TypeScript config preset optimized for:

- Bundler module resolution
- DOM environment
- Strict type checking

### IDE Support

TypeScript provides:

- **IntelliSense** - Autocomplete suggestions
- **Error highlighting** - Inline type errors
- **Go to definition** - Navigate to source
- **Refactoring** - Safe renames, extractions

## Git Configuration

### Ignored Files

**File:** `.gitignore`

```
node_modules
dist

# Devenv
.devenv*
devenv.local.nix
devenv.local.yaml

# direnv
.direnv
```

| Pattern          | Purpose                           |
| ---------------- | --------------------------------- |
| `node_modules`   | Dependencies (installed via pnpm) |
| `dist`           | Build output                      |
| `.devenv*`       | Devenv cache and generated files  |
| `devenv.local.*` | Local devenv overrides            |
| `.direnv`        | direnv cache                      |

## Changeset Management

### Configuration

Uses `@changesets/cli` for version management.

### Commands

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `pnpm changeset`        | Create a changeset           |
| `pnpm changeset status` | Check pending changesets     |
| `pnpm version`          | Apply changesets to versions |

### Workflow

1. Make changes
2. Run `pnpm changeset`
3. Select version bump type
4. Write change description
5. Commit the changeset file

## Editor Configuration

### Recommended Extensions (VS Code)

| Extension      | Purpose                   |
| -------------- | ------------------------- |
| **Prettier**   | Code formatting           |
| **TypeScript** | Built-in language support |
| **Vitest**     | Test runner integration   |
| **Nix IDE**    | Nix syntax highlighting   |

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Running with Debug Output

```bash
# Verbose test output
pnpm test -- --reporter=verbose

# Debug specific test
pnpm test -- -t "test name"
```

## Performance Profiling

### Build Performance

```bash
# Time the build
time pnpm build

# Verbose tsup output
pnpm tsup --verbose
```

### Test Performance

```bash
# Run with timing
pnpm test -- --reporter=verbose
```

## Tool Versions Summary

| Tool       | Version                           | Location                 |
| ---------- | --------------------------------- | ------------------------ |
| Node.js    | 24 (devenv) / >=20 (package.json) | devenv.nix, package.json |
| pnpm       | 10                                | devenv.nix, package.json |
| TypeScript | ^5.9.3                            | package.json             |
| Prettier   | ^3.8.0                            | package.json             |
| Vitest     | ^4.0.17                           | package.json             |
| tsup       | ^8.5.1                            | package.json             |

## Adding New Tools

### Adding a Dev Dependency

```bash
pnpm add -D <package-name>
```

### Adding to Devenv

Edit `devenv.nix`:

```nix
{
  packages = [ pkgs.nodejs_24 pkgs.pnpm pkgs.new-tool ];
}
```

### Adding npm Script

Edit `package.json`:

```json
{
  "scripts": {
    "new-command": "tool-command"
  }
}
```
