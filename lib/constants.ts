export const GST_PERCENT = 5;

export const ROLES = {
  HOST: "host",
  MASTER: "master",
} as const;

export type AuthRole = (typeof ROLES)[keyof typeof ROLES];