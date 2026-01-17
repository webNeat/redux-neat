# Type System

This document provides an in-depth look at the TypeScript type system used in redux-neat.

## Overview

redux-neat uses advanced TypeScript features to provide:

- Full type inference for actions and selectors
- Compile-time validation of configuration
- IDE autocompletion support
- Type-safe handler and getter definitions

## Type Dependencies

```typescript
import {Decrement} from 'just-types'
```

The `just-types` package provides utility types. Specifically, `Decrement` is used to limit recursion depth in nested types.

## Core Types

### State Type

The `State` type is user-defined and passed as a generic parameter:

```typescript
type State = {
  count: number
  user: {name: string} | null
}

const {store, actions, selectors} = create<State>(initialState, config)
```

All handlers and getters receive this state type.

### `StoreConfig<State>`

```typescript
export type StoreConfig<State = any> = {
  handlers: Handlers<State>
  getters: Getters<State>
}
```

The top-level configuration type:

- Parameterized by `State`
- Contains `handlers` and `getters` properties
- Ensures handlers and getters are typed against the same state

## Handler Types

### `HandlerFn<State>`

```typescript
export type HandlerFn<State = any> = (state: State, ...args: any[]) => State | undefined | void
```

A handler function signature:

| Parameter  | Type                         | Description                        |
| ---------- | ---------------------------- | ---------------------------------- |
| `state`    | `State`                      | Current state (cloned before call) |
| `...args`  | `any[]`                      | Additional arguments from action   |
| **Return** | `State \| undefined \| void` | New state, or void if mutating     |

**Return Value Behavior:**

- Return new state object: replaces current state
- Return `undefined`: keep mutated state
- Return `void`: keep mutated state

### `Handlers<State, Depth>`

```typescript
export type Handlers<State = any, Depth extends number = 5> = Record<
  string,
  HandlerFn<State> | (Depth extends 1 ? never : Handlers<State, Decrement<Depth>>)
>
```

Recursive type for nested handlers:

**Type Parameters:**

- `State` - The state type
- `Depth` - Recursion limit (default: 5)

**Structure:**

- Each key maps to either:
  - A `HandlerFn<State>` (leaf node)
  - Another `Handlers<State, Decrement<Depth>>` (nested object)

**Depth Limiting:**

```typescript
Depth extends 1 ? never : Handlers<State, Decrement<Depth>>
```

When `Depth` reaches 1:

- `Decrement<1>` = 0
- Further nesting becomes `never`
- Prevents infinite type recursion

**Example Usage:**

```typescript
const handlers: Handlers<State> = {
  // Flat handler
  reset: (state) => ({count: 0, user: null}),

  // Nested handlers
  counter: {
    increment: (state) => {
      state.count++
    },
    add: (state, n: number) => {
      state.count += n
    },
  },

  // Deeply nested (up to 5 levels)
  deeply: {
    nested: {
      handler: {
        here: (state) => state,
      },
    },
  },
}
```

## Getter Types

### `GetterFn<State>`

```typescript
export type GetterFn<State = any> = (state: State, ...args: any[]) => any
```

A getter function signature:

| Parameter  | Type    | Description          |
| ---------- | ------- | -------------------- |
| `state`    | `State` | Current state        |
| `...args`  | `any[]` | Additional arguments |
| **Return** | `any`   | Derived value        |

### `Getters<State, Depth>`

```typescript
export type Getters<State = any, Depth extends number = 5> = Record<
  string,
  GetterFn<State> | (Depth extends 1 ? never : Getters<State, Decrement<Depth>>)
>
```

Same recursive pattern as `Handlers`.

## Output Types

### `Actions<Fns>`

```typescript
export type Actions<Fns extends Handlers> = {
  [key in keyof Fns]: Fns[key] extends HandlerFn ? Action<Fns[key]> : Fns[key] extends Handlers ? Actions<Fns[key]> : never
}
```

Transforms handler structure to action structure:

| Handler Type | Action Type                     |
| ------------ | ------------------------------- |
| `HandlerFn`  | `Action<HandlerFn>`             |
| `Handlers`   | `Actions<Handlers>` (recursive) |

### `Action<Fn>`

```typescript
export type Action<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any ? (...args: Args) => void : () => void
```

Transforms a handler function to an action function:

**Transformation:**

