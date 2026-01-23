// Mock member data for development
// This file is used when real Toss login is unavailable.
// The shape matches the Member model defined in src/data/models/m_member.ts

import type { Member } from '../models/m_member';

export const MOCK_MEMBERS: Member[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        toss_id: 'mock_toss_id_1',
        name: '테스트 사용자 1',
        created_at: new Date().toISOString(),
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        toss_id: 'mock_toss_id_2',
        name: '테스트 사용자 2',
        created_at: new Date().toISOString(),
    },
];
