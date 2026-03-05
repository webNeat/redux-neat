import type {Store} from 'redux'
import {useSelector} from 'react-redux'
import {isFunction} from './utils'
import type {Selectors, Getters, GetterFn} from './types'

export function makeSelectors<State, Fns extends Getters<State>>(store: Store<State>, getters: Fns): Selectors<Fns> {
  const selectors = {} as any
  for (const name in getters) {
    const getter = getters[name]
    if (isFunction(getter)) {
      selectors[name] = (...args: any[]) => {
        return useSelector((state) => (getter as GetterFn)(state, ...args))
      }
    } else {
      selectors[name] = makeSelectors(store, getter as any)
    }
  }
  return selectors
}
