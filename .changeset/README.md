# changesets

스키마를 바꾸면 `pnpm changeset`으로 변경 기록을 남긴다. `minor` = 필드 추가(하위 호환), `major` = 제거·의미 변경, `patch` = 문서·내부.
`main`에 병합되면 릴리스 워크플로가 버전 PR을 만들고, 그 PR이 병합되면 npm에 배포한다.
