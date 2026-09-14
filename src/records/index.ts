import { z } from 'zod';

import { isoDate, isoDateTime, uuidV7, withSyncColumns } from '../base.js';
import { paletteKey } from '../categories/index.js';
import { cursorQuery } from '../pagination.js';

/**
 * 기록 (계획 C.4): 트래커(체중 kg, 기분 1~5, 수면 h …)와 그 값. 기록 레인·트래커 차트·목표 지표 소스.
 */
export const trackerValueType = z.enum(['number', 'scale', 'bool']);
export type TrackerValueType = z.infer<typeof trackerValueType>;

export const trackerRow = withSyncColumns({
  name: z.string().trim().min(1).max(60),
  valueType: trackerValueType,
  unit: z.string().trim().max(20).nullable(),
  /** scale 의 범위 (기본 1~5) */
  scaleMin: z.number().int().nullable(),
  scaleMax: z.number().int().nullable(),
  color: paletteKey,
  /** 기본 입력 시각 HH:MM (없으면 지금) */
  defaultTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
  archived: z.boolean(),
  sortOrder: z.number().int(),
});
export type TrackerRow = z.infer<typeof trackerRow>;
export const trackerCreate = trackerRow
  .pick({
    id: true,
    name: true,
    valueType: true,
    unit: true,
    scaleMin: true,
    scaleMax: true,
    color: true,
    defaultTime: true,
    archived: true,
    sortOrder: true,
  })
  .partial({
    valueType: true,
    unit: true,
    scaleMin: true,
    scaleMax: true,
    color: true,
    defaultTime: true,
    archived: true,
    sortOrder: true,
  });
export type TrackerCreate = z.infer<typeof trackerCreate>;
export const trackerPatch = trackerCreate.omit({ id: true, valueType: true }).partial();
export type TrackerPatch = z.infer<typeof trackerPatch>;

export const recordRow = withSyncColumns({
  trackerId: uuidV7,
  occurredAt: isoDateTime,
  /** number: 값, scale: 정수, bool: 0|1 */
  value: z.number(),
  memo: z.string().trim().max(500).nullable(),
  goalId: uuidV7.nullable(),
});
export type RecordRow = z.infer<typeof recordRow>;
export const recordCreate = recordRow
  .pick({ id: true, trackerId: true, occurredAt: true, value: true, memo: true, goalId: true })
  .partial({ memo: true, goalId: true });
export type RecordCreate = z.infer<typeof recordCreate>;
export const recordPatch = recordRow
  .pick({ occurredAt: true, value: true, memo: true, goalId: true })
  .partial();
export type RecordPatch = z.infer<typeof recordPatch>;

export const recordListQuery = cursorQuery.extend({
  trackerId: uuidV7.optional(),
  /** occurredAt 범위 (사용자 tz 날짜 → 클라이언트가 instant 로 바꿔 보낸다) */
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  goalId: uuidV7.optional(),
});
export type RecordListQuery = z.infer<typeof recordListQuery>;

/** 트래커 요약 (서버 계산): 최신값, 기간 평균, 개수 */
export const trackerSummary = z.object({
  trackerId: uuidV7,
  latest: z.object({ value: z.number(), occurredAt: isoDateTime }).nullable(),
  average: z.number().nullable(),
  count: z.number().int().nonnegative(),
  from: isoDate,
  to: isoDate,
});
export type TrackerSummary = z.infer<typeof trackerSummary>;
