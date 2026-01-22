
-- 1. Status 컬럼 추가 (기존 데이터는 'approved'로 설정)
alter table public.influencer 
add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));

update public.influencer set status = 'approved' where status is null;

-- 2. 인덱스 추가 (조회 속도 향상)
create index if not exists idx_influencer_status on public.influencer(status);

-- 3. RLS 정책 업데이트 (승인된 것만 조회, 누구나 신청 가능)
drop policy if exists "Public influencers are viewable by everyone." on public.influencer;

create policy "Approved influencers are viewable by everyone."
  on public.influencer for select
  using ( status = 'approved' );

create policy "Anyone can insert pending requests."
  on public.influencer for insert
  with check ( status = 'pending' );
