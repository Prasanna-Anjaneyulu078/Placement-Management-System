import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Trash2, Users, X, MapPin, Briefcase, DollarSign, Edit2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Modal, LoadingSpinner } from '../../components/common';
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
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-[#F47C20]/50 transition-all flex flex-col"
              >
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-extrabold text-slate-800 line-clamp-1">{job.title}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold flex items-center gap-1.5"><Briefcase size={12}/> {job.company}</p>
                </div>

                <div className="p-5 flex-1">
                  <p className="text-slate-600 text-xs font-medium mb-4 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <DollarSign size={14} className="text-slate-400" />
                      <span>{job.packageDetails}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                  <button 
                    onClick={() => setViewingJob(job)} 
                    className="text-[#F47C20] text-xs font-bold hover:underline"
                  >
                    View Details
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/alumni/applications`); }} className={actionBtnStyle}>
                      <Users size={12}/> Applicants
                    </button>
                    <button onClick={(e) => handleDelete(e, job.id)} className={deleteBtnStyle}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!viewingJob} 
        onClose={() => setViewingJob(null)} 
        title="Job Details"
        size="lg"
      >
        {viewingJob && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">{viewingJob.title}</h2>
                <p className="text-sm font-bold text-[#F47C20] mt-1">{viewingJob.company}</p>
              </div>
              <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(viewingJob.status)}`}>
                {viewingJob.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm font-extrabold text-slate-800">{viewingJob.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Package</p>
                <p className="text-sm font-extrabold text-slate-800">{viewingJob.packageDetails}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                <p className="text-sm font-extrabold text-slate-800">{viewingJob.experienceRequired}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
                <p className="text-sm font-extrabold text-slate-800">{new Date(viewingJob.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap">{viewingJob.description}</p>
            </div>

            {viewingJob.requiredSkills && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingJob.requiredSkills.split(',').map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={() => setViewingJob(null)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"><X size={16}/> Close</button>
            </div>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}
