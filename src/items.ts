import { z } from 'zod';

import { uuidV7 } from './base.js';

/** 고정 6 항목 타입. 새 타입 추가는 ADR + 종합 계획 §11.3 체크리스트를 따른다. */
export const itemType = z.enum(['event', 'task', 'transaction', 'note', 'goal', 'record']);
export type ItemType = z.infer<typeof itemType>;

/** 타입을 가로지르는 다형 참조(멘션·팝오버·변환). */
export const itemRef = z.object({ type: itemType, id: uuidV7 });
export type ItemRef = z.infer<typeof itemRef>;
