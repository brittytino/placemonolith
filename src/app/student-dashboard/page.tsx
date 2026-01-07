'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { pusherClient } from '@/lib/pusher-client';

interface Drive {
    id: string;
    role: string;
    package: string;
    driveDate: string;
    eligibilityCriteria: string | null;
    company: {
        name: string;
        domain: string | null;
    };
    _count: {
        rounds: number;
    };
    status: 'OPEN' | 'IN_PROGRESS' | 'ELIMINATED' | 'OFFERED';
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrives();

        if (user?.id) {
            const channel = pusherClient.subscribe(`student-${user.id}`);
            channel.bind('outcome-verified', (data: any) => {
                toast.success(data.message || 'Update received!');
                fetchDrives(); // Refresh data
            });

            return () => {
                pusherClient.unsubscribe(`student-${user.id}`);
            };
        }
    }, [user?.id]);

    const fetchDrives = async () => {
        try {
            const res = await axios.get('/api/student/drives');
            if (res.data.success) {
                setDrives(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OFFERED': return 'bg-green-100 text-green-800 border-green-200'; // Success
            case 'ELIMINATED': return 'bg-red-100 text-red-800 border-red-200'; // Fail
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'; // Active
            default: return 'bg-slate-100 text-slate-800 border-slate-200'; // Open
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 w-fit">
                    Your Placement Journey
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Track your applications and record your progress.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive) => (
                        <Card key={drive.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                        <Building className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <Badge variant="outline" className={getStatusColor(drive.status)}>
                                        {drive.status === 'OPEN' ? 'Upcoming' : drive.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold">{drive.company.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" /> {drive.role}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(drive.driveDate).toLocaleDateString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric'
                                    })}
                                </div>
                                <div className="text-sm font-medium">
                                    CTC: <span className="text-green-600 dark:text-green-400">{drive.package}</span>
                                </div>
                                {drive.eligibilityCriteria && (
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {drive.eligibilityCriteria}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Link href={`/student-drives/${drive.id}`} className="w-full">
                                    <Button className="w-full bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 group-hover:translate-x-1 transition-transform">
                                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                    {drives.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500 border-2 border-dashed rounded-xl">
                            <Briefcase className="h-12 w-12 mb-4 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Active Drives</h3>
                            <p>There are no placement drives scheduled for your batch yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
