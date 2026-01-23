import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { code, is_sandbox = false } = await req.json();

        if (!code) {
            throw new Error("Authorization Code is required");
        }

        const TOSS_API_HOST = is_sandbox
            ? "https://sandbox-api-partner.toss.im"
            : "https://api-partner.toss.im";

        const CLIENT_ID = Deno.env.get("TOSS_CLIENT_ID");
        const CLIENT_SECRET = Deno.env.get("TOSS_CLIENT_SECRET");

        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error("Toss Client ID/Secret configuration missing");
        }

        // 1. Authorization Code -> Access Token
        const tokenRes = await fetch(`${TOSS_API_HOST}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                grantType: "AUTHORIZATION_CODE",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                code: code,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.success) {
            console.error("Token Error Response:", tokenData);
            throw new Error(`Failed to generate token: ${tokenData.error?.reason || JSON.stringify(tokenData)}`);
        }

        const { accessToken } = tokenData.success;

        // 2. Access Token -> User Profile (me)
        const userRes = await fetch(`${TOSS_API_HOST}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const userData = await userRes.json();

        if (!userRes.ok || !userData.success) {
            console.error("User Profile Error:", userData);
            throw new Error(`Failed to fetch user profile: ${userData.error?.reason || JSON.stringify(userData)}`);
        }

        const userInfo = userData.success;

        // 3. Sync to Supabase Database (Upsert)
        // Supabase Admin Client 생성 (Service Role Key 필수)
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const upsertData = {
            toss_id: userInfo.userKey ? String(userInfo.userKey) : `toss_${Math.random().toString(36).substring(2)}`, // userKey가 숫자일 수 있으므로 문자변환
            name: userInfo.name || '토스 사용자', // 암호화된 값이거나 실제 값
            // profile_image: '', // Toss API에서 프로필 이미지를 준다면 여기에 매핑
        };

        // toss_id로 기존 유저 확인
        const { data: existingUser } = await supabaseAdmin
            .from('member')
            .select('id')
            .eq('toss_id', upsertData.toss_id)
            .maybeSingle();

        if (!existingUser) {
            // 신규 유저라면 UUID 생성 필요 (member 테이블 id가 uuid 타입 가정)
            // member 테이블 id 컬럼이 default gen_random_uuid()라면 생략 가능하지만,
            // 명시적으로 필요한 경우 여기서 처리. 보통은 DB default 로직에 맡김.
            // (member_service.ts 로직 참고하여 id 생략 시 자동 생성 기대)
        }

        const { data: savedMember, error: dbError } = await supabaseAdmin
            .from('member')
            .upsert(upsertData, { onConflict: 'toss_id' })
            .select()
            .single();

        if (dbError) {
            throw new Error(`Database upsert failed: ${dbError.message}`);
        }

        return new Response(
            JSON.stringify({ success: true, member: savedMember }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            },
        );
    }
});
