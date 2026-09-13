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
    oauthStart: (provider: 'google' | 'apple') => `/v1/auth/${provider}/start`,
  },
  users: { me: '/v1/users/me', views: '/v1/users/me/views', export: '/v1/users/me/export' },
  pat: '/v1/pat',
  categories: '/v1/categories',
  tasks: '/v1/tasks',
  events: '/v1/calendar/events',
} as const;
