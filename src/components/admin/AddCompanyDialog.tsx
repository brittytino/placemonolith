'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Building2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AddCompanyDialogProps {
    onSuccess: () => void;
}

export function AddCompanyDialog({ onSuccess }: AddCompanyDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [website, setWebsite] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/api/admin/companies', {
                name,
                domain,
                website
            });

            if (res.data.success) {
                toast.success('Company added');
                setOpen(false);
                setName('');
                setDomain('');
                setWebsite('');
                onSuccess();
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Failed to add company');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Company
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Company</DialogTitle>
                    <DialogDescription>
                        Add a new company to the directory.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Google"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Domain (Optional)</Label>
                        <Input
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                            placeholder="Tech / Fintech"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Website (Optional)</Label>
                        <Input
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            placeholder="https://google.com"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
