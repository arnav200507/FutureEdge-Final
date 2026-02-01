import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const formId = url.searchParams.get("formId");

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "Student ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET: Fetch forms for a student or get download URL
    if (req.method === "GET") {
      // If formId is provided, get download URL
      if (formId) {
        const { data: form, error: formError } = await supabase
          .from("student_forms")
          .select("*")
          .eq("id", formId)
          .eq("student_id", studentId)
          .single();

        if (formError || !form) {
          return new Response(
            JSON.stringify({ error: "Form not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate signed URL for download
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from("student-forms")
          .createSignedUrl(form.file_path, 300); // 5 minutes

        if (urlError) {
          return new Response(
            JSON.stringify({ error: "Failed to generate download URL" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ downloadUrl: signedUrl.signedUrl, fileName: form.file_name }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch all forms for the student
      const { data: forms, error: formsError } = await supabase
        .from("student_forms")
        .select("id, form_name, exam_type, round, file_name, file_size, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (formsError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch forms" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ forms: forms || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Forms error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
