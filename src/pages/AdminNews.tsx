import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, Newspaper } from "lucide-react";
import { format } from "date-fns";

interface Notice {
  id: string;
  title: string;
  content: string | null;
  is_important: boolean;
  status: string;
  published_at: string;
  created_at: string;
}

const AdminNews = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noticeType, setNoticeType] = useState<"important" | "update">("update");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotices((data as Notice[]) || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setNoticeType("update");
    setStatus("draft");
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (notice: Notice) => {
    setTitle(notice.title);
    setContent(notice.content || "");
    setNoticeType(notice.is_important ? "important" : "update");
    setStatus(notice.status as "published" | "draft");
    setEditingId(notice.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notice title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter a notice description");
      return;
    }

    setIsSaving(true);

    try {
      const noticeData = {
        title: title.trim(),
        content: content.trim(),
        is_important: noticeType === "important",
        status,
        published_at: status === "published" ? new Date().toISOString() : new Date().toISOString(),
      };

      if (isEditing && editingId) {
        const { error } = await supabase
          .from("notices")
          .update(noticeData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Notice updated successfully");
      } else {
        const { error } = await supabase
          .from("notices")
          .insert(noticeData);

        if (error) throw error;
        toast.success("Notice created successfully");
      }

      resetForm();
      fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);
      toast.error("Failed to save notice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notices")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Notice deleted successfully");
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error("Failed to delete notice");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage News & Notices</h1>
            <p className="text-muted-foreground">
              Create and manage student updates shown on the dashboard
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Notice" : "Add New Notice"}</CardTitle>
              <CardDescription>
                {isEditing ? "Update the notice details" : "Create a new notice for students"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Notice Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notice title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Notice Description *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter a short, student-friendly description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Notice Type</Label>
                    <Select value={noticeType} onValueChange={(v) => setNoticeType(v as "important" | "update")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Publish Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as "published" | "draft")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Notice"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Add New Notice
          </Button>
        )}

        {/* Notices List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              All Notices
            </CardTitle>
            <CardDescription>
              {notices.length} notice{notices.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading notices...</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notices yet. Create your first notice above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {notice.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={notice.is_important ? "destructive" : "secondary"}>
                            {notice.is_important ? "Important" : "Update"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notice.status === "published" ? "default" : "outline"}>
                            {notice.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(notice.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(notice)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{notice.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(notice.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNews;
