import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    console.log(`[Edge Function] Request received: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        console.log('[Edge Function] Handling OPTIONS request');
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('[Edge Function] Parsing request body...');
        const bodyContent = await req.text();
        console.log('[Edge Function] Raw body:', bodyContent);

        let body;
        try {
            body = JSON.parse(bodyContent);
        } catch (e) {
            throw new Error(`Failed to parse request body as JSON: ${bodyContent}`);
        }

        const { code, is_sandbox = false } = body;

        if (!code) {
            throw new Error("Authorization Code is required");
        }

        const TOSS_API_HOST = is_sandbox
            ? "https://sandbox-api-partner.toss.im"
            : "https://api-partner.toss.im";

        const DECRYPT_KEY = Deno.env.get("TOSS_DECRYPT_KEY");
        const AAD = Deno.env.get("TOSS_AAD") || "TOSS";

        // 0. mTLS용 HttpClient 구성
        const TOSS_CERT = Deno.env.get("TOSS_CERT")?.trim();
        const TOSS_KEY = Deno.env.get("TOSS_KEY")?.trim();

        console.log(`Checking Toss Cert: ${TOSS_CERT ? 'EXISTS' : 'MISSING'}, Key: ${TOSS_KEY ? 'EXISTS' : 'MISSING'}`);

        let client: Deno.HttpClient | undefined;
        if (TOSS_CERT && TOSS_KEY) {
            try {
                // @ts-ignore
                client = Deno.createHttpClient({
                    cert: TOSS_CERT,
                    key: TOSS_KEY,
                });
                console.log("mTLS HttpClient successfully created.");
            } catch (e) {
                console.warn("Failed to create mTLS client, falling back to default fetch:", e);
            }
        } else {
            console.warn("TOSS_CERT or TOSS_KEY is missing. mTLS will not be used.");
        }

        async function fetchWithRetry(url: string, options: any) {
            try {
                console.log(`[Edge Function] Fetching: ${url}`);
                return await fetch(url, options);
            } catch (e) {
                // DNS 에러일 경우 mTLS 클라이언트 없이 재시도하거나, 도메인 문제일 수 있음
                if (options.client && (e.message?.includes("dns") || e.name === "TypeError")) {
                    console.warn(`[Edge Function] DNS/Network error with mTLS client, retrying WITHOUT client: ${e.message}`);
                    const { client: _, ...restOptions } = options;
                    return await fetch(url, restOptions);
                }
                throw e;
            }
        }

        // 도메인 후보군
        const domains = [
            "https://apps-in-toss-api.toss.im",
            "https://api-partner.toss.im"
        ];

        async function tryMultipleDomains(path: string, options: any) {
            let lastError;
            for (const domain of domains) {
                try {
                    const res = await fetchWithRetry(`${domain}${path}`, options);
                    // DNS 에러가 아니라 응답이 오면 성공으로 간주 (4xx/5xx 포함)
                    return res;
                } catch (e) {
                    console.warn(`[Edge Function] Domain ${domain} failed with: ${e.message}`);
                    lastError = e;
                }
            }
            throw lastError;
        }

        // 1. Authorization Code -> Access Token
        const tokenRes = await tryMultipleDomains("/api-partner/v1/apps-in-toss/user/oauth2/generate-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "influencer-map-app",
            },
            // @ts-ignore
            client: client,
            body: JSON.stringify({
                authorizationCode: code,
                referrer: "influencer-map"
            }),
        });

        const tokenRaw = await tokenRes.text();
        console.log("Token Response Raw:", tokenRaw);

        let tokenData;
        try {
            tokenData = JSON.parse(tokenRaw);
        } catch (e) {
            throw new Error(`Token API returned non-JSON response: ${tokenRaw.substring(0, 100)}...`);
        }

        if (!tokenRes.ok || !tokenData.success) {
            console.error("Token Error Response:", tokenData);
            throw new Error(`Failed to generate token: ${tokenData.error?.reason || JSON.stringify(tokenData)}`);
        }

        const { accessToken } = tokenData.success;

        // 2. Access Token -> User Profile (me)
        const userRes = await tryMultipleDomains("/api-partner/v1/apps-in-toss/user/oauth2/login-me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "User-Agent": "influencer-map-app",
            },
            // @ts-ignore
            client: client,
        });

        const userRaw = await userRes.text();
        console.log("User Profile Response Raw:", userRaw);

        let userData;
        try {
            userData = JSON.parse(userRaw);
        } catch (e) {
            throw new Error(`User Profile API returned non-JSON response: ${userRaw.substring(0, 100)}...`);
        }


        if (!userRes.ok || !userData.success) {
            console.error("User Profile Error:", userData);
            throw new Error(`Failed to fetch user profile: ${userData.error?.reason || JSON.stringify(userData)}`);
        }

        const userInfo = userData.success;

        // 3. Decrypt User Info (Name, Birthday, Gender, Phone etc.)
        let realName = '토스 사용자';
        let realBirthday = null;
        let realGender = null;
        let realPhone = null;

        if (DECRYPT_KEY) {
            try {
                if (userInfo.name) realName = await decryptTossData(userInfo.name, DECRYPT_KEY, AAD);
                if (userInfo.birthday) realBirthday = await decryptTossData(userInfo.birthday, DECRYPT_KEY, AAD);
                if (userInfo.gender) realGender = await decryptTossData(userInfo.gender, DECRYPT_KEY, AAD);
                if (userInfo.phone) realPhone = await decryptTossData(userInfo.phone, DECRYPT_KEY, AAD);
            } catch (e) {
                console.error("Decryption failed:", e);
                // Fallback or keep default
            }
        }

        // 4. Sync to Supabase Database (Upsert)
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const tossIdStr = String(userInfo.userKey);

        // 기존 멤버 확인 (id 제약 조건 해결용)
        const { data: existingMember } = await supabaseAdmin
            .from('member')
            .select('id')
            .eq('toss_id', tossIdStr)
            .maybeSingle();

        const upsertData: any = {
            toss_id: tossIdStr,
            name: realName,
            birthday: realBirthday,
            gender: realGender,
            phone: realPhone,
        };

        if (existingMember) {
            upsertData.id = existingMember.id;
        } else {
            upsertData.id = crypto.randomUUID();
        }

        console.log(`[Edge Function] Upserting member: ${tossIdStr} with id: ${upsertData.id}`);

        const { data: savedMember, error: dbError } = await supabaseAdmin
            .from('member')
            .upsert(upsertData, { onConflict: 'toss_id' })
            .select()
            .single();

        if (dbError) {
            console.error('[Edge Function] Database upsert failed:', dbError);
            throw new Error(`Database upsert failed: ${dbError.message}`);
        }

        console.log('[Edge Function] Login successful for:', savedMember.toss_id);

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

/**
 * AES-256-GCM Decryption for Toss User Info
 */
async function decryptTossData(encryptedText: string, base64Key: string, aad: string): Promise<string> {
    const IV_LENGTH = 12;
    const TAG_LENGTH = 16;

    // Decode base64 inputs
    const encryptedBuffer = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const keyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    const aadBuffer = new TextEncoder().encode(aad);

    // Extract IV, Ciphertext, and Auth Tag
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const data = encryptedBuffer.slice(IV_LENGTH);

    // Import Key
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
            additionalData: aadBuffer,
            tagLength: TAG_LENGTH * 8
        },
        cryptoKey,
        data
    );

    return new TextDecoder().decode(decryptedBuffer);
}

