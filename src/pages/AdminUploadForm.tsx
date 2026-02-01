import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Note: Using edge function for uploads (bypasses RLS restrictions)
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string | null;
  registration_number: string;
}

const EXAM_TYPES = ["MHT-CET", "JEE", "NEET", "Other"];
const CAP_ROUNDS = ["Round 1", "Round 2", "Round 3", "Special Round"];
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AdminUploadForm = () => {
  const navigate = useNavigate();
  const { session } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [formName, setFormName] = useState("");
  const [examType, setExamType] = useState("");
  const [capRound, setCapRound] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.access_token) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  const fetchStudents = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-student-list`,
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
        throw new Error(result?.error || "Failed to fetch students");
      }

      setStudents(result.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error("Only PDF, PNG, and JPG files are allowed");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10 MB");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    if (!formName.trim()) {
      toast.error("Please enter a form name");
      return;
    }

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!session?.access_token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    setUploading(true);

    try {
      // Use edge function to upload form (bypasses RLS)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentId", selectedStudent);
      formData.append("formName", formName.trim());
      if (examType) formData.append("examType", examType);
      if (capRound) formData.append("capRound", capRound);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-upload-form`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to upload form");
      }

      setSuccess(true);
      toast.success("Form uploaded successfully");
    } catch (error) {
      console.error("Error uploading form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload form");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedStudent("");
    setFormName("");
    setExamType("");
    setCapRound("");
    setFile(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Upload Student Form
            </h1>
          </div>
        </header>

        <main className="p-4 max-w-lg mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Form Uploaded Successfully
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                The form is now available for the student to download.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleReset}>Upload Another Form</Button>
                <Button variant="outline" onClick={() => navigate("/admin")}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Upload Student Form
            </h1>
            <p className="text-xs text-muted-foreground">
              Upload filled admission forms for students to download
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Form Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Student Selection - Searchable */}
              <div className="space-y-2">
                <Label>
                  Select Student <span className="text-destructive">*</span>
                </Label>
                {loading ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading students...
                  </div>
                ) : students.length === 0 ? (
                  <div className="h-10 px-3 border rounded-md flex items-center text-sm text-muted-foreground">
                    No students found. Please create students first.
                  </div>
                ) : (
                  <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={studentOpen}
                        className="w-full justify-between font-normal"
                      >
                        {selectedStudentData
                          ? `${selectedStudentData.full_name || "Unnamed"} (${selectedStudentData.registration_number})`
                          : "Choose a student..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search by name or registration..." />
                        <CommandList>
                          <CommandEmpty>No student found.</CommandEmpty>
                          <CommandGroup>
                            {students.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={`${student.full_name ?? ""} ${student.registration_number}`}
                                onSelect={() => {
                                  setSelectedStudent(student.id);
                                  setStudentOpen(false);
                                }}
                              >
                                <span
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudent === student.id ? "opacity-100" : "opacity-0"
                                  )}
                                >
                                  ✓
                                </span>
                                {student.full_name || "Unnamed"} ({student.registration_number})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Form Name */}
              <div className="space-y-2">
                <Label htmlFor="formName">
                  Form Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="formName"
                  placeholder="e.g., CET Option Form – Round 1"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Exam Type */}
              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type (Optional)</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger id="examType">
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    {EXAM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CAP Round */}
              <div className="space-y-2">
                <Label htmlFor="capRound">CAP Round (Optional)</Label>
                <Select value={capRound} onValueChange={setCapRound}>
                  <SelectTrigger id="capRound">
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    {CAP_ROUNDS.map((round) => (
                      <SelectItem key={round} value={round}>
                        {round}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">
                  Upload Form File <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    {file ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Click to select file
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, PNG, JPG (max 10 MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={uploading || !selectedStudent || !formName.trim() || !file}
                >
                  {uploading ? "Uploading..." : "Upload Form"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUploadForm;
