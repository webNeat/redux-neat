import {Reducer} from 'redux'
import {Handlers} from './types'

export function makeReducer<State, Fns extends Handlers<State, 1>>(initialState: State, handlers: Fns): Reducer<State> {
  return (state = initialState, action) => {
    for (const name in handlers) {
      if (action.type == name) {
        return handlers[name]({...state}, ...action.args)
      }
    }
    return state
  }
}
