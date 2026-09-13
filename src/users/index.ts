import { z } from 'zod';

import { ianaTimezone, isoDateTime, uuidV7 } from '../base.js';

export const userRow = z.object({
  id: uuidV7,
  email: z.email(),
  emailVerified: z.boolean(),
  name: z.string().nullable(),
  timezone: ianaTimezone,
  locale: z.enum(['ko', 'en']),
  createdAt: isoDateTime,
  deletionRequestedAt: isoDateTime.nullable(),
});
export type UserRow = z.infer<typeof userRow>;

export const userPatch = userRow.pick({ name: true, timezone: true, locale: true }).partial();
export type UserPatch = z.infer<typeof userPatch>;

/** 주간 캔버스 레인 종류. 순서·표시는 사용자 뷰 설정에 저장한다. */
export const laneKind = z.enum(['allDay', 'tasks', 'ledger', 'notes', 'records', 'habits']);
export type LaneKind = z.infer<typeof laneKind>;

export const laneSetting = z.object({
  kind: laneKind,
  enabled: z.boolean(),
  collapsed: z.boolean().default(false),
});

export const viewSettings = z.object({
  weekStart: z.number().int().min(0).max(6).default(1),
  hourRange: z
    .tuple([z.number().int().min(0).max(23), z.number().int().min(1).max(24)])
    .default([6, 24]),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  defaultView: z.enum(['day', 'threeDay', 'week', 'month', 'agenda']).default('week'),
  lanes: z
    .array(laneSetting)
    .max(6)
    .default([
      { kind: 'allDay', enabled: true, collapsed: false },
      { kind: 'tasks', enabled: true, collapsed: false },
      { kind: 'ledger', enabled: true, collapsed: false },
      { kind: 'notes', enabled: true, collapsed: false },
    ]),
});
export type ViewSettings = z.infer<typeof viewSettings>;
export const viewSettingsPatch = viewSettings.partial();
