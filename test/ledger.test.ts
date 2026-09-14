import { describe, expect, it } from 'vitest';

import {
  accountCreate,
  budgetCreate,
  ledgerSummaryQuery,
  recurringRuleCreate,
  transactionCreate,
  transactionListQuery,
  transactionPatch,
} from '../src/index.js';

const A = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8b';
const B = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8c';
const C = '01926f3a-8b1c-7def-8a2b-3c4d5e6f7a8d';

describe('ledger', () => {
  it('계좌 create 는 id·name·type 만 필수', () => {
    expect(accountCreate.safeParse({ id: A, name: '생활비', type: 'checking' }).success).toBe(true);
    expect(accountCreate.safeParse({ id: A, name: '', type: 'checking' }).success).toBe(false);
  });
  it('거래 금액은 최소 단위 양의 정수', () => {
    const base = { id: A, type: 'expense', accountId: B, occurredOn: '2026-09-14' };
    expect(transactionCreate.safeParse({ ...base, amount: 12000 }).success).toBe(true);
    expect(transactionCreate.safeParse({ ...base, amount: 120.5 }).success).toBe(false);
    expect(transactionCreate.safeParse({ ...base, amount: -100 }).success).toBe(false);
    expect(transactionCreate.safeParse({ ...base, amount: 0 }).success).toBe(false);
  });
  it('이체는 상대 계좌 필수·자기 계좌와 다름·분류 없음', () => {
    const t = { id: A, type: 'transfer', amount: 1000, accountId: B, occurredOn: '2026-09-14' };
    expect(transactionCreate.safeParse(t).success).toBe(false);
    expect(transactionCreate.safeParse({ ...t, counterAccountId: B }).success).toBe(false);
    expect(transactionCreate.safeParse({ ...t, counterAccountId: C }).success).toBe(true);
    expect(
      transactionCreate.safeParse({ ...t, counterAccountId: C, ledgerCategoryId: A }).success,
    ).toBe(false);
  });
  it('이체가 아니면 상대 계좌를 비운다', () => {
    expect(
      transactionCreate.safeParse({
        id: A,
        type: 'income',
        amount: 1000,
        accountId: B,
        counterAccountId: C,
        occurredOn: '2026-09-14',
      }).success,
    ).toBe(false);
  });
  it('patch 는 id·source 를 받지 않고 null 로 지움', () => {
    const p = transactionPatch.parse({ ledgerCategoryId: null, memo: null });
    expect(p.ledgerCategoryId).toBeNull();
    expect('id' in transactionPatch.shape).toBe(false);
    expect('source' in transactionPatch.shape).toBe(false);
  });
  it('거래 목록 기본값과 상한', () => {
    expect(transactionListQuery.parse({}).limit).toBe(50);
    expect(transactionListQuery.safeParse({ from: '2026-9-1' }).success).toBe(false);
  });
  it('예산 month 는 YYYY-MM', () => {
    expect(budgetCreate.safeParse({ id: A, month: '2026-09', amount: 500000 }).success).toBe(true);
    expect(budgetCreate.safeParse({ id: A, month: '2026-13', amount: 500000 }).success).toBe(false);
    expect(budgetCreate.safeParse({ id: A, month: '2026-09-01', amount: 1 }).success).toBe(false);
  });
  it('반복 규칙 템플릿은 기본값을 채우고 이체 규칙을 검사한다', () => {
    const r = recurringRuleCreate.parse({
      id: A,
      rrule: 'FREQ=MONTHLY;BYMONTHDAY=25',
      startDate: '2026-09-25',
      template: { type: 'income', amount: 2500000, accountId: B },
    });
    expect(r.template.currency).toBe('KRW');
    expect(r.template.tags).toEqual([]);
    expect(
      recurringRuleCreate.safeParse({
        id: A,
        rrule: 'FREQ=MONTHLY',
        startDate: '2026-09-25',
        template: { type: 'transfer', amount: 1, accountId: B },
      }).success,
    ).toBe(false);
  });
  it('집계 질의는 from·to 필수, groupBy 기본 day', () => {
    expect(ledgerSummaryQuery.parse({ from: '2026-09-01', to: '2026-09-30' }).groupBy).toBe('day');
    expect(ledgerSummaryQuery.safeParse({ from: '2026-09-01' }).success).toBe(false);
  });
});
