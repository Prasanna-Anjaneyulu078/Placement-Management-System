import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, MapPin, Briefcase, Award, X, CheckCircle, Calendar, ChevronRight, XCircle } from 'lucide-react';
import { PageHeader, Modal, Button, LoadingSpinner } from '../../components/common';
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
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedJob, setSelectedJob] = useState(null); // Full job details modal
  const [confirmingJob, setConfirmingJob] = useState(null); // Confirmation modal
  
  // To store full job details when clicking on an applied/closed job which only returns a DTO
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

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
    if (!searchTerm) return jobsList;
    return jobsList.filter(job => {
      const title = (job.title || job.jobTitle || '').toLowerCase();
      const comp = (job.company || '').toLowerCase();
      return title.includes(searchTerm.toLowerCase()) || comp.includes(searchTerm.toLowerCase());
    });
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

  const openJobDetails = async (job) => {
    // If it's from Applied Jobs DTO, we might not have all details, but we can display what we have or fetch full.
    // For this redesign, the applied job DTO only has basic info.
    // Let's see if we can just use the provided info, or ideally we'd have a full job fetch.
    // For now, we will display what we have.
    setSelectedJob(job);
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
            onClick={() => { setActiveTab('open'); setSearchTerm(''); }}
          >
            Open Jobs
          </button>
          <button 
            className={`job-tab-btn ${activeTab === 'applied' ? 'active' : ''}`}
            onClick={() => { setActiveTab('applied'); setSearchTerm(''); }}
          >
            Applied Jobs
          </button>
          <button 
            className={`job-tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => { setActiveTab('closed'); setSearchTerm(''); }}
          >
            Closed Jobs
          </button>
        </div>

        <div className="search-section">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by job title or company..." 
              className="main-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-input-btn" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
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
                  <div className="jobs-grid">
                    {getFilteredJobs(openJobs).map(job => {
                      const eligibility = checkEligibility(job);
                      return (
                        <div key={job.id} className="portal-job-card">
                          <div className="job-card-header">
                            <div>
                              <h3 className="job-title">{job.title}</h3>
                              <p className="job-company">{job.company}</p>
                            </div>
                            <div className="job-type-badge">{job.jobType || 'Full-time'}</div>
                          </div>
                          
                          <div className="job-card-body">
                            <div className="info-row"><MapPin size={16}/> {job.location || 'Remote'}</div>
                            <div className="info-row"><Award size={16}/> Min CGPA: {job.minCgpa || 'N/A'}</div>
                            <div className="info-row"><Calendar size={16}/> Exp: {job.expiryDate || 'N/A'}</div>
                          </div>

                          <div className="job-card-footer">
                            {eligibility.eligible ? (
                              <div className="eligibility-status success">
                                <CheckCircle size={16} /> Eligible
                              </div>
                            ) : (
                              <div className="eligibility-status error" title={eligibility.message}>
                                <XCircle size={16} /> Not Eligible
                              </div>
                            )}
                            <div className="action-buttons">
                              <button className="btn-secondary" onClick={() => openJobDetails(job)}>Details</button>
                              {eligibility.eligible && (
                                <button className="btn-primary" onClick={() => handleApply(job)}>Apply</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                  <div className="applied-jobs-list">
                    {getFilteredJobs(appliedJobs).map(app => (
                      <div key={app.id} className="applied-job-item">
                        <div className="applied-info">
                          <h3 className="job-title">{app.jobTitle}</h3>
                          <p className="job-company">{app.company}</p>
                          <span className="applied-date">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="applied-actions">
                          <span className={`status-badge ${getStatusClass(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
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
                  <div className="jobs-grid">
                    {getFilteredJobs(closedJobs).map(job => (
                      <div key={job.id} className="portal-job-card closed-card">
                        <div className="job-card-header">
                          <div>
                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-company">{job.company}</p>
                          </div>
                          <span className="status-badge status-closed">CLOSED</span>
                        </div>
                        
                        <div className="job-card-body">
                          <div className="info-row"><MapPin size={16}/> {job.location || 'N/A'}</div>
                          <div className="info-row"><Calendar size={16}/> Closed on: {job.expiryDate || 'N/A'}</div>
                        </div>

                        <div className="job-card-footer justify-end">
                          <button className="btn-secondary w-full" onClick={() => openJobDetails(job)}>View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* JOB DETAILS MODAL */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={activeTab === 'applied' ? "Application Details" : "Job Details"}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
            {activeTab === 'open' && checkEligibility(selectedJob).eligible && (
              <Button onClick={() => { handleApply(selectedJob); setSelectedJob(null); }}>
                Apply Now
              </Button>
            )}
          </div>
        }
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {(selectedJob.company || selectedJob.jobTitle || 'J').charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedJob.title || selectedJob.jobTitle}</h2>
                <p className="text-gray-500">{selectedJob.company}</p>
              </div>
            </div>

            {/* Display full details if available (Open/Closed jobs) */}
            {selectedJob.description !== undefined && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Type</p>
                    <p className="font-bold text-gray-900">{selectedJob.jobType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                    <p className="font-bold text-gray-900">{selectedJob.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Min CGPA</p>
                    <p className="font-bold text-gray-900">{selectedJob.minCgpa || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Expiry</p>
                    <p className="font-bold text-gray-900">{selectedJob.expiryDate || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.description || 'No description available.'}</p>
                </div>
              </>
            )}

            {/* Display applied specific details */}
            {activeTab === 'applied' && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Application Status</h4>
                <div className="flex justify-between items-center">
                  <span className={`status-badge ${getStatusClass(selectedJob.status)} text-sm px-4 py-2`}>
                    {selectedJob.status}
                  </span>
                  <span className="text-blue-700 font-medium">Applied on {new Date(selectedJob.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

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
