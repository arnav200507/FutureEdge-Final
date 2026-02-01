import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateStudent from "./pages/AdminCreateStudent";
import AdminUploadForm from "./pages/AdminUploadForm";
import AdminNews from "./pages/AdminNews";
import AdminStudents from "./pages/AdminStudents";
import AdminStudentDetail from "./pages/AdminStudentDetail";
import Documents from "./pages/Documents";
import Forms from "./pages/Forms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/create-student" 
              element={
                <AdminProtectedRoute>
                  <AdminCreateStudent />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/upload-form" 
              element={
                <AdminProtectedRoute>
                  <AdminUploadForm />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/news" 
              element={
                <AdminProtectedRoute>
                  <AdminNews />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <AdminProtectedRoute>
                  <AdminStudents />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students/:studentId" 
              element={
                <AdminProtectedRoute>
                  <AdminStudentDetail />
                </AdminProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
