import { describe, expect, it } from 'vitest';

import {
  connectionSourcePatch,
  connectionSourceRow,
  disconnectQuery,
  errorStatus,
  integrationStartQuery,
  paths,
} from '../src/index.js';

const A = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8b';
const B = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a99';

describe('integrations', () => {
  it('소스 행: 방향은 pull|two_way, 카테고리는 nullable', () => {
    const row = connectionSourceRow.safeParse({
      id: A,
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
      deletedAt: null,
      revision: 1,
      connectionId: B,
      externalId: 'primary',
      name: '개인',
      color: 'blue',
      kind: 'calendar',
      direction: 'two_way',
      categoryId: null,
      enabled: true,
      lastSyncAt: null,
      lastError: null,
      webhookExpiresAt: null,
    });
    expect(row.success).toBe(true);
    expect(connectionSourcePatch.safeParse({ direction: 'push' }).success).toBe(false);
    expect(connectionSourcePatch.safeParse({ enabled: false, categoryId: null }).success).toBe(
      true,
    );
  });
  it('시작 쿼리는 URL, 해제는 기본 keep, 경로·에러 상태', () => {
    expect(integrationStartQuery.safeParse({ redirectUri: 'not a url' }).success).toBe(false);
    expect(disconnectQuery.parse({})).toEqual({ items: 'keep' });
    expect(paths.integrations.connectStart('google_calendar')).toBe(
      '/v1/integrations/connect/google_calendar/start',
    );
    expect(errorStatus.integration_disabled).toBe(503);
    expect(errorStatus.provider_error).toBe(502);
  });
});
