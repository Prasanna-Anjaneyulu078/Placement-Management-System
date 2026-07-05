import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Trash2, Users, X, MapPin, Briefcase, DollarSign, Edit2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Modal, LoadingSpinner, JobCard, JobDetailsModal } from '../../components/common';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

export default function AlumniMyJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingJob, setViewingJob] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/alumni/my-jobs');
      setJobs(res.data);
    } catch (err) {
      toast.error('Failed to load my jobs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        await api.delete(`/jobs/${id}`);
        toast.success('Job deleted successfully');
        fetchJobs();
      } catch (err) {
        toast.error('Failed to delete job');
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const actionBtnStyle = "px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#FFF4EB] focus:ring-2 focus:ring-[#F47C20] transition-all flex items-center gap-1.5 shadow-sm";
  const deleteBtnStyle = "px-3 py-1.5 bg-white border border-red-500 text-red-500 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-all flex items-center gap-1.5 shadow-sm";

  return (
    <DashboardLayout role="alumni">
      <PageHeader 
        title="My Posted Jobs" 
        subtitle="Manage your job listings and track applicants." 
      />

      <div className="mt-6 pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 min-h-[400px]">
            <LoadingSpinner size="large" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white p-16 rounded-2xl border border-slate-200">
            <div className="w-20 h-20 bg-[#FFF4EB] rounded-full flex items-center justify-center mb-6">
              <Briefcase size={32} className="text-[#F47C20]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Jobs Posted</h3>
            <p className="text-slate-500 mb-6 text-center max-w-md">You haven't posted any jobs yet. Share opportunities with students to help them build their careers.</p>
            <button onClick={() => navigate('/alumni/post-job')} className={actionBtnStyle}>
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job}
                isAlumni={true}
                onSelect={setViewingJob}
                onEdit={() => navigate(`/alumni/edit-job/${job.id}`)}
                onDelete={(j) => handleDelete({ stopPropagation: () => {} }, j.id)}
                customStatusBadge={
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>

      <JobDetailsModal 
        isOpen={!!viewingJob} 
        onClose={() => setViewingJob(null)} 
        job={viewingJob}
        role="alumni"
        onEdit={(job) => navigate(`/alumni/edit-job/${job.id}`)}
        onDelete={(job) => handleDelete({ stopPropagation: () => {} }, job.id)}
      />

    </DashboardLayout>
  );
}
