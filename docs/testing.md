# Testing Guide

This document covers the testing infrastructure, patterns, and best practices for redux-neat.

## Testing Stack

| Tool            | Version | Purpose                   |
| --------------- | ------- | ------------------------- |
| **Vitest**      | ^4.0.17 | Test framework            |
| **expect-type** | ^1.3.0  | Compile-time type testing |

## Test Structure

```
redux-neat/
├── src/
│   └── flattenHandlers.test.ts   # In-source unit tests
└── tests/
    └── simple.test.ts            # Integration tests
```

### In-Source Tests

Located alongside source files in `src/`:

- `flattenHandlers.test.ts` - Tests for handler flattening

### Integration Tests

Located in `tests/`:

- `simple.test.ts` - End-to-end usage tests

## Running Tests

### Single Run

```bash
pnpm test
```

Runs all tests once and exits.

### Watch Mode

```bash
pnpm test-watch
```

Runs tests in watch mode, re-running on file changes.

### With Specific Reporter

```bash
pnpm test -- --reporter=verbose
```

### Run Specific Test File

```bash
pnpm test -- tests/simple.test.ts
```

### Run Tests Matching Pattern

```bash
pnpm test -- -t "handles counter"
```

## Vitest Configuration

**File:** `vitest.config.ts`

```typescript
import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.ts'],
  },
})
```

**Key Settings:**

- `includeSource: ['src/**/*.ts']` - Enables in-source testing

This allows test files (`*.test.ts`) within `src/` to be run by Vitest.

## Test Patterns

### Unit Test Pattern

From `src/flattenHandlers.test.ts`:

```typescript
import {flattenHandlers} from './flattenHandlers'

describe('flattenHandlers', () => {
  it('returns the same handlers if already flat', () => {
    const handlers = {
      increment: (n: number) => n + 1,
      decrement: (n: number) => n - 1,
      reset: (_: number) => 0,
    }
    expect(flattenHandlers(handlers)).toEqual(handlers)
  })

  it('flattens handlers', () => {
    const handlers = {
      counter: {
        increment: (n: number) => n + 1,
        decrement: (n: number) => n - 1,
        reset: (_: number) => 0,
      },
      operations: {
        arithmetic: {
          plus: (n: number, x: number) => n + x,
          minus: (n: number, x: number) => n - x,
        },
        bitwise: {
          shiftRight: (n: number, x: number) => n >> x,
        },
      },
    }
    expect(flattenHandlers(handlers)).toEqual({
      'counter.increment': handlers.counter.increment,
      'counter.decrement': handlers.counter.decrement,
      'counter.reset': handlers.counter.reset,
      'operations.arithmetic.plus': handlers.operations.arithmetic.plus,
      'operations.arithmetic.minus': handlers.operations.arithmetic.minus,
      'operations.bitwise.shiftRight': handlers.operations.bitwise.shiftRight,
    })
  })
})
```

**Characteristics:**

- Tests pure functions
- Simple input/output assertions
- Uses `toEqual` for deep comparison

### Integration Test Pattern

From `tests/simple.test.ts`:

```typescript
import {describe, it, expect} from 'vitest'
import {create} from '../src'

describe('simple use case', () => {
  type State = {value: number}

  const handlers = {
    math: {
      add: (state: State, n: number) => {
        state.value += n
      },
      substract: (state: State, n: number) => {
        state.value -= n
      },
    },
    counter: {
      increment: (state: State) => {
        state.value++
      },
      decrement: (state: State) => {
        state.value--
      },
      reset: (state: State) => {
        state.value = 0
      },
    },
  }

  const getters = {
    getValue: (state: State) => state.value,
  }

  const initialState: State = {value: 0}

  const {store, actions} = create(initialState, {handlers, getters})

  it('handles counter actions', () => {
    expect(store.getState()).toEqual({value: 0})

    actions.counter.increment()
    expect(store.getState()).toEqual({value: 1})

    actions.counter.increment()
    expect(store.getState()).toEqual({value: 2})

    actions.counter.decrement()
    expect(store.getState()).toEqual({value: 1})

    actions.counter.increment()
    actions.counter.increment()
    expect(store.getState()).toEqual({value: 3})

    actions.counter.reset()
    expect(store.getState()).toEqual({value: 0})
  })

  it('handles arithmetic actions', () => {
    expect(store.getState()).toEqual({value: 0})

    actions.math.add(5)
    expect(store.getState()).toEqual({value: 5})

    actions.math.substract(3)
    expect(store.getState()).toEqual({value: 2})
  })
})
```

