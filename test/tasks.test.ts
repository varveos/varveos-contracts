import { describe, expect, it } from 'vitest';

import { taskCreate, taskListQuery, taskPatch } from '../src/index.js';

const V7 = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8b';

describe('tasks', () => {
  it('create는 id와 title만 필수', () => {
    expect(taskCreate.safeParse({ id: V7, title: '보고서 제출' }).success).toBe(true);
    expect(taskCreate.safeParse({ title: '보고서 제출' }).success).toBe(false);
  });
  it('patch는 id를 받지 않고 null로 지움을 표현한다', () => {
    const p = taskPatch.parse({ dueDate: null, priority: 'high' });
    expect(p.dueDate).toBeNull();
    expect('id' in taskPatch.shape).toBe(false);
  });
  it('list query 기본값', () => {
    const q = taskListQuery.parse({});
    expect(q.limit).toBe(50);
    expect(q.status).toBe('open');
    expect(taskListQuery.safeParse({ limit: 500 }).success).toBe(false);
  });
});
