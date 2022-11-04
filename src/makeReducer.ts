import {Reducer} from 'redux'
import {Handlers} from './types'
import {deepClone} from './utils'

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
