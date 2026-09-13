import { z } from 'zod';

import { isoDateTime, uuidV7 } from '../base.js';

/**
 * 푸시 디바이스 등록 (종합 계획 §2.4·§3.1). 1차는 토큰 등록·해지까지, 발송 fan-out은 2차.
 * 같은 (provider, token) 재등록은 upsert — 토큰이 갱신되면 클라이언트가 새 id로 다시 등록한다.
 */
export const pushProvider = z.enum(['fcm', 'apns']);
export type PushProvider = z.infer<typeof pushProvider>;

export const devicePlatform = z.enum(['ios', 'android']);
export type DevicePlatform = z.infer<typeof devicePlatform>;

export const deviceRow = z.object({
  id: uuidV7,
  platform: devicePlatform,
  provider: pushProvider,
  name: z.string().nullable(),
  appVersion: z.string().nullable(),
  locale: z.string().nullable(),
  createdAt: isoDateTime,
  lastSeenAt: isoDateTime,
});
export type DeviceRow = z.infer<typeof deviceRow>;

export const deviceRegister = z.object({
  id: uuidV7,
  platform: devicePlatform,
  provider: pushProvider,
  token: z.string().min(1).max(4096),
  name: z.string().trim().min(1).max(80).optional(),
  appVersion: z.string().trim().min(1).max(40).optional(),
  locale: z.string().trim().min(2).max(16).optional(),
});
export type DeviceRegister = z.infer<typeof deviceRegister>;

export const deviceList = z.object({ items: z.array(deviceRow) });
export type DeviceList = z.infer<typeof deviceList>;
