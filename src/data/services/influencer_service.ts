import { supabase } from '../../lib/supabase';
import type { Influencer } from '../models/m_influencer';

export const InfluencerService = {
    /**
     * 특정 지역(Province + District)의 인플루언서 목록을 좋아요 순으로 가져옵니다.
     * @param provinceId 광역 자치단체 ID (예: 'seoul')
     * @param districtId 기초 자치단체 ID (예: 'gangnam')
     */
    async fetchInfluencersByRegion(provinceId: string, districtId: string): Promise<Influencer[]> {
        try {
            const regionId = `${provinceId}_${districtId}`;
            console.log('Fetching influencers for regionId:', regionId);
            const { data, error } = await supabase
                .from('influencers') // corrected table name
                .select('*')
                .eq('region_id', regionId)
                .order('like_count', { ascending: false });
            console.log('Fetched count:', data?.length ?? 0);

            if (error) {
                console.error('Error fetching influencers:', error);
                return [];
            }

            return data as Influencer[];
        } catch (e) {
            console.error('Unexpected error:', e);
            return [];
        }
    },

    /**
     * 전체 인플루언서 목록을 가져옵니다 (테스트용)
     */
    async fetchAllInfluencers(): Promise<Influencer[]> {
        const { data, error } = await supabase
            .from('influencer')
            .select('*')
            .order('like_count', { ascending: false })
            .limit(20);

        if (error) return [];
        return data as Influencer[];
    }
};
