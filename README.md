# redux-neat

An opinionated and simple way to use Redux.

[![Bundle size](https://img.shields.io/bundlephobia/minzip/redux-neat?style=flat-square)](https://bundlephobia.com/result?p=redux-neat)
[![Tests Status](https://img.shields.io/github/actions/workflow/status/webneat/redux-neat/ci.yml?branch=main&style=flat-square)](https://github.com/webneat/redux-neat/actions?query=workflow:"CI")
[![Version](https://img.shields.io/npm/v/redux-neat?style=flat-square)](https://www.npmjs.com/package/redux-neat)
[![MIT](https://img.shields.io/npm/l/redux-neat?style=flat-square)](LICENSE)

# Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Exploring the API](#exploring-the-api)
  - [Defining handlers](#defining-handlers)
  - [Defining getters](#defining-getters)
  - [Using nested handlers and getters](#using-nested-handlers-and-getters)
  - [Using selectors in React components](#using-selectors-in-react-components)
  - [Disabling Redux DevTools](#disabling-redux-devtools)
- [Changelog](#changelog)

# Features

- **Zero boilerplate** - Single `create()` function to set up your entire Redux store.
- **Full TypeScript support** - Actions and selectors are fully typed with inference.
- **Mutable syntax** - Write handlers that mutate state directly (powered by [Immer](https://immerjs.github.io/immer/)).
- **Nested organization** - Group related handlers and getters in nested objects.
- **React integration** - Selectors are React hooks that subscribe to state changes.
- **Redux DevTools** - Automatic integration with Redux DevTools browser extension.

# Installation

```bash
npm i redux-neat
# or
yarn add redux-neat
# or
pnpm add redux-neat
```

**Note:** This library requires `react` and `react-dom` as peer dependencies.

# Quick Start

```ts
import {create} from 'redux-neat'

// 1. Create store with handlers and getters
const {store, actions, selectors} = create(
  {count: 0}, // initial state
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
      count: (state) => state.count,
    },
  }
)

// 2. Use actions to update state
actions.increment()
actions.add(5)

// 3. Use selectors in React components (they are hooks!)
function Counter() {
  const count = selectors.count()
  return <div>{count}</div>
}
```

That's it! No action types, no action creators, no reducers. Just handlers and getters.

# Exploring the API

The library exports a single function `create` and some TypeScript types:

```ts
import {create} from 'redux-neat'
import type {StoreConfig, Handlers, Getters} from 'redux-neat'
```

## Defining handlers

Handlers are functions that update the state. They receive the current state as the first argument and can receive additional arguments:

```ts
const {actions} = create<State>(initialState, {
  handlers: {
    // Handler with no extra arguments
    reset: (state) => {
      state.count = 0
    },
    // Handler with one argument
    add: (state, n: number) => {
      state.count += n
    },
    // Handler with multiple arguments
    addMultiple: (state, a: number, b: number) => {
      state.count += a + b
    },
  },
  getters: {},
})

// Call actions (state argument is not passed, it's handled internally)
actions.reset()
actions.add(5)
actions.addMultiple(2, 3)
```

Handlers can mutate the state directly.

## Defining getters

Getters are functions that derive data from the state. They are converted to React hooks (selectors):

```ts
const {selectors} = create<State>(initialState, {
  handlers: {},
  getters: {
    // Simple getter
    count: (state) => state.count,
    // Getter with arguments
    countPlusN: (state, n: number) => state.count + n,
    // Computed values
    isPositive: (state) => state.count > 0,
  },
})

// In a React component
function MyComponent() {
  const count = selectors.count()
  const countPlus10 = selectors.countPlusN(10)
  const isPositive = selectors.isPositive()
  // ...
}
```

## Using nested handlers and getters

You can organize handlers and getters in nested objects for better code organization:

```ts
type State = {
  user: {name: string; age: number}
  settings: {theme: 'light' | 'dark'}
}

const {actions, selectors} = create<State>(initialState, {
  handlers: {
    user: {
      setName: (state, name: string) => {
        state.user.name = name
      },
      birthday: (state) => {
        state.user.age++
      },
    },
    settings: {
      toggleTheme: (state) => {
        state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light'
      },
    },
  },
  getters: {
    user: {
      name: (state) => state.user.name,
      age: (state) => state.user.age,
    },
    settings: {
      theme: (state) => state.settings.theme,
    },
  },
})

// Actions mirror the nested structure
actions.user.setName('Alice')
actions.user.birthday()
actions.settings.toggleTheme()

// Selectors mirror the nested structure (in React components)
const name = selectors.user.name()
const theme = selectors.settings.theme()
```

In Redux DevTools, nested actions appear with dot notation: `user.setName`, `user.birthday`, `settings.toggleTheme`.

## Using selectors in React components

Selectors are React hooks that use `useSelector` from `react-redux` under the hood. Your app needs to be wrapped with `Provider`:

```tsx
import {Provider} from 'react-redux'
import {create} from 'redux-neat'

const {store, actions, selectors} = create<State>(initialState, config)

// Wrap your app with Provider
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}

// Use selectors in components
function Counter() {
  const count = selectors.count()
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => actions.increment()}>+</button>
      <button onClick={() => actions.decrement()}>-</button>
    </div>
  )
}
```

## Disabling Redux DevTools

By default, redux-neat connects to Redux DevTools if available. You can disable this:

```ts
const {store, actions, selectors} = create<State>(initialState, {
  handlers,
  getters,
  withDevTools: false,
})
```

# Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
