'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Lightbulb, Building } from 'lucide-react';
import axios from 'axios';

interface Insight {
    id: string;
    result: 'PASS' | 'FAIL';
    studentReflection: string;
    questionsAsked: string | null;
    student: { batch: { name: string } };
    round: {
        name: string;
        drive: {
            company: { name: string };
            role: string;
            package: string;
        };
    };
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async (search?: string) => {
        setLoading(true);
        try {
            const params = search ? `?role=${search}` : '';
            const res = await axios.get(`/api/insights${params}`);
            if (res.data.success) {
                setInsights(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInsights(query);
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Lightbulb className="h-8 w-8 text-yellow-500" />
                    Interview Insights
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Learn from the experiences of your seniors.
                </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <Input
                    placeholder="Search by role (e.g. Developer, Analyst)"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <Button type="submit">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {insights.map(item => (
                        <Card key={item.id} className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Building className="h-4 w-4 text-slate-400" />
                                            {item.round.drive.company.name}
                                        </CardTitle>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {item.round.drive.role} • {item.round.name}
                                        </p>
                                    </div>
                                    <Badge variant={item.result === 'PASS' ? 'default' : 'secondary'}>
                                        {item.result === 'PASS' ? 'Cleared' : 'Experience'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-sm italic text-slate-700 dark:text-slate-300">
                                    "{item.studentReflection}"
                                </div>
                                {item.questionsAsked && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Questions Asked</p>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                                            {item.questionsAsked}
                                        </p>
                                    </div>
                                )}
                                <div className="text-xs text-right text-slate-400">
                                    — {item.student.batch.name} Student
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {insights.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No insights found. Be the first to share!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
