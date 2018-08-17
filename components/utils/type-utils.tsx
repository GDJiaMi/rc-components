/**
 * 类型相关的帮助方法
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
