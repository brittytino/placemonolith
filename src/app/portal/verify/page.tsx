'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Outcome {
    id: string;
    result: 'PASS' | 'FAIL';
    student: { name: string; rollNo: string; };
    round: {
        name: string;
        drive: {
            company: { name: string; };
            role: string;
        };
    };
    studentReflection: string;
}

export default function VerificationPage() {
    const [outcomes, setOutcomes] = useState<Outcome[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await axios.get('/api/verification');
            if (res.data.success) {
                setOutcomes(res.data.data);
            }
        } catch (e) {
            console.error(e);
            // If 403, maybe redirect
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'VERIFY' | 'REJECT') => {
        try {
            await axios.post('/api/verification', { outcomeId: id, action });
            toast.success(action === 'VERIFY' ? 'Verified' : 'Rejected');
            setOutcomes(prev => prev.filter(o => o.id !== id));
        } catch (e) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-indigo-600" />
                Verification Queue
            </h1>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="grid gap-4">
                    {outcomes.map(item => (
                        <Card key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{item.student.name}</span>
                                    <span className="text-sm text-slate-500">({item.student.rollNo})</span>
                                    <Badge variant={item.result === 'PASS' ? 'default' : 'destructive'}>
                                        {item.result}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {item.round.drive.company.name} - {item.round.drive.role} ({item.round.name})
                                </p>
                                {item.studentReflection && (
                                    <p className="text-xs text-slate-500 italic">"{item.studentReflection}"</p>
                                )}
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <Button size="sm" variant="destructive" onClick={() => handleAction(item.id, 'REJECT')}>
                                    <X className="mr-1 h-4 w-4" /> Reject
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(item.id, 'VERIFY')}>
                                    <Check className="mr-1 h-4 w-4" /> Verify
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {outcomes.length === 0 && (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                            No pending verifications. Good job!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
