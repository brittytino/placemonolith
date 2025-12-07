'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function DataExport() {
  const handleExport = () => {
    alert('Export feature will download all student data as Excel file');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download student data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={handleExport} variant="outline" className="justify-start">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as Excel
          </Button>
          <Button onClick={handleExport} variant="outline" className="justify-start">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Export includes all student profiles, batch info, and progress data
        </p>
      </CardContent>
    </Card>
  );
}
