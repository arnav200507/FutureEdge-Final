import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import futureEdgeLogo from "@/assets/future-edge-logo.png";

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  if (score >= 4) return { score: 4, label: "Strong", color: "bg-green-500" };
  
  return { score: 0, label: "", color: "" };
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Get student ID from session storage
      const studentId = sessionStorage.getItem("studentId");
      
      if (!studentId) {
        navigate("/");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("update-first-password", {
        body: {
          studentId,
          newPassword: password,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to update password");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update session storage
      sessionStorage.setItem("mustChangePassword", "false");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Update password error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="flex items-center justify-center gap-3">
          <img
            src={futureEdgeLogo}
            alt="Future Edge Logo"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold font-display text-foreground">
            Future Edge
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8 animate-slide-up">
            {/* Welcome Message */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Welcome! Please set a new password to continue.
              </p>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-2">
                Set Your Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Create a secure password to protect your account
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 flex items-start gap-3 animate-scale-in">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
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
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-2 animate-scale-in">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Minimum 8 characters
                      </p>
                      <p className={`text-xs font-medium ${
                        passwordStrength.score >= 3 ? "text-green-600" : 
                        passwordStrength.score >= 2 ? "text-yellow-600" : "text-destructive"
                      }`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Match Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 animate-scale-in">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-xs text-green-600">Passwords match</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-xs text-destructive">Passwords do not match</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || password.length < 8 || password !== confirmPassword}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-hover transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Password & Continue"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Future Edge. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default ChangePassword;
