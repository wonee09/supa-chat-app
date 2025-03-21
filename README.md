# Supabase 실시간 채팅 앱

Supabase의 Realtime 기능을 활용하여 만든 실시간 채팅 애플리케이션입니다. 사용자는 회원가입과 로그인을 통해 채팅방에 참여할 수 있으며, 메시지를 실시간으로 주고받을 수 있습니다.

## 주요 기능

- 사용자 인증 (회원가입/로그인)
- 실시간 메시지 전송 및 수신
- 사용자 프로필 표시
- 모바일 반응형 디자인

## 기술 스택

- Next.js (React 프레임워크)
- TypeScript
- Tailwind CSS (스타일링)
- Supabase (백엔드 서비스)
  - 인증
  - 데이터베이스
  - Realtime 기능

## 설치 및 실행 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/supabase-chat-app.git
cd supabase-chat-app
```

2. 의존성 설치

```bash
npm install
```

3. Supabase 계정 및 프로젝트 생성

- [Supabase](https://supabase.com/)에 가입하고 새 프로젝트를 생성합니다.
- SQL 에디터에서 `supabase.sql` 파일의 내용을 실행하여 필요한 테이블과 보안 정책을 설정합니다.
- 프로젝트의 URL과 익명 키를 복사합니다.

4. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 연결 정보를 추가합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. 개발 서버 실행

```bash
npm run dev
```

6. 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

## 프로젝트 구조

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # 메인 페이지
│   │   ├── layout.tsx        # 레이아웃 컴포넌트
│   │   └── globals.css       # 전역 스타일
│   ├── components/
│   │   ├── Auth.tsx          # 인증 컴포넌트
│   │   └── Chat.tsx          # 채팅 컴포넌트
│   ├── lib/
│   │   └── supabase.ts       # Supabase 클라이언트
│   └── types/
│       └── index.ts          # 타입 정의
├── supabase.sql              # Supabase DB 설정 SQL
└── ...
```

## Supabase 설정

애플리케이션이 작동하기 위해 Supabase 프로젝트에서 다음 설정이 필요합니다:

1. 인증 서비스 활성화

   - 이메일/비밀번호 로그인 활성화

2. 데이터베이스 테이블 및 보안 정책 설정

   - `supabase.sql` 파일의 내용을 SQL 에디터에서 실행

3. Realtime 기능 활성화
   - 프로젝트 설정에서 Realtime 기능 활성화
   - 메시지 테이블에 대한 Realtime 설정 확인

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.
