-- regions 테이블: 행정구역 정보
CREATE TABLE regions (
  id TEXT PRIMARY KEY, -- e.g., 'seoul_gangnam', 'busan_haeundae'
  parent_id TEXT, -- 광역시/도 ID (광역시의 경우 null)
  name TEXT NOT NULL, -- 행정구역 이름
  group_type TEXT NOT NULL CHECK (group_type IN ('A', 'B', 'C')), -- Group A, B, C 구분
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- influencers 테이블: 인플루언서 정보
CREATE TABLE influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_id TEXT NOT NULL, -- 원본 인스타 ID
  image_url TEXT, -- 인스타 CDN 이미지 URL
  region_id TEXT REFERENCES regions(id), -- 소속 지역 ID
  like_count INTEGER DEFAULT 0, -- 랭킹용 좋아요 수
  is_active BOOLEAN DEFAULT true, -- 노출 여부 (관리자 승인용)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX idx_influencers_region_id ON influencers(region_id);
CREATE INDEX idx_influencers_like_count ON influencers(like_count DESC);
