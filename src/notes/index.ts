import { z } from 'zod';

import { isoDate, uuidV7, withSyncColumns } from '../base.js';
import { itemRef } from '../items.js';
import { cursorQuery } from '../pagination.js';

/**
 * 노트(Note) — 일별 노트(date 1:1) 또는 자유 노트 (계획 A.2·C.4).
 * 본문은 Tiptap(ProseMirror) JSON 문서. 본문의 `@멘션` 노드(type: 'mention', attrs: { type, id })에서
 * 서버가 참조를 추출해 `mentions` 로 돌려준다(역링크). 일별 노트의 date 는 사용자 프로필 시간대 기준이다.
 */
export const noteKind = z.enum(['daily', 'free']);
export type NoteKind = z.infer<typeof noteKind>;

/** Tiptap JSON 문서. 구조는 에디터가 책임지고 서버는 크기와 멘션만 본다 */
export const noteBody = z.record(z.string(), z.unknown());
export type NoteBody = z.infer<typeof noteBody>;

export const EMPTY_NOTE_BODY: NoteBody = { type: 'doc', content: [] };

export const noteRow = withSyncColumns({
  kind: noteKind,
  /** daily 만. free 는 null */
  date: isoDate.nullable(),
  /** free 노트 제목. daily 는 빈 문자열 허용 */
  title: z.string().trim().max(200),
  body: noteBody,
  pinned: z.boolean(),
  categoryId: uuidV7.nullable(),
  /** 본문에서 추출한 항목 참조 (중복 제거) */
  mentions: z.array(itemRef),
});
export type NoteRow = z.infer<typeof noteRow>;

export const noteCreate = z
  .object({
    id: uuidV7,
    kind: noteKind,
    date: isoDate.optional(),
    title: noteRow.shape.title.optional(),
    body: noteBody.optional(),
    pinned: z.boolean().optional(),
    categoryId: uuidV7.nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === 'daily' && !v.date)
      ctx.addIssue({ code: 'custom', message: '일별 노트는 date 가 필요합니다', path: ['date'] });
    if (v.kind === 'free' && v.date)
      ctx.addIssue({
        code: 'custom',
        message: '자유 노트는 date 를 갖지 않습니다',
        path: ['date'],
      });
  });
export type NoteCreate = z.infer<typeof noteCreate>;

/** merge-patch: null = 지움, 없음 = 무시. kind·date 는 바꾸지 않는다 (기본값 없는 원형에서 partial) */
export const notePatch = z.object({
  title: noteRow.shape.title.optional(),
  body: noteBody.optional(),
  pinned: z.boolean().optional(),
  categoryId: uuidV7.nullable().optional(),
});
export type NotePatch = z.infer<typeof notePatch>;

export const noteListQuery = cursorQuery.extend({
  kind: noteKind.optional(),
  /** 일별 노트 날짜 범위 (레인·주간 조회) */
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  /** 제목·본문 텍스트 검색 */
  q: z.string().trim().min(1).max(100).optional(),
  /** 이 항목을 멘션한 노트만 (역링크) */
  mentionType: itemRef.shape.type.optional(),
  mentionId: uuidV7.optional(),
  pinned: z.coerce.boolean().optional(),
});
export type NoteListQuery = z.infer<typeof noteListQuery>;
