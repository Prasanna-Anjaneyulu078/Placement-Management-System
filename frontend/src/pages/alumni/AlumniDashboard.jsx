import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, CheckCircle, GraduationCap, Clock, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, LoadingSpinner, Avatar } from '../../components/common';
import api from '../../utils/axiosConfig';

export default function AlumniDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, statsRes, jobsRes, appsRes] = await Promise.all([
          api.get('/alumni/profile'),
          api.get('/alumni/stats'),
          api.get('/alumni/my-jobs'),
          api.get('/applications/alumni/my-posted-jobs').catch(() => ({ data: [] }))
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setMyJobs(jobsRes.data);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch alumni dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="alumni">
        <div className="flex justify-center items-center h-full min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const activeJobs = myJobs.filter(job => job.status === 'APPROVED');
  const recentJobs = [...myJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentApps = [...applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 3);
  const recentSelected = [...applications].filter(a => a.status === 'SELECTED').sort((a, b) => new Date(b.updatedAt || b.appliedAt) - new Date(a.updatedAt || a.appliedAt)).slice(0, 3);

  return (
    <DashboardLayout role="alumni">
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
        
        

        {/* Quick Statistics (Single Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Briefcase size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Jobs Posted</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{stats?.jobsPosted || 0}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Jobs</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{stats?.activeJobs || 0}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[#F47C20]/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#FFF4EB] flex items-center justify-center shrink-0">
              <Users size={24} className="text-[#F47C20]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Students Applied</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{stats?.totalApplicants || applications.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <GraduationCap size={24} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Selected Students</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{applications.filter(a => a.status === 'SELECTED').length}</h3>
            </div>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Job Posts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Briefcase size={16} className="text-blue-500"/> Recent Jobs</h3>
              <button onClick={() => navigate('/alumni/my-jobs')} className="text-[11px] font-bold text-[#F47C20] hover:underline uppercase tracking-wider">View All</button>
            </div>
            <div className="p-4 flex-1">
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map(job => (
                    <div key={job.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => navigate(`/alumni/my-jobs`)}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${job.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        <Briefcase size={14}/>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{job.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${job.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                            {job.status}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><Clock size={10}/> {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <Briefcase size={32} className="text-slate-200 mb-3"/>
                  <p className="text-sm font-semibold text-slate-400">No jobs posted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Latest Applications */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText size={16} className="text-[#F47C20]"/> Latest Applications</h3>
              <button onClick={() => navigate('/alumni/applications')} className="text-[11px] font-bold text-[#F47C20] hover:underline uppercase tracking-wider">View All</button>
            </div>
            <div className="p-4 flex-1">
              {recentApps.length > 0 ? (
                <div className="space-y-4">
                  {recentApps.map(app => (
                    <div key={app.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => navigate(`/alumni/applications`)}>
                      <Avatar src={`https://ui-avatars.com/api/?name=${app.student?.name || 'S'}&background=F47C20&color=fff`} size="sm" className="shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{app.student?.name || 'Student'}</h4>
                        <p className="text-[11px] font-medium text-slate-500 truncate">Applied for {app.jobTitle}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <FileText size={32} className="text-slate-200 mb-3"/>
                  <p className="text-sm font-semibold text-slate-400">No applications yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Selected */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Recently Selected</h3>
              <button onClick={() => navigate('/alumni/applications')} className="text-[11px] font-bold text-[#F47C20] hover:underline uppercase tracking-wider">View All</button>
            </div>
            <div className="p-4 flex-1">
              {recentSelected.length > 0 ? (
                <div className="space-y-4">
                  {recentSelected.map(app => (
                    <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100 cursor-pointer" onClick={() => navigate(`/alumni/applications`)}>
                      <Avatar src={`https://ui-avatars.com/api/?name=${app.student?.name || 'S'}&background=10b981&color=fff`} size="sm" className="shrink-0 ring-2 ring-emerald-100"/>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{app.student?.name || 'Student'}</h4>
                        <p className="text-[11px] font-bold text-emerald-600 truncate">Selected for {app.jobTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <Users size={32} className="text-slate-200 mb-3"/>
                  <p className="text-sm font-semibold text-slate-400">No selections yet</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
