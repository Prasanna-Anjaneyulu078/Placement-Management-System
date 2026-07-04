import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Mail, Briefcase, Calendar, GraduationCap, CheckCircle } from 'lucide-react';
import { PageHeader, SearchInput, Table, Modal, Button, LoadingSpinner } from '../../components/common';
import ToastContainer from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import api from '../../utils/axiosConfig';

export default function AdminShortlisted() {
  const { toasts, showToast, removeToast } = useToast();
  const [shortlisted, setShortlisted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const itemsPerPage = 10;
  
  const fetchShortlisted = async () => {
    try {
      const res = await api.get('/admin/applications/shortlisted');
      setShortlisted(res.data);
    } catch (err) {
      console.error('Failed to load shortlisted applications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const updateApplicationStatus = async (appId, status) => {
    try {
      await api.post(`/admin/applications/${appId}/status`, { status });
      fetchShortlisted();
      showToast('Application status updated successfully.', 'success');
    } catch (err) {
      console.error('Failed to update status', err);
      showToast('Failed to update status. Please try again.', 'error');
    }
  };

  const filteredShortlisted = shortlisted.filter(item => 
    item.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredShortlisted.length / itemsPerPage);
  const currentShortlisted = filteredShortlisted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const columns = [
    { header: 'Application ID', render: (item) => <span className="text-gray-500 font-mono text-sm">#{item.id}</span> },
    {
      header: 'Student Name',
      render: (item) => {
        const student = item.user;
        return (
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -ml-2"
            onClick={() => student && handleViewStudent(student)}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src={`https://ui-avatars.com/api/?name=${student?.name || 'S'}&background=random`} alt={student?.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-gray-900">{student ? student.name : `ID: ${item.userId}`}</div>
              {student && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {student.studentProfile?.department || ''} • Class of {student.studentProfile?.graduationYear || ''}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    { header: 'Role', render: (item) => <span className="font-medium text-gray-700">{item.job?.title}</span> },
    { header: 'Company', render: (item) => <span className="text-gray-600">{item.job?.company}</span> },
    {
      header: 'Current Status',
      render: (item) => (
        <select 
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer" 
          value={item.status}
          onChange={(e) => updateApplicationStatus(item.id, e.target.value)}
        >
          <option value="REVIEWING">Reviewing</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="OFFERED">Offered</option>
        </select>
      )
    },
    {
      header: 'Actions',
      render: (item) => (
        <Button variant="outline" size="sm" icon={Mail} onClick={() => window.location.href = `mailto:${item.user?.email}`}>
          Email
        </Button>
      )
    }
  ];

  return (
    <>
      <DashboardLayout role="admin">
      <PageHeader 
        title="Shortlisted Candidates" 
        subtitle="Track students who have been shortlisted by companies." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="mb-6 max-w-md">
          <SearchInput 
            placeholder="Search roles, companies or students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500 font-medium">Loading shortlisted candidates...</p>
          </div>
        ) : filteredShortlisted.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">No candidates found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table 
              columns={columns}
              data={currentShortlisted}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage
              }}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Details"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 w-full">
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
            <Button icon={Mail} onClick={() => window.location.href = `mailto:${selectedStudent?.email}`}>
              Send Email
            </Button>
          </div>
        }
      >
        {selectedStudent && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${selectedStudent.name}&background=random&size=150`} alt={selectedStudent.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedStudent.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Mail size={16} />
                  <span>{selectedStudent.email}</span>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  selectedStudent.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700 border-green-200' : 
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                }`}>
                  {selectedStudent.verificationStatus}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                  <p className="font-bold text-gray-900">{selectedStudent.studentProfile?.department || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Graduation Year</p>
                  <p className="font-bold text-gray-900">{selectedStudent.studentProfile?.graduationYear || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">CGPA</p>
                  <p className="font-bold text-gray-900">{selectedStudent.studentProfile?.cgpa || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="font-bold text-gray-900">{selectedStudent.studentProfile?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
