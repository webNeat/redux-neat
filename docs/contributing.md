# Contributing Guidelines

Thank you for your interest in contributing to redux-neat! This guide covers everything you need to know to contribute effectively.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Ways to Contribute

### 1. Report Bugs

Found a bug? Please open an issue with:

- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Node.js and redux-neat versions
- Minimal code example

### 2. Suggest Features

Have an idea? Open an issue with:

- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Consideration of backwards compatibility

### 3. Improve Documentation

Documentation improvements are always welcome:

- Fix typos and grammar
- Add examples
- Clarify confusing sections
- Add missing information

### 4. Submit Code Changes

Ready to code? Follow the workflow below.

## Development Workflow

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/redux-neat.git
cd redux-neat
```

### 2. Set Up Environment

```bash
# Install dependencies
pnpm install

# Verify setup
pnpm test
pnpm build
pnpm typecheck
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 4. Make Changes

Follow these guidelines:

- Keep changes focused and minimal
- Follow existing code style
- Add tests for new functionality
- Update documentation if needed

### 5. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test-watch

# Type check
pnpm typecheck

# Format code
pnpm format

# Build
pnpm build
```

### 6. Create a Changeset

For user-facing changes:

```bash
pnpm changeset
```

Follow the prompts:

1. Select version bump (patch/minor/major)
2. Write a summary of changes

### 7. Commit Your Changes

Write clear commit messages:

```bash
git add .
git commit -m "feat: add new feature X"
```

**Commit message format:**

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code refactoring |
| `test` | Tests |
| `chore` | Maintenance |

### 8. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:

- Clear title
- Description of changes
- Link to related issue (if any)
- Screenshots (if UI-related)

## Pull Request Guidelines

### PR Checklist

Before submitting, ensure:

- [ ] Tests pass (`pnpm test`)
- [ ] Types check (`pnpm typecheck`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Changeset added (if user-facing)
- [ ] Documentation updated (if needed)

### PR Review Process

1. **CI checks** - Automated tests run on all Node.js versions
2. **Code review** - Maintainers review the code
3. **Feedback** - Address any comments
4. **Approval** - Maintainer approves
5. **Merge** - PR is merged to main

### What We Look For

| Aspect               | Expectations                      |
| -------------------- | --------------------------------- |
| **Code quality**     | Clean, readable, follows patterns |
| **Tests**            | New code has tests                |
| **Types**            | Full TypeScript typing            |
| **Breaking changes** | Avoided when possible             |
| **Bundle size**      | Minimal impact                    |
| **Documentation**    | Updated if needed                 |

## Code Style Guide

### General Principles

- **Simplicity** - Prefer simple, readable code
- **Consistency** - Follow existing patterns
- **Type safety** - Leverage TypeScript fully
- **Minimal dependencies** - Avoid adding dependencies

### Formatting

Prettier handles formatting automatically. Key rules:

- No semicolons
- Single quotes
- 144 character line width
- No bracket spacing

### TypeScript

- Use explicit types for function signatures
- Prefer type inference for local variables
- Use `type` over `interface` when possible
- Avoid `any` except where necessary

### Naming

| Element   | Convention | Example          |
| --------- | ---------- | ---------------- |
| Functions | camelCase  | `makeActions`    |
| Types     | PascalCase | `StoreConfig`    |
| Constants | camelCase  | `initialState`   |
| Files     | camelCase  | `makeActions.ts` |

### File Structure

```typescript
// 1. Imports
import { something } from 'somewhere'

// 2. Types (if any)
type MyType = { ... }

// 3. Main exports
export function myFunction() { ... }

// 4. Helper functions (private)
function helperFunction() { ... }
```

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect } from 'vitest'

describe('functionName', () => {
  it('does X when Y', () => {
    // Arrange
    const input = ...

    // Act
    const result = functionName(input)

    // Assert
    expect(result).toEqual(expected)
  })
})
```

### Test Coverage

Aim to test:

- Normal cases
- Edge cases
- Error conditions
- Type correctness (with expect-type)

### Test Placement

- **Unit tests**: `src/<module>.test.ts`
- **Integration tests**: `tests/<feature>.test.ts`

## Documentation Guidelines

### When to Update Docs

- New features
- API changes
- Configuration changes
- Bug fixes with notable behavior changes

### Documentation Style

- Use clear, concise language
- Include code examples
- Use tables for structured data
- Keep examples minimal but complete

## Breaking Changes

### What Constitutes Breaking

- Removing public API
- Changing function signatures
- Changing default behavior
- Removing/renaming exports

### How to Handle

1. Consider if it's truly necessary
2. Discuss in an issue first
3. Use major version bump
4. Document migration path
5. Provide deprecation warnings if possible

## Getting Help

### Questions

- Check existing issues
- Read the documentation
- Open a discussion (if enabled)
- Ask in the issue/PR

### Stuck on Something?

- Describe what you're trying to do
- Share what you've tried
- Include relevant code/errors
- Ask for guidance

## Maintainer Notes

### Merging PRs

1. Ensure CI passes
2. Review code quality
3. Check for breaking changes
4. Squash and merge (clean history)

### Releasing

Releases are automated via changesets:

1. Merge PRs with changesets
2. Review auto-generated version PR
3. Merge version PR to publish

## Thank You!

Your contributions make redux-neat better for everyone. Whether it's a typo fix or a major feature, every contribution is valued.

## Quick Reference

| Task             | Command           |
| ---------------- | ----------------- |
| Install deps     | `pnpm install`    |
| Run tests        | `pnpm test`       |
| Watch tests      | `pnpm test-watch` |
| Type check       | `pnpm typecheck`  |
| Format code      | `pnpm format`     |
| Build            | `pnpm build`      |
| Create changeset | `pnpm changeset`  |
