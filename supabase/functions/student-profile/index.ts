import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateProfileBody {
  studentId: string;
  mobile_number?: string;
  alternate_contact_number?: string;
  exam_types?: string[];
  category?: string;
  home_state?: string;
  preferred_branches?: string[];
  preferred_colleges?: string[];
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET - Fetch student profile
    if (req.method === "GET") {
      const url = new URL(req.url);
      const studentId = url.searchParams.get("studentId");
      const adminUserId = url.searchParams.get("adminUserId");

      if (!studentId) {
        return new Response(
          JSON.stringify({ error: "Student ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // If adminUserId is provided, verify admin role
      if (adminUserId) {
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: adminUserId,
          _role: "admin",
        });

        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      const { data: student, error } = await supabase
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
          preferred_branches,
          preferred_colleges,
          created_at,
          updated_at
        `)
        .eq("id", studentId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching student:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch profile" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!student) {
        return new Response(
          JSON.stringify({ error: "Student not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, student }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // PUT - Update student profile
    if (req.method === "PUT") {
      const body: UpdateProfileBody = await req.json();
      const { studentId, ...updateData } = body;

      if (!studentId) {
        return new Response(
          JSON.stringify({ error: "Student ID is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Validate mobile number if provided
      if (updateData.mobile_number && !/^\d{10}$/.test(updateData.mobile_number)) {
        return new Response(
          JSON.stringify({ error: "Mobile number must be 10 digits" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Validate alternate contact if provided
      if (updateData.alternate_contact_number && updateData.alternate_contact_number.length > 0) {
        if (!/^\d{10}$/.test(updateData.alternate_contact_number)) {
          return new Response(
            JSON.stringify({ error: "Alternate contact number must be 10 digits" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      // Filter out empty strings for optional fields
      const cleanedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          if (typeof value === 'string' && value === '') {
            cleanedData[key] = null;
          } else {
            cleanedData[key] = value;
          }
        }
      }

      console.log("Updating student profile:", studentId, cleanedData);

      const { data: updatedStudent, error } = await supabase
        .from("students")
        .update(cleanedData)
        .eq("id", studentId)
        .select()
        .single();

      if (error) {
        console.error("Error updating student:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update profile" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Profile updated successfully", student: updatedStudent }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in student-profile function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
