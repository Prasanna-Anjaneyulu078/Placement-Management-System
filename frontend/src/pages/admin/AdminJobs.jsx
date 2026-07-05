import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader, SearchInput, JobCard, LoadingSpinner } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

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
    } catch (err) {
      console.error('Failed to update job status', err);
      toast.error('Failed to update job status');
    }
  };

  const handleShowDetails = (job) => {
    navigate(`/admin/jobs/${job.id}`);
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



  return (
    <DashboardLayout role="admin">
      <PageHeader 
        title="Job Moderation" 
        subtitle="Review and approve job postings from alumni." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-6">
          <div className="w-full md:w-96">
            <SearchInput 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs or companies..."
            />
          </div>
          <div className="w-full md:w-auto">
            <select 
              className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F47C20]/20 focus:border-[#F47C20] font-medium text-gray-700 outline-none transition-all"
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
        ) : currentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job}
                isAdmin={true}
                onSelect={(job) => handleShowDetails(job)}
                onApprove={(job) => updateJobStatus(job.id, 'ACTIVE')}
                onReject={(job) => updateJobStatus(job.id, 'REJECTED')}
              />
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 mb-8 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                currentPage === i + 1 
                  ? 'bg-primary text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
