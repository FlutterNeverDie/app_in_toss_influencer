-- 1. Member 테이블 생성 (토스 유저 정보 동기화용)
create table if not exists public.member (
  id uuid primary key default auth.uid(), -- Supabase Auth ID와 연동
  toss_id text unique not null,           -- 토스 유저 고유 식별값
  name text,                              -- 유저 이름 (또는 닉네임)
  profile_image text,                     -- 유저 프로필 이미지 URL
  created_at timestamp with time zone default now()
);

-- Member 테이블 RLS 설정
alter table public.member enable row level security;

create policy "Users can view their own profile."
  on public.member for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.member for update
  using ( auth.uid() = id );

-- 2. Influencer 테이블에 Member ID 연결
alter table public.influencer 
add column if not exists member_id uuid references public.member(id);
 
-- 인덱스 추가
create index if not exists idx_influencer_member_id on public.influencer(member_id);

-- 3. RLS 정책 업데이트
-- 본인이 등록한 신청 내역은 본인이 볼 수 있어야 함
create policy "Users can view their own requests."
  on public.influencer for select
  using ( auth.uid() = member_id );
