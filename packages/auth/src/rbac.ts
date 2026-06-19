export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export const Permissions = {
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  DEPLOY_CREATE: 'deploy:create',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  MEMBER_INVITE: 'member:invite',
  MEMBER_REMOVE: 'member:remove',
} as const

export type Permission = (typeof Permissions)[keyof typeof Permissions]

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.OWNER]: Object.values(Permissions),
  [Role.ADMIN]: [
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_READ,
    Permissions.PROJECT_UPDATE,
    Permissions.PROJECT_DELETE,
    Permissions.DEPLOY_CREATE,
    Permissions.ORG_UPDATE,
    Permissions.MEMBER_INVITE,
    Permissions.MEMBER_REMOVE,
  ],
  [Role.MEMBER]: [
    Permissions.PROJECT_READ,
    Permissions.PROJECT_UPDATE,
    Permissions.DEPLOY_CREATE,
  ],
  [Role.VIEWER]: [Permissions.PROJECT_READ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false
}
