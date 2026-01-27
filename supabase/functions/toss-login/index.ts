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
        const DECRYPT_KEY = Deno.env.get("TOSS_DECRYPT_KEY"); // Base64 encoded AES key
        const AAD = Deno.env.get("TOSS_AAD") || "TOSS"; // Default to TOSS if not set

        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error("Toss Client ID/Secret configuration missing");
        }

        // 0. mTLS용 HttpClient 구성 (권장: Supabase Secrets에 PEM 형식으로 저장)
        const TOSS_CERT = Deno.env.get("TOSS_CERT");
        const TOSS_KEY = Deno.env.get("TOSS_KEY");

        let client: Deno.HttpClient | undefined;
        if (TOSS_CERT && TOSS_KEY) {
            try {
                // @ts-ignore: Deno.createHttpClient는 Supabase Edge Functions 최신 런타임에서 지원됨
                client = Deno.createHttpClient({
                    certChain: TOSS_CERT,
                    privateKey: TOSS_KEY,
                });
            } catch (e) {
                console.warn("Failed to create mTLS client, falling back to default fetch:", e);
            }
        }

        // 1. Authorization Code -> Access Token
        const tokenRes = await fetch(`${TOSS_API_HOST}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // @ts-ignore
            client: client,
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

        const upsertData = {
            toss_id: String(userInfo.userKey),
            name: realName,
            birthday: realBirthday,
            gender: realGender,
            phone: realPhone,
        };

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

