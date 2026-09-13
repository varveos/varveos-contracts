import { z } from 'zod';

import { isoDate, isoDateTime, uuidV7, withSyncColumns } from '../base.js';
import { propValues } from '../categories/index.js';
import { cursorQuery } from '../pagination.js';

export const taskPriority = z.enum(['none', 'low', 'medium', 'high']);
export type TaskPriority = z.infer<typeof taskPriority>;

/** 할 일은 시간이 없다. 마감일(date)만 선택적으로 갖는다 (사용자 결정). */
export const taskRow = withSyncColumns({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).nullable(),
  dueDate: isoDate.nullable(),
  completedAt: isoDateTime.nullable(),
  priority: taskPriority,
  sortOrder: z.number().int(),
  parentId: uuidV7.nullable(),
  categoryId: uuidV7.nullable(),
  goalId: uuidV7.nullable(),
  milestoneId: uuidV7.nullable(),
  props: propValues,
});
export type TaskRow = z.infer<typeof taskRow>;

export const taskCreate = taskRow
  .pick({
    id: true,
    title: true,
    description: true,
    dueDate: true,
    priority: true,
    sortOrder: true,
    parentId: true,
    categoryId: true,
    goalId: true,
    milestoneId: true,
    props: true,
  })
  .partial({
    description: true,
    dueDate: true,
    priority: true,
    sortOrder: true,
    parentId: true,
    categoryId: true,
    goalId: true,
    milestoneId: true,
    props: true,
  });
export type TaskCreate = z.infer<typeof taskCreate>;

/** merge-patch: null = 지움, 없음 = 무시. */
export const taskPatch = taskCreate.omit({ id: true }).partial();
export type TaskPatch = z.infer<typeof taskPatch>;

export const taskListQuery = cursorQuery.extend({
  status: z.enum(['open', 'completed', 'all']).default('open'),
  dueFrom: isoDate.optional(),
  dueTo: isoDate.optional(),
  /** 마감일 없는 할 일(인박스)만 */
  inbox: z.coerce.boolean().optional(),
  categoryId: uuidV7.optional(),
  goalId: uuidV7.optional(),
});
export type TaskListQuery = z.infer<typeof taskListQuery>;
