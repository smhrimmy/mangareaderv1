import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  mangaId: string;
  mangaTitle: string;
  chapterNumber: string;
  chapterTitle: string;
}

const sendEmail = async (to: string, subject: string, html: string) => {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "MangaReader <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email failed: ${error}`);
  }

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mangaId, mangaTitle, chapterNumber, chapterTitle }: NotificationRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users subscribed to this manga with email enabled
    const { data: subscriptions, error: subError } = await supabase
      .from("chapter_notifications")
      .select("user_id")
      .eq("manga_id", mangaId)
      .eq("email_enabled", true);

    if (subError || !subscriptions?.length) {
      console.log("No subscribers found or error:", subError);
      return new Response(JSON.stringify({ message: "No subscribers" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user emails from auth
    const userIds = subscriptions.map(s => s.user_id);
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      throw new Error("Failed to get users");
    }

    const subscribedUsers = users.users.filter(u => userIds.includes(u.id));
    const emails = subscribedUsers.map(u => u.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      return new Response(JSON.stringify({ message: "No valid emails" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; padding: 32px; border-radius: 12px;">
        <h1 style="color: #a855f7; margin-bottom: 16px;">New Chapter Released! 🎉</h1>
        <div style="background: #16213e; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #fff; margin: 0 0 8px 0;">${mangaTitle}</h2>
          <p style="color: #a1a1aa; margin: 0;">Chapter ${chapterNumber}: ${chapterTitle}</p>
        </div>
        <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
          You received this email because you subscribed to chapter updates for ${mangaTitle}.
        </p>
      </div>
    `;

    // Send email to all subscribers
    const results = await Promise.allSettled(
      emails.map(email => 
        sendEmail(email, `📚 New Chapter: ${mangaTitle} - Chapter ${chapterNumber}`, emailHtml)
      )
    );

    const successCount = results.filter(r => r.status === "fulfilled").length;

    // Update last notified chapter
    await supabase
      .from("chapter_notifications")
      .update({ last_notified_chapter: chapterNumber })
      .eq("manga_id", mangaId)
      .in("user_id", userIds);

    console.log(`Sent ${successCount}/${emails.length} notification emails for ${mangaTitle} Chapter ${chapterNumber}`);

    return new Response(JSON.stringify({ success: true, count: successCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
