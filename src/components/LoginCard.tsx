import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Lock, AlertCircle } from "lucide-react";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const LoginCard = () => {
  const navigate = useNavigate();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!registrationNumber.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("student-login", {
        body: {
          registrationNumber: registrationNumber.trim(),
          password,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Login failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.student) {
        // Store session info
        sessionStorage.setItem("studentId", data.student.id);
        sessionStorage.setItem("studentName", data.student.fullName || "Student");
        sessionStorage.setItem("mustChangePassword", String(data.student.mustChangePassword));

        // Redirect based on password change requirement
        if (data.student.mustChangePassword) {
          navigate("/change-password");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid registration number or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sign in to access your portal
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 flex items-start gap-3 animate-scale-in">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Registration Number Field */}
          <div className="space-y-2">
            <Label htmlFor="registration" className="text-sm font-medium text-foreground">
              Registration Number
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="registration"
                type="text"
                placeholder="Enter your registration number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="pl-11 h-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use the registration number provided by your counsellor
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-hover transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-border space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            For login issues, contact your counsellor
          </p>
          <p className="text-center text-xs text-muted-foreground/70">
            Are you an admin?{" "}
            <Link 
              to="/admin/login" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Admin Login
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginCard;