1. Uses `infer Args` to extract handler's extra arguments
2. Removes the first parameter (state)
3. Returns void (actions dispatch, don't return)

**Examples:**

```typescript
// Handler
(state: State) => { state.count++ }
// Action
() => void

// Handler
(state: State, n: number) => { state.count += n }
// Action
(n: number) => void

// Handler
(state: State, a: string, b: number) => { ... }
// Action
(a: string, b: number) => void
```

### `Selectors<Fns>`

```typescript
export type Selectors<Fns extends Getters> = {
  [key in keyof Fns]: Fns[key] extends GetterFn ? Selector<Fns[key]> : Fns[key] extends Getters ? Selectors<Fns[key]> : never
}
```

Same transformation pattern as `Actions`.

### `Selector<Fn>`

```typescript
export type Selector<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any
  ? (...args: Args) => ReturnType<Fn>
  : () => ReturnType<Fn>
```

Transforms a getter function to a selector function:

**Key Difference from Action:**

- Preserves the return type (`ReturnType<Fn>`)
- Selectors return values, actions return void

**Examples:**

```typescript
// Getter
(state: State) => state.count
// Selector
() => number

// Getter
(state: State, key: string) => state.items[key]
// Selector
(key: string) => Item
```

## Type Inference Flow

### At Definition Time

```typescript
const config = {
  handlers: {
    add: (state: State, n: number) => {
      state.count += n
    },
  },
  getters: {
    getCount: (state: State) => state.count,
  },
}
```

TypeScript infers:

- `config.handlers.add` is `(state: State, n: number) => void`
- `config.getters.getCount` is `(state: State) => number`

### At Create Time

```typescript
const {actions, selectors} = create<State>(initialState, config)
```

TypeScript transforms:

- `actions.add` becomes `(n: number) => void`
- `selectors.getCount` becomes `() => number`

### At Usage Time

```typescript
actions.add(5) // ✅ Correct
actions.add('hello') // ❌ Type error: expected number

const count = selectors.getCount() // count: number
```

## Advanced Type Patterns

### Conditional Types

Used extensively for type transformation:

```typescript
Fns[key] extends HandlerFn ? Action<Fns[key]> : ...
```

This checks if a value is a function type and transforms accordingly.

### Mapped Types

Used to preserve object structure:

```typescript
{ [key in keyof Fns]: TransformedType }
```

Maps over all keys in the handlers/getters object.

### Infer Keyword

Used to extract argument types:

```typescript
Fn extends (a: any, ...args: infer Args) => any ? Args : never
```

Extracts the rest parameters from a function type.

### Recursive Types

Used for nested structures:

```typescript
type Handlers<State, Depth> = Record<string, HandlerFn<State> | Handlers<State, Decrement<Depth>>>
```

Allows arbitrary nesting up to the depth limit.

## Type Limitations

### Depth Limit

Maximum nesting depth is 5 levels:

```typescript
// ✅ Works (5 levels)
handlers.a.b.c.d.e

// ❌ Type error (6 levels)
handlers.a.b.c.d.e.f
```

To increase, modify the default `Depth` parameter in `types.ts`.

### `any` in Arguments

Handler arguments are typed as `...args: any[]`:

```typescript
export type HandlerFn<State = any> = (state: State, ...args: any[]) => ...
```

This means argument types are inferred from usage, not enforced by the base type.

### No Async Handler Types

Current types don't support async handlers:

```typescript
// Not directly supported
async (state: State) => { await fetch(...); state.loaded = true }
```

Async operations require external handling (middleware, thunks, etc.).

## Type Testing

The project uses `expect-type` for compile-time type testing:

```typescript
import {expectTypeOf} from 'expect-type'

expectTypeOf(actions.add).toEqualTypeOf<(n: number) => void>()
expectTypeOf(selectors.getCount).toEqualTypeOf<() => number>()
```

Add type tests when modifying the type system to ensure correctness.

## Common Type Errors

### Missing State Parameter

```typescript
// ❌ Error: state is required
const handlers = {
  increment: () => { ... }
}

// ✅ Correct
const handlers = {
  increment: (state: State) => { ... }
}
```

### Wrong State Type

```typescript
// ❌ Error: State types don't match
const handlers = {
  increment: (state: { wrong: string }) => { ... }
}

create<State>({ count: 0 }, { handlers, getters })
```

### Accessing Non-existent Action

```typescript
const {actions} = create<State>(initial, config)

actions.nonExistent() // ❌ Type error: property doesn't exist
```

## Extending the Type System

### Adding New Handler Return Types

To support additional return types:

```typescript
export type HandlerFn<State = any> = (state: State, ...args: any[]) => State | undefined | void | Promise<State> // Add Promise
```

### Adding Metadata

To add metadata to handlers:

```typescript
type HandlerWithMeta<State> = {
  fn: HandlerFn<State>
  meta: {description: string}
}
```

Would require updating `makeActions`, `makeReducer`, and related types.
