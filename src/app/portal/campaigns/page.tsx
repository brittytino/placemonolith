'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Calendar, BadgeIndianRupee } from 'lucide-react';
import axios from 'axios';
import { AddDriveDialog } from '@/components/admin/AddDriveDialog';
import { ManageRoundsDialog } from '@/components/admin/ManageRoundsDialog';
import { Badge } from '@/components/ui/badge';

interface Drive {
    id: string;
    role: string;
    package: string;
    driveDate: string;
    company: {
        name: string;
    };
}

export default function AdminDrivesPage() {
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const res = await axios.get('/api/portal/drives');
            if (res.data.success) {
                setDrives(res.data.data);
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
                <h1 className="text-3xl font-bold">Placement Drives</h1>
                <AddDriveDialog onSuccess={fetchDrives} />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive) => (
                        <Card key={drive.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl font-bold">{drive.company.name}</CardTitle>
                                        <p className="text-sm text-slate-500 mt-1">{drive.role}</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                        {drive.package}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-slate-500 mt-2">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(drive.driveDate).toLocaleDateString(undefined, {
                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <ManageRoundsDialog driveId={drive.id} driveRole={drive.role} />
                                    <Button variant="ghost" className="w-full text-xs h-8">
                                        Participants
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {drives.length === 0 && (
                        <div className="col-span-full text-center text-slate-500 py-12">
                            No drives scheduled yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
