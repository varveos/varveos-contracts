import { z } from 'zod';

import { ianaTimezone, isoDateTime } from './base.js';
import { eventRow } from './calendar/index.js';
import { categoryRow } from './categories/index.js';
import { goalRow, habitCheckRow, habitRow, milestoneRow } from './goals/index.js';
import {
  accountRow,
  budgetRow,
  ledgerCategoryRow,
  recurringRuleRow,
  transactionRow,
} from './ledger/index.js';
import { noteRow } from './notes/index.js';
import { recordRow, trackerRow } from './records/index.js';
import { taskRow } from './tasks/index.js';
import { userRow, viewSettings } from './users/index.js';

/**
 * 데이터 내보내기 봉투 `varveos-export-v1` (개인정보 이동권, 계획 R6/§3.4).
 * 모듈이 늘면 배열 필드를 추가한다(하위 호환 유지). 가져오기는 2차.
 */
export const EXPORT_VERSION = 'varveos-export-v1' as const;

export const exportEnvelope = z.object({
  version: z.literal(EXPORT_VERSION),
  exportedAt: isoDateTime,
  timezone: ianaTimezone,
  user: userRow,
  views: viewSettings,
  categories: z.array(categoryRow),
  tasks: z.array(taskRow),
  accounts: z.array(accountRow),
  ledgerCategories: z.array(ledgerCategoryRow),
  transactions: z.array(transactionRow),
  budgets: z.array(budgetRow),
  recurringRules: z.array(recurringRuleRow),
  /** 일정: 단발·반복 마스터·회차 예외 행 그대로 (전개하지 않음) */
  events: z.array(eventRow),
  /** 노트 본문은 Tiptap JSON */
  notes: z.array(noteRow),
  goals: z.array(goalRow),
  milestones: z.array(milestoneRow),
  habits: z.array(habitRow),
  habitChecks: z.array(habitCheckRow),
  trackers: z.array(trackerRow),
  records: z.array(recordRow),
});
export type ExportEnvelope = z.infer<typeof exportEnvelope>;
