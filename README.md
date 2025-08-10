# 실버리드(Silver Read) — 원페이지 1분 읽기

시니어 친화적 원페이지 웹앱으로, 하루 1분 읽기 · 이해도 퀴즈 · 즉시 피드백을 제공합니다.

## 구조
- `PRD_Silver_Read_OnePage.md`: 병합 PRD
- `ROADMAP.md`: 개발 로드맵
- `web/`: 정적 원페이지 앱(HTML/CSS/JS)
- `netlify.toml`, `netlify/functions/`: Netlify 배포 및 서버리스 함수

## 로컬 실행
정적 파일이라 간단 서버가 필요합니다(클립보드/tts 등 보안 정책 호환).

- Node가 있으면:
  ```bash
  npx serve web -p 5173 --single
  ```
- Python이 있으면:
  ```bash
  python -m http.server 5173 -d web
  ```
브라우저에서 `http://localhost:5173` 접속.

## 배포(Netlify)
1) GitHub 원격 저장소에 푸시한 뒤 Netlify에서 “Git에서 새 사이트”로 연결하세요.

- Publish directory: `web`
- Build command: 비움(정적)
- Functions directory: `netlify/functions` (자동 인식)
- 환경변수(추가 예정): `GEMINI_API_KEY`

2) 서버리스 함수 `generate-quiz`는 `GEMINI_API_KEY`가 없으면 내장 규칙으로 퀴즈를 생성합니다. 키가 있으면 Gemini 1.5 Flash REST API로 JSON 형식 문항을 요청합니다.

## Git 푸시(사용자 규칙 반영)
원격 저장소 URL은 사용 중인 리포지토리로 교체하세요.

```bash
git init
git add .
git commit -m "feat: Silver Read one-page MVP scaffold"
git branch -M main
git remote add origin <YOUR_REMOTE_URL>
git push -u origin main
```

푸시 후 Netlify에 연동하면 자동 배포가 진행됩니다.

## 차기 작업
- Gemini 기반 문항/채점 고도화, 카카오 공유 SDK, 접근성 개선, 뉴스 자동 선정


