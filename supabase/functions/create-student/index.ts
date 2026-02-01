import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new TextDecoder().decode(encodeHex(new Uint8Array(hashBuffer)));
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No auth header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.log("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "Error checking permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!roleData) {
      console.log("User is not an admin");
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { 
      fullName, 
      registrationNumber, 
      mobileNumber, 
      email, 
      examTypes, 
      category, 
      tempPassword 
    } = await req.json();

    console.log("Creating student:", { registrationNumber, email });

    // Validate required fields
    if (!fullName || !registrationNumber || !email || !tempPassword) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if registration number already exists
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("registration_number", registrationNumber)
      .maybeSingle();

    if (existingStudent) {
      console.log("Duplicate registration number:", registrationNumber);
      return new Response(
        JSON.stringify({ error: "Registration number already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("students")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      console.log("Duplicate email:", email);
      return new Response(
        JSON.stringify({ error: "Email address already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(tempPassword);

    // Create the student record
    const { data: newStudent, error: insertError } = await supabase
      .from("students")
      .insert({
        full_name: fullName,
        registration_number: registrationNumber,
        mobile_number: mobileNumber,
        email: email.toLowerCase(),
        exam_types: examTypes || [],
        category: category || "Open",
        password_hash: passwordHash,
        must_change_password: true,
        payment_status: "paid",
        admission_stage: "Account Created",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user_roles entry for the student
    const { error: roleInsertError } = await supabase
      .from("user_roles")
      .insert({
        user_id: newStudent.id,
        role: "student",
      });

    if (roleInsertError) {
      console.error("Role insert error:", roleInsertError);
      // Don't fail the whole operation, student was created
    }

    console.log("Student created successfully:", newStudent.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        studentId: newStudent.id,
        registrationNumber: newStudent.registration_number 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
