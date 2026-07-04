import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader, Input, Button } from '../../components/common';
import api from '../../utils/axiosConfig';
import { Briefcase, DollarSign, MapPin, FileText, Tag, Layers, CheckCircle } from 'lucide-react';

export default function AlumniPostJob() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    level: 'Entry Level',
    salary: '',
    description: '',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newJob = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await api.post('/jobs/post', newJob);
      
      setShowToast(true);
      setTimeout(() => {
        navigate('/alumni/my-jobs');
      }, 1500);
      
    } catch (err) {
      console.error('Failed to post job', err);
      alert('Failed to post job: ' + (err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="alumni">
      {showToast && (
        <div className="fixed top-20 right-8 bg-green-50 text-green-700 px-6 py-4 rounded-xl border border-green-200 shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <CheckCircle size={24} className="text-green-500" />
          <span className="font-semibold">Job posted successfully! Redirecting...</span>
        </div>
      )}
      <PageHeader 
        title="Post a New Job" 
        subtitle="Share opportunities with students from your alma mater." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Job Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-gray-100">
              <Briefcase size={20} className="text-primary" />
              Job Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Title <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="title"
                  placeholder="e.g. Software Engineer" 
                  value={formData.title}
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Company Name <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="company"
                  placeholder="e.g. Google" 
                  value={formData.company}
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="location"
                  placeholder="e.g. Remote, New York" 
                  value={formData.location}
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Employment Type <span className="text-red-500">*</span></label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none appearance-none bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Job Description <span className="text-red-500">*</span></label>
              <textarea 
                name="description"
                rows={6} 
                placeholder="Describe the role responsibilities and requirements..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-y"
              ></textarea>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-gray-100">
              <DollarSign size={20} className="text-primary" />
              Requirements & Compensation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Experience Level <span className="text-red-500">*</span></label>
                <select 
                  name="level" 
                  value={formData.level} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none appearance-none bg-white"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Salary Range (Optional)</label>
                <input 
                  type="text"
                  name="salary"
                  placeholder="e.g. $80k - $120k" 
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Required Skills (Tags)</label>
              <input 
                type="text"
                name="tags"
                placeholder="Type skills separated by commas (e.g. React, Node.js, Python)" 
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">These tags help students find your job when searching.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => navigate('/alumni/dashboard')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
