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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AddDriveDialogProps {
    onSuccess: () => void;
}

export function AddDriveDialog({ onSuccess }: AddDriveDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [companies, setCompanies] = useState<{ id: string, name: string }[]>([]);
    const [companyId, setCompanyId] = useState('');
    const [role, setRole] = useState('');
    const [pkg, setPkg] = useState(''); // Package
    const [date, setDate] = useState('');

    useEffect(() => {
        if (open) {
            axios.get('/api/portal/companies').then(res => {
                if (res.data.success) setCompanies(res.data.data);
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/api/portal/drives', {
                role,
                companyId,
                package: pkg,
                date
            });

            if (res.data.success) {
                toast.success('Drive created');
                setOpen(false);
                setRole('');
                setPkg('');
                setDate('');
                setCompanyId('');
                onSuccess();
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Failed to create drive');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600">
                    <Plus className="mr-2 h-4 w-4" /> New Drive
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Drive</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Select onValueChange={setCompanyId} value={companyId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            placeholder="Software Engineer"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Package (CTC)</Label>
                        <Input
                            value={pkg}
                            onChange={e => setPkg(e.target.value)}
                            placeholder="12 LPA"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Drive
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
