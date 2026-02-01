import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Loader2,
  FileText,
  FolderOpen,
  Users,
  Check,
  Save,
  Download,
  Eye,
  X,
} from "lucide-react";

interface Student {
  id: string;
  full_name: string | null;
  registration_number: string;
  email: string;
  mobile_number: string | null;
  alternate_contact_number: string | null;
  exam_types: string[] | null;
  category: string | null;
  home_state: string | null;
  admission_stage: string | null;
  payment_status: string | null;
  preferred_branches: string[] | null;
  preferred_colleges: string[] | null;
  created_at: string;
  updated_at: string;
}

interface StudentDocument {
  id: string;
  student_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  status: "pending" | "approved" | "re-upload";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const ADMISSION_STAGES = [
  "Registration for Counselling (MHT-CET 2026)",
  "Document Verification at Facilitation Centre",
  "Display of Merit List",
  "Filling Option Form for CAP Rounds",
  "Seat Allotment",
  "Accepting Offered Seat",
  "Reporting to Allotted Institute",
  "Commencement of Course",
];

const AdminStudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { session, user } = useAdminAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [docActionId, setDocActionId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const adminUserId = user?.id ?? null;

  useEffect(() => {
    if (session?.access_token && studentId) {
      fetchStudent();
    }
  }, [session, studentId]);

  const fetchStudent = async () => {
    if (!session?.access_token || !studentId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-student-detail?studentId=${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to fetch student");
        return;
      }

      setStudent(result.student);
      setSelectedStage(result.student.admission_stage || ADMISSION_STAGES[0]);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!studentId || !session?.access_token || !adminUserId) return;

    setIsDocsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents?studentId=${studentId}&adminUserId=${adminUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch documents");
      }

      setDocuments(result.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load uploaded documents");
    } finally {
      setIsDocsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token && studentId && adminUserId) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, studentId, adminUserId]);

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const statusBadge = (status: StudentDocument["status"]) => {
    switch (status) {
      case "approved":
        return <Badge variant="secondary">Approved</Badge>;
      case "re-upload":
        return <Badge variant="destructive">Re-upload</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const previewDocument = async (doc: StudentDocument) => {
    if (!session?.access_token || !adminUserId) {
      toast.error("Session expired. Please log in again.");
      navigate("/admin/login");
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: doc.file_path, adminUserId }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to get preview URL");
      }

      setPreviewUrl(result.signedUrl);
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to load preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadDocument = async (doc: StudentDocument) => {
    if (!session?.access_token || !adminUserId) {
      toast.error("Session expired. Please log in again.");
      navigate("/admin/login");
      return;
    }

    setDocActionId(doc.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: doc.file_path, adminUserId }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to generate download link");
      }

      const signedUrl: string = result.signedUrl;
      const fileRes = await fetch(signedUrl);
      if (!fileRes.ok) throw new Error("Failed to download file");

      const blob = await fileRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = doc.file_name || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setDocActionId(null);
    }
  };

