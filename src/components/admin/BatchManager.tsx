'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Plus, Users, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Group {
  id: string;
  name: string;
  description?: string;
  _count?: { members: number };
}

interface BatchManagerProps {
  onUpdate?: () => void;
}

export default function BatchManager({ onUpdate }: BatchManagerProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portal/groups');
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      setCreating(true);
      await axios.post('/api/portal/groups', {
        name: newGroupName,
        description: newGroupDesc,
      });
      setNewGroupName('');
      setNewGroupDesc('');
      fetchGroups();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await axios.delete(`/api/portal/groups/${id}`);
      fetchGroups();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete group');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Create Group */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Create New Group
          </CardTitle>
          <CardDescription className="text-sm">
            Create unlimited groups for students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Group Name *</label>
            <Input
              placeholder="e.g., Placement Group 1"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Input
              placeholder="Optional description"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateGroup} disabled={creating} className="w-full">
            {creating ? 'Creating...' : 'Create Group'}
          </Button>
        </CardContent>
      </Card>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Existing Groups
          </CardTitle>
          <CardDescription className="text-sm">
            Manage all placement groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-slate-500">Loading...</p>}
          
          {!loading && groups.length === 0 && (
            <p className="text-sm text-slate-500">No groups created yet</p>
          )}

          {!loading && groups.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {group._count?.members || 0} members
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
