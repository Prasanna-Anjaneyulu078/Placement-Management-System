import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader, SearchInput, Table, Button, LoadingSpinner } from '../../components/common';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import useDepartments from '../../hooks/useDepartments';

export default function AdminStudents() {
  const { departments } = useDepartments();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load students', err);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(currentUsers.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkVerify = async (approved) => {
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    try {
      await api.post('/admin/students/verify/bulk', {
        studentIds: selectedStudentIds,
        approved
      });
      toast.success(`Students ${approved ? 'Verified' : 'Rejected'} Successfully`);
      setSelectedStudentIds([]);
      fetchStudents();
    } catch (err) {
      toast.error('Bulk verification failed');
    }
  };

  const filteredUsers = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || s.department === filterDept;
    const matchesStatus = filterStatus === 'All' || s.verificationStatus === filterStatus.toUpperCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'VERIFIED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const columns = [
    {
      header: (
        <input 
          type="checkbox" 
          checked={currentUsers.length > 0 && selectedStudentIds.length === currentUsers.length}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
      ),
      render: (student) => (
        <input 
          type="checkbox"
          checked={selectedStudentIds.includes(student.id)}
          onChange={() => handleSelectStudent(student.id)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
      )
    },
    {
      header: 'Name',
      render: (student) => (
        <div className="font-bold text-gray-900">{student.name}</div>
      )
    },
    { header: 'Roll Number', accessor: 'rollNumber', className: 'text-gray-600 font-medium' },
    { header: 'Department', accessor: 'department', className: 'text-gray-600' },
    { header: 'Semester', accessor: 'semester', className: 'text-gray-600' },
    { header: 'CGPA', accessor: 'cgpa', className: 'text-gray-600 font-bold' },
    {
      header: 'Status',
      render: (student) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(student.verificationStatus)}`}>
          {student.verificationStatus}
        </span>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader 
        title="Student Directory" 
        subtitle="Manage and verify all registered students." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
            <div className="w-full md:w-72">
              <SearchInput 
                placeholder="Search by name or roll no..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="w-full md:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-gray-700 outline-none transition-all"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </select>

            <select 
              className="w-full md:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-gray-700 outline-none transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleBulkVerify(false)}
            >
              Reject Selected
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleBulkVerify(true)}
            >
              Verify Selected
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500 font-medium">Loading student directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">No students found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table 
              columns={columns}
              data={currentUsers}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
