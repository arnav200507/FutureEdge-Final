import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, User, Phone, GraduationCap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import futureEdgeLogo from "@/assets/future-edge-logo.png";

const EXAM_TYPE_OPTIONS = ["MHT-CET", "JEE", "NEET", "Other"];
const CATEGORY_OPTIONS = ["Open", "SC", "ST", "OBC", "NT", "VJ", "SBC"];
const BRANCH_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Data Science",
  "AI & Machine Learning",
];

interface StudentProfile {
  id: string;
  full_name: string | null;
  registration_number: string;
  email: string;
  mobile_number: string | null;
  alternate_contact_number: string | null;
  exam_types: string[] | null;
  category: string | null;
  home_state: string | null;
  preferred_branches: string[] | null;
  preferred_colleges: string[] | null;
}

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAdminAuth();
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Editable fields
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [homeState, setHomeState] = useState("");
  const [preferredBranches, setPreferredBranches] = useState<string[]>([]);
  const [preferredColleges, setPreferredColleges] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      // Check if student is logged in via session
      const studentId = sessionStorage.getItem("studentId");
      const mustChangePassword = sessionStorage.getItem("mustChangePassword");

      // If admin is viewing, get studentId from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const viewStudentId = urlParams.get("studentId");

      if (isAdmin && viewStudentId) {
        // Admin viewing a specific student's profile
        setIsReadOnly(true);
        await loadProfile(viewStudentId, user?.id);
      } else if (studentId) {
        // Student viewing their own profile
        if (mustChangePassword === "true") {
          navigate("/change-password");
          return;
        }
        await loadProfile(studentId);
      } else if (!user) {
        // Not logged in
        navigate("/");
        return;
      }
    };

    fetchProfile();
  }, [navigate, user, isAdmin]);

  const loadProfile = async (studentId: string, adminUserId?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ studentId });
      if (adminUserId) {
        params.append("adminUserId", adminUserId);
      }

      // Use fetch directly for GET with query params
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const fetchResponse = await fetch(
        `${supabaseUrl}/functions/v1/student-profile?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const data = await fetchResponse.json();

      if (!fetchResponse.ok) {
        throw new Error(data.error || "Failed to load profile");
      }

      const student = data.student;
      setProfile(student);
      
      // Initialize form fields
      setMobileNumber(student.mobile_number || "");
      setAlternateContact(student.alternate_contact_number || "");
      setExamTypes(student.exam_types || []);
      setCategory(student.category || "");
      setHomeState(student.home_state || "");
      setPreferredBranches(student.preferred_branches || []);
      setPreferredColleges(student.preferred_colleges?.join(", ") || "");
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (alternateContact && !/^\d{10}$/.test(alternateContact)) {
      newErrors.alternateContact = "Alternate contact must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !profile) return;

    setIsSaving(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          studentId: profile.id,
          mobile_number: mobileNumber,
          alternate_contact_number: alternateContact || null,
          exam_types: examTypes,
          category: category || null,
          home_state: homeState || null,
          preferred_branches: preferredBranches,
          preferred_colleges: preferredColleges
            ? preferredColleges.split(",").map((c) => c.trim()).filter(Boolean)
            : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExamTypeChange = (examType: string, checked: boolean) => {
    if (checked) {
      setExamTypes([...examTypes, examType]);
    } else {
      setExamTypes(examTypes.filter((t) => t !== examType));
    }
  };

  const handleBranchChange = (branch: string, checked: boolean) => {
    if (checked) {
      setPreferredBranches([...preferredBranches, branch]);
    } else {
      setPreferredBranches(preferredBranches.filter((b) => b !== branch));
    }
  };

  const handleBack = () => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border h-16">
        <div className="max-w-3xl mx-auto px-4 h-full flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img
              src={futureEdgeLogo}
              alt="Future Edge Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold font-display text-foreground">
              Future Edge
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-6 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and update your personal information
            </p>
            {isReadOnly && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Viewing in read-only mode
              </p>
            )}
          </div>

          {/* Section 1: Personal Details */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                  <CardDescription>These details are managed by your counsellor.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Full Name</Label>
                  <Input
                    value={profile?.full_name || "—"}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Registration Number</Label>
                  <Input
                    value={profile?.registration_number || "—"}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Email Address</Label>
                <Input
                  value={profile?.email || "—"}
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Section 2: Contact Information */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>Keep your contact details up to date.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={isReadOnly || isSaving}
                    className={errors.mobileNumber ? "border-destructive" : ""}
                  />
                  {errors.mobileNumber && (
                    <p className="text-sm text-destructive">{errors.mobileNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternate">Alternate Contact (Optional)</Label>
                  <Input
                    id="alternate"
                    type="tel"
                    placeholder="10-digit number"
                    value={alternateContact}
                    onChange={(e) => setAlternateContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={isReadOnly || isSaving}
                    className={errors.alternateContact ? "border-destructive" : ""}
                  />
                  {errors.alternateContact && (
                    <p className="text-sm text-destructive">{errors.alternateContact}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Section 3: Academic & Exam Details */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Academic & Exam Details</CardTitle>
                  <CardDescription>Select your exams and category.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exam Types */}
              <div className="space-y-3">
                <Label>Exam Type (Select all that apply)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EXAM_TYPE_OPTIONS.map((exam) => (
                    <label
                      key={exam}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={examTypes.includes(exam)}
                        onCheckedChange={(checked) => handleExamTypeChange(exam, !!checked)}
                        disabled={isReadOnly || isSaving}
                      />
                      <span className="text-sm">{exam}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isReadOnly || isSaving}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Home State */}
                <div className="space-y-2">
                  <Label htmlFor="homeState">Home State</Label>
                  <Input
                    id="homeState"
                    placeholder="e.g., Maharashtra"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    disabled={isReadOnly || isSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Section 4: Preferences */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                  <CardDescription>Tell us about your preferences (optional).</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Branches */}
              <div className="space-y-3">
                <Label>Preferred Branches</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BRANCH_OPTIONS.map((branch) => (
                    <label
                      key={branch}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={preferredBranches.includes(branch)}
                        onCheckedChange={(checked) => handleBranchChange(branch, !!checked)}
                        disabled={isReadOnly || isSaving}
                      />
                      <span className="text-sm">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Colleges */}
              <div className="space-y-2">
                <Label htmlFor="colleges">Preferred Colleges</Label>
                <Input
                  id="colleges"
                  placeholder="Enter college names separated by commas"
                  value={preferredColleges}
                  onChange={(e) => setPreferredColleges(e.target.value)}
                  disabled={isReadOnly || isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple colleges with commas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {!isReadOnly && (
            <div className="flex justify-end pb-8 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[160px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
