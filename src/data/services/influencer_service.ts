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
            const { data, error } = await supabase
                .from('influencer')
                .select('*')
                .eq('province_id', provinceId)
                .eq('district_id', districtId)
                .order('like_count', { ascending: false });

            if (error) return [];
            return data as Influencer[];
        } catch (e) {
            return [];
        }
    },

    /**
     * 특정 광역 지역의 모든 인플루언서를 가져옵니다.
     */
    async fetchInfluencersByProvince(provinceId: string): Promise<Influencer[]> {
        try {
            const { data, error } = await supabase
                .from('influencer')
                .select('*')
                .eq('province_id', provinceId)
                .order('like_count', { ascending: false });

            if (error) return [];
            return data as Influencer[];
        } catch (e) {
            return [];
        }
    },

    /**
     * 특정 기초 지역의 모든 인플루언서를 가져옵니다.
     */
    async fetchInfluencersByDistrict(districtId: string): Promise<Influencer[]> {
        try {
            const { data, error } = await supabase
                .from('influencer')
                .select('*')
                .eq('district_id', districtId)
                .order('like_count', { ascending: false });

            if (error) return [];
            return data as Influencer[];
        } catch (e) {
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
            // .eq('status', 'approved')
            .order('like_count', { ascending: false })
            .limit(20);

        if (error) return [];
        return data as Influencer[];
    },

    /**
     * 새로운 인플루언서 등록 신청을 합니다.
     * @param influencer 신청 정보
     */
    async registerInfluencer(influencer: Partial<Influencer>): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('influencer')
                .insert({
                    ...influencer,
                    status: 'pending', // 초기 상태는 항상 대기
                    like_count: 0      // 초기 좋아요는 0
                });

            if (error) {
                console.error('Error registering influencer:', error);
                return false;
            }

            return true;
        } catch (e) {
            console.error('Unexpected error in registerInfluencer:', e);
            return false;
        }
    }
};
