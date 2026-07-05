import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, Mail, Phone, MapPin, Linkedin, Github, 
  Plus, Edit2, Trash2, FileText, Download, X, BadgeCheck, AlertCircle, Link as LinkIcon, CheckCircle, Save, BookOpen, Wrench, FolderGit2
} from 'lucide-react';
import { Modal, Input, Button, DocumentViewerModal, LoadingSpinner } from '../../components/common';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import { calculateProfileCompletion } from '../../utils/profileUtils';
import { useData } from '../../context/DataContext';
import useDepartments from '../../hooks/useDepartments';

export default function StudentProfile() {
  const location = useLocation();
  const { profileImage, updateProfileImage } = useData();
  const { departments } = useDepartments();

  const [isLoading, setIsLoading] = useState(true);
  
  const [basicInfo, setBasicInfo] = useState({
    name: '', email: '', department: '', mobileNumber: '', location: '', githubUrl: '', linkedinUrl: '', profileImageUrl: ''
  });
  const [academicInfo, setAcademicInfo] = useState({
    cgpa: '', semester: '', backlogs: '', academicYear: '', rollNumber: '', verificationStatus: 'PENDING'
  });
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resumeDetails, setResumeDetails] = useState(null);
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);
  
  const [basicForm, setBasicForm] = useState({});
  const [academicForm, setAcademicForm] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [editingSkill, setEditingSkill] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tech: '', demoUrl: '', sourceUrl: '' });
  const [editingProject, setEditingProject] = useState(null);

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerMetadata, setViewerMetadata] = useState(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const [profileRes, resumeRes] = await Promise.all([
        api.get('/student/profile').catch(() => ({ data: null })),
        api.get('/student/resume/details').catch(() => ({ data: null }))
      ]);

      if (profileRes.data) {
        setSkills(profileRes.data.skills || []);
        setProjects(profileRes.data.projects || []);
        
        const acad = {
          cgpa: profileRes.data.cgpa || '',
          semester: profileRes.data.semester || '',
          backlogs: profileRes.data.backlogs !== null ? profileRes.data.backlogs : '',
          academicYear: profileRes.data.academicYear || '',
          rollNumber: profileRes.data.rollNumber || '',
          verificationStatus: profileRes.data.verificationStatus || 'PENDING'
        };
        setAcademicInfo(acad);
        setAcademicForm(acad);

        if (profileRes.data.user) {
          const basic = {
            name: profileRes.data.user.name || '',
            email: profileRes.data.user.email || '',
            department: profileRes.data.department || '',
            mobileNumber: profileRes.data.mobileNumber || '',
            location: profileRes.data.location || '',
            githubUrl: profileRes.data.githubUrl || '',
            linkedinUrl: profileRes.data.linkedinUrl || '',
            profileImageUrl: profileRes.data.profileImageUrl || ''
          };
          setBasicInfo(basic);
          setBasicForm(basic);
          updateProfileImage(profileRes.data.profileImageUrl);
        }
      }
      if (resumeRes.data) setResumeDetails(resumeRes.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      await api.put('/student/profile', {
        department: basicForm.department,
        mobileNumber: basicForm.mobileNumber,
        location: basicForm.location,
        githubUrl: basicForm.githubUrl,
        linkedinUrl: basicForm.linkedinUrl
      });
      await fetchProfile();
      toast.success("Profile updated successfully");
      setIsEditingPersonal(false);
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleUpdateAcademic = async (e) => {
    e.preventDefault();
    setIsSavingAcademic(true);
    try {
      await api.put('/student/profile', {
        cgpa: parseFloat(academicForm.cgpa),
        semester: parseInt(academicForm.semester),
        backlogs: parseInt(academicForm.backlogs)
      });
      await fetchProfile();
      toast.success("Academic information saved. Note: Verification status is now PENDING.");
      setIsEditingAcademic(false);
    } catch (err) {
      toast.error("Failed to update academic profile.");
    } finally {
      setIsSavingAcademic(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/student/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProfile();
      toast.success(res.data.message || "Profile image updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    }
  };

  const handleResumeUpload = async (e, isReplace = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeDetails(res.data);
      toast.success(isReplace ? "Resume replaced successfully" : "Resume uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resume upload failed");
    }
  };

  const handleResumeView = async () => {
    try {
      const res = await api.get('/student/resume/view', { responseType: 'blob' });
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${academicInfo.rollNumber || 'Student'}_Resume.pdf`;
      const file = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      setViewerUrl(fileURL);
      setViewerMetadata({
        fileName: filename,
        studentName: basicInfo.name,
        rollNumber: academicInfo.rollNumber,
        uploadDate: resumeDetails?.uploadDate ? new Date(resumeDetails.uploadDate).toLocaleDateString() : undefined
      });
      setViewerOpen(true);
    } catch (err) {
      toast.error("Failed to view resume.");
    }
  };

  const closeDocumentViewer = () => {
    setViewerOpen(false);
    if (viewerUrl) {
      URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
    }
    setViewerMetadata(null);
  };

  const handleResumeDownload = async () => {
    try {
      const res = await api.get('/student/resume/download', { responseType: 'blob' });
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${academicInfo.rollNumber || 'Student'}_Resume.pdf`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download resume.");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      try {
        const skillName = newSkill.trim();
        if (editingSkill && editingSkill !== skillName) {
          await api.delete(`/student/skills/${editingSkill}`);
          await api.post('/student/skills', { name: skillName });
        } else if (!editingSkill) {
          await api.post('/student/skills', { name: skillName });
        }
        await fetchProfile();
        setShowSkillModal(false);
        setNewSkill('');
        setEditingSkill(null);
        toast.success("Skill saved successfully");
      } catch (error) {
        toast.error("Failed to save skill.");
      }
    }
  };

  const deleteSkill = async (skillToDelete) => {
    if (window.confirm(`Delete ${skillToDelete}?`)) {
      try {
        await api.delete(`/student/skills/${skillToDelete}`);
        await fetchProfile();
        toast.success("Skill deleted successfully");
      } catch (error) {
        toast.error("Failed to delete skill.");
      }
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const techArray = projectForm.tech.split(',').map(t => t.trim()).filter(t => t);
    const projectData = { ...projectForm, tech: techArray };
    if (editingProject) projectData.id = editingProject.id;

    try {
      await api.post('/student/projects', projectData);
      await fetchProfile();
      setShowProjectModal(false);
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to save project.");
    }
  };

  const deleteProject = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await api.delete(`/student/projects/${id}`);
        await fetchProfile();
        toast.success("Project deleted successfully");
      } catch (error) {
        toast.error("Failed to delete project.");
      }
    }
  };

  const { percentage: completionPercentage } = calculateProfileCompletion(
    { ...basicInfo, ...academicInfo, skills, projects },
    resumeDetails
  );

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex justify-center items-center h-full min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const actionBtnStyle = "py-2.5 px-4 bg-white border border-[#F47C20] text-[#F47C20] rounded-xl text-sm font-bold hover:bg-[#FFF4EB] focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer";
  const smallActionBtnStyle = "px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#FFF4EB] focus:ring-2 focus:ring-[#F47C20] transition-all flex items-center gap-1.5 shadow-sm";

  return (
    <DashboardLayout role="student">
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 mt-4 animate-in zoom-in-95 duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ======================= LEFT COLUMN (lg:col-span-4) ======================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. Identity Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              </div>
              <div className="px-6 pb-6 relative text-center">
                <div className="flex justify-center -mt-16 mb-4 relative z-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                      {profileImage || basicInfo.profileImageUrl ? (
                        <img src={profileImage || basicInfo.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl font-extrabold text-slate-300 flex items-center justify-center h-full">
                          {basicInfo.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-white">
                      <Edit2 size={24} color="white" />
                      <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex justify-center items-center gap-2">
                  {basicInfo.name}
                  {academicInfo.verificationStatus === 'VERIFIED' && <BadgeCheck size={20} className="text-[#F47C20]"/>}
                </h2>
                <p className="text-sm font-extrabold text-[#F47C20] mt-1">{academicInfo.rollNumber}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1">{basicInfo.department || 'No Department'}</p>
                
                <div className="mt-5 flex items-center justify-center gap-3">
                  {academicInfo.verificationStatus === "VERIFIED" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase"><CheckCircle size={12}/> Verified Student</span>
                  ) : academicInfo.verificationStatus === "REJECTED" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 uppercase"><AlertCircle size={12}/> Rejected</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFF4EB] text-[#F47C20] border border-[#F47C20]/30 uppercase"><AlertCircle size={12}/> Pending Verification</span>
                  )}
                </div>

                {/* Profile Completion */}
                <div className="w-full mt-6 pt-5 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Completion</span>
                    <span className="text-xs font-bold text-slate-700">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F47C20] rounded-full transition-all duration-500" style={{width: `${completionPercentage}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Quick Overview & Links */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center">
                  <p className="text-2xl font-black text-slate-800">{academicInfo.cgpa || "N/A"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">CGPA</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center">
                  <p className="text-2xl font-black text-slate-800">{academicInfo.backlogs || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Backlogs</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Links</h3>
                <button onClick={() => setShowPersonalModal(true)} className="px-2 py-1 bg-white border border-[#F47C20] text-[#F47C20] rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-[#FFF4EB] focus:ring-2 focus:ring-[#F47C20] transition-all flex items-center gap-1 shadow-sm">
                  <Edit2 size={10} /> Edit
                </button>
              </div>
              <div className="space-y-4">
                {basicInfo.email && <div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><Mail size={16} className="text-slate-400 shrink-0"/> <span className="truncate break-all">{basicInfo.email}</span></div>}
                {basicInfo.mobileNumber && <div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><Phone size={16} className="text-slate-400 shrink-0"/> <span>{basicInfo.mobileNumber}</span></div>}
                {basicInfo.location && <div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><MapPin size={16} className="text-slate-400 shrink-0"/> <span>{basicInfo.location}</span></div>}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                {basicInfo.githubUrl && <a href={basicInfo.githubUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#F47C20] hover:border-[#F47C20] transition-colors"><Github size={18}/></a>}
                {basicInfo.linkedinUrl && <a href={basicInfo.linkedinUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#F47C20] hover:border-[#F47C20] transition-colors"><Linkedin size={18}/></a>}
              </div>
            </div>

          </div>

          {/* ======================= RIGHT COLUMN (lg:col-span-8) ======================= */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Section 2: Academic Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h4 className="font-bold text-[#F47C20] text-sm uppercase tracking-wider flex items-center gap-2"><BookOpen size={16}/> Academic Information</h4>
                 {!isEditingAcademic && (
                   <button onClick={() => setIsEditingAcademic(true)} className={smallActionBtnStyle}>
                     <Edit2 size={12} /> Edit Details
                   </button>
                 )}
              </div>
              <div className="p-6">
                {isEditingAcademic ? (
                  <>
                    <div className="bg-[#FFF4EB] border border-[#F47C20]/30 text-[#F47C20] rounded-xl p-4 flex gap-3 items-start mb-6">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold leading-relaxed">Warning: Updating academic information will automatically reset your Verification Status to PENDING.</p>
                    </div>
                    <form onSubmit={handleUpdateAcademic}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <Input label="Roll Number" value={academicInfo.rollNumber || ''} disabled />
                        <Input label="Academic Year" value={academicInfo.academicYear || ''} disabled />
                        <Input label="Current Semester" type="number" min="1" max="8" value={academicForm.semester || ''} onChange={e => setAcademicForm({...academicForm, semester: e.target.value})} required />
                        <Input label="Current CGPA" type="number" step="0.01" min="0" max="10" value={academicForm.cgpa || ''} onChange={e => setAcademicForm({...academicForm, cgpa: e.target.value})} required />
                        <Input label="Active Backlogs" type="number" min="0" value={academicForm.backlogs || ''} onChange={e => setAcademicForm({...academicForm, backlogs: e.target.value})} required />
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsEditingAcademic(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"><X size={16}/> Cancel</button>
                        <button type="submit" disabled={isSavingAcademic} className={actionBtnStyle + " w-auto px-6"}>
                          <Save size={16}/> {isSavingAcademic ? 'Saving...' : 'Submit for Verification'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roll Number</p><p className="text-sm font-extrabold text-slate-800">{academicInfo.rollNumber || '-'}</p></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year</p><p className="text-sm font-extrabold text-slate-800">{academicInfo.academicYear || '-'}</p></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semester</p><p className="text-sm font-extrabold text-slate-800">{academicInfo.semester || '-'}</p></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CGPA</p><p className="text-sm font-extrabold text-slate-800">{academicInfo.cgpa || '-'}</p></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Backlogs</p><p className="text-sm font-extrabold text-slate-800">{academicInfo.backlogs || 0}</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Skills & Technologies */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h4 className="font-bold text-[#F47C20] text-sm uppercase tracking-wider flex items-center gap-2"><Wrench size={16}/> Skills & Technologies</h4>
                 <button onClick={() => {setEditingSkill(null); setNewSkill(''); setShowSkillModal(true);}} className={smallActionBtnStyle}>
                   <Plus size={12}/> Add Skill
                 </button>
              </div>
              <div className="p-6">
                {skills.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="font-semibold text-sm">No skills added yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {skills.map(skill => (
                      <div key={skill} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-semibold text-sm shadow-sm group hover:border-[#F47C20]/50 transition-colors">
                        <span>{skill}</span>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-slate-400 hover:text-[#F47C20]" onClick={() => { setEditingSkill(skill); setNewSkill(skill); setShowSkillModal(true); }}><Edit2 size={12}/></button>
                          <button className="text-slate-400 hover:text-red-500" onClick={() => deleteSkill(skill)}><X size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Resume Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                 <h4 className="font-bold text-[#F47C20] text-sm uppercase tracking-wider flex items-center gap-2"><FileText size={16}/> Resume / CV</h4>
              </div>
              <div className="p-6">
                {resumeDetails ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl gap-6 shadow-sm hover:border-[#F47C20]/50 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 bg-[#FFF4EB] rounded-xl flex items-center justify-center text-[#F47C20] shadow-inner shrink-0"><FileText size={28}/></div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-base truncate" title={resumeDetails.fileName || 'resume.pdf'}>{resumeDetails.fileName || 'resume.pdf'}</h3>
                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                          {resumeDetails.fileType?.includes('pdf') ? 'PDF' : 'DOC'} • {new Date(resumeDetails.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 shrink-0 items-center flex-nowrap">
                      <button onClick={handleResumeView} className="px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#FFF4EB] transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"><LinkIcon size={14}/> View</button>
                      <button onClick={handleResumeDownload} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"><Download size={14}/> Save</button>
                      <div className="flex shrink-0">
                        <input type="file" id="resume-replace" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeUpload(e, true)} />
                        <label htmlFor="resume-replace" className="px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#FFF4EB] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap m-0">Replace</label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mx-auto mb-4"><FileText size={32}/></div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-2">No Resume Uploaded</h3>
                    <p className="mb-6 max-w-sm mx-auto text-xs font-semibold text-slate-500">Upload your latest resume to share with recruiters.</p>
                    <div>
                      <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeUpload(e, false)} />
                      <label htmlFor="resume-upload" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F47C20] text-white text-sm font-bold rounded-xl hover:bg-[#E06915] shadow-sm cursor-pointer m-0 active:scale-95 transition-all"><Plus size={16}/> Upload Resume</label>
                    </div>
                  </div>
                )}
              </div>
            </div>

          

            </div>
        </div>

        {/* FULL WIDTH SECTION */}
        {/* Section 4: Projects */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h4 className="font-bold text-[#F47C20] text-sm uppercase tracking-wider flex items-center gap-2"><FolderGit2 size={16}/> Projects Portfolio</h4>
                 <button onClick={() => { setEditingProject(null); setProjectForm({ title: '', description: '', tech: '', demoUrl: '', sourceUrl: '' }); setShowProjectModal(true); }} className={smallActionBtnStyle}>
                   <Plus size={12}/> Add Project
                 </button>
              </div>
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="font-semibold text-sm">No projects added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(proj => (
                      <div key={proj.id} className="p-5 border border-slate-200 rounded-xl hover:border-[#F47C20]/50 hover:shadow-md transition-all bg-slate-50 group flex flex-col gap-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-extrabold text-base text-slate-800">{proj.title}</h3>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingProject(proj); setProjectForm({ title: proj.title, description: proj.description, tech: proj.tech.join(', '), demoUrl: proj.demoUrl || '', sourceUrl: proj.sourceUrl || '' }); setShowProjectModal(true); }} className="text-slate-400 hover:text-[#F47C20]"><Edit2 size={14}/></button>
                            <button onClick={() => deleteProject(proj.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        {proj.description && <p className="text-[13px] text-slate-600 line-clamp-3 leading-relaxed flex-1 font-medium">{proj.description}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {proj.tech.map((t, i) => <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider rounded shadow-sm">{t}</span>)}
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-200 flex-wrap mt-2">
                          {proj.sourceUrl && proj.sourceUrl.trim() !== '' ? (
                            <a href={proj.sourceUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] hover:bg-[#FFF4EB] text-[11px] font-bold rounded-lg transition-colors shadow-sm"><Github size={12}/> Code</a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 text-[11px] font-bold rounded-lg cursor-default"><Github size={12}/> No Code</span>
                          )}
                          {proj.demoUrl && proj.demoUrl.trim() !== '' ? (
                            <a href={proj.demoUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] hover:bg-[#FFF4EB] text-[11px] font-bold rounded-lg transition-colors shadow-sm"><LinkIcon size={12}/> Demo</a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 text-[11px] font-bold rounded-lg cursor-default"><LinkIcon size={12}/> No Demo</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

      </div>

      {/* Modals */}

      <Modal isOpen={showPersonalModal} onClose={() => setShowPersonalModal(false)} title="Edit Personal Information">
        <form onSubmit={(e) => {
          e.preventDefault();
          setIsSavingPersonal(true);
          api.put('/student/profile', {
            department: basicForm.department,
            mobileNumber: basicForm.mobileNumber,
            location: basicForm.location,
            githubUrl: basicForm.githubUrl,
            linkedinUrl: basicForm.linkedinUrl
          }).then(() => {
            fetchProfile();
            toast.success("Profile updated successfully");
            setShowPersonalModal(false);
          }).catch(() => {
            toast.error("Failed to save profile");
          }).finally(() => setIsSavingPersonal(false));
        }}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Input label="Full Name" value={basicForm.name || ''} disabled />
            <Input label="Email" value={basicForm.email || ''} disabled />
            <div className="form-group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
              <select value={basicForm.department || ''} onChange={e => setBasicForm({...basicForm, department: e.target.value})} required className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F47C20] transition-all cursor-pointer">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <Input label="Mobile Number" value={basicForm.mobileNumber || ''} onChange={e => setBasicForm({...basicForm, mobileNumber: e.target.value})} required />
            <Input label="Location" value={basicForm.location || ''} onChange={e => setBasicForm({...basicForm, location: e.target.value})} required />
            <Input label="GitHub URL" type="url" value={basicForm.githubUrl || ''} onChange={e => setBasicForm({...basicForm, githubUrl: e.target.value})} />
            <Input label="LinkedIn URL" type="url" value={basicForm.linkedinUrl || ''} onChange={e => setBasicForm({...basicForm, linkedinUrl: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowPersonalModal(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSavingPersonal} className="px-5 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-xl text-sm font-bold hover:bg-[#FFF4EB] transition-all shadow-sm flex items-center justify-center gap-2">
              <Save size={16}/> {isSavingPersonal ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title={editingSkill ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={handleAddSkill}>
          <Input label="Skill Name" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. React, Java" required />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowSkillModal(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-xl text-sm font-bold hover:bg-[#FFF4EB] transition-all shadow-sm">Save Skill</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title={editingProject ? "Edit Project" : "Add Project"}>
        <form onSubmit={handleProjectSubmit}>
          <Input label="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#F47C20] focus:ring-2 focus:ring-[#F47C20]/20 transition-all" rows="3" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} required></textarea>
          </div>
          <Input label="Technologies (comma separated)" value={projectForm.tech} onChange={e => setProjectForm({...projectForm, tech: e.target.value})} required placeholder="React, Node.js, MongoDB" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input label="GitHub URL" type="url" value={projectForm.sourceUrl} onChange={e => setProjectForm({...projectForm, sourceUrl: e.target.value})} />
            <Input label="Live Demo URL" type="url" value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowProjectModal(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] rounded-xl text-sm font-bold hover:bg-[#FFF4EB] transition-all shadow-sm">Save Project</button>
          </div>
        </form>
      </Modal>

      {/* DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={closeDocumentViewer}
        documentUrl={viewerUrl}
        fileName={viewerMetadata?.fileName}
        studentName={viewerMetadata?.studentName}
        rollNumber={viewerMetadata?.rollNumber}
        uploadDate={viewerMetadata?.uploadDate}
      />
    </DashboardLayout>
  );
}
