# CI/CD Pipeline

This document covers the GitHub Actions workflows and release process for redux-neat.

## Overview

The project uses GitHub Actions for:

1. **CI** - Continuous Integration (testing on pull requests)
2. **Release** - Automated publishing to npm

## Workflow Files

```
.github/
└── workflows/
    ├── ci.yml       # Pull request testing
    └── release.yml  # Automated releases
```

## CI Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 21, 22, 23, 24]

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test
```

### CI Workflow Details

**Trigger:** Pull requests to `main` branch

**Matrix Strategy:**
| Node.js Version | Status |
|-----------------|--------|
| 20 | Tested |
| 21 | Tested |
| 22 | Tested |
| 23 | Tested |
| 24 | Tested |

**Steps:**

1. **Checkout** - Clone repository
2. **Setup pnpm** - Install pnpm v10
3. **Setup Node.js** - Install Node.js (with pnpm cache)
4. **Install dependencies** - `pnpm install --frozen-lockfile`
5. **Build** - `pnpm build`
6. **Test** - `pnpm test`

### CI Requirements

For a PR to pass CI:

- Build must succeed on all Node.js versions
- All tests must pass on all Node.js versions
- Dependencies must match lockfile (`--frozen-lockfile`)

## Release Workflow

**File:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  id-token: write
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Release Workflow Details

**Trigger:** Push to `main` branch

**Concurrency:**

- Only one release workflow runs at a time
- In-progress runs are cancelled for newer commits

**Permissions:**
| Permission | Purpose |
|------------|---------|
| `id-token: write` | npm provenance |
| `contents: write` | Create GitHub releases |
| `pull-requests: write` | Create version PRs |

**Steps:**

1. **Checkout** - Clone repository
2. **Setup pnpm** - Install pnpm v10
3. **Setup Node.js** - Install Node.js 22
4. **Install dependencies** - `pnpm install --frozen-lockfile`
5. **Changesets action** - Either creates version PR or publishes

### Changesets Action Behavior

The `changesets/action@v1` action has two modes:

**Mode 1: Pending Changesets**

- Creates a "Version Packages" pull request
- PR updates versions based on changesets
- Merging the PR triggers Mode 2

**Mode 2: No Pending Changesets**

- Publishes to npm using `pnpm release`
- Creates GitHub releases

## Release Process

### Step 1: Create a Changeset

When making changes that should be released:

```bash
pnpm changeset
```

Interactive prompts:

1. Select packages (press Enter for redux-neat)
2. Select bump type (patch/minor/major)
3. Write summary of changes

This creates a file in `.changeset/`:

```
.changeset/
└── cool-ideas-flow.md
```

Example changeset file:

```markdown
---
'redux-neat': minor
---

Added new feature X that does Y
```

### Step 2: Commit and Push

```bash
git add .changeset/
git commit -m "Add changeset for feature X"
git push
```

### Step 3: Merge to Main

After PR review and CI passes, merge to `main`.

### Step 4: Version PR (Automatic)

The release workflow creates a "Version Packages" PR:

- Updates `package.json` version
- Updates `CHANGELOG.md` (if configured)
- Removes consumed changesets

### Step 5: Publish (Automatic)

Merging the version PR triggers:

- `pnpm release` command
- npm publish
- GitHub release creation

## Secrets Required

| Secret         | Purpose           | Where to Get                   |
| -------------- | ----------------- | ------------------------------ |
| `GITHUB_TOKEN` | GitHub API access | Automatic (provided by GitHub) |
| `NPM_TOKEN`    | npm publishing    | Generate at npmjs.com          |

### Setting Up NPM_TOKEN

1. Go to [npmjs.com](https://www.npmjs.com/) → Access Tokens
2. Generate new token (Automation type)
3. Add to repository: Settings → Secrets → Actions → New repository secret

## Changesets Configuration

The project uses `@changesets/cli` and `@changesets/changelog-github`.

Configuration is typically in `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

## npm Scripts for Release

```json
{
  "scripts": {
    "release": "pnpm build && changeset publish",
    "version": "changeset version && pnpm install --no-frozen-lockfile"
  }
}
```

| Script    | Purpose                         |
| --------- | ------------------------------- |
| `release` | Build and publish to npm        |
| `version` | Update versions from changesets |

## Version Bumping

### Semantic Versioning

| Bump    | When to Use                        |
| ------- | ---------------------------------- |
| `patch` | Bug fixes, non-breaking changes    |
| `minor` | New features, backwards-compatible |
| `major` | Breaking changes                   |

### Pre-release Versions

Current version: `1.0.0-beta.8`

Pre-release handling with changesets:

```bash
# Enter pre-release mode
pnpm changeset pre enter beta

# Create changesets as normal
pnpm changeset

# Exit pre-release mode when ready for stable
pnpm changeset pre exit
```

## Manual Release (Emergency)

If automated release fails:

```bash
# 1. Ensure you're on main with latest changes
git checkout main
git pull

# 2. Build
pnpm build

# 3. Publish (requires npm login)
npm publish

# 4. Tag the release
git tag v1.0.0
git push --tags
```

## Troubleshooting

### CI Fails on Node Version

Check that code is compatible with all tested Node.js versions (20-24).

### Release Workflow Doesn't Run

Verify:

- Push is to `main` branch
- Workflow file syntax is valid
- GitHub Actions is enabled for repository

### npm Publish Fails

Check:

- `NPM_TOKEN` secret is set correctly
- Token has publish permissions
- Package name is available on npm

### Version PR Not Created

Ensure:

- Changesets exist in `.changeset/`
- Changesets are not empty
- `@changesets/cli` is installed

## Best Practices

1. **Always create changesets** for user-facing changes
2. **Write clear changeset summaries** - they become release notes
3. **Review version PRs** before merging
4. **Test locally** before pushing to ensure CI passes
5. **Use conventional commits** for clear history
