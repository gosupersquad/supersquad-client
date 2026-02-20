export const GST_PERCENT = 5;

export const ROLES = {
  HOST: "host",
  MASTER: "master",
} as const;

export type AuthRole = (typeof ROLES)[keyof typeof ROLES];

export const APPROVAL_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[keyof typeof APPROVAL_STATUSES];