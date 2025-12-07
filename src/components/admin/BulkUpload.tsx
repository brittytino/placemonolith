'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import axios from 'axios';

interface BulkUploadProps {
  onSuccess?: () => void;
}

export default function BulkUpload({ onSuccess }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState<{
    processed: number;
    total: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setProgress(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/admin/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`Successfully uploaded ${response.data.data.successful} students!`);
      setProgress({
        processed: response.data.data.processed,
        total: response.data.data.total,
        errors: response.data.data.errors || [],
      });
      
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.location.href = '/templates/bulk-upload-template.xlsx';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Upload className="h-5 w-5" />
          Bulk Upload Students
        </CardTitle>
        <CardDescription className="text-sm">
          Upload an Excel file to add multiple students at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Download Template
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Use our template to ensure correct format
                </p>
              </div>
            </div>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto flex-shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <label className="block">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 sm:p-8 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Excel files only (.xlsx, .xls)
                </p>
              </label>
            </div>
          </label>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-900 dark:text-green-100 truncate flex-1">
                {file.name}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-900 dark:text-green-100">{success}</p>
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">Processed:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {progress.processed} / {progress.total}
              </span>
            </div>
            {progress.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600 mb-1">Errors:</p>
                <ul className="text-xs text-red-900 dark:text-red-100 space-y-1 max-h-32 overflow-y-auto">
                  {progress.errors.map((err, idx) => (
                    <li key={idx} className="truncate">{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Students
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
