export function isFunction<T>(x: T): T extends Function ? true : false
export function isFunction(x: any) {
  return !!x && {}.toString.call(x) === '[object Function]'
}

export function deepClone<T>(state: T): T {
  return JSON.parse(JSON.stringify(state))
}