  const updateDocumentStatus = async (
    doc: StudentDocument,
    nextStatus: StudentDocument["status"]
  ) => {
    if (!session?.access_token || !adminUserId) {
      toast.error("Session expired. Please log in again.");
      navigate("/admin/login");
      return;
    }

    const adminNote =
      nextStatus === "re-upload" ? window.prompt("Reason / note for re-upload (optional):") : null;

    setDocActionId(doc.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: doc.id,
            adminUserId,
            status: nextStatus,
            adminNote,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update document status");
      }

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: nextStatus, admin_note: adminNote } : d))
      );
      toast.success("Document status updated");
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setDocActionId(null);
    }
  };

  const handleUpdateStage = async () => {
    if (!studentId || !selectedStage) {
      toast.error("Missing student ID or stage selection");
      return;
    }
    
    if (!session?.access_token) {
      toast.error("Session expired. Please log in again.");
      navigate("/admin/login");
      return;
    }

    console.log("Progress update function called");
    console.log("Student ID:", studentId);
    console.log("New admission stage:", selectedStage);

    setIsUpdating(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-student-detail`;
      console.log("Calling API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, admissionStage: selectedStage }),
      });

      console.log("Response status:", response.status);

      let result;
      try {
        result = await response.json();
        console.log("Response data:", result);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        toast.error("Invalid response from server");
        return;
      }

      if (!response.ok) {
        toast.error(result.error || "Failed to update progress");
        return;
      }

      setStudent((prev) => prev ? { ...prev, admission_stage: selectedStage } : null);
      toast.success("Student admission progress updated successfully.");
    } catch (error) {
      console.error("Fetch error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Unable to connect to server. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred while updating progress");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStageIndex = ADMISSION_STAGES.findIndex(
    (stage) => stage === (student?.admission_stage || ADMISSION_STAGES[0])
  );

  const selectedStageIndex = ADMISSION_STAGES.findIndex(
    (stage) => stage === selectedStage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Student not found</p>
        <Button variant="outline" onClick={() => navigate("/admin/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-foreground">
                {student.full_name || "Unnamed Student"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{student.registration_number}</span>
                <span>•</span>
                <div className="flex gap-1">
                  {student.exam_types?.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
                <span>•</span>
                <span>{student.category || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Section 1: Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Information</CardTitle>
            <CardDescription>Read-only student details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                <p className="font-medium">{student.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mobile Number</p>
                <p className="font-medium">{student.mobile_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Exam Type(s)</p>
                <div className="flex flex-wrap gap-1">
                  {student.exam_types?.length ? (
                    student.exam_types.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className="font-medium">{student.category || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Home State</p>
                <p className="font-medium">{student.home_state || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Admission Progress Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admission Progress</CardTitle>
            <CardDescription>
              Update the student's current admission stage. Changes reflect immediately on their dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar Visual */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Progress Line Background */}
                <div className="absolute top-5 left-[20px] right-[20px] h-1 bg-muted rounded-full" />
                
                {/* Progress Line Fill */}
                <div 
                  className="absolute top-5 left-[20px] h-1 bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: selectedStageIndex === 0 
                      ? '0%' 
                      : `calc(${(selectedStageIndex / (ADMISSION_STAGES.length - 1)) * 100}% - 40px * ${selectedStageIndex / (ADMISSION_STAGES.length - 1)})`
                  }}
                />
                
                {/* Stages */}
                <div className="relative flex justify-between">
                  {ADMISSION_STAGES.map((stage, index) => {
                    const isCompleted = index < selectedStageIndex;
                    const isCurrent = index === selectedStageIndex;
                    
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedStage(stage)}
                        className="flex flex-col items-center group"
                        style={{ width: `${100 / ADMISSION_STAGES.length}%` }}
                      >
                        {/* Step Circle */}
                        <div 
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center z-10 
                            font-semibold text-sm transition-all duration-300 cursor-pointer
                            group-hover:scale-110
                            ${isCompleted 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : isCurrent 
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/25 shadow-lg scale-110" 
                                : "bg-muted text-muted-foreground border-2 border-muted-foreground/20 hover:border-primary/50"
                            }
                          `}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" strokeWidth={3} />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Stage Label */}
                        <span 
                          className={`
                            text-[11px] text-center mt-3 leading-tight max-w-[90px] min-h-[32px]
                            ${isCurrent 
                              ? "text-primary font-semibold" 
                              : isCompleted
                                ? "text-foreground font-medium"
                                : "text-muted-foreground group-hover:text-foreground"
                            }
                          `}
                        >
                          {stage}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile: Dropdown */}
            <div className="md:hidden">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {ADMISSION_STAGES.map((stage, index) => (
                    <SelectItem key={stage} value={stage}>
                      {index + 1}. {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop: Dropdown as alternative */}
            <div className="hidden md:block">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Or select from dropdown:
                  </label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMISSION_STAGES.map((stage, index) => (
                        <SelectItem key={stage} value={stage}>
                          {index + 1}. {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button 
                onClick={handleUpdateStage} 
                disabled={isUpdating || selectedStage === student.admission_stage}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Update Progress
              </Button>
              {selectedStage !== student.admission_stage && (
                <p className="text-sm text-muted-foreground">
                  Changing from stage {currentStageIndex + 1} to stage {selectedStageIndex + 1}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Uploaded Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Documents</CardTitle>
            <CardDescription>
              Review documents uploaded by this student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDocsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading documents…
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const isBusy = docActionId === doc.id;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {formatDocumentType(doc.document_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{doc.file_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {statusBadge(doc.status)}
                            {doc.status === "re-upload" && doc.admin_note ? (
                              <span className="text-xs text-muted-foreground truncate max-w-[260px]">
                                {doc.admin_note}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => previewDocument(doc)}
                              disabled={isBusy || previewLoading}
                            >
                              <Eye className="h-3 w-3" />
                              <span className="ml-1">Preview</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadDocument(doc)}
                              disabled={isBusy}
                            >
                              {isBusy ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              <span className="ml-2">Download</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateDocumentStatus(doc, "approved")}
                              disabled={isBusy}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateDocumentStatus(doc, "re-upload")}
                              disabled={isBusy}
                            >
                              Request Re-upload
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/students/${studentId}/documents`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Uploaded Documents
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/students/${studentId}/forms`)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                View Uploaded Forms
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/students")}>
                <Users className="h-4 w-4 mr-2" />
                Back to Students List
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img
              src={previewUrl}
              alt="Document preview"
              className="max-w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentDetail;
