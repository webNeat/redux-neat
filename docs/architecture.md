# Architecture Overview

This document describes the high-level architecture and design principles of redux-neat.

## Design Philosophy

redux-neat follows these core principles:

1. **Simplicity over flexibility** - Provide one clear way to do things
2. **Type safety first** - Full TypeScript support with inferred types
3. **Minimal API surface** - Single entry point (`create()`) for users
4. **Zero configuration** - Works out of the box with sensible defaults
5. **Thin wrapper** - Leverage Redux's battle-tested core

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Code                                │
│  create(initialState, { handlers, getters })                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      create.ts                                   │
│  Orchestrates store creation, actions, and selectors            │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  makeReducer.ts  │ │  makeActions.ts  │ │ makeSelectors.ts │
│                  │ │                  │ │                  │
│ Creates Redux    │ │ Creates dispatch │ │ Creates React    │
│ reducer from     │ │ functions from   │ │ hooks from       │
│ handlers         │ │ handlers         │ │ getters          │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Redux Store                              │
│  legacy_createStore(reducer, devToolsEnhancer)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Module Dependency Graph

```
index.ts
    └── create.ts
            ├── flattenHandlers.ts
            │       └── utils.ts (isFunction)
            ├── makeActions.ts
            │       └── utils.ts (isFunction)
            ├── makeReducer.ts
            │       └── utils.ts (deepClone)
            ├── makeSelectors.ts
            │       └── utils.ts (isFunction)
            └── types.ts
```

## Core Components

### 1. Entry Point (`index.ts`)

The public API surface is minimal:

```typescript
export type * from './types'
export {create} from './create'
```

Only exports:

- The `create` function
- All type definitions

### 2. Configuration Types (`types.ts`)

Defines the shape of user-provided configuration:

| Type                 | Purpose                              |
| -------------------- | ------------------------------------ |
| `StoreConfig<State>` | Main configuration object            |
| `Handlers<State>`    | Nested handler functions (recursive) |
| `Getters<State>`     | Nested getter functions (recursive)  |
| `HandlerFn<State>`   | Single handler function signature    |
| `GetterFn<State>`    | Single getter function signature     |
| `Actions<Handlers>`  | Output type for generated actions    |
| `Selectors<Getters>` | Output type for generated selectors  |

### 3. Store Creation (`create.ts`)

The main orchestration function:

```typescript
function create<State, Config extends StoreConfig<State>>(initialState: State, {handlers, getters}: Config) {
  // 1. Flatten nested handlers to flat key-value pairs
  const flatHandlers = flattenHandlers(handlers)

  // 2. Create Redux reducer from flat handlers
  const reducer = makeReducer(initialState, flatHandlers)

  // 3. Create Redux store with DevTools support
  const store = legacy_createStore(reducer, devToolsEnhancer)

  // 4. Generate action dispatch functions
  const actions = makeActions(store, handlers)

  // 5. Generate selector hooks
  const selectors = makeSelectors(store, getters)

  return {store, actions, selectors}
}
```

### 4. Handler Flattening (`flattenHandlers.ts`)

Converts nested handler objects to flat key-value pairs:

```typescript
// Input
{
  counter: {
    increment: (state) => { ... },
    decrement: (state) => { ... }
  }
}

// Output
{
  'counter.increment': (state) => { ... },
  'counter.decrement': (state) => { ... }
}
```

This enables:

- Nested organization for developer ergonomics
- Flat action types for Redux DevTools
- Efficient reducer lookup

### 5. Reducer Generation (`makeReducer.ts`)

Creates a Redux reducer from flattened handlers:

```typescript
function makeReducer<State>(initialState: State, handlers: Handlers<State, 1>) {
  return (state = initialState, action) => {
    for (const name in handlers) {
      if (action.type === name) {
        state = deepClone(state) // Immutability via cloning
        state = handlers[name](state, ...action.args) || state
        return state
      }
    }
    return state
  }
}
```

Key behaviors:

- Deep clones state before mutation (enables mutable handler syntax)
- Handlers can mutate state directly OR return new state
- Returns current state if no handler matches

