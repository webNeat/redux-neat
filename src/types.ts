import {Decrement} from 'just-types'

export type HandlerFn<State = any> = (state: State, ...args: any[]) => State
export type Handlers<State = any, Depth extends number = 5> = Record<
  string,
  HandlerFn<State> | (Depth extends 1 ? never : Handlers<State, Decrement<Depth>>)
>

export type Actions<Fns extends Handlers> = {
  // @ts-expect-error if Fns[key] doesn't extend HandlerFn then it extends Handlers
  [key in keyof Fns]: Fns[key] extends HandlerFn ? Action<Fns[key]> : Actions<Fns[key]>
}

export type Action<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any ? (...args: Args) => void : () => void
