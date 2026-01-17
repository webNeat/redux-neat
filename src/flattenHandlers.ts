import {isFunction} from './utils'
import type {HandlerFn, Handlers} from './types'

export function flattenHandlers<State>(fns: Handlers<State>, prefix = ''): Handlers<State, 1> {
  let result: Record<string, HandlerFn<State>> = {}
  for (const name in fns) {
    const fn = fns[name] as any
    if (isFunction(fn)) {
      result[prefix + name] = fn
    } else {
      result = {...result, ...flattenHandlers(fn, prefix + name + '.')}
    }
  }
  return result as any
}
