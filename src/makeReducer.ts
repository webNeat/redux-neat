import {produce} from 'immer'
import type {Reducer} from 'redux'
import type {Handlers} from './types'

export function makeReducer<State, Fns extends Handlers<State, 1>>(initialState: State, handlers: Fns): Reducer<State> {
  return (state = initialState, action) => {
    for (const name in handlers) {
      if (action.type == name) {
        return produce(state, (draft) => handlers[name]!(draft as State, ...(action.args as any[])) as any)
      }
    }
    return state
  }
}
