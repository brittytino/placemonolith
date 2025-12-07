'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Code2, MessageSquare, Upload, UserPlus, Bell, Download, Settings } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import BulkUpload from '@/components/admin/BulkUpload';
import StudentTable from '@/components/admin/StudentTable';
import BatchManager from '@/components/admin/BatchManager';
import CustomFieldManager from '@/components/admin/CustomFieldManager';
import DataExport from '@/components/admin/DataExport';
import AddStudentForm from '@/components/admin/AddStudentForm';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    profileCompleted: 0,
    totalProjects: 0,
    activeGroups: 0,
    avgLeetCodeScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchBatches();
    fetchGroups();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [studentsRes, groupsRes] = await Promise.all([
        axios.get('/api/students').catch(() => ({ data: { data: [] } })),
        axios.get('/api/admin/groups').catch(() => ({ data: { data: [] } })),
      ]);

      const students = studentsRes.data.data || [];
      const groups = groupsRes.data.data || [];
      const profileCompleted = students.filter((s: any) => s.profile?.isProfileComplete).length;

      setStats({
        totalStudents: students.length,
        profileCompleted,
        totalProjects: 0,
        activeGroups: groups.length,
        avgLeetCodeScore: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get('/api/admin/batches');
      setBatches(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/admin/groups');
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Profile Completed',
      value: stats.profileCompleted,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Active Groups',
      value: stats.activeGroups,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Avg LeetCode',
      value: stats.avgLeetCodeScore,
      icon: Code2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 sm:mt-2">
            Manage placement portal, students, and activities
          </p>
        </motion.div>

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      {stat.title}
                    </CardTitle>
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                      {loading ? '...' : stat.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="students" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1 bg-white dark:bg-slate-800 rounded-lg">
              <TabsTrigger value="students" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Students</span>
                <span className="sm:hidden">Students</span>
              </TabsTrigger>
              <TabsTrigger value="add-student" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Bulk Upload</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Batch & Groups</span>
                <span className="sm:hidden">Batch</span>
              </TabsTrigger>
              <TabsTrigger value="fields" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Custom Fields</span>
                <span className="sm:hidden">Fields</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-4">
              <StudentTable onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="add-student" className="mt-4">
              <AddStudentForm batches={batches} groups={groups} onSuccess={() => {
                fetchStats();
                fetchBatches();
                fetchGroups();
              }} />
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <BulkUpload onSuccess={fetchStats} />
            </TabsContent>

            <TabsContent value="batch" className="mt-4">
              <BatchManager onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="fields" className="mt-4">
              <CustomFieldManager />
            </TabsContent>

            <TabsContent value="export" className="mt-4">
              <DataExport />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
