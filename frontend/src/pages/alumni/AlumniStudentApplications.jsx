import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader, LoadingSpinner, Avatar } from '../../components/common';
import { FileText, CheckCircle, XCircle, Search, Download } from 'lucide-react';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

export default function AlumniStudentApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SELECTED
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/applications/alumni/my-posted-jobs');
      setApplications(res.data || []);
    } catch (err) {
      toast.error('Failed to load student applications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, null, { params: { status: status.toUpperCase() } });
      toast.success(`Application marked as ${status}`);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  const handleResumeDownload = async (filename) => {
    try {
      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = `/api/admin/resumes/${filename}`; // Public static serve
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error opening resume:", error);
      toast.error("Could not open resume");
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.student?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          app.jobTitle?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'SELECTED') {
      return matchesSearch && app.status === 'SELECTED';
    }
    return matchesSearch && app.status !== 'SELECTED'; // Show pending/shortlisted/rejected in ALL tab
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'SELECTED': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'SHORTLISTED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <DashboardLayout role="alumni">
      <PageHeader 
        title="Student Applications" 
        subtitle="Review and manage students who applied to your jobs."
      />

      <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'ALL' ? 'bg-white text-[#F47C20] shadow-sm' : 'text-slate-500 hover:text-[#F47C20]'}`}
          >
            Pending / Shortlisted
          </button>
          <button 
            onClick={() => setActiveTab('SELECTED')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1 ${activeTab === 'SELECTED' ? 'bg-white text-[#F47C20] shadow-sm' : 'text-slate-500 hover:text-[#F47C20]'}`}
          >
            <CheckCircle size={14} /> Selected Students
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search student or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><LoadingSpinner /></div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center p-12 text-slate-500 font-medium">No applications found in this category.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicant</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Applied For</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applied Date</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={`https://ui-avatars.com/api/?name=${app.student?.name || 'S'}&background=F47C20&color=fff`} size="md" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{app.student?.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{app.student?.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-slate-700">{app.jobTitle}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {app.resumeUrl && (
                          <button 
                            onClick={() => handleResumeDownload(app.resumeUrl)}
                            className="px-2 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Download size={12}/> Resume
                          </button>
                        )}
                        
                        {activeTab === 'ALL' && (
                          <>
                            {app.status === 'PENDING' && (
                              <button 
                                onClick={() => updateApplicationStatus(app.id, 'SHORTLISTED')}
                                className="px-2 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-colors"
                              >
                                Shortlist
                              </button>
                            )}
                            
                            {(app.status === 'PENDING' || app.status === 'SHORTLISTED') && (
                              <button 
                                onClick={() => updateApplicationStatus(app.id, 'SELECTED')}
                                className="px-2 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                              >
                                <CheckCircle size={12}/> Select
                              </button>
                            )}
                            
                            {app.status !== 'REJECTED' && (
                              <button 
                                onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                                className="p-1.5 bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject Application"
                              >
                                <XCircle size={14}/>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
