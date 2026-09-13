import { describe, expect, it } from 'vitest';

import { isoDateTime, syncColumns, uuidV7 } from '../src/index.js';

const V7 = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8b';
const V4 = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

describe('uuidV7', () => {
  it('v7만 통과한다', () => {
    expect(uuidV7.safeParse(V7).success).toBe(true);
    expect(uuidV7.safeParse(V4).success).toBe(false);
    expect(uuidV7.safeParse('not-a-uuid').success).toBe(false);
  });
});

describe('isoDateTime', () => {
  it('오프셋이 없으면 거부한다', () => {
    expect(isoDateTime.safeParse('2026-09-13T09:00:00+09:00').success).toBe(true);
    expect(isoDateTime.safeParse('2026-09-13T00:00:00Z').success).toBe(true);
    expect(isoDateTime.safeParse('2026-09-13T09:00:00').success).toBe(false);
  });
});

describe('syncColumns', () => {
  it('공통 컬럼을 검증한다', () => {
    const ok = syncColumns.safeParse({
      id: V7,
      createdAt: '2026-09-13T09:00:00+09:00',
      updatedAt: '2026-09-13T09:00:00+09:00',
      deletedAt: null,
      revision: 1,
    });
    expect(ok.success).toBe(true);
    expect(syncColumns.safeParse({ id: V7, revision: 0 }).success).toBe(false);
  });
});
