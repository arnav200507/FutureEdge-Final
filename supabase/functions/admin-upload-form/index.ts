import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use anon client for JWT verification, service role for DB/storage access
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const verifyAdmin = async () => {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return { ok: false as const, status: 401, error: "Missing Authorization header" };
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userRes, error: authError } = await supabaseAuth.auth.getUser(token);
      if (authError || !userRes?.user) {
        console.error("Auth error:", authError);
        return { ok: false as const, status: 401, error: "Unauthorized" };
      }

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userRes.user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        return { ok: false as const, status: 403, error: "Forbidden - Admin access required" };
      }

      return { ok: true as const, userId: userRes.user.id };
    };

    // POST - Upload form for a student
    if (req.method === "POST") {
      // Verify admin
      const authRes = await verifyAdmin();
      if (!authRes.ok) {
        return new Response(JSON.stringify({ error: authRes.error }), {
          status: authRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const contentType = req.headers.get("content-type") || "";

      if (!contentType.includes("multipart/form-data")) {
        return new Response(
          JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const formData = await req.formData();
      const file = formData.get("file") as File;
      const studentId = formData.get("studentId") as string;
      const formName = formData.get("formName") as string;
      const examType = formData.get("examType") as string | null;
      const capRound = formData.get("capRound") as string | null;

      if (!file || !studentId || !formName) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: file, studentId, formName" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify student exists
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, registration_number")
        .eq("id", studentId)
        .single();

      if (studentError || !student) {
        console.error("Student lookup error:", studentError);
        return new Response(
          JSON.stringify({ error: "Invalid student ID" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${studentId}/${fileName}`;

      // Upload file to storage using service role
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("student-forms")
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to upload file to storage" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create form record in database
      const { data: formRecord, error: dbError } = await supabase
        .from("student_forms")
        .insert({
          student_id: studentId,
          form_name: formName,
          exam_type: examType || null,
          round: capRound || null,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        // Clean up uploaded file
        await supabase.storage.from("student-forms").remove([filePath]);
        return new Response(
          JSON.stringify({ error: "Failed to create form record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          form: formRecord, 
          message: "Form uploaded successfully",
          student: {
            full_name: student.full_name,
            registration_number: student.registration_number
          }
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
