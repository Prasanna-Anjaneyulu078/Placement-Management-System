import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, MapPin, Briefcase, Award, X, CheckCircle, Calendar, ChevronRight, XCircle } from 'lucide-react';
import { PageHeader, Modal, Button, LoadingSpinner, JobCard } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import './StudentJobs.css';

export default function StudentJobs() {
  const [activeTab, setActiveTab] = useState('open'); // 'open', 'applied', 'closed'
  
  const [openJobs, setOpenJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [confirmingJob, setConfirmingJob] = useState(null); // Confirmation modal
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!profile) {
         const profileRes = await api.get('/student/profile').catch(() => ({ data: null }));
         setProfile(profileRes.data);
      }
      
      if (activeTab === 'open') {
        const res = await api.get('/student/jobs/open');
        setOpenJobs(res.data);
      } else if (activeTab === 'applied') {
        const res = await api.get('/student/jobs/applied');
        setAppliedJobs(res.data);
      } else if (activeTab === 'closed') {
        const res = await api.get('/student/jobs/closed');
        setClosedJobs(res.data);
      }
    } catch (err) {
      toast.error('Failed to load jobs data');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredJobs = (jobsList) => {
    return jobsList; // Filter removed per request
  };

  const checkEligibility = (job) => {
    if (!job) return { eligible: false, message: '' };
    if (!profile) return { eligible: true, message: '' };
    
    if (job.minCgpa != null && (profile.cgpa == null || profile.cgpa < job.minCgpa)) {
      return { eligible: false, message: `Requires ${job.minCgpa} CGPA (You have ${profile.cgpa || 0})` };
    }
    if (job.eligibleSemester != null && (profile.semester == null || profile.semester < job.eligibleSemester)) {
      return { eligible: false, message: `Requires Semester ${job.eligibleSemester}` };
    }
    if (job.maxBacklogs != null && (profile.backlogs == null || profile.backlogs > job.maxBacklogs)) {
      return { eligible: false, message: `Max ${job.maxBacklogs} Backlogs (You have ${profile.backlogs || 0})` };
    }
    
    return { eligible: true, message: '' };
  };

  const handleApply = (job) => {
    setConfirmingJob(job);
  };

  const confirmApply = async () => {
    if (confirmingJob) {
      try {
        await api.post(`/student/jobs/${confirmingJob.id}/apply`);
        toast.success(`Application submitted successfully.`);
        // Remove from open jobs array to reflect immediately
        setOpenJobs(openJobs.filter(j => j.id !== confirmingJob.id));
        setConfirmingJob(null);
        setSelectedJob(null);
      } catch (err) {
        toast.error(err.response?.data || 'Failed to apply');
        setConfirmingJob(null);
      }
    }
  };

  const openJobDetails = (job) => {
    navigate(`/student/jobs/${job.id}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPLIED': return 'status-applied';
      case 'SHORTLISTED': return 'status-shortlisted';
      case 'SELECTED': return 'status-selected';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-closed';
    }
  };

  return (
    <DashboardLayout role="student">
      <PageHeader 
        title="Job Portal" 
        subtitle="Discover, apply, and track your job opportunities." 
      />

      <div className="jobs-portal-container">
        <div className="job-tabs">
          <button 
            className={`job-tab-btn ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open Jobs
          </button>
          <button 
            className={`job-tab-btn ${activeTab === 'applied' ? 'active' : ''}`}
            onClick={() => setActiveTab('applied')}
          >
            Applied Jobs
          </button>
          <button 
            className={`job-tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed Jobs
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p className="loading-text">Loading jobs...</p>
          </div>
        ) : (
          <div className="jobs-content-area">
            
            {/* OPEN JOBS */}
            {activeTab === 'open' && (
              <>
                {getFilteredJobs(openJobs).length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={48} className="empty-icon" />
                    <p>No jobs available currently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredJobs(openJobs).map(job => (
                      <JobCard 
                        key={job.id}
                        job={job}
                        onSelect={openJobDetails}
                        onApply={handleApply}
                        eligibility={checkEligibility(job)}
                        role="student"
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* APPLIED JOBS */}
            {activeTab === 'applied' && (
              <>
                {getFilteredJobs(appliedJobs).length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle size={48} className="empty-icon" />
                    <p>You have not applied for any jobs yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredJobs(appliedJobs).map(app => (
                      <JobCard 
                        key={app.id}
                        job={{
                          id: app.jobId || app.id,
                          title: app.jobTitle,
                          company: app.company,
                          status: app.status
                        }}
                        onSelect={() => openJobDetails({ id: app.jobId || app.id })}
                        hasApplied={true}
                        statusOverride={app.status}
                        role="student"
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CLOSED JOBS */}
            {activeTab === 'closed' && (
              <>
                {getFilteredJobs(closedJobs).length === 0 ? (
                  <div className="empty-state">
                    <XCircle size={48} className="empty-icon" />
                    <p>No closed jobs available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredJobs(closedJobs).map(job => (
                      <JobCard 
                        key={job.id}
                        job={job}
                        onSelect={openJobDetails}
                        role="student"
                        customStatusBadge={<span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">CLOSED</span>}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>



      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={!!confirmingJob}
        onClose={() => setConfirmingJob(null)}
        title="Confirm Application"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setConfirmingJob(null)}>Cancel</Button>
            <Button onClick={confirmApply}>Confirm Apply</Button>
          </div>
        }
      >
        {confirmingJob && (
          <div>
            <p className="text-gray-600">
              Are you sure you want to apply for the <span className="font-bold text-gray-900">{confirmingJob.title}</span> position at <span className="font-bold text-gray-900">{confirmingJob.company}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Make sure your profile and resume are up to date before applying.
            </p>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}
