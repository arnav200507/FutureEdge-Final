import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestPasswordResetBody {
  registrationNumber: string;
  siteUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationNumber, siteUrl }: RequestPasswordResetBody = await req.json();

    console.log("Password reset requested for:", registrationNumber);

    if (!registrationNumber) {
      return new Response(
        JSON.stringify({ error: "Registration number is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find student by registration number
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, email, full_name")
      .eq("registration_number", registrationNumber)
      .single();

    if (studentError || !student) {
      console.log("Student not found:", registrationNumber);
      // Don't reveal if student exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "If this registration number exists, a password reset email has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate a secure random token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the reset token
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert({
        student_id: student.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error creating reset token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to create reset token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build reset URL
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    const studentName = student.full_name || "Student";

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Student Portal <onboarding@resend.dev>",
      to: [student.email],
      subject: "Reset Your Password - Student Counselling Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3d9a8b 0%, #4db8a8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">Hello ${studentName},</p>
            <p>We received a request to reset your password for the Student Counselling Portal.</p>
            <p>Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #3d9a8b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">Student Counselling Portal<br>For assistance, contact your counsellor.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "If this registration number exists, a password reset email has been sent." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in request-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
