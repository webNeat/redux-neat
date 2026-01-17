# Source Code Guide

This document provides a detailed walkthrough of every source file in the redux-neat codebase.

## File Overview

| File                      | Lines | Purpose                        |
| ------------------------- | ----- | ------------------------------ |
| `index.ts`                | 3     | Public API exports             |
| `types.ts`                | 31    | TypeScript type definitions    |
| `create.ts`               | 22    | Main store creation function   |
| `makeActions.ts`          | 16    | Action dispatch generator      |
| `makeReducer.ts`          | 17    | Redux reducer generator        |
| `makeSelectors.ts`        | 17    | React selector hooks generator |
| `flattenHandlers.ts`      | 16    | Handler flattening utility     |
| `flattenHandlers.test.ts` | 40    | In-source unit tests           |
| `utils.ts`                | 9     | Shared utility functions       |

---

## `index.ts`

**Purpose:** Public API entry point. Defines what consumers can import.

```typescript
export type * from './types'
export {create} from './create'
```

**Exports:**

- All types from `types.ts` (as type-only exports)
- The `create` function from `create.ts`

**Design Decision:** Using `export type *` ensures type definitions don't add to runtime bundle size.

---

## `types.ts`

**Purpose:** Comprehensive TypeScript type definitions for the entire library.

### Dependencies

```typescript
import {Decrement} from 'just-types'
```

Uses `just-types` library for the `Decrement` utility type, which decrements a number type (e.g., `Decrement<5>` = `4`).

### Type Definitions

#### `StoreConfig<State>`

```typescript
export type StoreConfig<State = any> = {
  handlers: Handlers<State>
  getters: Getters<State>
}
```

The configuration object passed to `create()`. Contains:

- `handlers` - Functions that modify state
- `getters` - Functions that derive data from state

#### `HandlerFn<State>`

```typescript
export type HandlerFn<State = any> = (state: State, ...args: any[]) => State | undefined | void
```

A single handler function signature:

- Receives current state as first argument
- Can receive additional arguments
- Can return new state, modify state in place (return void), or return undefined

#### `Handlers<State, Depth>`

```typescript
export type Handlers<State = any, Depth extends number = 5> = Record<
  string,
  HandlerFn<State> | (Depth extends 1 ? never : Handlers<State, Decrement<Depth>>)
>
```

Recursive type for nested handlers:

- Each key maps to either a `HandlerFn` or nested `Handlers`
- `Depth` parameter limits recursion (default 5 levels)
- Prevents infinite recursion in TypeScript compiler

#### `GetterFn<State>`

```typescript
export type GetterFn<State = any> = (state: State, ...args: any[]) => any
```

A single getter function:

- Receives state as first argument
- Can receive additional arguments
- Returns derived value

#### `Getters<State, Depth>`

```typescript
export type Getters<State = any, Depth extends number = 5> = Record<
  string,
  GetterFn<State> | (Depth extends 1 ? never : Getters<State, Decrement<Depth>>)
>
```

Recursive type for nested getters (same pattern as `Handlers`).

#### `Actions<Fns>`

```typescript
export type Actions<Fns extends Handlers> = {
  [key in keyof Fns]: Fns[key] extends HandlerFn ? Action<Fns[key]> : Fns[key] extends Handlers ? Actions<Fns[key]> : never
}
```

Maps handler structure to action structure:

- Preserves nesting
- Converts each `HandlerFn` to an `Action`

#### `Action<Fn>`

```typescript
export type Action<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any ? (...args: Args) => void : () => void
```

Converts a handler function to an action function:

- Removes the first argument (state)
- Keeps remaining arguments
- Returns void (dispatches action)

#### `Selectors<Fns>`

```typescript
export type Selectors<Fns extends Getters> = {
  [key in keyof Fns]: Fns[key] extends GetterFn ? Selector<Fns[key]> : Fns[key] extends Getters ? Selectors<Fns[key]> : never
}
```

Maps getter structure to selector structure.

#### `Selector<Fn>`

```typescript
export type Selector<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any
  ? (...args: Args) => ReturnType<Fn>
  : () => ReturnType<Fn>
```

Converts a getter function to a selector function:

- Removes state argument
- Preserves return type

---

## `create.ts`

**Purpose:** Main entry point function that creates the Redux store and generates actions/selectors.

### Imports

```typescript
import {legacy_createStore} from 'redux'
import {flattenHandlers} from './flattenHandlers'
import {makeActions} from './makeActions'
import {makeReducer} from './makeReducer'
import {makeSelectors} from './makeSelectors'
import type {Actions, StoreConfig, Selectors} from './types'
```

### Main Function

