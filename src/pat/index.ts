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

/** PAT 사용 기록 (계획 3.4 pat_audit): 요청마다 한 줄, 30일 보관. GET /v1/pat/:id/audit (세션 전용) */
export const patAuditRow = z.object({
  id: z.number().int(),
  patId: uuidV7,
  at: isoDateTime,
  method: z.string(),
  /** 라우트 패턴 (예: /v1/tasks/:id) — 실제 id 는 남기지 않는다 */
  route: z.string(),
  status: z.number().int(),
});
export type PatAuditRow = z.infer<typeof patAuditRow>;
export const patAuditList = z.object({ items: z.array(patAuditRow) });
export type PatAuditList = z.infer<typeof patAuditList>;
