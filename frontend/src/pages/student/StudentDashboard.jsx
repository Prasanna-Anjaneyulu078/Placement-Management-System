import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  BadgeCheck, Briefcase, FileText, CheckCircle, XCircle, 
  ChevronRight, Edit2, Upload, AlertCircle, ArrowRight
} from 'lucide-react';
import { Avatar, LoadingSpinner } from '../../components/common';
import api from '../../utils/axiosConfig';
import { useData } from '../../context/DataContext';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profileImage, updateProfileImage } = useData();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [resumeDetails, setResumeDetails] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, statsRes, jobsRes, resumeRes, appsRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/stats'),
          api.get('/jobs/approved').catch(() => ({ data: [] })),
          api.get('/student/resume/details').catch(() => ({ data: null })),
          api.get('/applications/my').catch(() => ({ data: [] }))
        ]);
        setProfile(profileRes.data);
        if (profileRes.data?.profileImageUrl) {
          updateProfileImage(profileRes.data.profileImageUrl);
        }
        setStats(statsRes.data);
        const now = new Date();
        const activeJobs = (jobsRes.data || []).filter(job => {
          if (job.status && job.status !== 'ACTIVE') return false;
          if (job.deadline && new Date(job.deadline) < now) return false;
          return true;
        });
        const sortedJobs = activeJobs
          .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
          .slice(0, 3);
        
        const sortedApps = (appsRes.data || [])
          .sort((a, b) => new Date(b.appliedAt || Date.now()) - new Date(a.appliedAt || Date.now()))
          .slice(0, 3);

        setRecentJobs(sortedJobs);
        setRecentApps(sortedApps);
        setResumeDetails(resumeRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center p-24">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-500 font-medium">Loading your placement portal...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Job Eligibility Helper
  const checkEligibility = (job) => {
    if (!profile) return false;
    const meetsCgpa = profile.cgpa >= job.minCgpa;
    const meetsBacklogs = profile.backlogs <= job.maxBacklogs;
    const meetsDept = !job.allowedDepartments || job.allowedDepartments.length === 0 || job.allowedDepartments.includes(profile.department);
    return meetsCgpa && meetsBacklogs && meetsDept;
  };

  return (
    <DashboardLayout role="student">
      <div className="student-dashboard">
        
        {/* SECTION 1: WELCOME HEADER */}
        <div className="dash-section welcome-header">
          <div className="welcome-avatar-wrapper">
            <Avatar 
              size="xl" 
              src={profileImage || profile?.profileImageUrl || `https://ui-avatars.com/api/?name=${profile?.user?.name}&background=F47C20&color=fff`} 
              alt="Profile"
              className="welcome-avatar"
            />
          </div>
          <div className="welcome-info">
            <h1 className="welcome-title">
              Welcome Back, {profile?.user?.name}
              {profile?.verificationStatus === 'VERIFIED' && <BadgeCheck size={24} className="verified-badge" title="Verified" />}
            </h1>
            <p className="welcome-subtitle">
              {profile?.department ? `${profile.department}` : 'Department Not Set'}
              {profile?.semester ? ` • Semester ${profile.semester}` : ''}
              {profile?.cgpa ? ` • CGPA ${profile.cgpa}` : ''}
            </p>
          </div>
        </div>

        <div className="dash-grid">
          {/* LEFT COLUMN */}
          <div className="dash-main-col">
            
            {/* SECTION 3: PLACEMENT SUMMARY */}
            <div className="dash-section summary-grid">
              <div className="summary-card applications" onClick={() => navigate('/student/applications?filter=ALL')}>
                <div className="summary-icon bg-blue-100 text-blue-600"><FileText size={24} /></div>
                <div className="summary-data">
                  <span className="summary-value">{stats?.totalApplications || 0}</span>
                  <span className="summary-label">Applied</span>
                </div>
              </div>
              <div className="summary-card shortlisted" onClick={() => navigate('/student/applications?filter=SHORTLISTED')}>
                <div className="summary-icon bg-yellow-100 text-yellow-600"><Briefcase size={24} /></div>
                <div className="summary-data">
                  <span className="summary-value">{stats?.shortlisted || 0}</span>
                  <span className="summary-label">Shortlisted</span>
                </div>
              </div>
              <div className="summary-card selected" onClick={() => navigate('/student/applications?filter=SELECTED')}>
                <div className="summary-icon bg-green-100 text-green-600"><CheckCircle size={24} /></div>
                <div className="summary-data">
                  <span className="summary-value">{stats?.selected || 0}</span>
                  <span className="summary-label">Selected</span>
                </div>
              </div>
              <div className="summary-card rejected" onClick={() => navigate('/student/applications?filter=REJECTED')}>
                <div className="summary-icon bg-red-100 text-red-600"><XCircle size={24} /></div>
                <div className="summary-data">
                  <span className="summary-value">{stats?.rejected || 0}</span>
                  <span className="summary-label">Rejected</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: LATEST ELIGIBLE JOBS */}
            <div className="dash-section content-card">
              <div className="card-header">
                <h2>Latest Opportunities</h2>
                <Link to="/student/jobs" className="view-all-link">View All Jobs <ChevronRight size={16}/></Link>
              </div>
              <div className="job-list">
                {recentJobs.length > 0 ? recentJobs.map(job => {
                  return (
                    <div key={job.id} className="dash-job-card" onClick={() => navigate('/student/jobs')}>
                      <div className="job-basic">
                        <div className="job-title">{job.title}</div>
                        <div className="job-company">{job.company}</div>
                        <div className="job-details-row">
                          <span>{job.location || 'Remote'}</span>
                          <span className="dot-sep">•</span>
                          <span>{job.type || 'Full-time'}</span>
                          <span className="dot-sep">•</span>
                          <span>Posted: {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="job-meta">
                        <Link to="/student/jobs" className="action-btn-outline" onClick={(e) => e.stopPropagation()}>View Details</Link>
                        <Link to="/student/jobs" className="action-btn-primary ml-2" onClick={(e) => e.stopPropagation()}>Apply</Link>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="empty-state">No active opportunities available.</p>
                )}
              </div>
            </div>

            {/* SECTION 5: RECENT APPLICATIONS */}
            <div className="dash-section content-card">
              <div className="card-header">
                <h2>Recent Applications</h2>
                <Link to="/student/applications" className="view-all-link">View All Applications <ChevronRight size={16}/></Link>
              </div>
              <div className="app-list">
                {recentApps.length > 0 ? recentApps.map(app => (
                  <div key={app.id} className="dash-app-row" onClick={() => navigate('/student/applications')}>
                    <div className="app-info flex-1">
                      <div className="app-role">{app.job?.title}</div>
                      <div className="app-company">{app.job?.company}</div>
                      <div className="app-date text-xs text-gray-400 mt-1">Applied: {new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div className="app-status-col">
                      <span className={`status-badge status-${app.status?.toLowerCase()}`}>{app.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state-container">
                    <p className="empty-state mb-4 border-none p-0">You haven't applied for any jobs yet.</p>
                    <Link to="/student/jobs" className="action-btn-primary inline-block">Browse Jobs</Link>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 7: QUICK ACTIONS */}
            <div className="dash-section quick-actions-card">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-action-links-horizontal">
                <Link to="/student/profile" className="quick-link-box"><Edit2 size={24}/> <span>Edit Profile</span></Link>
                <Link to="/student/profile?tab=resume" className="quick-link-box"><Upload size={24}/> <span>Upload Resume</span></Link>
                <Link to="/student/jobs" className="quick-link-box"><Briefcase size={24}/> <span>Browse Jobs</span></Link>
                <Link to="/student/applications" className="quick-link-box"><FileText size={24}/> <span>My Applications</span></Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
