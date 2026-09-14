import { z } from 'zod';

import { isoDate, isoDateTime, uuidV7, withSyncColumns } from '../base.js';
import { paletteKey } from '../categories/index.js';
import { cursorQuery } from '../pagination.js';

/**
 * 가계부 (계획 C.2). 금액은 통화 최소 단위의 정수(KRW 원), float 금지. 잔액은 거래 합산으로 서버가 계산한다.
 * 용어: 가계부 "분류"(ledgerCategory)는 항목 "카테고리"와 다른 개념·다른 단어.
 */
/** ISO 4217 (예: KRW, USD) */
export const currencyCode = z.string().regex(/^[A-Z]{3}$/);
export type CurrencyCode = z.infer<typeof currencyCode>;
export const DEFAULT_CURRENCY = 'KRW' as const;

/** 최소 단위 정수 금액. 양수만(부호는 type 이 정한다). */
export const amountMinor = z.number().int().positive();
/** 부호 있는 합계 (순액 등) */
export const signedAmountMinor = z.number().int();

// ─────────────────────────────── 계좌 ───────────────────────────────
export const accountType = z.enum([
  'cash',
  'checking',
  'credit_card',
  'bank',
  'investment',
  'other',
]);
export type AccountType = z.infer<typeof accountType>;

export const accountRow = withSyncColumns({
  name: z.string().trim().min(1).max(60),
  type: accountType,
  currency: currencyCode,
  /** 개설 시점 잔액(최소 단위, 부호 가능 — 신용카드는 음수일 수 있다) */
  initialBalance: signedAmountMinor,
  sortOrder: z.number().int(),
  archived: z.boolean(),
  memo: z.string().max(500).nullable(),
});
export type AccountRow = z.infer<typeof accountRow>;

export const accountCreate = accountRow
  .pick({
    id: true,
    name: true,
    type: true,
    currency: true,
    initialBalance: true,
    sortOrder: true,
    archived: true,
    memo: true,
  })
  .partial({ currency: true, initialBalance: true, sortOrder: true, archived: true, memo: true });
export type AccountCreate = z.infer<typeof accountCreate>;
export const accountPatch = accountCreate.omit({ id: true }).partial();
export type AccountPatch = z.infer<typeof accountPatch>;

/** 계좌 + 서버 계산 잔액 */
export const accountWithBalance = accountRow.extend({ balance: signedAmountMinor });
export type AccountWithBalance = z.infer<typeof accountWithBalance>;

// ─────────────────────────────── 분류 ───────────────────────────────
export const ledgerCategoryKind = z.enum(['expense', 'income']);
export type LedgerCategoryKind = z.infer<typeof ledgerCategoryKind>;

export const ledgerCategoryRow = withSyncColumns({
  name: z.string().trim().min(1).max(60),
  kind: ledgerCategoryKind,
  icon: z.string().max(40).nullable(),
  color: paletteKey,
  /** 1단계 부모 (부모의 kind 와 같아야 한다) */
  parentId: uuidV7.nullable(),
  sortOrder: z.number().int(),
});
export type LedgerCategoryRow = z.infer<typeof ledgerCategoryRow>;

export const ledgerCategoryCreate = ledgerCategoryRow
  .pick({
    id: true,
    name: true,
    kind: true,
    icon: true,
    color: true,
    parentId: true,
    sortOrder: true,
  })
  .partial({ icon: true, color: true, parentId: true, sortOrder: true });
export type LedgerCategoryCreate = z.infer<typeof ledgerCategoryCreate>;
export const ledgerCategoryPatch = ledgerCategoryCreate.omit({ id: true, kind: true }).partial();
export type LedgerCategoryPatch = z.infer<typeof ledgerCategoryPatch>;

export const ledgerCategoryListQuery = z.object({ kind: ledgerCategoryKind.optional() });
export type LedgerCategoryListQuery = z.infer<typeof ledgerCategoryListQuery>;

// ─────────────────────────────── 거래 ───────────────────────────────
export const transactionType = z.enum(['expense', 'income', 'transfer']);
export type TransactionType = z.infer<typeof transactionType>;
/** 반복 규칙이 만든 거래는 승인 대기(pending)일 수 있다. 집계는 confirmed 만 */
export const transactionStatus = z.enum(['confirmed', 'pending']);
export type TransactionStatus = z.infer<typeof transactionStatus>;
export const transactionSource = z.enum(['manual', 'recurring', 'import', 'sync']);
export type TransactionSource = z.infer<typeof transactionSource>;

