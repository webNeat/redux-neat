# Build System

This document covers the build tooling, configuration, and output structure for redux-neat.

## Build Stack

| Tool           | Version    | Purpose                       |
| -------------- | ---------- | ----------------------------- |
| **tsup**       | ^8.5.1     | Bundle and compile TypeScript |
| **TypeScript** | ^5.9.3     | Type checking                 |
| **esbuild**    | (via tsup) | Fast JavaScript bundler       |

## Build Command

```bash
pnpm build
```

This runs `tsup` with the configuration from `tsup.config.ts`.

## tsup Configuration

**File:** `tsup.config.ts`

```typescript
import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
})
```

### Configuration Options

| Option      | Value                                | Description                            |
| ----------- | ------------------------------------ | -------------------------------------- |
| `entry`     | `['src/index.ts', 'src/*/index.ts']` | Entry points to build                  |
| `format`    | `['cjs', 'esm']`                     | Output formats (CommonJS + ES Modules) |
| `dts`       | `true`                               | Generate TypeScript declaration files  |
| `splitting` | `false`                              | Disable code splitting                 |
| `sourcemap` | `true`                               | Generate source maps                   |
| `clean`     | `true`                               | Clean output directory before build    |

### Entry Points

The `entry` pattern supports:

1. **Main entry:** `src/index.ts` → `dist/index.js`
2. **Subpath entries:** `src/*/index.ts` → `dist/*/index.js`

This enables subpath imports like:

```typescript
import {something} from 'redux-neat/submodule'
```

## Build Output

After running `pnpm build`, the `dist/` directory contains:

```
dist/
├── index.js          # ESM main entry
├── index.cjs         # CommonJS main entry
├── index.d.ts        # TypeScript declarations
├── index.js.map      # Source map (ESM)
└── index.cjs.map     # Source map (CJS)
```

### Output Formats

**ESM (`.js`)**

- Modern JavaScript modules
- Uses `import`/`export` syntax
- Tree-shakeable
- Default for modern bundlers

**CommonJS (`.cjs`)**

- Node.js traditional format
- Uses `require()`/`module.exports`
- Backwards compatibility

### Declaration Files

TypeScript `.d.ts` files are generated automatically:

- Provides type information for consumers
- Enables IDE autocompletion
- No runtime overhead

## TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "extends": "@total-typescript/tsconfig/bundler/dom",
  "exclude": ["node_modules", "dist"]
}
```

### Base Configuration

Extends `@total-typescript/tsconfig/bundler/dom` which provides:

- Strict type checking
- Modern JavaScript target
- DOM type definitions
- Bundler-optimized settings

### Key Inherited Settings

From the base config (typical settings):

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### Type Checking

Run type checking without emitting:

```bash
pnpm typecheck
```

This runs `tsc --noEmit` to check types without building.

## Package Exports

**File:** `package.json` (relevant sections)

```json
{
  "type": "module",
  "main": "dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./*": {
      "types": "./dist/*/index.d.ts",
      "import": "./dist/*/index.js",
      "require": "./dist/*/index.cjs"
    }
  },
  "files": ["dist"]
}
```

### Export Conditions

| Import Type                           | Condition | File                |
| ------------------------------------- | --------- | ------------------- |
| `import { create } from 'redux-neat'` | ESM       | `dist/index.js`     |
| `require('redux-neat')`               | CJS       | `dist/index.cjs`    |
| `import { x } from 'redux-neat/sub'`  | ESM       | `dist/sub/index.js` |

### Published Files

Only `dist/` is included in the npm package (`files` array).

## Build Process Details

### Step 1: Clean

tsup removes existing `dist/` directory (`clean: true`).

### Step 2: Bundle

esbuild (via tsup) bundles source files:

- Resolves imports
- Transforms TypeScript
- Creates output bundles

### Step 3: Generate Declarations

TypeScript compiler generates `.d.ts` files:

- Extracts type information
- Preserves public API types

### Step 4: Generate Source Maps

Creates `.map` files for debugging:

- Maps compiled code to source
- Enables source debugging in browsers/Node.js

## Dual Package Hazard

The library supports both ESM and CJS. This can cause issues if:

- Both formats are loaded in the same process
- They create separate instances of the same objects

**Mitigation:**

- redux-neat is stateless (no global state)
- Each `create()` call returns independent objects
- No singleton patterns used

## Build Verification

After building, verify the output:

```bash
# Check output files exist
ls -la dist/

# Verify ESM syntax
head dist/index.js

# Verify CJS syntax
head dist/index.cjs

# Check TypeScript declarations
head dist/index.d.ts
```

## Development vs Production

The build output is the same for development and production:

- No minification (consumers handle this)
- Source maps included
- Full type definitions

Consumers' bundlers (webpack, vite, etc.) handle:

- Minification
- Tree shaking
- Dead code elimination

## Adding New Entry Points

To add a new subpath export:

1. **Create the module:**

   ```
   src/
   └── newmodule/
       └── index.ts
   ```

2. **Build includes it automatically** (via `src/*/index.ts` pattern)

3. **Export is available:**
   ```typescript
   import {something} from 'redux-neat/newmodule'
   ```

## Build Performance

tsup uses esbuild for fast builds:

- Typical build time: < 1 second
- Parallel TypeScript declaration generation
- Incremental compilation support

## Troubleshooting

### Build Fails with Type Errors

```bash
# Check types first
pnpm typecheck

# Fix errors, then rebuild
pnpm build
```

### Missing Declarations

Ensure `dts: true` in tsup.config.ts and TypeScript is properly configured.

### Large Bundle Size

Check for:

- Unnecessary dependencies
- Missing tree-shaking annotations
- Bundled dependencies (should be external)

### Source Maps Not Working

Verify:

- `sourcemap: true` in tsup.config.ts
- Source maps included in published package
- Consumer bundler configured for source maps

## Dependencies

### Runtime Dependencies

```json
{
  "dependencies": {
    "just-types": "^1.6.0",
    "react-redux": "^9.2.0",
    "redux": "^5.0.1"
  }
}
```

These are:

- **Not bundled** into the output
- **Required** by consumers
- Listed as regular dependencies

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": "^18",
    "react-dom": "^18"
  }
}
```

These are:

- **Provided by consumer** application
- Not installed automatically
- Version range specified

### Dev Dependencies

Build-related dev dependencies:

```json
{
  "devDependencies": {
    "@total-typescript/tsconfig": "^1.0.4",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3"
  }
}
```

Not included in published package.