**Characteristics:**

- Tests full `create()` function
- Creates real Redux store
- Tests action dispatch and state changes
- Sequential state mutations

## What to Test

### Required Tests

| Component     | What to Test                        |
| ------------- | ----------------------------------- |
| **Handlers**  | State mutation correctness          |
| **Actions**   | Dispatch format and args passing    |
| **Selectors** | Value derivation (mock useSelector) |
| **Types**     | Compile-time type correctness       |

### Test Categories

**1. Unit Tests (src/\*.test.ts)**

- Pure utility functions
- Type transformations
- Edge cases

**2. Integration Tests (tests/)**

- Full create() workflow
- Action → State changes
- Nested handler access

**3. Type Tests (using expect-type)**

- Action type inference
- Selector return types
- Handler argument types

## Writing New Tests

### Adding Unit Tests

1. Create `src/<module>.test.ts` alongside the module
2. Import the function to test
3. Write describe/it blocks

```typescript
import {myFunction} from './myModule'

describe('myFunction', () => {
  it('handles normal case', () => {
    expect(myFunction(input)).toBe(expected)
  })

  it('handles edge case', () => {
    expect(myFunction(edgeInput)).toBe(edgeExpected)
  })
})
```

### Adding Integration Tests

1. Create `tests/<feature>.test.ts`
2. Import from `../src`
3. Test the public API

```typescript
import {describe, it, expect} from 'vitest'
import {create} from '../src'

describe('feature name', () => {
  const {store, actions, selectors} = create(initialState, config)

  it('does something', () => {
    actions.someAction()
    expect(store.getState()).toEqual(expectedState)
  })
})
```

### Adding Type Tests

Use `expect-type` for compile-time assertions:

```typescript
import {expectTypeOf} from 'expect-type'
import {create, Actions, Handlers} from '../src'

describe('type inference', () => {
  it('infers action types correctly', () => {
    const handlers = {
      add: (state: State, n: number) => {
        state.count += n
      },
    }
    const {actions} = create(initialState, {handlers, getters: {}})

    expectTypeOf(actions.add).toEqualTypeOf<(n: number) => void>()
  })
})
```

## Testing React Selectors

Selectors use `useSelector` from react-redux and need special handling:

### Approach 1: Mock useSelector

```typescript
import {vi} from 'vitest'

vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector) => selector(mockState)),
}))
```

### Approach 2: Test Getters Directly

```typescript
// Test the getter function, not the selector hook
it('getter derives correct value', () => {
  const state = {count: 5}
  expect(getters.getCount(state)).toBe(5)
})
```

### Approach 3: Integration Test with React Testing Library

```typescript
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

function TestComponent() {
  const count = selectors.getCount()
  return <div data-testid="count">{count}</div>
}

it('renders count from selector', () => {
  render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  )
  expect(screen.getByTestId('count')).toHaveTextContent('0')
})
```

## Test Coverage

The project doesn't currently have coverage reporting configured. To add:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    includeSource: ['src/**/*.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

Run with:

```bash
pnpm test -- --coverage
```

## Common Testing Issues

### Issue: Tests Share State

```typescript
// ❌ Bad: Store shared between tests
const { store, actions } = create(...)

describe('tests', () => {
  it('test 1', () => { actions.add(1) })
  it('test 2', () => { /* state is 1, not 0! */ })
})
```

**Solution:** Create fresh store per test or test group:

```typescript
// ✅ Good: Fresh store per describe block
describe('tests', () => {
  let store, actions

  beforeEach(() => {
    ;({store, actions} = create(initialState, config))
  })

  it('test 1', () => {
    actions.add(1)
  })
  it('test 2', () => {
    /* state is 0 */
  })
})
```

### Issue: useSelector Outside React

```typescript
// ❌ Error: Invalid hook call
selectors.getCount() // Called outside React component
```

**Solution:** Use React Testing Library or mock the hook.

### Issue: Async Tests

```typescript
// ✅ Use async/await for async operations
it('handles async', async () => {
  await someAsyncOperation()
  expect(result).toBe(expected)
})
```

## Best Practices

1. **Test behavior, not implementation** - Focus on inputs/outputs
2. **Keep tests isolated** - No shared mutable state
3. **Use descriptive names** - Clear `it('does X when Y')` descriptions
4. **Test edge cases** - Empty arrays, null values, boundaries
5. **Maintain type tests** - Verify type inference works correctly
6. **Keep tests fast** - Avoid unnecessary setup/teardown
