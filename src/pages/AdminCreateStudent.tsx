import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, UserPlus, RotateCcw, CheckCircle, Eye, EyeOff } from "lucide-react";

const EXAM_TYPES = ["MHT-CET", "JEE", "NEET", "Others"];
const CATEGORIES = ["Open", "SC", "ST", "OBC", "NT", "VJ", "SBC"];

interface CreatedStudent {
  registrationNumber: string;
  email: string;
  tempPassword: string;
}

const AdminCreateStudent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<CreatedStudent | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    registrationNumber: "",
    mobileNumber: "",
    email: "",
    examTypes: [] as string[],
    category: "Open",
    tempPassword: "Welcome@123",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    
    if (formData.examTypes.length === 0) {
      newErrors.examTypes = "Select at least one exam type";
    }
    
    if (!formData.tempPassword || formData.tempPassword.length < 8) {
      newErrors.tempPassword = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExamTypeChange = (examType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      examTypes: checked 
        ? [...prev.examTypes, examType]
        : prev.examTypes.filter(t => t !== examType)
    }));
    setErrors(prev => ({ ...prev, examTypes: "" }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      registrationNumber: "",
      mobileNumber: "",
      email: "",
      examTypes: [],
      category: "Open",
      tempPassword: "Welcome@123",
    });
    setErrors({});
    setCreatedStudent(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-student", {
        body: {
          fullName: formData.fullName.trim(),
          registrationNumber: formData.registrationNumber.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          email: formData.email.trim().toLowerCase(),
          examTypes: formData.examTypes,
          category: formData.category,
          tempPassword: formData.tempPassword,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("duplicate") || data.error.includes("already exists")) {
          setErrors({ registrationNumber: "This registration number already exists" });
          toast.error("Registration number already exists");
        } else {
          toast.error(data.error);
        }
        return;
      }

      setCreatedStudent({
        registrationNumber: formData.registrationNumber,
        email: formData.email,
        tempPassword: formData.tempPassword,
      });
      
      toast.success("Student account created successfully!");
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast.error(error.message || "Failed to create student account");
    } finally {
      setIsLoading(false);
    }
  };

  if (createdStudent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl text-foreground">Account Created Successfully!</CardTitle>
            <CardDescription>
              Share these login details with the student
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Registration Number</p>
                  <p className="font-mono font-semibold text-foreground">{createdStudent.registrationNumber}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(createdStudent.registrationNumber, "Registration number")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-mono text-sm text-foreground">{createdStudent.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(createdStudent.email, "Email")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Temporary Password</p>
                  <p className="font-mono text-sm text-foreground">{createdStudent.tempPassword}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(createdStudent.tempPassword, "Password")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetForm}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Another
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate("/admin")}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Create Student Account
          </CardTitle>
          <CardDescription>
            Add a new student to the counselling portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Student Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter student's full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            {/* Registration Number */}
            <div className="space-y-1.5">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                placeholder="e.g., FE-001 or MHT-2025-014"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                className={errors.registrationNumber ? "border-destructive" : ""}
              />
              {errors.registrationNumber && (
                <p className="text-xs text-destructive">{errors.registrationNumber}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                className={errors.mobileNumber ? "border-destructive" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Exam Types */}
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXAM_TYPES.map((exam) => (
                  <div key={exam} className="flex items-center space-x-2">
                    <Checkbox
                      id={exam}
                      checked={formData.examTypes.includes(exam)}
                      onCheckedChange={(checked) => handleExamTypeChange(exam, checked as boolean)}
                    />
                    <Label htmlFor={exam} className="text-sm font-normal cursor-pointer">
                      {exam}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.examTypes && (
                <p className="text-xs text-destructive">{errors.examTypes}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Temporary Password */}
            <div className="space-y-1.5">
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <div className="relative">
                <Input
                  id="tempPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Set temporary password"
                  value={formData.tempPassword}
                  onChange={(e) => handleInputChange("tempPassword", e.target.value)}
                  className={errors.tempPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.tempPassword && (
                <p className="text-xs text-destructive">{errors.tempPassword}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Student will be asked to change this on first login
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={resetForm}
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Form
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateStudent;
