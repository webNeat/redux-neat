import {legacy_createStore, compose} from 'redux'
import {flattenHandlers} from './flattenHandlers'
import {makeActions} from './makeActions'
import {makeReducer} from './makeReducer'
import {makeSelectors} from './makeSelectors'
import type {Actions, StoreConfig, Selectors} from './types'

export function create<State, Config extends StoreConfig<State>>(
  initialState: State,
  {handlers, getters, withDevTools = true}: Config
) {
  const composeEnhancers = getComposeEnhancers(withDevTools)
  const store = legacy_createStore(makeReducer(initialState, flattenHandlers(handlers)), composeEnhancers())
  const actions: Actions<Config['handlers']> = makeActions(store, handlers)
  const selectors: Selectors<Config['getters']> = makeSelectors(store, getters)
  return {store, actions, selectors}
}

function getComposeEnhancers(withDevTools: boolean) {
  if (withDevTools && typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
  return compose
}
