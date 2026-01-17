import {describe, it, expect} from 'vitest'
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
