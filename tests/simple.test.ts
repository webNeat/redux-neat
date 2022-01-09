import reduz from '../src'

describe('simple use case', () => {
  type State = {
    value: number
  }
  const add = (state: State, n: number) => {
    state.value += n
    return state
  }
  const substract = (state: State, n: number) => {
    state.value -= n
    return state
  }
  const increment = (state: State) => add(state, 1)
  const decrement = (state: State) => substract(state, 1)
  const reset = (state: State) => substract(state, state.value)

  const handlers = {
    math: {
      arithmetic: {add, substract},
    },
    counter: {increment, decrement, reset},
  }
  const initialState: State = {value: 0}

  const {store, actions} = reduz(initialState, handlers)

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

    actions.math.arithmetic.add(5)
    expect(store.getState()).toEqual({value: 5})

    actions.math.arithmetic.substract(3)
    expect(store.getState()).toEqual({value: 2})
  })
})
