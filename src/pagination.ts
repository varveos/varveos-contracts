import { z } from 'zod';

/** `?cursor&limit` — cursor는 서버가 만든 base64url(sort_key,id). */
export const cursorQuery = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type CursorQuery = z.infer<typeof cursorQuery>;

export const page = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), nextCursor: z.string().nullable() });
