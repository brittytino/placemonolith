'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Clock, Building, ArrowLeft } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';

// We need a specific component for Round Outcome Entry
import { RoundOutcomeForm } from '@/components/student/RoundOutcomeForm';

interface DriveDetail {
    id: string;
    role: string;
    package: string;
    description: string | null;
    company: { name: string; website: string | null; };
    rounds: { id: string; name: string; orderIndex: number; }[];
    participation: {
        currentStatus: string;
        roundOutcomes: { roundId: string; result: string; }[];
    } | null;
}

export default function StudentDriveDetailPage() {
    const params = useParams();
    const driveId = params.driveId as string;
    const { user } = useAuth();
    const [drive, setDrive] = useState<DriveDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (driveId) fetchDriveDetails();
    }, [driveId]);

    const fetchDriveDetails = async () => {
        try {
            const res = await axios.get(`/api/student/drives/${driveId}`);
            if (res.data.success) {
                setDrive(res.data.data);
            }
        } catch (e) {
            toast.error('Failed to load drive details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!drive) return <div className="p-8 text-center text-slate-500">Drive not found</div>;

    // Determine current active round for the student
    // Logic: Find the first round that DOES NOT have an outcome.
    // If previous round was FAIL, then student is Eliminated, no more rounds.

    const outcomes = drive.participation?.roundOutcomes || [];
    const isEliminated = outcomes.some(o => o.result === 'FAIL');

    // Find next pending round
    // A round is pending if:
    // 1. It has no outcome
    // 2. All previous rounds were PASSED
    // 3. Student is not ELIMINATED

    let activeRoundId: string | null = null;

    if (!isEliminated) {
        for (const round of drive.rounds) {
            const hasOutcome = outcomes.find(o => o.roundId === round.id);
            if (!hasOutcome) {
                activeRoundId = round.id;
                break; // This is the next one
            }
        }
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-4xl space-y-6">
            <Link href="/student-dashboard" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>

            <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold">{drive.company.name}</CardTitle>
                            <CardDescription className="text-lg">{drive.role}</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-green-600">{drive.package}</div>
                            {drive.company.website && (
                                <a href={drive.company.website} target="_blank" className="text-sm text-indigo-600 hover:underline">
                                    Visit Website
                                </a>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Progress</h3>

                {isEliminated && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Eliminated</AlertTitle>
                        <AlertDescription>
                            You have been eliminated from this drive. Better luck next time!
                        </AlertDescription>
                    </Alert>
                )}

                {!isEliminated && !activeRoundId && outcomes.length === drive.rounds.length && drive.rounds.length > 0 && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>All Rounds Completed</AlertTitle>
                        <AlertDescription>
                            You have passed all rounds! Waiting for final offer confirmation.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-8 space-y-8 py-2">
                    {drive.rounds.map((round, index) => {
                        const outcome = outcomes.find(o => o.roundId === round.id);
                        const isNext = round.id === activeRoundId;
                        const isLocked = !outcome && !isNext;

                        return (
                            <div key={round.id} className="relative">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-2 
                                    ${outcome?.result === 'PASS' ? 'bg-green-500 border-green-500' :
                                        outcome?.result === 'FAIL' ? 'bg-red-500 border-red-500' :
                                            isNext ? 'bg-white border-indigo-500 animate-pulse' :
                                                'bg-slate-100 border-slate-300'
                                    }`}
                                />

                                <Card className={`${isNext ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'opacity-80'}`}>
                                    <CardHeader className="py-3">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base font-medium">
                                                Round {index + 1}: {round.name}
                                            </CardTitle>
                                            {outcome ? (
                                                <Badge variant={outcome.result === 'PASS' ? 'default' : 'destructive'}>
                                                    {outcome.result}
                                                </Badge>
                                            ) : isNext ? (
                                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                                                    In Progress
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400">Locked</Badge>
                                            )}
                                        </div>
                                    </CardHeader>

                                    {isNext && (
                                        <CardContent>
                                            <RoundOutcomeForm
                                                driveId={drive.id}
                                                roundId={round.id}
                                                roundName={round.name}
                                                onSuccess={fetchDriveDetails}
                                            />
                                        </CardContent>
                                    )}
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