const transactionShape = {
  type: transactionType,
  status: transactionStatus,
  amount: amountMinor,
  currency: currencyCode,
  accountId: uuidV7,
  /** 이체의 상대 계좌 (이체가 아니면 null) */
  counterAccountId: uuidV7.nullable(),
  /** 가계부 분류 (이체는 null) */
  ledgerCategoryId: uuidV7.nullable(),
  occurredOn: isoDate,
  occurredAt: isoDateTime.nullable(),
  memo: z.string().trim().max(500).nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
  recurringRuleId: uuidV7.nullable(),
  source: transactionSource,
  externalRef: z.string().max(200).nullable(),
  goalId: uuidV7.nullable(),
  eventId: uuidV7.nullable(),
};

/** 이체 규칙: 상대 계좌 필수·자기 계좌와 다름·분류 없음. 그 외는 상대 계좌 없음 */
type TransferFields = {
  type: TransactionType;
  accountId?: string | undefined;
  counterAccountId?: string | null | undefined;
  ledgerCategoryId?: string | null | undefined;
};
const refineTransfer = (v: TransferFields, ctx: z.RefinementCtx) => {
  if (v.type === 'transfer') {
    if (!v.counterAccountId)
      ctx.addIssue({
        code: 'custom',
        path: ['counterAccountId'],
        message: '이체는 상대 계좌가 필요합니다',
      });
    else if (v.counterAccountId === v.accountId)
      ctx.addIssue({
        code: 'custom',
        path: ['counterAccountId'],
        message: '상대 계좌는 출금 계좌와 달라야 합니다',
      });
    if (v.ledgerCategoryId)
      ctx.addIssue({
        code: 'custom',
        path: ['ledgerCategoryId'],
        message: '이체에는 분류를 붙이지 않습니다',
      });
  } else if (v.counterAccountId) {
    ctx.addIssue({
      code: 'custom',
      path: ['counterAccountId'],
      message: '이체가 아니면 상대 계좌를 비웁니다',
    });
  }
};

export const transactionRow = withSyncColumns(transactionShape).superRefine(refineTransfer);
export type TransactionRow = z.infer<typeof transactionRow>;

export const transactionCreate = z
  .object({
    id: uuidV7,
    ...transactionShape,
  })
  .partial({
    status: true,
    currency: true,
    counterAccountId: true,
    ledgerCategoryId: true,
    occurredAt: true,
    memo: true,
    tags: true,
    recurringRuleId: true,
    source: true,
    externalRef: true,
    goalId: true,
    eventId: true,
  })
  .superRefine(refineTransfer);
export type TransactionCreate = z.infer<typeof transactionCreate>;

/** merge-patch. 이체 규칙은 서버가 병합 결과에 다시 적용한다 */
export const transactionPatch = z
  .object({
    type: transactionType,
    status: transactionStatus,
    amount: amountMinor,
    currency: currencyCode,
    accountId: uuidV7,
    counterAccountId: uuidV7.nullable(),
    ledgerCategoryId: uuidV7.nullable(),
    occurredOn: isoDate,
    occurredAt: isoDateTime.nullable(),
    memo: z.string().trim().max(500).nullable(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10),
    goalId: uuidV7.nullable(),
    eventId: uuidV7.nullable(),
  })
  .partial();
export type TransactionPatch = z.infer<typeof transactionPatch>;

export const transactionListQuery = cursorQuery.extend({
  from: isoDate.optional(),
  to: isoDate.optional(),
  accountId: uuidV7.optional(),
  ledgerCategoryId: uuidV7.optional(),
  type: transactionType.optional(),
  status: transactionStatus.optional(),
  /** 메모·태그 검색 */
  q: z.string().trim().min(1).max(100).optional(),
  tag: z.string().trim().min(1).max(30).optional(),
  goalId: uuidV7.optional(),
});
export type TransactionListQuery = z.infer<typeof transactionListQuery>;

// ─────────────────────────────── 예산 ───────────────────────────────
/** YYYY-MM */
export const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const budgetRow = withSyncColumns({
  month: yearMonth,
  /** null = 전체 지출 예산 */
  ledgerCategoryId: uuidV7.nullable(),
  amount: amountMinor,
  currency: currencyCode,
  /** 남은 금액을 다음 달로 이월 */
  carryOver: z.boolean(),
});
export type BudgetRow = z.infer<typeof budgetRow>;
export const budgetCreate = budgetRow
  .pick({
    id: true,
    month: true,
    ledgerCategoryId: true,
    amount: true,
    currency: true,
    carryOver: true,
  })
  .partial({ ledgerCategoryId: true, currency: true, carryOver: true });
