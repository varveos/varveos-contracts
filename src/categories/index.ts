import { z } from 'zod';

import { withSyncColumns } from '../base.js';

/** 카테고리 12색 팔레트 키. 실제 색값은 앱 디자인 토큰이 소유한다. */
export const paletteKey = z.enum([
  'gray',
  'purple',
  'green',
  'blue',
  'yellow',
  'red',
  'orange',
  'pink',
  'teal',
  'brown',
  'indigo',
  'lime',
]);
export type PaletteKey = z.infer<typeof paletteKey>;

/** 카테고리별 사용자 정의 속성 (최대 6개). Event·Task·Goal에만 적용된다. */
export const propType = z.enum([
  'select',
  'multi_select',
  'number',
  'text',
  'checkbox',
  'url',
  'date',
]);
export const propDef = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]{0,31}$/),
  label: z.string().trim().min(1).max(40),
  type: propType,
  options: z.array(z.string().trim().min(1).max(40)).max(50).optional(),
});
export type PropDef = z.infer<typeof propDef>;

/** 항목의 props 값. key → 값(타입은 propDef가 결정, 서버가 검증). */
export const propValues = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
);
export type PropValues = z.infer<typeof propValues>;

export const categoryRow = withSyncColumns({
  name: z.string().trim().min(1).max(60),
  color: paletteKey,
  icon: z.string().max(40).nullable(),
  groupName: z.string().trim().max(60).nullable(),
  sortOrder: z.number().int(),
  /** 외부 연동(pull) 카테고리는 편집 불가. 서버가 connection_sources에서 파생한다. */
  readonly: z.boolean(),
  propDefs: z.array(propDef).max(6),
});
export type CategoryRow = z.infer<typeof categoryRow>;

export const categoryCreate = categoryRow
  .pick({
    id: true,
    name: true,
    color: true,
    icon: true,
    groupName: true,
    sortOrder: true,
    propDefs: true,
  })
  .partial({ icon: true, groupName: true, sortOrder: true, propDefs: true });
export type CategoryCreate = z.infer<typeof categoryCreate>;

export const categoryPatch = categoryCreate.omit({ id: true }).partial();
export type CategoryPatch = z.infer<typeof categoryPatch>;
