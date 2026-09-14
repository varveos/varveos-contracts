import { z } from 'zod';

/** 안정된 기계용 에러 코드. 클라이언트는 `errors.<code>` i18n 키로 표시한다. */
export const errorCode = z.enum([
  'validation_failed',
  'unauthorized',
  'forbidden',
  'not_found',
  'already_exists',
  'in_use',
  'revision_conflict',
  'account_exists',
  'invalid_credentials',
  'token_reused',
  'rate_limited',
  'app_update_required',
  /** 커넥터가 서버에 설정되지 않았다 (503) */
  'integration_disabled',
  /** 외부 프로바이더 호출 실패 (502) */
  'provider_error',
  'internal',
]);
export type ErrorCode = z.infer<typeof errorCode>;

export const errorEnvelope = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;

/** 코드 → HTTP 상태. 서버 AppError와 클라이언트 재시도 판단이 공유한다. */
export const errorStatus: Record<ErrorCode, number> = {
  validation_failed: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  already_exists: 409,
  in_use: 409,
  revision_conflict: 409,
  account_exists: 409,
  invalid_credentials: 401,
  token_reused: 401,
  rate_limited: 429,
  app_update_required: 426,
  integration_disabled: 503,
  provider_error: 502,
  internal: 500,
};
