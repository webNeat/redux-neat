import type {Store} from 'redux'
import {isFunction} from './utils'
import type {Selectors, Getters, GetterFn} from './types'

export function makeGetters<State, Fns extends Getters<State>>(store: Store<State>, getters: Fns): Selectors<Fns> {
  const results = {} as any
  for (const name in getters) {
    const getter = getters[name]
    if (isFunction(getter)) {
      results[name] = (...args: any[]) => (getter as GetterFn)(store.getState(), ...args)
    } else {
      results[name] = makeGetters(store, getter as any)
    }
  }
  return results
}
