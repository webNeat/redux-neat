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
