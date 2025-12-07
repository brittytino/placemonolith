'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminSetupPage() {
  const router = useRouter();
  const [setupRequired, setSetupRequired] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const [formData, setFormData] = useState({
    registerNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    personalEmail: '',
    dateOfBirth: '',
    gender: 'MALE',
    batchStartYear: currentYear,
    batchEndYear: currentYear + 2,
    classSection: 'G1',
    academicYear: 1,
    ugDegree: '',
    ugCollege: '',
    ugPercentage: '',
    schoolName: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    whatsappNumber: ''
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch('/api/setup/super-admin');
      const data = await res.json();
      setSetupRequired(data.setupRequired);
      
      if (!data.setupRequired) {
        setTimeout(() => router.push('/login'), 1000);
      }
    } catch (error) {
      console.error('Failed to check setup status:', error);
      setError('Failed to check setup status. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (Number(formData.batchEndYear) <= Number(formData.batchStartYear)) {
      setError('Batch end year must be after start year');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/setup/super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create Super Admin');
      }

      setSuccess('✅ Super Admin created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (!setupRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Setup Complete!</h1>
          <p className="mt-2 text-gray-600">Super Admin already exists.</p>
          <p className="mt-1 text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
            <h1 className="text-3xl font-bold text-white text-center">PSG College MCA Placement Portal</h1>
            <h2 className="text-xl font-semibold text-indigo-100 mt-2 text-center">Placement Representative Setup</h2>
            <p className="mt-3 text-sm text-indigo-100 text-center">
              Create your account to manage the placement portal. This is a one-time setup.
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Credentials</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Register Number *</label>
                    <input type="text" name="registerNumber" required value={formData.registerNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="25MX354" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">College Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="email@psgtech.ac.in" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Min 8 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                    <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender *</label>
                    <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input type="tel" name="phoneNumber" required pattern="[0-9]{10}" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="10 digits" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                    <input type="tel" name="whatsappNumber" pattern="[0-9]{10}" value={formData.whatsappNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Batch Start Year *</label>
                    <select name="batchStartYear" required value={formData.batchStartYear} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Batch End Year *</label>
                    <select name="batchEndYear" required value={formData.batchEndYear} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Class Section *</label>
                    <select name="classSection" required value={formData.classSection} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="G1">G1</option>
                      <option value="G2">G2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Academic Year *</label>
                    <select name="academicYear" required value={formData.academicYear} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">UG Degree</label>
                    <input type="text" name="ugDegree" value={formData.ugDegree} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="B.E CSE" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UG College</label>
                    <input type="text" name="ugCollege" value={formData.ugCollege} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UG Percentage</label>
                    <input type="number" step="0.01" name="ugPercentage" value={formData.ugPercentage} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">School Name</label>
                    <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">10th Percentage</label>
                    <input type="number" step="0.01" name="tenthPercentage" value={formData.tenthPercentage} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">12th Percentage</label>
                    <input type="number" step="0.01" name="twelfthPercentage" value={formData.twelfthPercentage} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" min="0" max="100" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50">
                {submitting ? 'Creating Account...' : 'Create Placement Representative Account'}
              </button>
            </form>
          </div>

          <div className="bg-yellow-50 px-8 py-4 border-t rounded-b-2xl">
            <p className="text-sm text-yellow-900">⚠️ This setup route will be disabled after account creation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
