import { z } from 'zod';

import { ianaTimezone, isoDateTime, uuidV7 } from '../base.js';
import { userRow } from '../users/index.js';

export const clientKind = z.enum(['web', 'ios', 'android', 'desktop']);
export type ClientKind = z.infer<typeof clientKind>;

export const oauthProvider = z.enum(['google', 'apple']);
export type OAuthProvider = z.infer<typeof oauthProvider>;

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const password = z.string().min(8).max(128);

export const registerInput = z.object({
  email,
  password,
  name: z.string().trim().min(1).max(60).optional(),
  timezone: ianaTimezone.default('Asia/Seoul'),
});
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({ email, password });
export type LoginInput = z.infer<typeof loginInput>;

/** web 클라이언트는 refreshToken을 body 대신 httpOnly 쿠키로 받는다. */
export const tokenPair = z.object({
  accessToken: z.string().min(1),
  accessExpiresIn: z.number().int().positive(),
  refreshToken: z.string().min(1).optional(),
});
export type TokenPair = z.infer<typeof tokenPair>;

export const refreshInput = z.object({ refreshToken: z.string().min(1).optional() });

/** 서버 중개 Authorization Code + PKCE 시작. */
export const oauthStartQuery = z.object({
  client: clientKind,
  redirectUri: z.url(),
  codeChallenge: z.string().min(43).max(128),
  state: z.string().min(8).max(256),
});
export type OAuthStartQuery = z.infer<typeof oauthStartQuery>;

export const exchangeInput = z.object({
  code: z.string().min(1),
  codeVerifier: z.string().min(43).max(128),
});
export type ExchangeInput = z.infer<typeof exchangeInput>;

/** iOS 네이티브 Apple Sign-In. 이름은 첫 로그인에만 온다. */
export const appleNativeInput = z.object({
  identityToken: z.string().min(1),
  nonce: z.string().min(1),
  name: z.string().trim().min(1).max(60).optional(),
});

export const sessionRow = z.object({
  id: uuidV7,
  deviceName: z.string().nullable(),
  platform: clientKind,
  lastUsedAt: isoDateTime,
  createdAt: isoDateTime,
  current: z.boolean(),
});
export type SessionRow = z.infer<typeof sessionRow>;

/** GET /v1/meta — 앱↔API 호환 정보. */
export const metaResponse = z.object({
  apiVersion: z.string(),
  minSupportedAppVersion: z.string(),
  serverTime: isoDateTime,
});
export type MetaResponse = z.infer<typeof metaResponse>;

/** 로그인·가입·exchange·refresh 공통 응답. web은 tokens.refreshToken이 없고 쿠키로 받는다. */
export const authResponse = z.object({ user: userRow, tokens: tokenPair });
export type AuthResponse = z.infer<typeof authResponse>;

const oneTimeToken = z.string().min(20).max(256);

export const emailInput = z.object({ email });
export const verifyEmailInput = z.object({ token: oneTimeToken });
export const resetPasswordInput = z.object({ token: oneTimeToken, password });
export const changePasswordInput = z.object({ currentPassword: password, newPassword: password });
export type ChangePasswordInput = z.infer<typeof changePasswordInput>;

/** 세션 목록 항목 삭제·전체 폐기 응답 */
export const revokedResponse = z.object({ revoked: z.number().int().nonnegative() });

/** 계정 삭제 유예 상태 (DELETE /v1/users/me 응답, GET /v1/users/me 에도 노출) */
export const deletionStatus = z.object({
  deletionRequestedAt: isoDateTime,
  purgeAfter: isoDateTime,
});
export type DeletionStatus = z.infer<typeof deletionStatus>;

/** 인증된 주체. JWT(세션) 또는 PAT. 서버 내부용이지만 /v1/auth/whoami 응답으로도 쓴다. */
export const principal = z.object({
  userId: uuidV7,
  kind: z.enum(['session', 'pat']),
  sessionId: uuidV7.nullable(),
  scopes: z.array(z.string()).nullable(),
});
export type Principal = z.infer<typeof principal>;
