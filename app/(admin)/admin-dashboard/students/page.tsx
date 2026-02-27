"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  faculty: string;
  level: string;
  programme: string;
  createdAt: string;
}

const faculties = [
  "Faculty of Computing Engineering and Mathematical Sciences: (CEMS)",
  "Faculty of Economics and Business Administration: (EBA)",
  "Faculty of Education: (ED)",
  "Faculty of Nursing and Midwifery: (SONAM)",
  "Faculty of Religious Studies: (RS)",
];

const levels = ["Level 100", "Level 200", "Level 300", "Level 400"];

const programmes = [
  "Computer Science",
  "Information Technology",
  "Business Administration",
  "Economics",
  "Nursing",
  "Education",
  "Psychology",
  "Sociology",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
];

export default function StudentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    faculty: "",
    level: "",
    programme: "",
    password: "",
  });

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setIsLoadingAuth(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch students
  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [page, search, facultyFilter, levelFilter, user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        faculty: facultyFilter,
        level: levelFilter,
      });

      const response = await fetch(`/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch students");

      const data = await response.json();
      setStudents(data.students);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student._id);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
      faculty: student.faculty,
      level: student.level,
      programme: student.programme,
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete student");

      setSuccess("Student deleted successfully");
      fetchStudents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (editingId) {
        // Update
        const response = await fetch(`/api/students/${editingId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update student");
        }

        setSuccess("Student updated successfully");
      } else {
        // Create - password is required for new students
        if (!formData.password || formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }

        const response = await fetch("/api/students", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create student");
        }

        setSuccess("Student created successfully");
      }

      setShowModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        studentId: "",
        faculty: "",
        level: "",
        programme: "",
        password: "",
      });
      setEditingId(null);
      fetchStudents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Students Management
              </h1>
              <p className="text-zinc-400">
                View and manage all registered students
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  studentId: "",
                  faculty: "",
                  level: "",
                  programme: "",
                  password: "",
                });
                setShowModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </motion.div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400"
            >
              <span className="text-sm font-medium">{success}</span>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-10 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 text-white placeholder:text-zinc-500 rounded-lg"
                />
              </div>

              <select
                value={facultyFilter}
                onChange={(e) => {
                  setFacultyFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Faculties</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center p-12">
                <p className="text-zinc-400">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Student ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Faculty
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Level
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Programme
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-400 text-sm">
                            {student.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white text-sm font-mono">
                            {student.studentId}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-300 text-sm truncate max-w-xs">
                            {student.faculty}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                            {student.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-300 text-sm">
                            {student.programme}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(student)}
                              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(student._id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-800/50">
                <span className="text-sm text-zinc-400">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Student" : "Add New Student"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="col-span-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="col-span-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />

              <input
                type="text"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />

              {!editingId && (
                <input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              )}

              <select
                value={formData.faculty}
                onChange={(e) =>
                  setFormData({ ...formData, faculty: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>

              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Level</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <select
                value={formData.programme}
                onChange={(e) =>
                  setFormData({ ...formData, programme: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Programme</option>
                {programmes.map((programme) => (
                  <option key={programme} value={programme}>
                    {programme}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
