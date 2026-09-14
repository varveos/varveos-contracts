---
'@varveos/contracts': patch
---

`viewSettingsPatch` 가 기본값을 주입하지 않도록 수정 — Zod 4 `.partial()` 은 `.default()` 를 유지해 PATCH 로 보낸 필드 외의 값이 기본값으로 덮어써졌다. `ViewSettingsPatch` 타입 export 추가.
