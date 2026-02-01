import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
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

    const url = new URL(req.url);
    const method = req.method;

    const verifyAdmin = async (adminUserId: string) => {
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

      if (userRes.user.id !== adminUserId) {
        return { ok: false as const, status: 403, error: "Unauthorized" };
      }

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: adminUserId,
        _role: "admin",
      });

      if (!isAdmin) {
        return { ok: false as const, status: 403, error: "Forbidden" };
      }

      return { ok: true as const };
    };

    // GET - Fetch documents for a student
    if (method === "GET") {
      const studentId = url.searchParams.get("studentId");
      const adminUserId = url.searchParams.get("adminUserId");

      if (!studentId) {
        return new Response(JSON.stringify({ error: "Student ID is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If adminUserId provided, require JWT verification + admin role
      if (adminUserId) {
        const res = await verifyAdmin(adminUserId);
        if (!res.ok) {
          return new Response(JSON.stringify({ error: res.error }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Fetch documents
      const { data: documents, error } = await supabase
        .from("student_documents")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch documents" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ documents: documents || [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Upload document with file data (base64)
    if (method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      
      // Handle multipart form data for file uploads
      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const studentId = formData.get("studentId") as string;
        const documentType = formData.get("documentType") as string;

        if (!file || !studentId || !documentType) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: file, studentId, documentType" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify student exists
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("id", studentId)
          .single();

        if (studentError || !student) {
          return new Response(
            JSON.stringify({ error: "Invalid student ID" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create file path
        const fileExt = file.name.split(".").pop();
        const filePath = `${studentId}/${documentType}-${Date.now()}.${fileExt}`;

        // Check if document of this type already exists
        const { data: existing } = await supabase
          .from("student_documents")
          .select("id, file_path")
          .eq("student_id", studentId)
          .eq("document_type", documentType)
          .maybeSingle();

        // If exists, delete old file
        if (existing) {
          await supabase.storage
            .from("student-documents")
            .remove([existing.file_path]);
        }

        // Upload file to storage using service role
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("student-documents")
          .upload(filePath, arrayBuffer, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          return new Response(
            JSON.stringify({ error: "Failed to upload file to storage" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update or insert document record
        if (existing) {
          const { data, error } = await supabase
            .from("student_documents")
            .update({
              file_path: filePath,
              file_name: file.name,
              file_size: file.size,
              status: "pending",
              admin_note: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)
            .select()
            .single();

          if (error) {
            console.error("Error updating document:", error);
            return new Response(
              JSON.stringify({ error: "Failed to update document record" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ document: data, message: "Document updated successfully" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create new document record
        const { data, error } = await supabase
          .from("student_documents")
          .insert({
            student_id: studentId,
            document_type: documentType,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            status: "pending",
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating document:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create document record" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ document: data, message: "Document uploaded successfully" }),
          { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle JSON metadata-only request (legacy support)
      const body = await req.json();
      const { studentId, documentType, filePath, fileName, fileSize } = body;

      if (!studentId || !documentType || !filePath || !fileName || !fileSize) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if document of this type already exists
      const { data: existing } = await supabase
        .from("student_documents")
        .select("id, file_path")
        .eq("student_id", studentId)
        .eq("document_type", documentType)
        .maybeSingle();

      // If exists, delete old file and update record
      if (existing) {
        // Delete old file from storage
        await supabase.storage
          .from("student-documents")
          .remove([existing.file_path]);

        // Update record
        const { data, error } = await supabase
          .from("student_documents")
          .update({
            file_path: filePath,
            file_name: fileName,
            file_size: fileSize,
            status: "pending",
            admin_note: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating document:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update document" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ document: data, message: "Document updated successfully" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create new document record
      const { data, error } = await supabase
        .from("student_documents")
        .insert({
          student_id: studentId,
          document_type: documentType,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating document:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create document record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ document: data, message: "Document uploaded successfully" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH - Admin update document status
    if (method === "PATCH") {
      const body = await req.json();
      const { documentId, adminUserId, status, adminNote } = body;

      if (!documentId || !adminUserId || !status) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const res = await verifyAdmin(adminUserId);
      if (!res.ok) {
        return new Response(JSON.stringify({ error: res.error }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update document status
      const { data, error } = await supabase
        .from("student_documents")
        .update({
          status,
          admin_note: adminNote || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select()
        .single();

      if (error) {
        console.error("Error updating document status:", error);
        return new Response(JSON.stringify({ error: "Failed to update document status" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ document: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET signed URL for viewing/download
    if (method === "PUT") {
      const body = await req.json();
      const { filePath, studentId, adminUserId } = body;

      if (!filePath) {
        return new Response(JSON.stringify({ error: "File path is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If adminUserId, require JWT verification + admin role
      if (adminUserId) {
        const res = await verifyAdmin(adminUserId);
        if (!res.ok) {
          return new Response(JSON.stringify({ error: res.error }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (studentId) {
        // Verify the document belongs to the student (non-auth student flow)
        const { data: doc } = await supabase
          .from("student_documents")
          .select("student_id")
          .eq("file_path", filePath)
          .maybeSingle();

        if (!doc || doc.student_id !== studentId) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Generate signed URL
      const { data, error } = await supabase.storage
        .from("student-documents")
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error("Error creating signed URL:", error);
        return new Response(JSON.stringify({ error: "Failed to generate URL" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
