/**
 * 访问控制列表规则
 */
export type Rules = {
  [role: string]: Action[]
  [roleInNumber: number]: Action[]
}

/**
 * 权限
 */
export type Action = string | number | '*'
export type Role = string | number
