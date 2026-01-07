'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Upload } from 'lucide-react';
import axios from 'axios';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';

interface Student {
    id: string;
    name: string;
    rollNo: string;
    email: string;
    cgpa: number | null;
    isActive: boolean;
    batch: { name: string };
}

export default function AdminStudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/admin/students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Students</h1>
                <div className="flex gap-2">
                    <BulkUploadDialog onSuccess={fetchStudents} />
                    <Button className="bg-indigo-600">
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Directory ({students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>CGPA</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.batch.name}</TableCell>
                                        <TableCell>{student.cgpa || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {student.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                            No students found. Upload or add students to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
