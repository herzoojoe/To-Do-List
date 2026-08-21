# To-Do List

매일 10~20개 수준의 할 일을 관리하는 개인용 To-Do 앱. 순수 HTML/CSS/JavaScript로 만들어졌으며 별도 설치나 빌드 없이 바로 실행할 수 있습니다.

이 프로젝트에는 두 가지 버전이 들어 있습니다.

| 버전 | 위치 | 설명 |
|---|---|---|
| **To-Do List** | 프로젝트 루트 | 카테고리·다크모드·진행률까지 갖춘 완성형 버전 |
| **My Tasks** | [`basic/`](basic/) | 기본 구조부터 단계적으로 기능을 쌓아 올린 버전 (카테고리, 진행률 대시보드, 다크모드, 접근성/반응형까지 포함) |

두 버전 모두 기능은 거의 동등하지만 코드 구조와 데이터 모델이 서로 다른 별도의 앱입니다.

## 주요 기능

- 할 일 추가 / 수정 / 삭제
- 완료 체크 (완료 시 취소선)
- 카테고리 분류 (업무 / 개인 / 공부) 및 필터링
- 진행률 표시 (완료 개수 / 전체 개수, %) — `basic/`은 카테고리별 진행률 대시보드까지 제공
- `localStorage` 기반 데이터 저장 — 새로고침해도 목록 유지
- 다크 모드 (시스템 설정 자동 감지 + 수동 토글, 선택값 저장)
- `basic/`은 항목별 생성 시간 표시("N분 전" 등, 자동 갱신), 완료 항목 자동 하단 정렬, 접근성(`aria-label`, 포커스 표시)과 모바일 반응형 레이아웃까지 포함

자세한 요구사항은 [PRD.md](PRD.md)(루트 버전) / [basic/PRD.md](basic/PRD.md)(My Tasks 버전) 참고.

## 실행 방법

⚠️ **`index.html` 파일을 더블클릭해서 `file://`로 직접 열지 마세요.** 브라우저 정책상 CSS/JS 로드나 `localStorage` 접근이 제한되어 스타일이 깨지거나 기능이 정상 동작하지 않을 수 있습니다. 반드시 로컬 서버로 실행하세요.

프로젝트 루트 폴더에서 다음 중 하나를 실행합니다.

```bash
python -m http.server 8080
```

또는 Node.js가 설치되어 있다면:

```bash
npx serve .
```

서버 실행 후 브라우저에서 원하는 버전으로 접속합니다.

```
http://localhost:8080          → To-Do List (루트 버전)
http://localhost:8080/basic/   → My Tasks (basic 버전)
```

## 파일 구성

```
To-Do List/
├── index.html      # To-Do List (루트 버전) 화면 구조
├── style.css       # 스타일 (라이트/다크 테마 포함)
├── script.js       # CRUD, 필터링, 진행률, 테마 전환, localStorage 로직
├── PRD.md          # 제품 요구사항 문서
├── README.md       # 이 문서
└── basic/          # My Tasks (basic 버전)
    ├── index.html  # 화면 구조 (대시보드, 카테고리, 다크모드 토글 포함)
    ├── style.css   # 스타일 (라이트/다크 테마, 반응형 포함)
    └── script.js   # CRUD, 필터링, 대시보드 계산, 테마 전환, localStorage 로직
```

## 데이터 저장

두 버전은 같은 origin(`localhost:8080`)을 공유해도 서로 다른 `localStorage` 키를 사용하므로 데이터가 섞이지 않습니다.

**To-Do List (루트 버전)**

- 할 일 목록: `todos` 키에 `{ id, text, category, completed, createdAt }` 형태의 JSON 배열로 저장
- 테마 설정: `theme` 키에 `"light"` 또는 `"dark"`로 저장 (없으면 시스템 설정을 따름)

**My Tasks (`basic/` 버전)**

- 할 일 목록: `basic_todos` 키에 `{ id, text, completed, category, createdAt }` 형태의 JSON 배열로 저장
- 필터 상태: `basic_filter` 키에 `"all" | "work" | "personal" | "study"`로 저장
- 테마 설정: `basic_theme` 키에 `"light"` 또는 `"dark"`로 저장 (없으면 시스템 설정을 따름)

서버 외 백엔드가 없으므로 브라우저(같은 origin)를 벗어나면 데이터가 공유되지 않습니다.
