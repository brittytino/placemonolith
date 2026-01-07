'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Trash2, Edit, Mail, Phone, Shield } from 'lucide-react';
import axios from 'axios';

interface Student {
  id: string;
  registerNumber: string;
  email: string;
  role: 'STUDENT' | 'CLASS_REP' | 'SUPER_ADMIN';
  studentProfile?: {
    fullName: string;
    contactNumber?: string;
  };
  batchStartYear: number;
  batchEndYear: number;
  isActive: boolean;
}

interface StudentTableProps {
  onUpdate?: () => void;
}

export default function StudentTable({ onUpdate }: StudentTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = students.filter(s =>
        s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.studentProfile?.fullName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [search, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students');
      setStudents(response.data.data || []);
      setFilteredStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await axios.delete(`/api/students/${id}`);
      fetchStudents();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('Failed to delete student');
    }
  };

  const handleRoleChange = async (studentId: string, newRole: string) => {
    try {
      await axios.patch(`/api/portal/students/${studentId}/role`, { role: newRole });
      fetchStudents();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update student role');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Users className="h-5 w-5" />
          Students Management
        </CardTitle>
        <CardDescription className="text-sm">
          View and manage all students in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or register number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-slate-500">
            <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-2"></div>
            Loading students...
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No students found</p>
            <p className="text-xs mt-1">Upload students using the Bulk Upload tab</p>
          </div>
        )}

        {/* Students Grid - Mobile First */}
        {!loading && filteredStudents.length > 0 && (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Register No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 text-sm font-medium">{student.registerNumber}</td>
                      <td className="px-4 py-3 text-sm">{student.studentProfile?.fullName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{student.email}</td>
                      <td className="px-4 py-3 text-sm">{student.batchStartYear}-{student.batchEndYear}</td>
                      <td className="px-4 py-3">
                        {student.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </span>
                        ) : (
                          <Select
                            value={student.role}
                            onValueChange={(value) => handleRoleChange(student.id, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="CLASS_REP">Class Rep</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-100'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {student.studentProfile?.fullName || 'N/A'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {student.registerNumber}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      student.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-100'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.studentProfile?.contactNumber && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{student.studentProfile.contactNumber}</span>
                      </div>
                    )}
                    <div className="text-slate-600 dark:text-slate-400">
                      Batch: {student.batchStartYear}-{student.batchEndYear}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Count */}
            <div className="text-center text-sm text-slate-500 pt-2">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
