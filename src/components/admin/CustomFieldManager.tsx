'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function CustomFieldManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Custom Fields Manager
        </CardTitle>
        <CardDescription>
          Manage custom profile fields for students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500">
          Custom fields feature coming soon...
        </p>
      </CardContent>
    </Card>
  );
}