```typescript
export function create<State, Config extends StoreConfig<State>>(initialState: State, {handlers, getters}: Config) {
  const store = legacy_createStore(makeReducer(initialState, flattenHandlers(handlers)), getReduxDevtoolsReducer())
  const actions: Actions<Config['handlers']> = makeActions(store, handlers)
  const selectors: Selectors<Config['getters']> = makeSelectors(store, getters)
  return {store, actions, selectors}
}
```

**Parameters:**

- `initialState: State` - The initial state value
- `{handlers, getters}: Config` - Configuration with handlers and getters

**Process:**

1. Flatten nested handlers to flat key-value pairs
2. Create Redux reducer from flattened handlers
3. Create store with Redux DevTools enhancer
4. Generate action dispatch functions
5. Generate selector hooks
6. Return store, actions, and selectors

**Return Value:**

```typescript
{
  store: Store<State>,           // Redux store instance
  actions: Actions<Handlers>,    // Dispatch functions
  selectors: Selectors<Getters>  // React hooks
}
```

### DevTools Helper

```typescript
function getReduxDevtoolsReducer() {
  try {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  } catch {
    return undefined
  }
}
```

Safely attempts to load Redux DevTools extension:

- Returns enhancer if available
- Returns undefined if not (browser extension not installed, SSR, etc.)
- Uses try/catch to handle environments without `window`

---

## `makeActions.ts`

**Purpose:** Generates action dispatch functions from handler definitions.

### Imports

```typescript
import {Store} from 'redux'
import {isFunction} from './utils'
import {Actions, Handlers} from './types'
```

### Main Function

```typescript
export function makeActions<State, Fns extends Handlers<State>>(store: Store<State>, handlers: Fns, prefix = ''): Actions<Fns> {
  const actions = {} as any
  for (const name in handlers) {
    const handler = handlers[name]
    const fn = (...args: any[]) => {
      store.dispatch({type: prefix + name, args})
    }
    actions[name] = isFunction(handler) ? fn : makeActions(store, handler as any, prefix + name + '.')
  }
  return actions
}
```

**Parameters:**

- `store` - Redux store instance
- `handlers` - Handler definitions (nested or flat)
- `prefix` - Current path prefix for action types (default: '')

**Algorithm:**

1. Iterate over handler keys
2. For each key:
   - If value is a function: create dispatch wrapper
   - If value is an object: recurse with updated prefix
3. Return actions object matching handler structure

**Action Format:**

```typescript
{ type: 'path.to.handler', args: [arg1, arg2, ...] }
```

**Example:**

```typescript
// Handlers
{ counter: { increment: (state) => { ... } } }

// Generated action call
actions.counter.increment()

// Dispatched action
{ type: 'counter.increment', args: [] }
```

---

## `makeReducer.ts`

**Purpose:** Generates a Redux reducer from flattened handlers.

### Imports

```typescript
import {Reducer} from 'redux'
import {Handlers} from './types'
import {deepClone} from './utils'
```

### Main Function

```typescript
export function makeReducer<State, Fns extends Handlers<State, 1>>(initialState: State, handlers: Fns): Reducer<State> {
  return (state = initialState, action) => {
    for (const name in handlers) {
      if (action.type == name) {
        state = deepClone(state)
        state = handlers[name](state, ...action.args) || state
        return state
      }
    }
    return state
  }
}
```

**Parameters:**

- `initialState` - Default state value
- `handlers` - **Flattened** handlers (depth 1)

**Algorithm:**

1. Return a Redux reducer function
2. For each action:
   - Find matching handler by action type
   - Deep clone state for immutability
   - Call handler with cloned state and action args
   - Return handler result or mutated state
3. Return unchanged state if no match

**Key Details:**

- Uses `Handlers<State, 1>` type (flat, not nested)
- Expects `action.args` array (custom format)
- Deep clones before mutation (allows mutable handler syntax)
- Handler can return new state OR mutate and return void

---

## `makeSelectors.ts`

**Purpose:** Generates React hooks from getter definitions.

### Imports

```typescript
import {Store} from 'redux'
import {isFunction} from './utils'
import {Selectors, Getters, GetterFn} from './types'
import {useSelector} from 'react-redux'
```

### Main Function

```typescript
export function makeSelectors<State, Fns extends Getters<State>>(store: Store<State>, getters: Fns): Selectors<Fns> {
  const selectors = {} as any
  for (const name in getters) {
    const getter = getters[name]
    const fn = (...args: any[]) => {
      return useSelector((state) => (getter as GetterFn)(state, ...args))
    }
    selectors[name] = isFunction(getter) ? fn : makeSelectors(store, getter as any)
  }
  return selectors
}
```

**Parameters:**

