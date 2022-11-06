import {Store} from 'redux'
import {isFunction} from './utils'
import {Selectors, Getters, GetterFn} from './types'
import {useSelector} from 'react-redux'

export function makeSelectors<State, Fns extends Getters<State>>(store: Store<State>, getters: Fns): Selectors<Fns> {
  const selectors = {} as any
  for (const name in getters) {
    const getter = getters[name]
    const fn = (...args: any[]) => {
      return useSelector((state) => (getter as GetterFn)(state, ...args))
    }
    selectors[name] = isFunction(getter) ? fn : makeSelectors(store, getter as any)
  }
  return selectors
}
