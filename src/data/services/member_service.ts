import { supabase } from '../../lib/supabase';
import type { Member } from '../models/m_member';

export const MemberService = {
    /**
     * 토스 로그인 정보를 바탕으로 DB의 멤버 정보를 업데이트하거나 생성합니다. (Upsert)
     * @param member 멤버 정보
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
            const upsertData: any = {
                toss_id: member.toss_id,
                name: member.name || '토스 사용자',
                profile_image: member.profile_image || '',
            };

            // 기존 멤버가 있다면 id를 지정하여 업데이트, 없다면 새 UUID 생성 (auth.uid() 대비)
            if (existingMember) {
                upsertData.id = existingMember.id;
            } else {
                // Supabase Auth 연동 전인 웹뷰 환경을 위해 직접 UUID 생성
                try {
                    upsertData.id = crypto.randomUUID();
                } catch (e) {
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
    }
};
