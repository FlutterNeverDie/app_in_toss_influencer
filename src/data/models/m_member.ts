/**
 * 서비스 이용자(회원) 데이터 모델
 */
export interface Member {
    id: string;        // UUID (Supabase Auth ID)
    toss_id: string;   // 토스 고유 식별자
    name: string;      // 사용자 이름
    birthday?: string; // 생년월일 (YYYYMMDD)
    gender?: string;   // 성별 (1: 남성, 2: 여성 등 토스 기준)
    phone?: string;    // 휴대폰 번호
    created_at: string;
}
