import { z } from 'zod';

import { isoDate, uuidV7 } from '../base.js';
import { itemType } from '../items.js';

/**
 * 통합 검색 (계획 B.3 커맨드 팔레트·E.3 MCP search): 제목·본문(노트)·메모(거래·기록)를 부분 일치로 찾는다.
 * 서버가 종류별로 찾아 점수(제목 시작 > 제목 포함 > 본문 포함)와 시간 역순으로 합친다. PAT 은 읽을 수 있는 종류만.
 */
export const searchQuery = z.object({
  q: z.string().trim().min(1).max(100),
  /** 비우면 전부. 콤마 구분 (event,task,…) */
  types: z
    .string()
    .transform((s) =>
      s
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    )
    .pipe(z.array(itemType).min(1))
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SearchQuery = z.infer<typeof searchQuery>;

export const searchHit = z.object({
  type: itemType,
  id: uuidV7,
  title: z.string(),
  /** 본문·메모에서 일치 부근 발췌 (제목 일치면 null) */
  snippet: z.string().nullable(),
  /** 항목의 시점: 일정 시작(ISO datetime) · 할 일 마감·노트 날짜·거래 발생일·목표 종료(ISO date) · 기록 시각 */
  when: z.string().nullable(),
  categoryId: uuidV7.nullable(),
  /** 일정: 반복 마스터면 true (팔레트가 회차가 아닌 마스터로 연다) */
  recurring: z.boolean().optional(),
});
export type SearchHit = z.infer<typeof searchHit>;

export const searchResponse = z.object({
  items: z.array(searchHit),
  /** 요청했지만 권한(PAT 스코프)이 없어 건너뛴 종류 */
  skipped: z.array(itemType),
});
export type SearchResponse = z.infer<typeof searchResponse>;

/** ISO date 형식 검증 헬퍼 재노출 (클라이언트가 when 을 날짜로 다룰 때) */
export const searchWhenDate = isoDate;
