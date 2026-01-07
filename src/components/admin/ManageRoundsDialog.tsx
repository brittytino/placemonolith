'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface ManageRoundsDialogProps {
    driveId: string;
    driveRole: string;
}

interface Round {
    id: string;
    name: string;
    orderIndex: number;
}

export function ManageRoundsDialog({ driveId, driveRole }: ManageRoundsDialogProps) {
    const [open, setOpen] = useState(false);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(false);
    const [newRoundName, setNewRoundName] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (open) {
            fetchRounds();
        }
    }, [open, driveId]);

    const fetchRounds = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/admin/rounds?driveId=${driveId}`);
            if (res.data.success) {
                setRounds(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRound = async () => {
        if (!newRoundName.trim()) return;
        setAdding(true);
        try {
            const orderIndex = rounds.length + 1;
            await axios.post('/api/admin/rounds', {
                driveId,
                name: newRoundName,
                orderIndex
            });
            setNewRoundName('');
            fetchRounds();
            toast.success('Round added');
        } catch (e) {
            toast.error('Failed to add round');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteRound = async (id: string) => {
        if (!confirm('Delete this round? Student data might be lost.')) return;
        try {
            await axios.delete(`/api/admin/rounds?roundId=${id}`);
            fetchRounds();
            toast.success('Round deleted');
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-xs h-8">
                    Manage Rounds
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rounds for {driveRole}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="space-y-2">
                            {rounds.map((round) => (
                                <div key={round.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-1 rounded-full font-mono">
                                            {round.orderIndex}
                                        </span>
                                        <span className="font-medium">{round.name}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleDeleteRound(round.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            {rounds.length === 0 && <p className="text-sm text-slate-500 text-center">No rounds configured.</p>}
                        </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Input
                            placeholder="New Round (e.g. OA, HR)"
                            value={newRoundName}
                            onChange={e => setNewRoundName(e.target.value)}
                        />
                        <Button onClick={handleAddRound} disabled={adding || !newRoundName}>
                            {adding ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
