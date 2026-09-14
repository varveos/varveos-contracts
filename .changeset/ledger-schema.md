---
'@varveos/contracts': minor
---

가계부 스키마 추가: 계좌(`accountRow`·`accountWithBalance`), 분류(`ledgerCategoryRow`), 거래(`transactionRow`·create·patch·listQuery — 최소 단위 정수 금액, 이체 규칙 refine, pending 상태), 예산(`budgetRow`·`budgetWithSpent`, YYYY-MM), 반복 규칙(`recurringRuleRow`, 거래 템플릿), 집계(`ledgerSummaryQuery`·`ledgerSummary`), `paths.ledger.*`.
