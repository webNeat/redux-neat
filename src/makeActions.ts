import type {Store} from 'redux'
import type {Actions, Handlers} from './types'
import {isFunction} from './utils'

export function makeActions<State, Fns extends Handlers<State>>(store: Store<State>, handlers: Fns, prefix = ''): Actions<Fns> {
  const actions = {} as any
  for (const name in handlers) {
    const handler = handlers[name]
    const fn = (...args: any[]) => {
      store.dispatch({type: prefix + name, args})
    }
    actions[name] = isFunction(handler) ? fn : makeActions(store, handler as any, prefix + name + '.')
  }
  return actions
}