### 6. Action Generation (`makeActions.ts`)

Creates dispatch functions that mirror handler structure:

```typescript
function makeActions<State>(store: Store<State>, handlers: Handlers, prefix = '') {
  const actions = {}
  for (const name in handlers) {
    const handler = handlers[name]
    if (isFunction(handler)) {
      actions[name] = (...args) => store.dispatch({type: prefix + name, args})
    } else {
      actions[name] = makeActions(store, handler, prefix + name + '.')
    }
  }
  return actions
}
```

Action format:

```typescript
{ type: 'counter.increment', args: [] }
{ type: 'math.add', args: [5] }
```

### 7. Selector Generation (`makeSelectors.ts`)

Creates React hooks from getter functions:

```typescript
function makeSelectors<State>(store: Store<State>, getters: Getters) {
  const selectors = {}
  for (const name in getters) {
    const getter = getters[name]
    if (isFunction(getter)) {
      selectors[name] = (...args) => useSelector((state) => getter(state, ...args))
    } else {
      selectors[name] = makeSelectors(store, getter)
    }
  }
  return selectors
}
```

Each selector is a React hook that:

- Uses `useSelector` from react-redux
- Subscribes the component to relevant state changes
- Passes additional arguments to the getter

## Data Flow

### Action Dispatch Flow

```
1. User calls: actions.counter.increment()
                    │
                    ▼
2. makeActions dispatches: { type: 'counter.increment', args: [] }
                    │
                    ▼
3. Redux store receives action
                    │
                    ▼
4. Reducer (makeReducer) processes:
   - Matches action.type to 'counter.increment'
   - Deep clones current state
   - Calls handler with (clonedState, ...args)
   - Returns new state
                    │
                    ▼
5. Store updates, React components re-render
```

### Selector Subscription Flow

```
1. Component renders: const count = selectors.getCount()
                    │
                    ▼
2. useSelector subscribes component to store
                    │
                    ▼
3. Getter function called: (state) => state.count
                    │
                    ▼
4. Value returned to component
                    │
                    ▼
5. On state change, useSelector triggers re-render
```

## State Immutability Strategy

redux-neat uses **deep cloning** for immutability:

```typescript
// In makeReducer.ts
state = deepClone(state) // JSON.parse(JSON.stringify(state))
state = handlers[name](state, ...action.args) || state
```

**Pros:**

- Allows handlers to use mutable syntax (`state.count++`)
- Simple mental model for developers
- No immer dependency

**Cons:**

- Performance cost for large state trees
- Cannot handle non-serializable values (functions, Dates, etc.)
- Loses object references

**Trade-off Decision:** This library prioritizes simplicity and small bundle size over handling edge cases with non-serializable state.

## Redux DevTools Integration

Automatic integration with Redux DevTools browser extension:

```typescript
function getReduxDevtoolsReducer() {
  try {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  } catch {
    return undefined
  }
}

const store = legacy_createStore(reducer, getReduxDevtoolsReducer())
```

Features available in DevTools:

- Action history with types like `counter.increment`
- State diff visualization
- Time-travel debugging
- Action replay

## Export Structure

The library supports multiple import patterns:

```typescript
// Main entry
import {create} from 'redux-neat'

// Subpath imports (if additional modules added)
import {something} from 'redux-neat/submodule'
```

Configured in `package.json`:

```json
{
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
  }
}
```

## Error Handling

The library takes a minimal approach to error handling:

- **No runtime validation** of handler/getter structure
- **TypeScript types** catch configuration errors at compile time
- **Redux DevTools** helps debug action/state issues

This keeps the bundle size small and runtime fast.

## Future Architecture Considerations

Potential enhancements that preserve the current architecture:

1. **Middleware support** - Allow intercepting actions
2. **Async handlers** - Built-in async action support
3. **Computed selectors** - Memoized derived state
4. **State persistence** - Local storage integration
5. **Immer integration** - Optional for complex state

Each would be an opt-in addition, not changing the core simplicity.
