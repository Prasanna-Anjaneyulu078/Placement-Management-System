import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/common';
import api from '../../utils/axiosConfig';
import { Briefcase, DollarSign, Image as ImageIcon, Building } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AlumniPostJob() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    packageDetails: '',
    experienceRequired: '',
    applicationLink: '',
    description: '',
    requiredSkills: '',
    expiryDate: '',
    minCgpa: '',
    eligibleSemester: '',
    maxBacklogs: '',
    industry: '',
    companySize: '',
    openings: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await api.post('/jobs/post', formData);
      const newJobId = res.data.id;

      if (logoFile) {
        const logoData = new FormData();
        logoData.append('file', logoFile);
        await api.post(`/jobs/${newJobId}/logo`, logoData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }

      if (bannerFile) {
        const bannerData = new FormData();
        bannerData.append('file', bannerFile);
        await api.post(`/jobs/${newJobId}/banner`, bannerData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      
      toast.success('Job posted successfully! Pending admin approval.');
      setTimeout(() => {
        navigate('/alumni/my-jobs');
      }, 1500);
      
    } catch (err) {
      console.error('Failed to post job', err);
      toast.error('Failed to post job: ' + (err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="alumni">
      <PageHeader 
        title="Post a New Job" 
        subtitle="Share opportunities with students from your alma mater." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-6 pb-12 max-w-4xl mx-auto">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-[#F47C20] flex items-center gap-2 pb-4 border-b border-slate-100 uppercase tracking-wider">
              <Briefcase size={20} />
              Job Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Title <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="title"
                  placeholder="e.g. Software Engineer" 
                  value={formData.title}
                  required
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Name <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="company"
                  placeholder="e.g. Google" 
                  value={formData.company}
                  required
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="location"
                  placeholder="e.g. Remote, New York" 
                  value={formData.location}
                  required
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employment Type <span className="text-red-500">*</span></label>
                <select 
                  name="jobType" 
                  value={formData.jobType} 
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Industry</label>
                <input 
                  type="text"
                  name="industry"
                  placeholder="e.g. Information Technology" 
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Size</label>
                <input 
                  type="text"
                  name="companySize"
                  placeholder="e.g. 1000-5000 employees" 
                  value={formData.companySize}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Openings</label>
                <input 
                  type="number"
                  name="openings"
                  placeholder="e.g. 5" 
                  value={formData.openings}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Description <span className="text-red-500">*</span></label>
              <textarea 
                name="description"
                rows={6} 
                placeholder="Describe the role responsibilities and requirements..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all resize-y"
              ></textarea>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-lg font-extrabold text-[#F47C20] flex items-center gap-2 pb-4 border-b border-slate-100 uppercase tracking-wider">
              <ImageIcon size={20} />
              Branding
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Logo</label>
                <input 
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F47C20] file:text-white hover:file:bg-[#e06912] cursor-pointer"
                />
                <p className="text-xs text-slate-400">Max size 2MB. Recommended 400x400px.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Banner</label>
                <input 
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#F47C20] file:text-white hover:file:bg-[#e06912] cursor-pointer"
                />
                <p className="text-xs text-slate-400">Max size 2MB. Recommended 1200x400px.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-extrabold text-[#F47C20] flex items-center gap-2 pb-4 border-b border-slate-100 uppercase tracking-wider">
              <DollarSign size={20} />
              Requirements & Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Package / Salary <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="packageDetails"
                  placeholder="e.g. 10 LPA" 
                  value={formData.packageDetails}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience Required <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="experienceRequired"
                  placeholder="e.g. 0-2 Years" 
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Application Deadline <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Skills (Comma separated)</label>
              <input 
                type="text"
                name="requiredSkills"
                placeholder="e.g. React, Node.js, AWS" 
                value={formData.requiredSkills}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Application Link</label>
              <input 
                type="url"
                name="applicationLink"
                placeholder="https://example.com/apply" 
                value={formData.applicationLink}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Min CGPA</label>
                <input 
                  type="number"
                  step="0.01"
                  name="minCgpa"
                  placeholder="e.g. 7.5" 
                  value={formData.minCgpa}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligible Semester</label>
                <input 
                  type="number"
                  name="eligibleSemester"
                  placeholder="e.g. 6" 
                  value={formData.eligibleSemester}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max Backlogs</label>
                <input 
                  type="number"
                  name="maxBacklogs"
                  placeholder="e.g. 0" 
                  value={formData.maxBacklogs}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-1 focus:ring-[#F47C20] transition-all"
                />
              </div>
            </div>
          </div>


          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 bg-white border-2 border-[#F47C20] text-[#F47C20] hover:bg-orange-50 rounded-xl text-sm font-bold shadow-lg shadow-[#F47C20]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting Job...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
