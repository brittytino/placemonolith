'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Users, Briefcase, Calendar } from 'lucide-react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { format } from 'path';

interface Batch {
    id: string;
    name: string;
    status: 'PLACEMENT_ACTIVE' | 'PREPARATION_ACTIVE' | 'ARCHIVED';
    startYear: number;
    endYear: number;
    placementRep: {
        name: string;
    };
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/api/portal/batches');
            if (res.data.success) {
                setBatches(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    if (loading || fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Welcome, {user?.name}. Managing {batches.find(b => b.placementRep.name === user?.name)?.name || 'Batches'}
                    </p>
                </div>

                {/* Only allow creating new batch if < 2 active. For now, disable */}
                <Button className="bg-indigo-600" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    New Batch
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                    <Card key={batch.id} className="hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">{batch.name}</CardTitle>
                            <Badge variant={
                                batch.status === 'PLACEMENT_ACTIVE' ? 'default' :
                                    batch.status === 'PREPARATION_ACTIVE' ? 'secondary' : 'outline'
                            }>
                                {batch.status.replace('_', ' ')}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center text-sm text-slate-500">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {batch.startYear} - {batch.endYear}
                                </div>
                                <div className="flex items-center text-sm text-slate-500">
                                    <Users className="mr-2 h-4 w-4" />
                                    Rep: {batch.placementRep.name}
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <Button variant="outline" className="w-full flex-1">
                                        Manage
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
