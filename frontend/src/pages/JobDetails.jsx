import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { PageHeader, Button, LoadingSpinner, Badge } from '../components/common';
import { MapPin, DollarSign, Users, Briefcase, Calendar, Award, ExternalLink, MessageSquare, Building2, Globe, Linkedin, CheckCircle, ChevronRight, XCircle, ChevronLeft, Info, Hourglass, CheckCircle2, Circle } from 'lucide-react';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // details, eligibility, skills, company, messages
  
  const role = localStorage.getItem('role')?.toLowerCase() || 'student';
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    if (role === 'student') {
      fetchStudentData();
    }
  }, [id, role]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      // In a real app we would have a specific endpoint that gets the job details + application status if student
      // For now we get the job from all jobs or approved jobs depending on role
      const res = await api.get(role === 'student' ? '/student/jobs/open' : (role === 'alumni' ? '/alumni/my-jobs' : '/admin/jobs'));
      const jobs = res.data;
      const foundJob = jobs.find(j => j.id.toString() === id);
      
      if (!foundJob) {
        toast.error('Job not found');
        navigate(`/${role}/jobs`);
        return;
      }
      setJob(foundJob);
    } catch (err) {
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      const [profileRes, appliedRes] = await Promise.all([
        api.get('/student/profile').catch(() => ({ data: null })),
        api.get('/student/jobs/applied').catch(() => ({ data: [] }))
      ]);
      setProfile(profileRes.data);
      
      const applied = appliedRes.data.find(app => app.jobId?.toString() === id || app.id?.toString() === id);
      if (applied) {
        setHasApplied(true);
        setApplicationStatus(applied.status);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkEligibility = () => {
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

  const handleApply = async () => {
    if (job.applicationLink) {
      window.open(job.applicationLink, '_blank');
      return;
    }
    try {
      await api.post(`/student/jobs/${job.id}/apply`);
      toast.success('Application submitted successfully');
      setHasApplied(true);
      setApplicationStatus('APPLIED');
    } catch (err) {
      toast.error(err.response?.data || 'Failed to apply');
    }
  };

  const updateJobStatus = async (status) => {
    try {
      await api.post(`/admin/jobs/moderate/${job.id}`, {
        approved: status === 'ACTIVE',
        rejectionReason: status === 'REJECTED' ? 'Not meeting criteria' : ''
      });
      toast.success(`Job marked as ${status}`);
      setJob({ ...job, status });
    } catch (err) {
      console.error('Failed to update job status', err);
      toast.error('Failed to update job status');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex justify-center items-center h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) return null;

  const eligibility = checkEligibility();
  const logoInitial = job.company ? job.company.charAt(0).toUpperCase() : 'C';
  const tabs = [
    { id: 'details', label: 'Job Details' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'skills', label: 'Skills Required' },
    { id: 'company', label: 'Company Information' },
    { id: 'messages', label: 'Messages' }
  ];

  return (
    <DashboardLayout role={role}>
      <div className="max-w-6xl mx-auto pb-12 bg-white min-h-screen px-4 md:px-8 pt-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <button 
              onClick={() => navigate(`/${role}/jobs`)} 
              className="mb-6 text-gray-800 hover:text-[#F47C20] transition-colors flex items-center"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <p className="text-[14px] font-medium text-gray-600 mb-1.5">{job.company}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">{job.title}</h1>
              {hasApplied && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9C4] text-[#F57F17] text-[11px] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F57F17]"></div>
                  Applied
                  <Info size={14} className="text-gray-400 cursor-pointer ml-0.5" />
                </span>
              )}
            </div>
          </div>
          <div className="w-14 h-14 bg-white flex items-center justify-center shrink-0 ml-4">
            {job.companyLogoUrl ? (
              <img src={job.companyLogoUrl} alt={job.company} className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold text-gray-300">{logoInitial}</span>
            )}
          </div>
        </div>

        {/* Metrics Box */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#F47C20]">
              <DollarSign size={14} />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Stipend</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{job.packageDetails || 'Not Disclosed'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#F47C20]">
              <Users size={14} />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Openings</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{job.openings || 'Multiple'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#F47C20]">
              <Briefcase size={14} />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Job Type</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{job.jobType || 'Full-time'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#F47C20]">
              <Hourglass size={14} />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Apply By</span>
            </div>
            <p className="text-sm font-medium text-gray-800">
              {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) + ', 04:00 PM' : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('details')} 
            className={`pb-3 font-semibold text-[15px] transition-colors relative ${activeTab === 'details' ? 'text-[#F47C20]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Job Details
            {activeTab === 'details' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#F47C20]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('messages')} 
            className={`pb-3 font-semibold text-[15px] transition-colors relative ${activeTab === 'messages' ? 'text-[#F47C20]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Messages
            {activeTab === 'messages' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#F47C20]"></div>}
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Content Area (Job Details) */}
          <div className="lg:col-span-2">
            {activeTab === 'details' && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col">
                <div className="p-6 md:p-8 flex flex-col gap-10">
                  
                  {/* Eligibility Criteria */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4 text-gray-800">
                      <CheckCircle2 size={20} className="text-gray-400" />
                      <h3 className="text-base font-semibold">Eligibility Criteria</h3>
                    </div>
                    <ul className="list-disc pl-9 space-y-2 text-[14px] text-gray-600">
                      <li><span className="font-medium text-gray-700">Minimum CGPA:</span> {job.minCgpa ? `${job.minCgpa}` : 'Not strictly specified. Standard requirements apply.'}</li>
                      <li><span className="font-medium text-gray-700">Year of graduation:</span> {job.eligibleSemester ? `Semester ${job.eligibleSemester} and above` : 'Final year students preferred.'}</li>
                      <li><span className="font-medium text-gray-700">Backlogs:</span> {job.maxBacklogs != null ? `Maximum ${job.maxBacklogs} active backlogs allowed.` : 'No active backlogs preferred.'}</li>
                      <li><span className="font-medium text-gray-700">Experience:</span> {job.experienceRequired || 'Entry Level / Fresher'}</li>
                    </ul>
                  </div>

                  {/* Location */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4 text-gray-800">
                      <MapPin size={20} className="text-gray-400" />
                      <h3 className="text-base font-semibold">Job Location</h3>
                    </div>
                    <ul className="list-disc pl-9 text-[14px] text-gray-600">
                      <li>{job.location || 'Remote'}</li>
                    </ul>
                  </div>

                  {/* Skills Required */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4 text-gray-800">
                      <Award size={20} className="text-gray-400" />
                      <h3 className="text-base font-semibold">Skills Required</h3>
                    </div>
                    <ul className="list-disc pl-9 space-y-2 text-[14px] text-gray-600">
                      {job.requiredSkills ? (
                        job.requiredSkills.split(',').map((skill, index) => (
                          <li key={index}>{skill.trim()}</li>
                        ))
                      ) : (
                        <li>Basic programming and communication skills.</li>
                      )}
                    </ul>
                  </div>

                  {/* Full Description */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4 text-gray-800">
                      <Briefcase size={20} className="text-gray-400" />
                      <h3 className="text-base font-semibold">Detailed Description</h3>
                    </div>
                    <div className="pl-9 text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {job.description || 'No detailed description provided by the recruiter.'}
                    </div>
                  </div>

                </div>
                
                {/* Left decorative border running down */}
                <div className="absolute left-8 top-8 bottom-8 w-px bg-gray-100 -z-10 hidden md:block"></div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="py-12 text-center border border-gray-200 rounded-xl">
                 <MessageSquare size={32} className="text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                 <p className="text-gray-500 text-sm">Any direct communication with the recruiter will appear here.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar Area */}
          <div className="lg:col-span-1">
            {role === 'student' && hasApplied && (
              <div className="flex flex-col gap-6">
                
                {/* Info Banner */}
                <div className="flex items-center gap-2 text-[13px] text-gray-700 font-medium">
                  <Info size={16} className="text-gray-400" />
                  You have applied for this job
                </div>

                {/* Job Updates Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase size={18} className="text-gray-500" />
                    <h3 className="text-base font-semibold text-gray-900">Job Updates</h3>
                  </div>

                  <div className="relative pl-6 space-y-8">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200"></div>

                    {/* Step 1: Applied */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#F47C20] flex items-center justify-center">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#F47C20]"></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-900">Applied</p>
                        <p className="text-[12px] text-gray-500 mt-1">Application submitted successfully</p>
                      </div>
                    </div>

                    {/* Step 2: Next Update */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1">
                         <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-300"></div>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-900">Expected Date for the Next Update</p>
                        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                          Waiting for the company's response on your job application and will update you soon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin / Alumni Actions */}
            {(role === 'admin' || role === 'alumni') && (
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                 <h3 className="text-base font-semibold text-gray-900 mb-4">Management Actions</h3>
                 
                 <div className="flex flex-col gap-3">
                   {role === 'alumni' && (
                     <Button className="w-full justify-center bg-[#F47C20] hover:bg-[#e06912] text-white rounded-lg h-11" onClick={() => navigate(`/alumni/edit-job/${job.id}`)}>
                       Edit Job Listing
                     </Button>
                   )}
                   
                   {role === 'admin' && job.status === 'PENDING' && (
                     <>
                        <Button className="w-full justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg h-11" onClick={() => updateJobStatus('ACTIVE')}>
                          Approve Job
                        </Button>
                        <Button variant="outline" className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-11" onClick={() => updateJobStatus('REJECTED')}>
                          Reject Job
                        </Button>
                     </>
                   )}
                   
                   {role === 'student' && !hasApplied && eligibility.eligible && (
                     <Button className="w-full justify-center bg-[#F47C20] hover:bg-[#e06912] text-white rounded-lg h-11 font-semibold shadow-sm" onClick={handleApply}>
                       Apply Now
                     </Button>
                   )}

                   {role === 'student' && !hasApplied && !eligibility.eligible && (
                      <Button disabled className="w-full justify-center bg-gray-200 text-gray-500 rounded-lg h-11 font-semibold cursor-not-allowed">
                        Not Eligible
                      </Button>
                   )}
                 </div>
              </div>
            )}

            {role === 'student' && !hasApplied && (
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                 <h3 className="text-base font-semibold text-gray-900 mb-4">Interested in this role?</h3>
                 {eligibility.eligible ? (
                    <Button className="w-full justify-center bg-[#F47C20] hover:bg-[#e06912] text-white rounded-lg h-11 font-semibold shadow-sm" onClick={handleApply}>
                      Apply Now
                    </Button>
                 ) : (
                    <Button disabled className="w-full justify-center bg-gray-200 text-gray-500 rounded-lg h-11 font-semibold cursor-not-allowed">
                      Not Eligible
                    </Button>
                 )}
                 {!eligibility.eligible && eligibility.message && (
                    <p className="text-xs text-red-500 mt-2 text-center">{eligibility.message}</p>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
