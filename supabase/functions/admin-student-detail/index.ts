import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  console.log("Progress update function called");
  console.log("Request method:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No auth header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - No auth header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify the requesting user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Invalid token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log("Authenticated user:", user.id);

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ success: false, error: "Error checking permissions" }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!roleData) {
      console.log("User is not an admin");
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
        { status: 403, headers: corsHeaders }
      );
    }

    console.log("Admin role verified");

    // Handle GET request - Fetch student details
    if (req.method === "GET") {
      const url = new URL(req.url);
      const studentId = url.searchParams.get("studentId");
      console.log("GET request - Student ID:", studentId);

      if (!studentId) {
        return new Response(
          JSON.stringify({ success: false, error: "Student ID is required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const { data: student, error: fetchError } = await supabase
        .from("students")
        .select(`
          id,
          full_name,
          registration_number,
          email,
          mobile_number,
          alternate_contact_number,
          exam_types,
          category,
          home_state,
          admission_stage,
          payment_status,
          preferred_branches,
          preferred_colleges,
          created_at,
          updated_at
        `)
        .eq("id", studentId)
        .maybeSingle();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        return new Response(
          JSON.stringify({ success: false, error: fetchError.message }),
          { status: 500, headers: corsHeaders }
        );
      }

      if (!student) {
        return new Response(
          JSON.stringify({ success: false, error: "Student not found" }),
          { status: 404, headers: corsHeaders }
        );
      }

      console.log("Student fetched successfully");
      return new Response(
        JSON.stringify({ success: true, student }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Handle PUT request - Update admission stage
    if (req.method === "PUT") {
      let body;
      try {
        body = await req.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON body" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const { studentId, admissionStage } = body;
      console.log("PUT request - Student ID:", studentId);
      console.log("PUT request - New admission stage:", admissionStage);

      if (!studentId || !admissionStage) {
        return new Response(
          JSON.stringify({ success: false, error: "Student ID and admission stage are required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const { data: updatedStudent, error: updateError } = await supabase
        .from("students")
        .update({ admission_stage: admissionStage })
        .eq("id", studentId)
        .select("id, admission_stage")
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Unable to update progress" }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log("Progress updated successfully");
      return new Response(
        JSON.stringify({ success: true, message: "Progress updated successfully", student: updatedStudent }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
