import { z } from 'zod';

/** 클라이언트가 생성하는 UUIDv7. 시간순 정렬·인덱스 친화. v7이 아니면 400. */
export const uuidV7 = z.uuidv7();
export type UuidV7 = z.infer<typeof uuidV7>;

/** ISO-8601, 오프셋 필수 (예: 2026-09-13T09:00:00+09:00). */
export const isoDateTime = z.iso.datetime({ offset: true });
/** 날짜만 (YYYY-MM-DD). 종일 일정·마감일·거래 발생일. */
export const isoDate = z.iso.date();
/** IANA 시간대 (예: Asia/Seoul). */
export const ianaTimezone = z.string().min(1).max(64);

/**
 * 모든 사용자 소유 엔티티의 공통(동기화 대비) 컬럼.
 * server_seq·client_id는 서버 내부용이라 계약에 노출하지 않는다.
 */
export const syncColumns = z.object({
  id: uuidV7,
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  deletedAt: isoDateTime.nullable(),
  revision: z.number().int().positive(),
});
export type SyncColumns = z.infer<typeof syncColumns>;

/** 공통 컬럼 위에 모듈 필드를 얹는다. `row = withSyncColumns({...})` */
export const withSyncColumns = <T extends z.ZodRawShape>(shape: T) => syncColumns.extend(shape);

/** PATCH 요청의 `If-Match` 헤더 값 = 현재 revision. */
export const ifMatchHeader = z.coerce.number().int().positive();
