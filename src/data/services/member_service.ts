import { supabase } from '../../lib/supabase';
import type { Member } from '../models/m_member';
import { MOCK_MEMBERS } from '../mock/mock_members';

export const MemberService = {
    /**
     * 토스 인가 코드를 사용하여 서버(Edge Function)를 통해 로그인 및 데이터 동기화를 수행합니다.
     * @param authCode 토스 인가 코드 (authorizationCode)
     */
    async loginWithToss(authCode: string): Promise<Member | null> {
        try {
            console.log(`[MemberService] Calling toss-login with code: ${authCode.substring(0, 10)}...`);
            const { data, error } = await supabase.functions.invoke('toss-login', {
                body: { code: authCode }
            });

            console.log('[MemberService] Edge Function Raw Result:', { data, error });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error(`Edge Function Error: ${error.message || JSON.stringify(error)}`);
            }

            if (!data.success || !data.member) {
                console.error('Login Failed:', data.error);
                throw new Error(`서버 로그인 실패: ${data.error || '알 수 없는 오류'}`);
            }

            return data.member as Member;
        } catch (e) {
            console.error('Unexpected error in loginWithToss:', e);
            return null;
        }
    },

    /**
     * 로컬 개발용 Mock 로그인
     * @param memberId 선택적 회원 ID (없으면 첫 번째 mock 회원 사용)
     */
    async mockLogin(memberId?: string): Promise<Member | null> {
        // 로컬 개발 환경이 아니면 동작하지 않음
        if (!import.meta.env.DEV) {
            console.warn('mockLogin is only available in development mode.');
            return null;
        }

        const member = MOCK_MEMBERS.find(m => m.id === memberId) || MOCK_MEMBERS[0];
        return member || null;
    },

    /**
     * (Legacy) 로컬 테스트용 등 수동 동기화
     */
    async syncMember(member: Partial<Member>): Promise<Member | null> {
        try {
            if (!member.toss_id) return null;

            // 1. 이미 존재하는 유저인지 확인
            const { data: existingMember } = await supabase
                .from('member')
                .select('*')
                .eq('toss_id', member.toss_id)
                .maybeSingle();

            // 2. Upsert 수행 (id가 있으면 기존 데이터 유지, 없으면 신규 생성)
            // 주의: DB의 id 기본값이 auth.uid()이므로, 비로그인 상태에서는 null이 되어 NOT NULL 제약조건 위반 가능성 있음.
            // 따라서 신규 생성 시에는 id를 생략하여 DB default를 따르거나, 명시적으로 처리해야 함.
            const upsertData: Partial<Member> & { id?: string } = {
                toss_id: member.toss_id,
                name: member.name || '토스 사용자',
            };

            // 기존 멤버가 있다면 id를 지정하여 업데이트, 없다면 새 UUID 생성 (auth.uid() 대비)
            if (existingMember) {
                upsertData.id = existingMember.id;
            } else {
                // Supabase Auth 연동 전인 웹뷰 환경을 위해 직접 UUID 생성
                try {
                    upsertData.id = crypto.randomUUID();
                } catch {
                    // Fallback for older browsers (though unlikely in modern webview)
                    upsertData.id = '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0');
                }
            }

            const { data, error } = await supabase
                .from('member')
                .upsert(upsertData, { onConflict: 'toss_id' })
                .select()
                .single();

            if (error) {
                console.error('Error syncing member:', error);

                // 만약 ID 제약조건(auth.uid()) 때문에 실패한 경우, 로컬 테스트용으로 existingMember라도 반환
                if (existingMember) return existingMember as Member;
                return null;
            }

            return data as Member;
        } catch (e) {
            console.error('Unexpected error in syncMember:', e);
            return null;
        }
    },

    /**
     * ID로 멤버 정보를 가져옵니다.
     */
    async getMemberById(id: string): Promise<Member | null> {
        const { data, error } = await supabase
            .from('member')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Member;
    },

    /**
     * 회원 탈퇴 (서비스 연결 해제)
     * 1. Toss API를 통해 연결 해제
     * 2. DB에서 유저 데이터 삭제
     */
    async withdraw(tossId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.functions.invoke('toss-unlink', {
                body: { toss_id: tossId }
            });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error(error.message);
            }

            if (!data.success) {
                console.error('Withdraw Failed:', data.error);
                throw new Error(data.error);
            }

            return true;
        } catch (e) {
            console.error('Withdraw Error:', e);
            throw e;
        }
    }
};
