import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { UserPlus, LogOut, Shield, Users, FileUp, Newspaper } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Welcome, Admin</h2>
          <p className="text-muted-foreground">Manage your counselling portal from here</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create Student Card */}
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate("/admin/create-student")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Create Student</CardTitle>
              <CardDescription>
                Add new student accounts to the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Student Account
              </Button>
            </CardContent>
          </Card>

          {/* Upload Form Card */}
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate("/admin/upload-form")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <FileUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Upload Form</CardTitle>
              <CardDescription>
                Upload admission forms for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <FileUp className="w-4 h-4 mr-2" />
                Upload Student Form
              </Button>
            </CardContent>
          </Card>

          {/* Manage News Card */}
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate("/admin/news")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Newspaper className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Manage News</CardTitle>
              <CardDescription>
                Create and manage student notices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Newspaper className="w-4 h-4 mr-2" />
                Manage Notices
              </Button>
            </CardContent>
          </Card>

          {/* View Students Card */}
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate("/admin/students")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">View Students</CardTitle>
              <CardDescription>
                Browse and manage all student accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View All Students
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
