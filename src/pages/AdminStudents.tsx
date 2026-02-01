import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Search, Users, Eye, Loader2, UserX, RefreshCw } from "lucide-react";

interface Student {
  id: string;
  full_name: string | null;
  registration_number: string;
  email: string;
  mobile_number: string | null;
  exam_types: string[] | null;
  category: string | null;
  admission_stage: string | null;
  payment_status: string | null;
  created_at: string;
}

const ADMISSION_STAGES = [
  "Account Created",
  "Document Verification",
  "Merit List Display",
  "Option Form Filling",
  "Seat Allotment",
  "Seat Acceptance",
  "Institute Reporting",
  "Course Commencement",
];

const AdminStudents = () => {
  const navigate = useNavigate();
  const { session } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [session]);

  const fetchStudents = async () => {
    if (!session?.access_token) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-students", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to fetch students");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setStudents(data.students || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueExamTypes = useMemo(() => {
    const types = new Set<string>();
    students.forEach((s) => s.exam_types?.forEach((t) => types.add(t)));
    return Array.from(types).sort();
  }, [students]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    students.forEach((s) => s.category && cats.add(s.category));
    return Array.from(cats).sort();
  }, [students]);

  const uniqueStages = useMemo(() => {
    const stages = new Set<string>();
    students.forEach((s) => s.admission_stage && stages.add(s.admission_stage));
    return Array.from(stages).sort();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        student.full_name?.toLowerCase().includes(searchLower) ||
        student.registration_number.toLowerCase().includes(searchLower);

      // Exam type filter
      const matchesExamType =
        examTypeFilter === "all" ||
        student.exam_types?.includes(examTypeFilter);

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || student.category === categoryFilter;

      // Stage filter
      const matchesStage =
        stageFilter === "all" || student.admission_stage === stageFilter;

      return matchesSearch && matchesExamType && matchesCategory && matchesStage;
    });
  }, [students, searchQuery, examTypeFilter, categoryFilter, stageFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setExamTypeFilter("all");
    setCategoryFilter("all");
    setStageFilter("all");
  };

  const handleBulkUpdate = async () => {
    if (!selectedStage || !session?.access_token) return;

    const studentIds = filteredStudents.map((s) => s.id);
    if (studentIds.length === 0) {
      toast.error("No students to update");
      return;
    }

    try {
      setIsBulkUpdating(true);
      const { data, error } = await supabase.functions.invoke("admin-students", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          student_ids: studentIds,
          admission_stage: selectedStage,
        },
      });

      if (error) {
        console.error("Bulk update error:", error);
        toast.error("Failed to update students");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data.message || `Updated ${studentIds.length} students`);
      setBulkDialogOpen(false);
      setSelectedStage("");
      await fetchStudents();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">All Students</h1>
              <p className="text-xs text-muted-foreground">
                View and manage student counselling progress
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                {filteredStudents.length} of {students.length} students
              </CardDescription>
            </div>
            {/* Bulk Update Button */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={filteredStudents.length === 0 || isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Bulk Update Stage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Update Admission Stage</DialogTitle>
                  <DialogDescription>
                    This will update the admission stage for{" "}
                    <strong>{filteredStudents.length}</strong> student(s) currently shown in the list.
                    {(searchQuery || examTypeFilter !== "all" || categoryFilter !== "all" || stageFilter !== "all") && (
                      <span className="block mt-2 text-destructive">
                        Note: Filters are active. Only filtered students will be updated.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">
                    Select New Admission Stage
                  </label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMISSION_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setBulkDialogOpen(false)}
                    disabled={isBulkUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkUpdate}
                    disabled={!selectedStage || isBulkUpdating}
                  >
                    {isBulkUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      `Update ${filteredStudents.length} Students`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or registration number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {uniqueExamTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {uniqueStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchQuery ||
                  examTypeFilter !== "all" ||
                  categoryFilter !== "all" ||
                  stageFilter !== "all") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  No students found
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {students.length === 0
                    ? "No students have been registered yet."
                    : "Try adjusting your search or filters."}
                </p>
                {students.length > 0 && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              /* Table */
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Reg. Number</TableHead>
                      <TableHead>Exam Type(s)</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Admission Stage</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.full_name || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.registration_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.exam_types?.length ? (
                              student.exam_types.map((type) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.category || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.admission_stage || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/students/${student.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminStudents;
