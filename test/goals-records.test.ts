import { describe, expect, it } from 'vitest';

import {
  goalCreate,
  goalListQuery,
  goalPatch,
  habitCheckSet,
  habitCreate,
  recordCreate,
  trackerCreate,
} from '../src/index.js';

const A = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8b';

describe('goals', () => {
  it('create 는 id·title 만 필수, status 기본은 서버가 채운다', () => {
    expect(goalCreate.safeParse({ id: A, title: '운동 습관 만들기' }).success).toBe(true);
    expect(goalCreate.safeParse({ id: A }).success).toBe(false);
  });
  it('수동 진행률은 0~100 정수', () => {
    expect(goalPatch.safeParse({ progressManual: 50 }).success).toBe(true);
    expect(goalPatch.safeParse({ progressManual: 101 }).success).toBe(false);
    expect(goalPatch.safeParse({ progressManual: 12.5 }).success).toBe(false);
  });
  it('목록 기본은 active', () => {
    expect(goalListQuery.parse({}).status).toBe('active');
  });
});

describe('habits', () => {
  it('빈도는 매일·요일·주 N회', () => {
    expect(
      habitCreate.safeParse({ id: A, title: '물 마시기', frequency: { kind: 'daily' } }).success,
    ).toBe(true);
    expect(
      habitCreate.safeParse({
        id: A,
        title: '운동',
        frequency: { kind: 'weekdays', days: [1, 3, 5] },
      }).success,
    ).toBe(true);
    expect(
      habitCreate.safeParse({ id: A, title: '운동', frequency: { kind: 'weekly_count', count: 3 } })
        .success,
    ).toBe(true);
    expect(
      habitCreate.safeParse({ id: A, title: '운동', frequency: { kind: 'weekdays', days: [7] } })
        .success,
    ).toBe(false);
  });
  it('체크 value 기본 1, 0 은 해제', () => {
    expect(habitCheckSet.parse({ date: '2026-09-15' }).value).toBe(1);
    expect(habitCheckSet.safeParse({ date: '2026-09-15', value: 0 }).success).toBe(true);
    expect(habitCheckSet.safeParse({ date: '2026-09-15', value: -1 }).success).toBe(false);
  });
});

describe('records', () => {
  it('트래커는 이름만 필수, 기본 시각은 HH:MM', () => {
    expect(trackerCreate.safeParse({ id: A, name: '체중' }).success).toBe(true);
    expect(trackerCreate.safeParse({ id: A, name: '체중', defaultTime: '07:30' }).success).toBe(
      true,
    );
    expect(trackerCreate.safeParse({ id: A, name: '체중', defaultTime: '7:30' }).success).toBe(
      false,
    );
  });
  it('기록은 트래커·시각·값 필수', () => {
    expect(
      recordCreate.safeParse({
        id: A,
        trackerId: A,
        occurredAt: '2026-09-15T07:30:00+09:00',
        value: 70.5,
      }).success,
    ).toBe(true);
    expect(recordCreate.safeParse({ id: A, trackerId: A, value: 70.5 }).success).toBe(false);
  });
});
