# varveos-contracts

`@varveos/contracts` — 모든 varveos 레포가 공유하는 zod 스키마·TypeScript 타입·에러 코드·엔드포인트 경로 상수. 서버(요청 검증)와 클라이언트(폼·응답 파싱)의 단일 진실 원천. 공개 npm 패키지.

## 실행

```bash
mise install            # Node 24, pnpm 10
pnpm install
pnpm check              # lint + typecheck + test + build (CI와 동일)
pnpm build              # tsup → dist (esm + cjs + d.ts)
pnpm changeset          # 변경 기록 (minor = 필드 추가, major = 제거/의미 변경)
```

## 규약 (전 레포 공통)

- 브랜치: `develop`에서 개발, `main`은 릴리스 태그 전용. 커밋은 `type(scope): 한글 내용`, scope 필수(`commitlint.config.mjs`의 목록). 도구 서명 트레일러 금지.
- 계층 규칙과 생성기(`pnpm gen`)는 종합 계획 §11을 따른다. 손으로 모듈·컴포넌트 파일을 만들지 않는다.
- 설정은 env만(`VARVEOS_*`), 값은 zod 스키마에서만 읽는다. 하드코딩 금지.
- 문자열·색·크기는 각각 i18n 메시지·디자인 토큰에서만 온다.
- 결정 기록: `docs/adr/`. 규약을 바꾸려면 ADR을 먼저 쓴다.

## 이 레포의 규약

- 런타임 의존성은 `zod`만. 다른 패키지 import 금지.
- 타입은 스키마에서 `z.infer`로만 파생. 수동 interface 금지.
- 모듈 폴더 = `src/<module>/{row,create,patch}.ts`, `patch = create.partial()`. `pnpm gen schema <name>`으로 생성.
- 모든 사용자 소유 엔티티는 `src/base.ts`의 `syncColumns`를 확장한다.
- 필드 제거는 `@deprecated` 1 minor 유지 후 major에서.

## 금지

- 다른 프로젝트 코드를 참고·복사하지 않는다.
- `any`, 인라인 `style`, 임의 hex/px, WIP 커밋, 모듈 간 직접 import.
