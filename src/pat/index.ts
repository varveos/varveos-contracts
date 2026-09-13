import { z } from 'zod';

import { isoDateTime, uuidV7 } from '../base.js';

/** PAT 스코프. `<resource>:<read|write>`. */
export const patScope = z.enum([
  'events:read',
  'events:write',
  'tasks:read',
  'tasks:write',
  'ledger:read',
  'ledger:write',
  'goals:read',
  'goals:write',
  'notes:read',
  'notes:write',
  'records:read',
  'records:write',
  'categories:read',
]);
export type PatScope = z.infer<typeof patScope>;

export const patCreateInput = z.object({
  name: z.string().trim().min(1).max(60),
  scopes: z.array(patScope).min(1),
  expiresAt: isoDateTime.optional(),
});
export type PatCreateInput = z.infer<typeof patCreateInput>;

export const patRow = z.object({
  id: uuidV7,
  name: z.string(),
  scopes: z.array(patScope),
  lastUsedAt: isoDateTime.nullable(),
  expiresAt: isoDateTime.nullable(),
  createdAt: isoDateTime,
});
export type PatRow = z.infer<typeof patRow>;

/** 생성 응답에만 평문 토큰이 포함된다 (vpat_ 프리픽스). 이후에는 다시 볼 수 없다. */
export const patCreated = patRow.extend({ token: z.string().startsWith('vpat_') });
