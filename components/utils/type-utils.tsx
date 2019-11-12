/**
 * 类型相关的帮助方法
 * TODO: 废弃
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
