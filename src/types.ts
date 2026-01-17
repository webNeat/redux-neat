import type {Decrement} from 'just-types'

export type StoreConfig<State = any> = {
  handlers: Handlers<State>
  getters: Getters<State>
  withDevTools?: boolean
}

export type HandlerFn<State = any> = (state: State, ...args: any[]) => State | undefined | void
export type Handlers<State = any, Depth extends number = 5> = Record<
  string,
  HandlerFn<State> | (Depth extends 1 ? never : Handlers<State, Decrement<Depth>>)
>

export type GetterFn<State = any> = (state: State, ...args: any[]) => any
export type Getters<State = any, Depth extends number = 5> = Record<
  string,
  GetterFn<State> | (Depth extends 1 ? never : Getters<State, Decrement<Depth>>)
>

export type Actions<Fns extends Handlers> = {
  [key in keyof Fns]: Fns[key] extends HandlerFn ? Action<Fns[key]> : Fns[key] extends Handlers ? Actions<Fns[key]> : never
}
export type Action<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any ? (...args: Args) => void : () => void

export type Selectors<Fns extends Getters> = {
  [key in keyof Fns]: Fns[key] extends GetterFn ? Selector<Fns[key]> : Fns[key] extends Getters ? Selectors<Fns[key]> : never
}
export type Selector<Fn extends HandlerFn<any>> = Fn extends (a: any, ...args: infer Args) => any
  ? (...args: Args) => ReturnType<Fn>
  : () => ReturnType<Fn>
