/** API 경로 상수. 서버 라우트 prefix와 클라이언트 호출이 같은 값을 쓴다. */
export const API_VERSION = 'v1' as const;

export const paths = {
  meta: '/v1/meta',
  auth: {
    register: '/v1/auth/register',
    login: '/v1/auth/login',
    refresh: '/v1/auth/refresh',
    logout: '/v1/auth/logout',
    exchange: '/v1/auth/exchange',
    appleNative: '/v1/auth/apple/native',
    sessions: '/v1/auth/sessions',
    revokeAll: '/v1/auth/sessions/revoke-all',
    whoami: '/v1/auth/whoami',
    verifyEmailRequest: '/v1/auth/verify-email/request',
    verifyEmail: '/v1/auth/verify-email',
    passwordForgot: '/v1/auth/password/forgot',
    passwordReset: '/v1/auth/password/reset',
    passwordChange: '/v1/auth/password/change',
    oauthStart: (provider: 'google' | 'apple') => `/v1/auth/${provider}/start`,
    oauthCallback: (provider: 'google' | 'apple') => `/v1/auth/${provider}/callback`,
  },
  users: {
    me: '/v1/users/me',
    views: '/v1/users/me/views',
    export: '/v1/users/me/export',
    deletionCancel: '/v1/users/me/deletion/cancel',
  },
  pat: '/v1/pat',
  /** 토큰 사용 기록 (최근 100건, 세션 전용) */
  patAudit: (id: string) => `/v1/pat/${id}/audit`,
  categories: '/v1/categories',
  tasks: '/v1/tasks',
  devices: '/v1/devices',
  events: '/v1/calendar/events',
  ledger: {
    accounts: '/v1/ledger/accounts',
    /** 가계부 "분류" (항목 카테고리와 다른 개념) */
    categories: '/v1/ledger/categories',
    transactions: '/v1/ledger/transactions',
    /** 승인 대기(pending) 거래 확정 */
    transactionConfirm: (id: string) => `/v1/ledger/transactions/${id}/confirm`,
    budgets: '/v1/ledger/budgets',
    recurringRules: '/v1/ledger/recurring-rules',
    /** ?from&to&groupBy=day|category|account — confirmed 거래만, 이체 제외 */
    summary: '/v1/ledger/summary',
  },
  notes: '/v1/notes',
  /** 통합 검색 ?q=&types=&limit= */
  search: '/v1/search',
  goals: '/v1/goals',
  /** 목표의 마일스톤 */
  goalMilestones: (goalId: string) => `/v1/goals/${goalId}/milestones`,
  /** 목표 진행률(서버 집계) */
  goalProgress: (goalId: string) => `/v1/goals/${goalId}/progress`,
  habits: '/v1/habits',
  /** 습관 체크: GET ?from&to · PUT { date, value } (0 이면 해제) */
  habitChecks: (habitId: string) => `/v1/habits/${habitId}/checks`,
  habitStats: (habitId: string) => `/v1/habits/${habitId}/stats`,
  trackers: '/v1/trackers',
  trackerSummary: (trackerId: string) => `/v1/trackers/${trackerId}/summary`,
  records: '/v1/records',
  /** 그 날짜의 일별 노트 (없으면 404 — 클라이언트가 kind=daily 로 만든다) */
  noteDaily: (date: string) => `/v1/notes/daily/${date}`,
  /** soft delete 된 일정 복구 (삭제 토스트의 되돌리기). 마스터면 함께 지운 예외 회차도 살린다 */
  eventRestore: (id: string) => `/v1/calendar/events/${id}/restore`,
  integrations: {
    /** 서버가 켜 둔 커넥터 목록 */
    providers: '/v1/integrations/providers',
    connections: '/v1/integrations/connections',
    connection: (id: string) => `/v1/integrations/connections/${id}`,
    connectionSources: (id: string) => `/v1/integrations/connections/${id}/sources`,
    /** 모든 켜진 소스를 지금 당겨온다 (큐) */
    connectionSync: (id: string) => `/v1/integrations/connections/${id}/sync`,
    source: (id: string) => `/v1/integrations/sources/${id}`,
    /** ?redirectUri= → { url }. 세션 전용 */
    connectStart: (provider: string) => `/v1/integrations/connect/${provider}/start`,
    connectCallback: (provider: string) => `/v1/integrations/connect/${provider}/callback`,
    /** 프로바이더 웹훅 수신 (인증 없음, 채널 토큰으로 검증) */
    webhook: (provider: string) => `/v1/integrations/webhooks/${provider}`,
    /** ICS 구독 연결 (POST { url, name? }) */
    connectIcs: '/v1/integrations/connect/ics',
    /** CalDAV 연결 (POST { serverUrl, username, password, name? }) */
    connectCaldav: '/v1/integrations/connect/caldav',
    /** 카테고리별 비공개 ICS 피드 관리 */
    icsFeeds: '/v1/integrations/ics-feeds',
    icsFeed: (id: string) => `/v1/integrations/ics-feeds/${id}`,
    /** 공개 피드 URL (토큰이 곧 비밀, 인증 없음) */
    icsFeedFile: (token: string) => `/v1/integrations/ics/${token}.ics`,
  },
} as const;
