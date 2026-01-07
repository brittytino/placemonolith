'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Save, UserCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function StudentProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState<any>(null);
    const [resumeUrl, setResumeUrl] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/student/profile');
            if (res.data.success) {
                setProfile(res.data.data);
                setResumeUrl(res.data.data.resumeUrl || '');
            }
        } catch (e) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put('/api/student/profile', {
                resumeUrl,
                password: password || undefined
            });
            if (res.data.success) {
                toast.success('Profile updated');
                setPassword('');
            }
        } catch (e: any) {
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-2xl space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserCircle className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div>
                        <CardTitle>{profile?.name}</CardTitle>
                        <p className="text-sm text-slate-500">{profile?.rollNo} • {profile?.batch?.name}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={profile?.email} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>CGPA</Label>
                                <Input value={profile?.cgpa || 'N/A'} disabled />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Resume URL (Google Drive / GitHub)</Label>
                            <Input
                                value={resumeUrl}
                                onChange={e => setResumeUrl(e.target.value)}
                                placeholder="https://..."
                            />
                            <p className="text-xs text-slate-500">
                                Make sure the link is accessible to public or anyone with the link.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Change Password (Optional)</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="New password"
                            />
                        </div>

                        <Button type="submit" disabled={saving} className="w-full bg-indigo-600">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
