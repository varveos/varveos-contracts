import { z } from 'zod';

import { isoDateTime, uuidV7, withSyncColumns } from '../base.js';
import { paletteKey } from '../categories/index.js';

/**
 * 외부 연동 (계획 E.1·E.2): 연결(외부 계정) → 소스(외부 캘린더/리스트 1개 ↔ varveos 카테고리 1개).
 * 1차 커넥터는 Google Calendar. `fake_calendar` 는 개발·테스트 전용 가짜(서버가 OAUTH_ADAPTER=fake 일 때만 허용).
 * 토큰·커서·웹훅 채널은 서버 내부라 계약에 노출하지 않는다.
 */
export const connectorProvider = z.enum([
  'google_calendar',
  'microsoft_outlook',
  'caldav',
  'ics',
  'todoist',
  'google_tasks',
  'microsoft_todo',
  'fake_calendar',
]);
export type ConnectorProvider = z.infer<typeof connectorProvider>;

export const connectionStatus = z.enum(['active', 'error', 'revoked']);
export type ConnectionStatus = z.infer<typeof connectionStatus>;

export const sourceKind = z.enum(['calendar', 'tasks']);
export type SourceKind = z.infer<typeof sourceKind>;

/** pull = 외부 → varveos 만(카테고리 readonly) · two_way = 양방향 */
export const syncDirection = z.enum(['pull', 'two_way']);
export type SyncDirection = z.infer<typeof syncDirection>;

export const connectionRow = withSyncColumns({
  provider: connectorProvider,
  /** 외부 계정 식별자 (구글 sub 등) */
  externalAccountId: z.string().min(1).max(200),
  /** 표시용 (이메일 등) */
  label: z.string().max(200),
  status: connectionStatus,
  scopes: z.array(z.string()),
  lastSyncAt: isoDateTime.nullable(),
  lastError: z.string().max(500).nullable(),
});
export type ConnectionRow = z.infer<typeof connectionRow>;
export const connectionList = z.object({ items: z.array(connectionRow) });

export const connectionSourceRow = withSyncColumns({
  connectionId: uuidV7,
  externalId: z.string().min(1).max(500),
  name: z.string().max(200),
  color: paletteKey.nullable(),
  kind: sourceKind,
  direction: syncDirection,
  /** 매핑된 varveos 카테고리 (연결 시 자동 생성) */
  categoryId: uuidV7.nullable(),
  enabled: z.boolean(),
  lastSyncAt: isoDateTime.nullable(),
  lastError: z.string().max(500).nullable(),
  /** 웹훅 구독 만료 (없으면 폴링만) */
  webhookExpiresAt: isoDateTime.nullable(),
});
export type ConnectionSourceRow = z.infer<typeof connectionSourceRow>;
export const connectionSourceList = z.object({ items: z.array(connectionSourceRow) });

export const connectionSourcePatch = z.object({
  direction: syncDirection.optional(),
  enabled: z.boolean().optional(),
  categoryId: uuidV7.nullable().optional(),
});
export type ConnectionSourcePatch = z.infer<typeof connectionSourcePatch>;

/** GET /connect/:provider/start?redirectUri= → { url } (사용자를 그 url 로 보낸다) */
export const integrationStartQuery = z.object({ redirectUri: z.url() });
export type IntegrationStartQuery = z.infer<typeof integrationStartQuery>;
export const integrationStartResponse = z.object({ url: z.url() });
export type IntegrationStartResponse = z.infer<typeof integrationStartResponse>;

/** POST /connections/:id/sync → 큐에 넣은 소스 수 */
export const syncQueued = z.object({ queued: z.number().int().nonnegative() });
export type SyncQueued = z.infer<typeof syncQueued>;

/** 연결 해제 시 외부에서 온 항목 처리 */
export const disconnectQuery = z.object({
  /** keep = 항목 유지(기본) · delete = 그 소스에서 온 항목 soft delete */
  items: z.enum(['keep', 'delete']).default('keep'),
});
export type DisconnectQuery = z.infer<typeof disconnectQuery>;

/** ICS 구독 연결 (OAuth 없음): POST /connect/ics → 연결 + 소스 1개(읽기 전용) */
export const icsConnectInput = z.object({
  url: z.url().max(2000),
  /** 비우면 피드의 X-WR-CALNAME 또는 호스트 이름 */
  name: z.string().trim().min(1).max(200).optional(),
});
export type IcsConnectInput = z.infer<typeof icsConnectInput>;

/** CalDAV 연결 (앱 암호 Basic 인증): POST /connect/caldav → 연결 + 캘린더마다 소스 */
export const caldavConnectInput = z.object({
  /** 서버 또는 principal URL (예: https://caldav.icloud.com, https://cloud.example.com/remote.php/dav) */
  serverUrl: z.url().max(500),
  username: z.string().trim().min(1).max(200),
  /** 앱 전용 암호. 서버가 암호화해 저장한다 */
  password: z.string().min(1).max(500),
  name: z.string().trim().min(1).max(200).optional(),
});
export type CaldavConnectInput = z.infer<typeof caldavConnectInput>;

/** 카테고리별 비공개 ICS 피드 (내보내기): 토큰이 URL 이다 */
export const icsFeedRow = z.object({
  id: uuidV7,
  categoryId: uuidV7,
  token: z.string().min(16),
  createdAt: isoDateTime,
});
export type IcsFeedRow = z.infer<typeof icsFeedRow>;
export const icsFeedList = z.object({ items: z.array(icsFeedRow) });
export const icsFeedCreate = z.object({ id: uuidV7, categoryId: uuidV7 });
export type IcsFeedCreate = z.infer<typeof icsFeedCreate>;

/** 서버 사용 가능 커넥터 (GET /providers) — 클라이언트는 이 목록만 버튼으로 보인다 */
export const providerInfo = z.object({
  provider: connectorProvider,
  kind: sourceKind,
  /** 가짜·개발 전용이면 true */
  dev: z.boolean(),
});
export const providerList = z.object({ items: z.array(providerInfo) });
export type ProviderInfo = z.infer<typeof providerInfo>;
