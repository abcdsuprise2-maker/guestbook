# 자기소개 + 방명록

강의 실습: GitHub(코드) · Vercel(배포) · Supabase(방명록 DB).

- `index.html`, `style.css`, `app.js` — 정적 페이지 (빌드 없음)
- `config.js` — Supabase 주소와 공개용(publishable) 키
- `supabase/migrations/` — 방명록 테이블과 보안 규칙(읽기·쓰기만 허용, 수정·삭제 불가, 도배 방지)

DB 변경: `supabase db push --remote`
배포: `vercel --prod`
