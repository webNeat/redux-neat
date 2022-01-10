import {createStore} from 'redux'
import {flattenHandlers} from './flattenHandlers'
import {makeActions} from './makeActions'
import {makeReducer} from './makeReducer'
import {Handlers} from './types'

export function create<State, Fns extends Handlers<State>>(initialState: State, fns: Fns) {
  const store = createStore(
    makeReducer(initialState, flattenHandlers(fns)),
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  )
  return {
    store,
    actions: makeActions(store, fns),
  }
}
