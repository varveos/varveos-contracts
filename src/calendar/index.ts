import { z } from 'zod';

import { ianaTimezone, isoDate, isoDateTime, uuidV7, withSyncColumns } from '../base.js';
import { propValues } from '../categories/index.js';

/**
 * 일정(Event) — 주간 캔버스의 기본 항목 (계획 A.2·3.3·B.2).
 * - 시간 일정: startsAt/endsAt(instant) + tz(IANA, 벽시계 해석·반복 전개 기준)
 * - 종일 일정: startDate/endDate(포함 범위). 서버가 tz 기준 자정으로 startsAt/endsAt 도 채워 범위 조회에 쓴다.
 * - 반복: rrule(RFC 5545 RRULE 본문, DTSTART 제외) + exdates + 예외 인스턴스(recurrenceMasterId·originalStartAt).
 *   전개는 서버가 조회 시 수행하고 인스턴스에 instanceId 를 붙여 돌려준다.
 */
export const eventRow = withSyncColumns({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).nullable(),
  location: z.string().max(300).nullable(),
  allDay: z.boolean(),
  startsAt: isoDateTime,
  endsAt: isoDateTime,
  tz: ianaTimezone,
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  rrule: z.string().min(1).max(500).nullable(),
  rruleUntil: isoDateTime.nullable(),
  exdates: z.array(isoDateTime),
  recurrenceMasterId: uuidV7.nullable(),
  originalStartAt: isoDateTime.nullable(),
  categoryId: uuidV7.nullable(),
  goalId: uuidV7.nullable(),
  props: propValues,
});
export type EventRow = z.infer<typeof eventRow>;

const timeFields = {
  allDay: z.boolean().default(false),
  startsAt: isoDateTime.optional(),
  endsAt: isoDateTime.optional(),
  tz: ianaTimezone,
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
};

const checkTime = (
  v: { allDay: boolean; startsAt?: string; endsAt?: string; startDate?: string; endDate?: string },
  ctx: z.RefinementCtx,
) => {
  if (v.allDay) {
    if (!v.startDate || !v.endDate)
      ctx.addIssue({
        code: 'custom',
        message: '종일 일정은 startDate·endDate 가 필요합니다',
        path: ['startDate'],
      });
    else if (v.endDate < v.startDate)
      ctx.addIssue({
        code: 'custom',
        message: 'endDate 는 startDate 이후여야 합니다',
        path: ['endDate'],
      });
    return;
  }
  if (!v.startsAt || !v.endsAt) {
    ctx.addIssue({
      code: 'custom',
      message: '시간 일정은 startsAt·endsAt 이 필요합니다',
      path: ['startsAt'],
    });
    return;
  }
  if (new Date(v.endsAt).getTime() <= new Date(v.startsAt).getTime())
    ctx.addIssue({
      code: 'custom',
      message: 'endsAt 은 startsAt 이후여야 합니다',
      path: ['endsAt'],
    });
};

export const eventCreate = z
  .object({
    id: uuidV7,
    title: eventRow.shape.title,
    description: eventRow.shape.description.optional(),
    location: eventRow.shape.location.optional(),
    ...timeFields,
    rrule: eventRow.shape.rrule.optional(),
    categoryId: eventRow.shape.categoryId.optional(),
    goalId: eventRow.shape.goalId.optional(),
    props: propValues.optional(),
  })
  .superRefine(checkTime);
export type EventCreate = z.infer<typeof eventCreate>;

/** merge-patch: null = 지움, 없음 = 무시. 시간 필드를 바꾸면 allDay 와 짝을 함께 보낸다(서버가 조합 검증). */
export const eventPatch = z.object({
  title: eventRow.shape.title.optional(),
  description: eventRow.shape.description.optional(),
  location: eventRow.shape.location.optional(),
  allDay: z.boolean().optional(),
  startsAt: isoDateTime.optional(),
  endsAt: isoDateTime.optional(),
  tz: ianaTimezone.optional(),
  startDate: isoDate.nullable().optional(),
  endDate: isoDate.nullable().optional(),
  rrule: eventRow.shape.rrule.optional(),
  exdates: z.array(isoDateTime).optional(),
  categoryId: eventRow.shape.categoryId.optional(),
  goalId: eventRow.shape.goalId.optional(),
  props: propValues.optional(),
});
export type EventPatch = z.infer<typeof eventPatch>;

/** 반복 일정 편집·삭제 범위 (계획 B.2). occurrence = 대상 회차의 originalStartAt. */
export const recurrenceScope = z.enum(['this', 'following', 'all']);
export type RecurrenceScope = z.infer<typeof recurrenceScope>;
export const recurrenceQuery = z.object({
  scope: recurrenceScope.default('all'),
  occurrence: isoDateTime.optional(),
});
export type RecurrenceQuery = z.infer<typeof recurrenceQuery>;

/** 범위 조회 (최대 62일). 반복 일정은 전개된 인스턴스로 돌아온다. */
export const eventListQuery = z.object({
  from: isoDateTime,
  to: isoDateTime,
  categoryId: uuidV7.optional(),
});
export type EventListQuery = z.infer<typeof eventListQuery>;

/** 전개된 회차. 단발 일정은 instanceId = id, masterId = id. */
export const eventInstance = eventRow.extend({
  instanceId: z.string().min(1),
  masterId: uuidV7,
  /** 이 회차의 규칙상 시작(예외·exdate 매칭 키). 단발은 startsAt 과 같다 */
  occurrenceStartAt: isoDateTime,
});
export type EventInstance = z.infer<typeof eventInstance>;
export const eventList = z.object({ items: z.array(eventInstance) });
export type EventList = z.infer<typeof eventList>;