export type BudgetCreate = z.infer<typeof budgetCreate>;
export const budgetPatch = budgetCreate
  .omit({ id: true, month: true, ledgerCategoryId: true })
  .partial();
export type BudgetPatch = z.infer<typeof budgetPatch>;
export const budgetListQuery = z.object({ month: yearMonth });
export type BudgetListQuery = z.infer<typeof budgetListQuery>;

/** 예산 + 그 달 지출(confirmed) 소진 */
export const budgetWithSpent = budgetRow.extend({
  spent: amountMinor.or(z.literal(0)),
  /** 이월 포함 실제 한도 */
  effectiveAmount: signedAmountMinor,
});
export type BudgetWithSpent = z.infer<typeof budgetWithSpent>;

// ─────────────────────────────── 반복 거래 ───────────────────────────────
/** 반복 규칙이 만들 거래의 틀 (발생일·id 는 회차마다 서버가 정한다) */
export const transactionTemplate = z
  .object({
    type: transactionType,
    amount: amountMinor,
    currency: currencyCode.default(DEFAULT_CURRENCY),
    accountId: uuidV7,
    counterAccountId: uuidV7.nullable().default(null),
    ledgerCategoryId: uuidV7.nullable().default(null),
    memo: z.string().trim().max(500).nullable().default(null),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  })
  .superRefine(refineTransfer);
export type TransactionTemplate = z.infer<typeof transactionTemplate>;

export const recurringRuleRow = withSyncColumns({
  /** RFC 5545 RRULE (DTSTART 없이, 사용자 timezone 의 date 단위로 전개) */
  rrule: z.string().min(1).max(500),
  startDate: isoDate,
  endDate: isoDate.nullable(),
  template: transactionTemplate,
  /** true = 회차마다 confirmed 거래 생성, false = pending 으로 만들어 승인 대기 */
  autoConfirm: z.boolean(),
  /** 다음에 만들 회차 (서버 계산, 끝나면 null) */
  nextDate: isoDate.nullable(),
  paused: z.boolean(),
});
export type RecurringRuleRow = z.infer<typeof recurringRuleRow>;
export const recurringRuleCreate = recurringRuleRow
  .pick({
    id: true,
    rrule: true,
    startDate: true,
    endDate: true,
    template: true,
    autoConfirm: true,
    paused: true,
  })
  .partial({ endDate: true, autoConfirm: true, paused: true });
export type RecurringRuleCreate = z.infer<typeof recurringRuleCreate>;
export const recurringRulePatch = z
  .object({
    rrule: z.string().min(1).max(500),
    startDate: isoDate,
    endDate: isoDate.nullable(),
    template: transactionTemplate,
    autoConfirm: z.boolean(),
    paused: z.boolean(),
  })
  .partial();
export type RecurringRulePatch = z.infer<typeof recurringRulePatch>;

// ─────────────────────────────── 집계 ───────────────────────────────
export const ledgerGroupBy = z.enum(['day', 'category', 'account']);
export type LedgerGroupBy = z.infer<typeof ledgerGroupBy>;

export const ledgerSummaryQuery = z.object({
  from: isoDate,
  to: isoDate,
  groupBy: ledgerGroupBy.default('day'),
  accountId: uuidV7.optional(),
});
export type LedgerSummaryQuery = z.infer<typeof ledgerSummaryQuery>;

/** 그룹 키: day → YYYY-MM-DD, category → 분류 id 또는 '' (미분류), account → 계좌 id */
export const ledgerSummaryGroup = z.object({
  key: z.string(),
  income: signedAmountMinor,
  expense: signedAmountMinor,
  net: signedAmountMinor,
  count: z.number().int().nonnegative(),
});
export const ledgerSummary = z.object({
  from: isoDate,
  to: isoDate,
  currency: currencyCode,
  groupBy: ledgerGroupBy,
  income: signedAmountMinor,
  expense: signedAmountMinor,
  net: signedAmountMinor,
  groups: z.array(ledgerSummaryGroup),
});
export type LedgerSummary = z.infer<typeof ledgerSummary>;
