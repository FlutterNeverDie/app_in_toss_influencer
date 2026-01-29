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
        const { toss_id, is_sandbox = false } = await req.json();

        if (!toss_id) {
            throw new Error("toss_id is required");
        }

        const TOSS_API_HOST = is_sandbox
            ? "https://sandbox-api-partner.toss.im"
            : "https://api-partner.toss.im";

        // 0. mTLS용 HttpClient 구성
        const TOSS_CERT = Deno.env.get("TOSS_CERT");
        const TOSS_KEY = Deno.env.get("TOSS_KEY");

        let client: Deno.HttpClient | undefined;
        if (TOSS_CERT && TOSS_KEY) {
            try {
                // @ts-ignore
                client = Deno.createHttpClient({
                    certChain: TOSS_CERT,
                    privateKey: TOSS_KEY,
                });
            } catch (e) {
                console.warn("Failed to create mTLS client, falling back to default fetch:", e);
            }
        }

        // 1. Toss API를 호출하여 유저 연결 해제
        // API: POST /api-partner/v1/apps-in-toss/user/remove
        const unlinkRes = await fetch(`${TOSS_API_HOST}/api-partner/v1/apps-in-toss/user/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // @ts-ignore
            client: client,
            body: JSON.stringify({
                userKey: toss_id
            }),
        });

        const unlinkData = await unlinkRes.json();

        if (!unlinkRes.ok || !unlinkData.success) {
            console.error("Unlink Error Response:", unlinkData);
            // 이미 해제된 경우 등도 성공으로 처리할지 고려해야 함. 일단 에러 던짐.
            throw new Error(`Failed to unlink user from Toss: ${unlinkData.error?.reason || JSON.stringify(unlinkData)}`);
        }

        // 2. Supabase DB에서 유저 삭제
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { error: dbError } = await supabaseAdmin
            .from('member')
            .delete()
            .eq('toss_id', toss_id);

        if (dbError) {
            throw new Error(`Database delete failed: ${dbError.message}`);
        }

        return new Response(
            JSON.stringify({ success: true, message: "User unlinked and deleted successfully" }),
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
