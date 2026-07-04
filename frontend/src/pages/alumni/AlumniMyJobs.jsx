import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Trash2, Users, X, MapPin, Briefcase, DollarSign, Mail, Phone, FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Modal, Button, LoadingSpinner, Pagination } from '../../components/common';
import api from '../../utils/axiosConfig';

export default function AlumniMyJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingApplicants, setViewingApplicants] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/alumni/my-jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to load my jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const currentJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        console.error('Failed to delete job', err);
        alert('Failed to delete job: ' + (err.response?.data || err.message));
      }
    }
  };

  const handleEdit = (e, job) => {
    e.stopPropagation();
    setEditingJob({ ...job });
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/jobs/${editingJob.id}`, editingJob);
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      console.error('Failed to update job', err);
      alert('Failed to update job: ' + (err.response?.data || err.message));
    }
  };

  const handleViewApplicants = async (e, job) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/applications/job/${job.id}`);
      setViewingApplicants({ job, list: res.data });
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, null, { params: { status: status.toUpperCase() } });
      const res = await api.get(`/applications/job/${viewingApplicants.job.id}`);
      setViewingApplicants({ ...viewingApplicants, list: res.data });
    } catch (err) {
      console.error('Failed to update application status', err);
      alert('Failed to update application status: ' + (err.response?.data || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200';
      case 'PENDING': return 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'REJECTED': return 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200';
      default: return 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <DashboardLayout role="alumni">
      <PageHeader 
        title="My Posted Jobs" 
        subtitle="Manage your job listings and view applicants." 
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 min-h-[400px]">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500 font-medium">Loading your job listings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white p-16 rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Briefcase size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Posted</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">You haven't posted any jobs yet. Share opportunities with students to help them build their careers.</p>
            <Button onClick={() => navigate('/alumni/post-job')}>
              Post Your First Job
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {currentJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  onClick={() => setViewingJob(job)}
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                        <p className="text-gray-500 text-sm">{job.company}</p>
                      </div>
                      <span className={getStatusBadge(job.status)}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                        <MapPin size={12} className="text-tertiary" />
                        <span className="truncate max-w-[100px]">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                        <DollarSign size={12} className="text-tertiary" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                        <Briefcase size={12} className="text-tertiary" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <button 
                      className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1.5 transition-colors" 
                      onClick={(e) => handleViewApplicants(e, job)}
                    >
                      <Users size={16} />
                      View Applicants
                    </button>
                    <div className="flex gap-2 text-gray-400">
                      <button className="p-2 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors" onClick={(e) => handleEdit(e, job)} title="Edit Job">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors" onClick={(e) => handleDelete(e, job.id)} title="Delete Job">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {jobs.length > itemsPerPage && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job Posting"
        size="lg"
        footer={null}
      >
        {editingJob && (
          <form onSubmit={handleUpdateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={editingJob.company}
                  onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Salary Range</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={editingJob.salary}
                  onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Job Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={editingJob.type}
                  onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Additional Details</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                value={editingJob.details || ''}
                onChange={(e) => setEditingJob({ ...editingJob, details: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={() => setEditingJob(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
        title="Job Details"
        size="lg"
        footer={
          <Button onClick={() => setViewingJob(null)}>Close</Button>
        }
      >
        {viewingJob && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingJob.title}</h3>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Briefcase size={18} className="text-gray-600" />
                  </div>
                  <span className="text-lg">{viewingJob.company}</span>
                </div>
              </div>
              <span className={getStatusBadge(viewingJob.status)}>
                {viewingJob.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col items-center text-center hover:bg-blue-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <span className="text-sm text-gray-500 mb-1 font-medium">Location</span>
                <span className="font-semibold text-gray-900">{viewingJob.location}</span>
              </div>
              
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col items-center text-center hover:bg-purple-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                  <Briefcase size={20} />
                </div>
                <span className="text-sm text-gray-500 mb-1 font-medium">Job Type</span>
                <span className="font-semibold text-gray-900">{viewingJob.type}</span>
              </div>
              
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col items-center text-center hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
                <span className="text-sm text-gray-500 mb-1 font-medium">Salary Range</span>
                <span className="font-semibold text-gray-900">{viewingJob.salary}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <FileText size={20} className="text-primary" />
                About the Role
              </h4>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {viewingJob.description}
              </div>
            </div>

            {viewingJob.details && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Users size={20} className="text-primary" />
                  Additional Information
                </h4>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {viewingJob.details}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!viewingApplicants}
        onClose={() => setViewingApplicants(null)}
        title={viewingApplicants ? `Applicants for ${viewingApplicants.job.title}` : ''}
        footer={
          <Button variant="outline" onClick={() => setViewingApplicants(null)}>Close</Button>
        }
      >
        <div className="space-y-4">
          {viewingApplicants?.list.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
              No applications received yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {viewingApplicants?.list.map(app => {
                const student = app.user; // Application returns user
                return (
                  <div key={app.id} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${student?.name || 'S'}&background=random`} alt="avatar" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{student?.name || `Student ID: ${app.userId}`}</h4>
                          <p className="text-sm text-gray-500">
                            {student?.studentProfile?.department || ''} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-3 ml-14">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail size={14} className="text-primary" />
                          <span>{student?.email}</span>
                        </div>
                        {student?.studentProfile?.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone size={14} className="text-primary" />
                            <span>{student.studentProfile.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto mt-4 md:mt-0 flex justify-end">
                      <select 
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm text-gray-700 bg-gray-50 hover:bg-white transition-colors cursor-pointer w-full md:w-40" 
                        value={app.status}
                        onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEWING">Interviewing</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="OFFERED">Offered</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
