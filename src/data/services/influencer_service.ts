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
            console.log(`[InfluencerService] Fetching influencers for: ${provinceId}, ${districtId}`);
            let { data, error } = await supabase
                .from('influencer')
                .select('*')
                .eq('province_id', provinceId)
                .eq('district_id', districtId)
                .order('like_count', { ascending: false });

            if (error) {
                console.error(`[InfluencerService] Error fetching region ${provinceId}/${districtId}:`, error);
                return [];
            }

            // [DEGUB] 성남시 등 특정 지역 데이터가 조회가 안 되는 경우를 위한 폴백 (ID 불일치 확인용)
            if (data && data.length === 0 && (districtId === 'seongnam' || districtId.includes('성남'))) {
                console.log(`[InfluencerService] No data for ${districtId}. Retrying with loose district_id match...`);
                const { data: fallbackData } = await supabase
                    .from('influencer')
                    .select('*')
                    .ilike('district_id', `%${districtId}%`)
                    .order('like_count', { ascending: false });

                if (fallbackData && fallbackData.length > 0) {
                    console.log(`[InfluencerService] Found ${fallbackData.length} records with fallback match! Check DB IDs.`);
                    data = fallbackData;
                }
            }

            console.log(`[InfluencerService] Fetched ${data?.length || 0} influencers for ${districtId}`);
            return data as Influencer[];
        } catch (err) {
            console.error('[InfluencerService] Unexpected error:', err);
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
        } catch {
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

            if (error) {
                console.error('Supabase error fetching influencers (district):', error);
                return [];
            }
            console.log(`Fetched influencers for ${districtId}:`, data);
            return data as Influencer[];
        } catch (e) {
            console.error('Unexpected error fetching influencers (district):', e);
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
    async registerInfluencer(influencer: Partial<Influencer>): Promise<{ success: boolean; message?: string }> {
        try {
            const { error } = await supabase
                .from('influencer_request') // 신청 대기 테이블로 변경
                .insert({
                    instagram_id: influencer.instagram_id,
                    image_url: influencer.image_url,
                    province_id: influencer.province_id,
                    district_id: influencer.district_id,
                    member_id: influencer.member_id,
                });

            if (error) {
                console.error('Supabase Insert Error:', error.message, error.details, error.hint);
                return { success: false, message: error.message };
            }

            return { success: true };
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            console.error('Unexpected error in registerInfluencer:', e);
            return { success: false, message: errorMessage };
        }
    },

    /**
     * 내 등록 상태 및 지역을 확인합니다.
     */
    async getMyRegistrationStatus(memberId: string): Promise<{
        status: 'pending' | 'approved' | 'rejected' | null;
        province_id?: string;
        district_id?: string;
    }> {
        try {
            // 1. 먼저 노출용 테이블(influencer) 확인 - 승인된 상태
            const { data: approvedData } = await supabase
                .from('influencer')
                .select('id, province_id, district_id')
                .eq('member_id', memberId)
                .maybeSingle();

            if (approvedData) {
                return {
                    status: 'approved',
                    province_id: approvedData.province_id,
                    district_id: approvedData.district_id
                };
            }

            // 2. 대기용 테이블(influencer_request) 확인 - 대기 중 상태
            const { data: pendingData } = await supabase
                .from('influencer_request')
                .select('id, province_id, district_id')
                .eq('member_id', memberId)
                .maybeSingle();

            if (pendingData) {
                return {
                    status: 'pending',
                    province_id: pendingData.province_id,
                    district_id: pendingData.district_id
                };
            }

            return { status: null };
        } catch {
            return { status: null };
        }
    },

    /**
     * 프로필 이미지를 Supabase Storage에 업로드합니다.
     * WebP 변환 및 최적화를 수행합니다.
     */
    async uploadProfileImage(file: File, memberId: string): Promise<string | null> {
        try {
            // 1. 이미지 최적화 (WebP 변환 및 리사이징)
            const optimizedBlob = await this.optimizeImage(file);
            if (!optimizedBlob) return null;

            // 2. 파일명 고정 (멤버당 1개 제한: memberId.webp)
            const fileName = `${memberId}.webp`;
            const filePath = `${fileName}`;

            // 3. Supabase Storage 업로드 (profiles 버킷, upsert: true로 덮어쓰기)
            const { error } = await supabase.storage
                .from('profiles')
                .upload(filePath, optimizedBlob, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (error) {
                console.error('Storage Upload Error:', error);
                return null;
            }

            // 4. 퍼블릭 URL 반환
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (e) {
            console.error('Unexpected error in uploadProfileImage:', e);
            return null;
        }
    },

    /**
     * Canvas를 이용한 이미지 최적화 (WebP)
     */
    async optimizeImage(file: File): Promise<Blob | null> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/webp', 0.8); // 80% 품질로 WebP 변환
                };
            };
        });
    },

    /**
     * 좋아요 토글 (DB 반영)
     */
    async toggleLike(influencerId: string, memberId: string): Promise<{ success: boolean; isLiked: boolean }> {
        try {
            // 1. 현재 좋아요 상태 확인
            const { data: existingLike } = await supabase
                .from('influencer_likes')
                .select('id')
                .eq('member_id', memberId)
                .eq('influencer_id', influencerId)
                .maybeSingle();

            if (existingLike) {
                // 2. 이미 좋아요 상태라면 제거
                const { error } = await supabase
                    .from('influencer_likes')
                    .delete()
                    .eq('id', existingLike.id);

                if (error) throw error;
                return { success: true, isLiked: false };
            } else {
                // 3. 좋아요 상태가 아니라면 추가
                const { error } = await supabase
                    .from('influencer_likes')
                    .insert({
                        member_id: memberId,
                        influencer_id: influencerId
                    });

                if (error) throw error;
                return { success: true, isLiked: true };
            }
        } catch (e) {
            console.error('[InfluencerService] toggleLike error:', e);
            return { success: false, isLiked: false };
        }
    },

    /**
     * 사용자가 좋아요를 누른 인플루언서 ID 목록을 가져옵니다.
     */
    async getLikedInfluencerIds(memberId: string): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('influencer_likes')
                .select('influencer_id')
                .eq('member_id', memberId);

            if (error) throw error;
            return data?.map(item => item.influencer_id) || [];
        } catch (e) {
            console.error('[InfluencerService] getLikedInfluencerIds error:', e);
            return [];
        }
    }
};
