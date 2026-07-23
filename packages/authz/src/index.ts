export {
  type CapabilityGateOptions,
  capabilityGate,
} from "./capabilityGate.js";
export {
  configureAuthz,
  defineCapability,
  getAuthzConfig,
  hasCapability,
  resetAuthz,
  resolveCapability,
} from "./resolve.js";
export type {
  AuthzConfig,
  CapabilityClaim,
  CapabilityDecision,
  CapabilityDecisionReason,
  CapabilityId,
  CapabilityPolicy,
} from "./types.js";
export {
  attachVaultCapabilityClaims,
  type AttachVaultCapabilityClaimsOptions,
  CAPABILITY_CLAIMS_FIELD,
  type CapabilityClaimEntry,
  capabilityClaimsField,
  clearMemberCapability,
  clearMemberCapabilityClaims,
  createVaultCapabilityClaimResolver,
  denyMemberCapability,
  getMemberCapabilityClaims,
  grantMemberCapability,
  type VaultClaimOptions,
} from "./vaultClaims.js";
