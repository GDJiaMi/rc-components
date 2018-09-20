export enum Role {
  Admin,
  Guest,
}

export const Rules = {
  [Role.Admin]: ['create', 'update', 'view', 'delete'],
  [Role.Guest]: ['view'],
}
