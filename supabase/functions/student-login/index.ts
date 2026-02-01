import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginBody {
  registrationNumber: string;
  password: string;
}

// Simple password hashing using Web Crypto API (must match reset-password function)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationNumber, password }: LoginBody = await req.json();

    console.log("Login attempt for:", registrationNumber);

    if (!registrationNumber || !password) {
      return new Response(
        JSON.stringify({ error: "Registration number and password are required" }),
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
      .select("id, registration_number, email, full_name, password_hash, must_change_password")
      .eq("registration_number", registrationNumber)
      .maybeSingle();

    if (studentError) {
      console.error("Database error:", studentError);
      return new Response(
        JSON.stringify({ error: "Invalid registration number or password" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!student) {
      console.log("Student not found:", registrationNumber);
      return new Response(
        JSON.stringify({ error: "Invalid registration number or password" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Hash the provided password and compare
    const passwordHash = await hashPassword(password);
    
    if (passwordHash !== student.password_hash) {
      console.log("Invalid password for:", registrationNumber);
      return new Response(
        JSON.stringify({ error: "Invalid registration number or password" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Login successful for:", registrationNumber);

    // Return student info (without password hash)
    return new Response(
      JSON.stringify({
        success: true,
        student: {
          id: student.id,
          registrationNumber: student.registration_number,
          email: student.email,
          fullName: student.full_name,
          mustChangePassword: student.must_change_password,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in student-login function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
