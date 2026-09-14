import { z } from 'zod';

import { isoDate, isoDateTime, uuidV7, withSyncColumns } from '../base.js';
import { paletteKey, propValues } from '../categories/index.js';
import { cursorQuery } from '../pagination.js';

/**
 * 목표 · 마일스톤 · 습관 (계획 C.3). 목표 지표는 수동 % 또는 연결 항목 집계(할 일 완료율·일정 시간 합·거래 합·트래커 최신값).
 * 집계는 서버가 계산해 `goalProgress` 로 돌려준다. 습관 체크는 (habit, date) 하나.
 */
export const goalStatus = z.enum(['active', 'completed', 'on_hold']);
export type GoalStatus = z.infer<typeof goalStatus>;

/**
 * manual: progressManual(0~100) / tasks: 연결 할 일 완료율 / events_hours: 연결 일정 시간 합(h) /
 * transactions_sum: 연결 거래 합(최소 단위) / tracker: 연결 트래커 최신값
 */
export const goalMetricType = z.enum([
  'manual',
  'tasks',
  'events_hours',
  'transactions_sum',
  'tracker',
]);
export type GoalMetricType = z.infer<typeof goalMetricType>;

export const goalRow = withSyncColumns({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).nullable(),
  status: goalStatus,
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  metricType: goalMetricType,
  /** 목표값 (tasks 는 무시, events_hours 는 시간, transactions_sum 은 최소 단위, tracker 는 트래커 단위) */
  targetValue: z.number().nullable(),
  unit: z.string().trim().max(20).nullable(),
  /** metricType=manual 의 진행률 (0~100) */
  progressManual: z.number().int().min(0).max(100),
  categoryId: uuidV7.nullable(),
  /** metricType=tracker 의 트래커 */
  trackerId: uuidV7.nullable(),
  sortOrder: z.number().int(),
  props: propValues,
});
export type GoalRow = z.infer<typeof goalRow>;

export const goalCreate = goalRow
  .pick({
    id: true,
    title: true,
    description: true,
    status: true,
    startDate: true,
    endDate: true,
    metricType: true,
    targetValue: true,
    unit: true,
    progressManual: true,
    categoryId: true,
    trackerId: true,
    sortOrder: true,
    props: true,
  })
  .partial({
    description: true,
    status: true,
    startDate: true,
    endDate: true,
    metricType: true,
    targetValue: true,
    unit: true,
    progressManual: true,
    categoryId: true,
    trackerId: true,
    sortOrder: true,
    props: true,
  });
export type GoalCreate = z.infer<typeof goalCreate>;
export const goalPatch = goalCreate.omit({ id: true }).partial();
export type GoalPatch = z.infer<typeof goalPatch>;

export const goalListQuery = cursorQuery.extend({
  status: z.enum(['active', 'completed', 'on_hold', 'all']).default('active'),
  categoryId: uuidV7.optional(),
});
export type GoalListQuery = z.infer<typeof goalListQuery>;

/** 서버 계산 진행률: value/target (tasks 는 done/total, manual 은 progressManual/100) */
export const goalProgress = z.object({
  goalId: uuidV7,
  metricType: goalMetricType,
  value: z.number(),
  target: z.number().nullable(),
  /** 0~1, target 이 없으면 null */
  ratio: z.number().min(0).nullable(),
  /** 연결된 항목 개수 (타입별) */
  linked: z.object({
    tasks: z.number().int().nonnegative(),
    events: z.number().int().nonnegative(),
    transactions: z.number().int().nonnegative(),
    habits: z.number().int().nonnegative(),
    records: z.number().int().nonnegative(),
  }),
});
export type GoalProgress = z.infer<typeof goalProgress>;
export const goalWithProgress = goalRow.extend({ progress: goalProgress });
export type GoalWithProgress = z.infer<typeof goalWithProgress>;

// ─────────────────────────────── 마일스톤 ───────────────────────────────
export const milestoneRow = withSyncColumns({
  goalId: uuidV7,
  title: z.string().trim().min(1).max(200),
  dueDate: isoDate.nullable(),
  completedAt: isoDateTime.nullable(),
  sortOrder: z.number().int(),
});
export type MilestoneRow = z.infer<typeof milestoneRow>;
export const milestoneCreate = milestoneRow
  .pick({ id: true, title: true, dueDate: true, sortOrder: true })
  .partial({ dueDate: true, sortOrder: true });
export type MilestoneCreate = z.infer<typeof milestoneCreate>;
export const milestonePatch = milestoneRow
  .pick({ title: true, dueDate: true, completedAt: true, sortOrder: true })
  .partial();
export type MilestonePatch = z.infer<typeof milestonePatch>;

// ─────────────────────────────── 습관 ───────────────────────────────
/** 빈도: 매일 / 특정 요일 / 주 N회 */
export const habitFrequency = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('daily') }),
  z.object({
    kind: z.literal('weekdays'),
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  }),
  z.object({ kind: z.literal('weekly_count'), count: z.number().int().min(1).max(7) }),
]);
export type HabitFrequency = z.infer<typeof habitFrequency>;

export const habitRow = withSyncColumns({
  title: z.string().trim().min(1).max(200),
  goalId: uuidV7.nullable(),
  frequency: habitFrequency,
  color: paletteKey,
  archived: z.boolean(),
  sortOrder: z.number().int(),
});
export type HabitRow = z.infer<typeof habitRow>;
export const habitCreate = habitRow
  .pick({
    id: true,
    title: true,
    goalId: true,
    frequency: true,
    color: true,
    archived: true,
    sortOrder: true,
  })
  .partial({ goalId: true, frequency: true, color: true, archived: true, sortOrder: true });
export type HabitCreate = z.infer<typeof habitCreate>;
export const habitPatch = habitCreate.omit({ id: true }).partial();
export type HabitPatch = z.infer<typeof habitPatch>;

/** 체크는 날짜당 하나. value 는 횟수(기본 1) */
export const habitCheckRow = withSyncColumns({
  habitId: uuidV7,
  date: isoDate,
  value: z.number().int().min(1),
});
export type HabitCheckRow = z.infer<typeof habitCheckRow>;
export const habitCheckSet = z.object({
  date: isoDate,
  /** 0 이면 체크 해제(삭제) */
  value: z.number().int().min(0).default(1),
});
export type HabitCheckSet = z.infer<typeof habitCheckSet>;
export const habitCheckListQuery = z.object({ from: isoDate, to: isoDate });
export type HabitCheckListQuery = z.infer<typeof habitCheckListQuery>;

/** 습관 통계 (서버 계산): 현재 스트릭, 최장 스트릭, 기간 달성률 */
export const habitStats = z.object({
  habitId: uuidV7,
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  /** from~to 사이 기대 횟수 대비 체크 비율 (0~1) */
  completionRate: z.number().min(0).max(1),
  expected: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
});
export type HabitStats = z.infer<typeof habitStats>;
