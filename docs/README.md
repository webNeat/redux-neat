# redux-neat Documentation

Welcome to the **redux-neat** contributor documentation. This guide provides comprehensive technical documentation for developers who want to contribute to the project.

## Table of Contents

1. [Getting Started](./getting-started.md) - Project setup and development environment
2. [Architecture Overview](./architecture.md) - High-level design and module structure
3. [Source Code Guide](./source-code.md) - Detailed walkthrough of all source files
4. [Type System](./type-system.md) - TypeScript types and type utilities
5. [Testing Guide](./testing.md) - How to write and run tests
6. [Build System](./build-system.md) - Build tools and configuration
7. [CI/CD Pipeline](./ci-cd.md) - GitHub Actions workflows and release process
8. [Development Tools](./development-tools.md) - Devenv, Prettier, and other tooling
9. [Contributing Guidelines](./contributing.md) - How to contribute to the project

## What is redux-neat?

**redux-neat** is an opinionated and simple way to use [Redux](https://redux.js.org/). It provides a streamlined API that reduces boilerplate while maintaining full type safety.

### Key Features

- **Simplified API**: Single `create()` function to set up your entire Redux store
- **Full TypeScript Support**: Strong typing for actions, selectors, and state
- **Nested Handlers**: Organize your state mutations in nested objects
- **React Integration**: Built-in `react-redux` integration with typed selectors
- **Redux DevTools Support**: Automatic integration with Redux DevTools extension
- **Minimal Bundle Size**: Lightweight wrapper around Redux core

### Core Concepts

| Concept       | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| **Handlers**  | Functions that mutate state (replaces reducers + action creators) |
| **Getters**   | Functions that derive data from state (used to create selectors)  |
| **Actions**   | Auto-generated dispatch functions from handlers                   |
| **Selectors** | React hooks that subscribe to state using getters                 |

## Quick Example

```typescript
import {create} from 'redux-neat'

type State = {count: number}

const {store, actions, selectors} = create<State>(
  {count: 0},
  {
    handlers: {
      increment: (state) => {
        state.count++
      },
      add: (state, n: number) => {
        state.count += n
      },
    },
    getters: {
      getCount: (state) => state.count,
    },
  }
)

// Usage
actions.increment() // Dispatches { type: 'increment', args: [] }
actions.add(5) // Dispatches { type: 'add', args: [5] }

// In React components
const count = selectors.getCount() // Uses useSelector internally
```

## Project Stats

| Metric              | Value        |
| ------------------- | ------------ |
| **Version**         | 1.0.0-beta.8 |
| **License**         | MIT          |
| **Node.js**         | >=20         |
| **Package Manager** | pnpm >=10    |
| **Module Format**   | ESM + CJS    |

## Getting Help

- [GitHub Issues](https://github.com/webNeat/redux-neat/issues) - Report bugs or request features
- [GitHub Repository](https://github.com/webNeat/redux-neat) - Source code and discussions
