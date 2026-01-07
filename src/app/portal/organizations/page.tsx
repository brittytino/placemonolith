'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Building2, Globe } from 'lucide-react';
import axios from 'axios';
import { AddCompanyDialog } from '@/components/admin/AddCompanyDialog';

interface Company {
    id: string;
    name: string;
    domain: string | null;
    website: string | null;
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await axios.get('/api/admin/companies');
            if (res.data.success) {
                setCompanies(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Companies</h1>
                <AddCompanyDialog onSuccess={fetchCompanies} />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <Card key={company.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{company.name}</CardTitle>
                                <Building2 className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {company.domain && (
                                        <div className="text-sm text-slate-500">
                                            {company.domain}
                                        </div>
                                    )}
                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            <Globe className="h-3 w-3" /> Website
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {companies.length === 0 && (
                        <div className="col-span-full text-center text-slate-500 py-12">
                            No companies found. Create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
