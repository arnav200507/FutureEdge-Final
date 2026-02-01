import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Check,
  AlertCircle,
  Clock,
  Eye,
  ArrowLeft,
  Info,
  FileImage,
  X,
} from "lucide-react";

interface DocumentItem {
  id: string;
  type: string;
  label: string;
  number: number;
}

interface UploadedDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: "pending" | "approved" | "re-upload";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_LIST: DocumentItem[] = [
  { id: "fc-arc", type: "fc-arc", label: "FC & ARC Document Verification Letter", number: 1 },
  { id: "jee-mhtcet", type: "jee-mhtcet", label: "JEE / MHT-CET Marksheet", number: 2 },
  { id: "ssc-hsc", type: "ssc-hsc", label: "SSC & HSC Marksheet", number: 3 },
  { id: "leaving", type: "leaving", label: "Leaving Certificate", number: 4 },
  { id: "domicile", type: "domicile", label: "Domicile Certificate", number: 5 },
  { id: "nationality", type: "nationality", label: "Nationality Certificate / Performa-1", number: 6 },
  { id: "income", type: "income", label: "Income Certificate", number: 7 },
  { id: "photograph", type: "photograph", label: "Photograph", number: 8 },
  { id: "parents-nationality", type: "parents-nationality", label: "Parents' Nationality / Domicile Certificate", number: 9 },
  { id: "aadhaar", type: "aadhaar", label: "Aadhaar Card", number: 10 },
  { id: "caste", type: "caste", label: "Caste Certificate", number: 11 },
  { id: "caste-validity", type: "caste-validity", label: "Caste Validity Certificate", number: 12 },
  { id: "ncl", type: "ncl", label: "Non-Creamy Layer Certificate", number: 13 },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function Documents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const studentId = sessionStorage.getItem("studentId");
    if (!studentId) {
      navigate("/");
      return;
    }
    fetchDocuments(studentId);
  }, [navigate]);

  const fetchDocuments = async (studentId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents?studentId=${studentId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setUploadedDocs(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (docType: string, file: File) => {
    const studentId = sessionStorage.getItem("studentId");
    if (!studentId) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file format",
        description: "Please upload a PNG or JPG image only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5 MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingType(docType);

    try {
      // Upload via edge function (handles both storage and database)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentId", studentId);
      formData.append("documentType", docType);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload document");
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Refresh documents
      await fetchDocuments(studentId);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingType(null);
    }
  };

  const handlePreview = async (filePath: string) => {
    const studentId = sessionStorage.getItem("studentId");
    if (!studentId) return;

    setPreviewLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-documents`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath, studentId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get preview URL");
      }

      const data = await response.json();
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error("Error getting preview:", error);
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const getDocumentData = (docType: string): UploadedDocument | undefined => {
    return uploadedDocs.find((doc) => doc.document_type === docType);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "re-upload":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Re-upload Required
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b h-16">
        <div className="container mx-auto px-4 h-full flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Upload Documents</h1>
            <p className="text-xs text-muted-foreground">
              Upload clear photos or scans (PNG / JPG only)
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-6 space-y-6 max-w-2xl">
        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Document requirements depend on your category:</p>
                <ul className="space-y-0.5 text-xs">
                  <li>• Open Category: Documents 1–7</li>
                  <li>• SC Category: Documents 1–11</li>
                  <li>• OBC / NT / VJ / SBC Category: Documents 1–12</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Cards */}
        <div className="space-y-3">
          {DOCUMENT_LIST.map((doc) => {
            const uploaded = getDocumentData(doc.type);
            const isUploading = uploadingType === doc.type;

            return (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                          {doc.number}
                        </span>
                        <h3 className="text-sm font-medium leading-tight">
                          {doc.label}
                        </h3>
                      </div>

                      {uploaded && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(uploaded.status)}
                            <span className="text-xs text-muted-foreground truncate">
                              {uploaded.file_name}
                            </span>
                          </div>

                          {uploaded.status === "re-upload" && uploaded.admin_note && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                              <p className="text-xs text-red-700 dark:text-red-400">
                                <strong>Note:</strong> {uploaded.admin_note}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {uploaded && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePreview(uploaded.file_path)}
                          disabled={previewLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        className="hidden"
                        ref={(el) => (fileInputRefs.current[doc.type] = el)}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(doc.type, file);
                            e.target.value = "";
                          }
                        }}
                      />

                      <Button
                        variant={uploaded ? "outline" : "default"}
                        size="sm"
                        className="h-8"
                        disabled={isUploading}
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : uploaded ? (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Replace
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="pt-4 pb-8">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              toast({
                title: "Documents Saved",
                description: "Your documents have been saved. You can continue uploading later.",
              });
              navigate("/dashboard");
            }}
          >
            Save & Continue
          </Button>
        </div>
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
}
