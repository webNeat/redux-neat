import {legacy_createStore} from 'redux'
import {flattenHandlers} from './flattenHandlers'
import {makeActions} from './makeActions'
import {makeReducer} from './makeReducer'
import {makeSelectors} from './makeSelectors'
import {Actions, StoreConfig, Selectors} from './types'

export function create<State, Config extends StoreConfig<State>>(initialState: State, {handlers, getters}: Config) {
  const store = legacy_createStore(makeReducer(initialState, flattenHandlers(handlers)), getReduxDevtoolsReducer())
  const actions: Actions<Config['handlers']> = makeActions(store, handlers)
  const selectors: Selectors<Config['getters']> = makeSelectors(store, getters)
  return {store, actions, selectors}
}

function getReduxDevtoolsReducer() {
  try {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  } catch {
    return undefined
  }
}
