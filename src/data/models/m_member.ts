/**
 * 서비스 이용자(회원) 데이터 모델
 */
export interface Member {
    readonly id: string;           // UUID (Supabase Auth ID)
    readonly toss_id: string;      // 토스 유저 고유 식별값
    readonly name?: string;        // 유저 이름/닉네임
    readonly profile_image?: string; // 프로필 이미지 URL
    readonly created_at?: string;
}
