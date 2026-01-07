'use client';

import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function BulkStudentUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const [showModal, setShowModal] = useState(false);

    const downloadTemplate = () => {
        const csvContent = `name,email,rollNo,cgpa
John Doe,john.doe@psgtech.ac.in,24MCA003,8.5
Jane Smith,jane.smith@psgtech.ac.in,24MCA004,9.2
Mike Johnson,mike.j@psgtech.ac.in,24MCA005,7.8`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_upload_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/portal/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
            if (res.data.success > 0) {
                setFile(null);
            }
        } catch (error: any) {
            setResult({
                success: 0,
                failed: 1,
                errors: [error.response?.data?.error || 'Upload failed']
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload Students
            </Button>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Bulk Upload Students</h2>
                                <p className="text-gray-400 text-sm mt-1">Upload CSV file to add multiple students</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Instructions */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    CSV Format Instructions
                                </h3>
                                <ul className="text-gray-300 text-sm space-y-1 ml-6 list-disc">
                                    <li>First row must be headers: <code className="text-purple-400">name,email,rollNo,cgpa</code></li>
                                    <li>Email must be unique and in format: <code className="text-purple-400">user@psgtech.ac.in</code></li>
                                    <li>Roll number must be unique (e.g., <code className="text-purple-400">24MCA001</code>)</li>
                                    <li>CGPA is optional, can be left empty or a number between 0-10</li>
                                    <li>Default password will be: <code className="text-purple-400">Student@123</code></li>
                                </ul>
                            </div>

                            {/* Download Template */}
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div>
                                    <p className="text-white font-medium">Download CSV Template</p>
                                    <p className="text-gray-400 text-sm">Get a pre-formatted template with sample data</p>
                                </div>
                                <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Download
                                </Button>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-4">
                                <label className="block">
                                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {file ? (
                                            <div className="space-y-2">
                                                <FileText className="w-12 h-12 text-purple-400 mx-auto" />
                                                <p className="text-white font-medium">{file.name}</p>
                                                <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                                <p className="text-white">Click to select CSV file</p>
                                                <p className="text-gray-400 text-sm">or drag and drop</p>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {file && (
                                    <Button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                                    >
                                        {loading ? 'Uploading...' : 'Upload Students'}
                                    </Button>
                                )}
                            </div>

                            {/* Results */}
                            {result && (
                                <div className="space-y-3">
                                    {result.success > 0 && (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                            <div>
                                                <p className="text-green-300 font-medium">
                                                    {result.success} student{result.success > 1 ? 's' : ''} uploaded successfully!
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {result.failed > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-red-300 font-medium mb-2">
                                                        {result.failed} row{result.failed > 1 ? 's' : ''} failed
                                                    </p>
                                                    <div className="space-y-1">
                                                        {result.errors.map((error, i) => (
                                                            <p key={i} className="text-red-200 text-sm">• {error}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
