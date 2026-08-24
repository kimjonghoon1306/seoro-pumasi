-- 서로품앗이 확장 기능: 알림 · 월드 게시판 · 채팅 · 출석 · 신고/차단
-- Supabase SQL Editor에서 1회 실행합니다. 기존 테이블은 변경하지 않습니다.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  world text not null check (world in ('experience','publish','partner','farm')),
  title text not null check (char_length(title) between 2 and 100),
  content text not null check (char_length(content) between 2 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.mission_messages (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  checked_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique(user_id, checked_on)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('mission','post','user','message')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 2 and 500),
  status text not null default 'pending' check (status in ('pending','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique(reporter_id, target_type, target_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id),
  check(blocker_id <> blocked_id)
);

alter table public.notifications enable row level security;
alter table public.community_posts enable row level security;
alter table public.mission_messages enable row level security;
alter table public.checkins enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

create policy "own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "read community posts" on public.community_posts for select to authenticated using (true);
create policy "create own post" on public.community_posts for insert with check (auth.uid() = author_id);
create policy "delete own post" on public.community_posts for delete using (auth.uid() = author_id);
create policy "read related mission messages" on public.mission_messages for select using (
  exists(select 1 from public.missions m where m.id = mission_id and m.owner_id = auth.uid())
  or exists(select 1 from public.completions c where c.mission_id = mission_id and c.user_id = auth.uid())
);
create policy "create related mission message" on public.mission_messages for insert with check (
  auth.uid() = sender_id and (
    exists(select 1 from public.missions m where m.id = mission_id and m.owner_id = auth.uid())
    or exists(select 1 from public.completions c where c.mission_id = mission_id and c.user_id = auth.uid())
  )
);
create policy "own checkins" on public.checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "create own report" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "read own reports" on public.reports for select using (auth.uid() = reporter_id);
create policy "own blocks" on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists posts_world_created_idx on public.community_posts(world, created_at desc);
create index if not exists messages_mission_created_idx on public.mission_messages(mission_id, created_at);
create index if not exists reports_status_created_idx on public.reports(status, created_at desc);

-- 인증 결과가 바뀌면 참여자에게 자동 알림
create or replace function public.notify_completion_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status in ('approved', 'rejected') then
    insert into public.notifications(user_id, title, body, link)
    values (
      new.user_id,
      case when new.status = 'approved' then '인증이 승인됐어요!' else '인증을 다시 확인해 주세요' end,
      case when new.status = 'approved' then '포인트가 지급됐습니다.' else '내역을 확인하고 다시 참여해 주세요.' end,
      '/mypage'
    );
  end if;
  return new;
end $$;
drop trigger if exists completion_status_notification on public.completions;
create trigger completion_status_notification after update of status on public.completions
for each row execute function public.notify_completion_status();
