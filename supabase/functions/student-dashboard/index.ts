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

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "Student ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch student data with admission stage
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, full_name, email, registration_number, admission_stage, mobile_number, exam_types, category, home_state, preferred_branches, preferred_colleges")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch unresolved alerts for this student
    const { data: alerts, error: alertsError } = await supabase
      .from("student_alerts")
      .select("id, title, message, alert_type, created_at")
      .eq("student_id", studentId)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false });

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
    }

    // Fetch latest 5 notices for the carousel
    const { data: notices, error: noticesError } = await supabase
      .from("notices")
      .select("id, title, content, is_important, published_at")
      .order("published_at", { ascending: false })
      .limit(5);

    if (noticesError) {
      console.error("Error fetching notices:", noticesError);
    }

    // Determine "What's Next" based on admission stage
    // These must match the ADMISSION_STAGES in AdminStudentDetail.tsx
    const admissionStages = [
      "Registration for Counselling (MHT-CET 2026)",
      "Document Verification at Facilitation Centre",
      "Display of Merit List",
      "Filling Option Form for CAP Rounds",
      "Seat Allotment",
      "Accepting Offered Seat",
      "Reporting to Allotted Institute",
      "Commencement of Course"
    ];

    const currentStageIndex = admissionStages.indexOf(student.admission_stage || admissionStages[0]);
    
    let whatsNext = "";
    switch (student.admission_stage) {
      case "Registration for Counselling (MHT-CET 2026)":
        whatsNext = "Complete your registration for MHT-CET 2026 counselling";
        break;
      case "Document Verification at Facilitation Centre":
        whatsNext = "Visit the Facilitation Centre for document verification";
        break;
      case "Display of Merit List":
        whatsNext = "Await the display of State Level / All India Merit List";
        break;
      case "Filling Option Form for CAP Rounds":
        whatsNext = "Fill your option form for CAP Rounds";
        break;
      case "Seat Allotment":
        whatsNext = "Await seat allotment results";
        break;
      case "Accepting Offered Seat":
        whatsNext = "Accept your offered seat via Candidate Login";
        break;
      case "Reporting to Allotted Institute":
        whatsNext = "Report to your allotted institute with documents";
        break;
      case "Commencement of Course":
        whatsNext = "Congratulations! Your admission is complete. Best of luck!";
        break;
      default:
        whatsNext = "Complete your registration to get started";
    }

    // Check profile completion status
    const isProfileComplete = Boolean(
      student.full_name &&
      student.mobile_number &&
      student.exam_types?.length > 0 &&
      student.category &&
      student.home_state
    );

    return new Response(
      JSON.stringify({
        student: {
          id: student.id,
          full_name: student.full_name,
          email: student.email,
          registration_number: student.registration_number,
          admission_stage: student.admission_stage || "Account Created",
        },
        progress: {
          stages: admissionStages,
          currentStageIndex,
          isProfileComplete,
        },
        whatsNext,
        alerts: alerts || [],
        notices: notices || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
