/**
 * 서비스 이용자(회원) 데이터 모델
 */
export interface Member {
    id: string;        // UUID (Supabase Auth ID)
    toss_id: string;   // 토스 고유 식별자
    name: string;      // 사용자 이름
    profile_image: string; // 프로필 이미지 URL
    created_at: string;
}
