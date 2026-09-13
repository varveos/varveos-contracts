import { describe, expect, it } from 'vitest';

import { errorCode, errorStatus, loginInput, registerInput } from '../src/index.js';

describe('registerInput', () => {
  it('이메일을 정규화하고 시간대 기본값을 준다', () => {
    const r = registerInput.parse({ email: '  Foo@Example.COM ', password: 'password123' });
    expect(r.email).toBe('foo@example.com');
    expect(r.timezone).toBe('Asia/Seoul');
  });
  it('짧은 비밀번호를 거부한다', () => {
    expect(loginInput.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(false);
  });
});

describe('errorStatus', () => {
  it('모든 에러 코드에 상태가 있다', () => {
    for (const code of errorCode.options) expect(errorStatus[code]).toBeGreaterThanOrEqual(400);
  });
});
