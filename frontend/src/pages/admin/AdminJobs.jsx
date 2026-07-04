import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader, SearchInput, Table, Modal, Badge, Button, LoadingSpinner } from '../../components/common';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/all');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateJobStatus = async (jobId, status) => {
    try {
      await api.post(`/admin/jobs/moderate/${jobId}`, {
        approved: status === 'ACTIVE',
        rejectionReason: status === 'REJECTED' ? 'Not meeting criteria' : ''
      });
      toast.success(`Job marked as ${status}`);
      fetchJobs();
      if (isModalOpen) setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to update job status', err);
      toast.error('Failed to update job status');
    }
  };

  const handleShowDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const currentJobs = sortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headers = ['Job Title', 'Company', 'Posted By', 'Status', 'Actions'];

  const renderRow = (job) => (
    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      <td className="py-4 px-6">
        <span className="font-bold text-gray-900">{job.title}</span>
      </td>
      <td className="py-4 px-6 text-gray-600">{job.company}</td>
      <td className="py-4 px-6 text-gray-600">{job.postedBy?.name || 'Admin'}</td>
      <td className="py-4 px-6">
        <Badge variant={job.status}>{job.status}</Badge>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleShowDetails(job)}
          >
            Details
          </Button>
          {job.status === 'PENDING' && (
            <>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateJobStatus(job.id, 'ACTIVE')}
              >
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => updateJobStatus(job.id, 'REJECTED')}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <DashboardLayout role="admin">
      <PageHeader 
        title="Job Moderation" 
        subtitle="Review and approve job postings from alumni." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="w-full md:w-96">
            <SearchInput 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs or companies..."
            />
          </div>
          <div className="w-full md:w-auto">
            <select 
              className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-gray-700 outline-none transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500 font-medium">Loading job listings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table 
              headers={headers}
              data={currentJobs}
              renderRow={renderRow}
              emptyMessage="No jobs found matching your criteria."
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Job Details"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            {selectedJob?.status === 'PENDING' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => updateJobStatus(selectedJob.id, 'REJECTED')}
                >
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => updateJobStatus(selectedJob.id, 'ACTIVE')}
                >
                  Approve
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <p className="text-gray-600 font-medium mt-1">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <Badge variant={selectedJob.status}>{selectedJob.status}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block text-sm text-gray-500 mb-1 font-medium">Type</span>
                <span className="font-bold text-gray-900">{selectedJob.type}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block text-sm text-gray-500 mb-1 font-medium">Level</span>
                <span className="font-bold text-gray-900">{selectedJob.level}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block text-sm text-gray-500 mb-1 font-medium">Salary</span>
                <span className="font-bold text-gray-900">{selectedJob.salary || 'Not specified'}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block text-sm text-gray-500 mb-1 font-medium">Posted</span>
                <span className="font-bold text-gray-900">{new Date(selectedJob.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedJob.description}</p>
              </div>
              
              {selectedJob.details && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Requirements & Details</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedJob.details}</p>
                </div>
              )}
              
              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
