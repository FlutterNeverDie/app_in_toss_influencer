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

            const { data, error } = await supabase
                .from('member')
                .upsert({
                    toss_id: member.toss_id,
                    name: member.name,
                    profile_image: member.profile_image,
                    // id는 primary key이며 default auth.uid()이지만, 
                    // 웹뷰 환경에서 auth 연동 전이라면 toss_id기반으로 식별이 필요할 수 있음.
                }, { onConflict: 'toss_id' })
                .select()
                .single();

            if (error) {
                console.error('Error syncing member:', error);
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
