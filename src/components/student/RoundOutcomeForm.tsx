'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { CardDescription } from '@/components/ui/card';

interface RoundOutcomeFormProps {
    driveId: string;
    roundId: string;
    roundName: string;
    onSuccess: () => void;
}

export function RoundOutcomeForm({ driveId, roundId, roundName, onSuccess }: RoundOutcomeFormProps) {
    const [result, setResult] = useState<'PASS' | 'FAIL' | null>(null);
    const [reflection, setReflection] = useState('');
    const [questions, setQuestions] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!result) {
            toast.error('Please select a result (Pass/Fail).');
            return;
        }

        if (result === 'FAIL' && !reflection) {
            toast.error('Please share a brief reflection or reason for failure. It helps juniors!');
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post('/api/student/round-outcome', {
                driveId,
                roundId,
                result,
                reflection,
                questions
            });

            if (res.data.success) {
                toast.success('Outcome recorded!');
                onSuccess();
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <CardDescription>
                Did you clear this round? Be honest, your data helps the batch tracking.
            </CardDescription>

            <RadioGroup onValueChange={(v) => setResult(v as 'PASS' | 'FAIL')} className="flex gap-4">
                <div className={`flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer transition-colors ${result === 'PASS' ? 'bg-green-50 border-green-500' : 'hover:bg-slate-50'}`}>
                    <RadioGroupItem value="PASS" id="pass" />
                    <Label htmlFor="pass" className="font-semibold text-green-700 cursor-pointer w-full">I Passed</Label>
                </div>
                <div className={`flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer transition-colors ${result === 'FAIL' ? 'bg-red-50 border-red-500' : 'hover:bg-slate-50'}`}>
                    <RadioGroupItem value="FAIL" id="fail" />
                    <Label htmlFor="fail" className="font-semibold text-red-700 cursor-pointer w-full">I Failed</Label>
                </div>
            </RadioGroup>

            <div className="space-y-2">
                <Label>Interview Questions / Test Topics</Label>
                <Textarea
                    placeholder="e.g. Asked about React Hooks, Database normalization..."
                    value={questions}
                    onChange={e => setQuestions(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Reflection / Failure Reason <span className="text-red-500">*</span></Label>
                <Textarea
                    placeholder={result === 'PASS' ? "What went well? Any tips?" : "What went wrong? What would you do differently?"}
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    required={result === 'FAIL'}
                />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Result
            </Button>
        </form>
    );
}
