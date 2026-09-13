import { z } from 'zod';

import { ianaTimezone, isoDateTime, uuidV7 } from '../base.js';

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
