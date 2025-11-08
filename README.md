# Cloud Project Front

React + Vite 기반의 프론트엔드 스타터입니다. Node 25.1.0 / npm 11.6.2 환경에서 동작하도록 구성되어 있으며, 백엔드와는 `axios`로 통신합니다.

## 개발 환경

- Node: 25.1.0 (프로젝트 루트의 `.nvmrc` 참고)
- npm: 11.6.2 (`packageManager` 필드 참조)
- React 19 + Vite 7 + styled-components

## 빠른 시작

```bash
nvm use 25.1.0 # 혹은 `nvm use` (자동으로 .nvmrc 읽음)
npm install
npm run dev
```

## 스크립트

- `npm run dev` : 로컬 개발 서버 (Vite)
- `npm run build` : 프로덕션 번들 생성
- `npm run preview` : 빌드 결과 미리보기
- `npm run lint` : ESLint 검사

## 환경 변수

`.env` (혹은 `.env.local`) 파일에 다음 값을 정의하면 axios 기본 주소를 오버라이드할 수 있습니다.

```
VITE_API_BASE_URL=https://api.example.com
```

## 폴더 구조

```
cloud-project-front
├── public/          # 정적 자산 (favicon 등)
├── src/
│   ├── assets/      # 이미지, 아이콘
│   ├── lib/         # axios 인스턴스 등 공용 유틸
│   ├── App.jsx
│   └── main.jsx
└── .nvmrc           # Node 버전 고정
```
