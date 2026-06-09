// ==============================================================================
// 🏥 BRAAM HEALTH CENTRE - SUPABASE EDGE FUNCTION
// Module: Send Email Notifications via SMTP (Nodemailer)
// ==============================================================================
// This function receives a secure POST request containing email payload details
// (to, subject, body/html/text) and routes them using Nodemailer via SMTP.
// It bypasses the need for external SaaS APIs like Resend.

import nodemailer from "npm:nodemailer";

// CORS Headers to allow cross-origin requests from the member/admin portals
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  fromNameOverride?: string;
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight Options requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // 2. enforce POST requests only
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed. Please use POST.` }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    // 3. Parse and validate the incoming request body
    const body: EmailPayload = await req.json();
    const { to, subject, text, html, fromNameOverride } = body;

    if (!to || !subject || (!text && !html)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request payload. 'to', 'subject', and either 'text' or 'html' body are required." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 4. Retrieve SMTP configuration parameters from Deno / Supabase environment
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPortRaw = Deno.env.get("SMTP_PORT");
    const smtpSecureRaw = Deno.env.get("SMTP_SECURE");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");  
    const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    const smtpFromName = fromNameOverride || Deno.env.get("SMTP_FROM_NAME") || "Braam Health Centre";

    if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass || !smtpFromEmail) {
      console.error("Missing SMTP server environment variables inside Supabase Secrets.");
      return new Response(
        JSON.stringify({ 
          error: "Internal Server Error: SMTP notification server is not fully configured." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const smtpPort = parseInt(smtpPortRaw, 10);
    const smtpSecure = smtpSecureRaw === "true"; // Secure connection if explicitly true (typically port 465)

    // 5. Initialize Nodemailer SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        // Do not fail on invalid certs (common for custom mail servers)
        rejectUnauthorized: false,
      },
    });

    // 6. Define the sender header and compile recipient details
    const fromHeader = `"${smtpFromName}" <${smtpFromEmail}>`;
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    console.log(`Attempting to transmit email: "${subject}" to [${recipients}] via SMTP [${smtpHost}:${smtpPort}]`);

    // 7. Transmit the email via SMTP transport
    const mailInfo = await transporter.sendMail({
      from: fromHeader,
      to: recipients,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Email transmitted successfully! MessageID:", mailInfo.messageId);

    // 8. Return response containing metadata
    return new Response(
      JSON.stringify({
        success: true,
        messageId: mailInfo.messageId,
        info: mailInfo.response,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Fatal exception during email dispatch:", err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || "An unknown error occurred during email transmission." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
