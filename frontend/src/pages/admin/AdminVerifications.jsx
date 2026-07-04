import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Check, X } from 'lucide-react';
import { PageHeader, SearchInput, Table, Button, LoadingSpinner } from '../../components/common';
import api from '../../utils/axiosConfig';

export default function AdminVerifications() {
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const fetchPendingAlumni = async () => {
    try {
      const res = await api.get('/admin/alumni/pending');
      setPendingAlumni(res.data);
    } catch (err) {
      console.error('Failed to fetch pending alumni', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAlumni();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.post(`/admin/alumni/verify/${id}`, { approved: status === 'Verified' });
      fetchPendingAlumni();
    } catch (err) {
      console.error('Failed to verify alumni', err);
      alert('Failed to verify alumni');
    }
  };

  const filteredUsers = pendingAlumni.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { 
      header: 'Name', 
      accessor: 'name',
      render: (alum) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${alum.name}&background=random`} alt={alum.name} className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-gray-900">{alum.name}</span>
        </div>
      )
    },
    { header: 'Email', accessor: 'email', className: 'text-gray-500' },
    { header: 'Graduation Year', accessor: 'gradYear', className: 'text-gray-500' },
    { header: 'Department', accessor: 'dept', className: 'text-gray-500' },
    {
      header: 'Actions',
      render: (alum) => (
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={() => handleVerify(alum.id, 'Verified')}
            icon={Check}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Verify
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleVerify(alum.id, 'Rejected')}
            icon={X}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader 
        title="Alumni Verifications" 
        subtitle="Verify identity of alumni registering on the portal." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="mb-6 max-w-md">
          <SearchInput 
            placeholder="Search alumni by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500 font-medium">Loading pending verifications...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">No pending verifications found.</p>
          </div>
        ) : (
          <Table 
            columns={columns}
            data={currentUsers}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
