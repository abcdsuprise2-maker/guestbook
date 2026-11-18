-- 방명록: 누구나 읽고 쓸 수 있지만, 고치거나 지울 수는 없다.
create table public.guestbook (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 20),
  message text not null check (char_length(btrim(message)) between 1 and 300),
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;

create policy "anyone can read" on public.guestbook
  for select to anon, authenticated using (true);

create policy "anyone can write" on public.guestbook
  for insert to anon, authenticated with check (true);

-- update/delete 정책이 없으므로 방문자는 수정·삭제 불가
grant select, insert on public.guestbook to anon, authenticated;
revoke update, delete, truncate on public.guestbook from anon, authenticated;

-- 스팸 방지: 1분에 10개 넘게, 또는 같은 내용을 10분 안에 다시 쓰면 거절
create function public.guestbook_throttle() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  if (select count(*) from public.guestbook where created_at > now() - interval '1 minute') >= 10 then
    raise exception '잠시 후 다시 시도해 주세요';
  end if;
  if exists (select 1 from public.guestbook
             where message = new.message and created_at > now() - interval '10 minutes') then
    raise exception '같은 내용이 이미 등록됐어요';
  end if;
  return new;
end $$;

create trigger guestbook_throttle before insert on public.guestbook
  for each row execute function public.guestbook_throttle();
