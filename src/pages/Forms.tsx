import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, ArrowLeft, FileIcon, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudentForm {
  id: string;
  form_name: string;
  exam_type: string | null;
  round: string | null;
  file_name: string;
  file_size: number;
  created_at: string;
}

const Forms = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<StudentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  useEffect(() => {
    const studentId = sessionStorage.getItem("studentId");
    if (!studentId) {
      navigate("/");
      return;
    }
    fetchForms(studentId);
  }, [navigate]);

  const fetchForms = async (studentId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-forms?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setForms(data.forms || []);
      } else {
        toast.error(data.error || "Failed to load forms");
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (form: StudentForm) => {
    const studentId = sessionStorage.getItem("studentId");
    if (!studentId) return;

    setDownloading(form.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-forms?studentId=${studentId}&formId=${form.id}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName || form.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started");
      } else {
        toast.error(data.error || "Failed to download form");
      }
    } catch (error) {
      console.error("Error downloading form:", error);
      toast.error("Failed to download form");
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return <FileText className="h-8 w-8 text-destructive" />;
    }
    return <FileIcon className="h-8 w-8 text-muted-foreground" />;
  };

  const isPreviewable = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");
  };

  const handlePreview = async (form: StudentForm) => {
    const studentId = sessionStorage.getItem("studentId");
    if (!studentId) return;

    setPreviewLoading(form.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-forms?studentId=${studentId}&formId=${form.id}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.downloadUrl) {
        setPreviewUrl(data.downloadUrl);
        setPreviewFileName(form.file_name);
      } else {
        toast.error(data.error || "Failed to load preview");
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Failed to load preview");
    } finally {
      setPreviewLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border h-16">
        <div className="px-4 h-full flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">My Forms</h1>
            <p className="text-xs text-muted-foreground">
              Download forms uploaded by your counsellor
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-20 px-4 pb-4 space-y-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                No forms have been uploaded yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Forms will appear here once your counsellor uploads them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(form.file_name)}
                    </div>

                    {/* Form Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {form.form_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {form.exam_type && (
                          <Badge variant="secondary" className="text-xs">
                            {form.exam_type}
                          </Badge>
                        )}
                        {form.round && (
                          <Badge variant="outline" className="text-xs">
                            {form.round}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded on {formatDate(form.created_at)} •{" "}
                        {formatFileSize(form.file_size)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      {isPreviewable(form.file_name) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(form)}
                          disabled={previewLoading === form.id}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleDownload(form)}
                        disabled={downloading === form.id}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {downloading === form.id ? "..." : "Download"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {previewFileName.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={previewUrl}
                className="w-full h-[80vh]"
                title="Form Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-[80vh] p-4">
                <img
                  src={previewUrl}
                  alt="Form Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;