- `store` - Redux store instance (currently unused, kept for future use)
- `getters` - Getter definitions (nested or flat)

**Algorithm:**

1. Iterate over getter keys
2. For each key:
   - If value is a function: create useSelector wrapper
   - If value is an object: recurse
3. Return selectors object matching getter structure

**Important:** Each generated selector is a **React hook** that:

- Must be called from React component/hook context
- Subscribes component to state changes
- Re-renders on relevant state changes

---

## `flattenHandlers.ts`

**Purpose:** Converts nested handler objects to flat key-value pairs.

### Imports

```typescript
import {isFunction} from './utils'
import {HandlerFn, Handlers} from './types'
```

### Main Function

```typescript
export function flattenHandlers<State>(fns: Handlers<State>, prefix = ''): Handlers<State, 1> {
  let result: Record<string, HandlerFn<State>> = {}
  for (const name in fns) {
    const fn = fns[name] as any
    if (isFunction(fn)) {
      result[prefix + name] = fn
    } else {
      result = {...result, ...flattenHandlers(fn, prefix + name + '.')}
    }
  }
  return result as any
}
```

**Parameters:**

- `fns` - Nested handlers object
- `prefix` - Current path prefix (default: '')

**Returns:** Flat handlers with dot-notation keys

**Example:**

```typescript
// Input
{
  counter: {
    increment: fn1,
    decrement: fn2
  },
  user: {
    profile: {
      update: fn3
    }
  }
}

// Output
{
  'counter.increment': fn1,
  'counter.decrement': fn2,
  'user.profile.update': fn3
}
```

---

## `flattenHandlers.test.ts`

**Purpose:** In-source unit tests for `flattenHandlers`.

This file contains Vitest tests that run with the source code:

### Test Cases

**Test 1: Already flat handlers**

```typescript
it('returns the same handlers if already flat', () => {
  const handlers = {
    increment: (n: number) => n + 1,
    decrement: (n: number) => n - 1,
    reset: (_: number) => 0,
  }
  expect(flattenHandlers(handlers)).toEqual(handlers)
})
```

**Test 2: Nested handlers**

```typescript
it('flattens handlers', () => {
  const handlers = {
    counter: {
      increment: (n: number) => n + 1,
      // ...
    },
    operations: {
      arithmetic: {
        plus: (n: number, x: number) => n + x,
        // ...
      },
      // ...
    },
  }
  expect(flattenHandlers(handlers)).toEqual({
    'counter.increment': handlers.counter.increment,
    'operations.arithmetic.plus': handlers.operations.arithmetic.plus,
    // ...
  })
})
```

---

## `utils.ts`

**Purpose:** Shared utility functions used across the codebase.

### `isFunction`

```typescript
export function isFunction<T>(x: T): T extends Function ? true : false
export function isFunction(x: any) {
  return !!x && {}.toString.call(x) === '[object Function]'
}
```

**Purpose:** Type-safe function detection

**Implementation Details:**

- Uses `Object.prototype.toString` for reliable detection
- Handles edge cases better than `typeof x === 'function'`
- Includes TypeScript overload for type narrowing

**Usage:**

```typescript
if (isFunction(handler)) {
  // TypeScript knows handler is a function here
}
```

### `deepClone`

```typescript
export function deepClone<T>(state: T): T {
  return JSON.parse(JSON.stringify(state))
}
```

**Purpose:** Create a deep copy of state

**Implementation:** JSON serialization round-trip

**Limitations:**

- Cannot handle `undefined` (converted to `null` or omitted)
- Cannot handle functions
- Cannot handle `Date` objects (become strings)
- Cannot handle circular references
- Cannot handle `Map`, `Set`, `Symbol`, etc.

**Trade-off:** Simplicity and zero dependencies over handling edge cases. Users should keep state JSON-serializable.

---

## Code Patterns

### Recursive Object Traversal

Used in `makeActions`, `makeSelectors`, and `flattenHandlers`:

```typescript
for (const name in object) {
  const value = object[name]
  if (isFunction(value)) {
    // Handle leaf (function)
  } else {
    // Recurse into nested object
  }
}
```

### Type Assertions

The codebase uses `as any` in several places:

```typescript
const actions = {} as any
```

This is intentional - the complex recursive types are verified at the function signature level, while internal implementation uses `any` for simplicity.

### Prefix Pattern

Both `makeActions` and `flattenHandlers` use prefix accumulation:

```typescript
function process(obj, prefix = '') {
  for (const name in obj) {
    if (isFunction(obj[name])) {
      result[prefix + name] = ...
    } else {
      process(obj[name], prefix + name + '.')
    }
  }
}
```

This converts nested paths to dot-notation strings.
