import {legacy_createStore} from 'redux'
import {flattenHandlers} from './flattenHandlers'
import {makeActions} from './makeActions'
import {makeReducer} from './makeReducer'
import {Handlers, Actions} from './types'

export function create<State, Fns extends Handlers<State>>(initialState: State, fns: Fns) {
  const store = legacy_createStore(makeReducer(initialState, flattenHandlers(fns)), getReduxDevtoolsReducer())
  const actions: Actions<Fns> = makeActions(store, fns)
  return {store, actions}
}

function getReduxDevtoolsReducer() {
  try {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  } catch {
    return undefined
  }
}
