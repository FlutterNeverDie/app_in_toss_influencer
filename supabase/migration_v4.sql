-- 1. influencer_likes 테이블 생성
CREATE TABLE IF NOT EXISTS public.influencer_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.member(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES public.influencer(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    -- 한 명의 유저가 한 명의 인플루언서에게 한 번만 좋아요 가능
    UNIQUE(member_id, influencer_id)
);

-- 2. RLS 설정
ALTER TABLE public.influencer_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" 
    ON public.influencer_likes FOR SELECT 
    USING (true);

CREATE POLICY "Users can toggle their own likes" 
    ON public.influencer_likes FOR ALL 
    USING (auth.uid() = member_id)
    WITH CHECK (auth.uid() = member_id);

-- 3. like_count 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_influencer_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.influencer
        SET like_count = like_count + 1
        WHERE id = NEW.influencer_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.influencer
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.influencer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 설정
DROP TRIGGER IF EXISTS tr_update_influencer_like_count ON public.influencer_likes;
CREATE TRIGGER tr_update_influencer_like_count
AFTER INSERT OR DELETE ON public.influencer_likes
FOR EACH ROW EXECUTE FUNCTION update_influencer_like_count();
