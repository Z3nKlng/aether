import { describe, it, expect } from 'vitest';
import { Role, Permissions, hasPermission } from './rbac';

describe('RBAC permissions', () => {
  it('should grant all permissions to OWNER', () => {
    Object.values(Permissions).forEach(permission => {
      expect(hasPermission(Role.OWNER, permission)).toBe(true);
    });
  });

  it('should grant specific permissions to ADMIN', () => {
    expect(hasPermission(Role.ADMIN, Permissions.PROJECT_DELETE)).toBe(true);
    expect(hasPermission(Role.ADMIN, Permissions.MEMBER_INVITE)).toBe(true);
    expect(hasPermission(Role.ADMIN, Permissions.ORG_DELETE)).toBe(false);
  });

  it('should grant specific permissions to MEMBER', () => {
    expect(hasPermission(Role.MEMBER, Permissions.PROJECT_READ)).toBe(true);
    expect(hasPermission(Role.MEMBER, Permissions.PROJECT_UPDATE)).toBe(true);
    expect(hasPermission(Role.MEMBER, Permissions.PROJECT_DELETE)).toBe(false);
  });

  it('should grant only read permission to VIEWER', () => {
    expect(hasPermission(Role.VIEWER, Permissions.PROJECT_READ)).toBe(true);
    expect(hasPermission(Role.VIEWER, Permissions.PROJECT_CREATE)).toBe(false);
  });

  it('should return false for unknown roles or permissions', () => {
    expect(hasPermission('INVALID_ROLE' as any, Permissions.PROJECT_READ)).toBe(false);
  });
});
