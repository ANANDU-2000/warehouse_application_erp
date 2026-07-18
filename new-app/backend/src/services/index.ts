export { getHealthStatus } from "./health.service";
export type { HealthStatus } from "./health.service";

export {
  AccountInactiveError,
  AccountBlockedError,
  PasswordStrengthError,
} from "./errors";

export {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from "./passwords.service";

export {
  PERMISSION_KEYS,
  ROLE_DEFAULTS,
  effectivePermissions,
  parsePermissionsJson,
  membershipPermissions,
  actorCanManageTarget,
} from "./permissions.service";
export type { PermissionKey, PermissionsMap } from "./permissions.service";

export { normalizeLoginEmail, resolveUserByEmail } from "./authLogin.service";

export { assertAccountEligible } from "./accountEligibility.service";
