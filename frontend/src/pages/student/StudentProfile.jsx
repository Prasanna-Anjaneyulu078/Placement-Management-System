import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, Mail, Phone, MapPin, Linkedin, Github, 
  Plus, Edit2, Trash2, FileText, Download, X, BadgeCheck, AlertCircle, Link as LinkIcon 
} from 'lucide-react';
import { Modal, Input, Button, Avatar } from '../../components/common';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import { calculateProfileCompletion } from '../../utils/profileUtils';
import { useData } from '../../context/DataContext';
import useDepartments from '../../hooks/useDepartments';
import './StudentProfile.css';

export default function StudentProfile() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'personal';

  const { profileImage, updateProfileImage } = useData();
  const { departments } = useDepartments();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);
  
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    department: '',
    mobileNumber: '',
    location: '',
    githubUrl: '',
    linkedinUrl: '',
    profileImageUrl: ''
  });
  
  const [academicInfo, setAcademicInfo] = useState({
    cgpa: '',
    semester: '',
    backlogs: '',
    academicYear: '',
    rollNumber: '',
    verificationStatus: 'PENDING'
  });
  
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resumeDetails, setResumeDetails] = useState(null);
  
  const fetchProfile = () => {
    api.get('/student/profile').then(res => {
      if (res.data) {
        setSkills(res.data.skills || []);
        setProjects(res.data.projects || []);
        setAcademicInfo({
          cgpa: res.data.cgpa || '',
          semester: res.data.semester || '',
          backlogs: res.data.backlogs !== null ? res.data.backlogs : '',
          academicYear: res.data.academicYear || '',
          rollNumber: res.data.rollNumber || '',
          verificationStatus: res.data.verificationStatus || 'PENDING'
        });
        if (res.data.user) {
          setBasicInfo({
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            department: res.data.department || '',
            mobileNumber: res.data.mobileNumber || '',
            location: res.data.location || '',
            githubUrl: res.data.githubUrl || '',
            linkedinUrl: res.data.linkedinUrl || '',
            profileImageUrl: res.data.profileImageUrl || ''
          });
          updateProfileImage(res.data.profileImageUrl);
        }
      }
    }).catch(err => console.error("Error fetching profile", err));
    
    api.get('/student/resume/details').then(res => {
      if (res.data) setResumeDetails(res.data);
    }).catch(err => console.error("Error fetching resume", err));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Form States
  const [basicForm, setBasicForm] = useState({});
  const [academicForm, setAcademicForm] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [editingSkill, setEditingSkill] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tech: '', demoUrl: '', sourceUrl: '' });
  const [editingProject, setEditingProject] = useState(null);

  // Modals
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Initialize forms when switching tabs or data loads
  useEffect(() => {
    setBasicForm({ ...basicInfo });
    setAcademicForm({ ...academicInfo });
  }, [basicInfo, academicInfo, activeTab]);

  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    try {
      await api.put('/student/profile', {
        department: basicForm.department,
        mobileNumber: basicForm.mobileNumber,
        location: basicForm.location,
        githubUrl: basicForm.githubUrl,
        linkedinUrl: basicForm.linkedinUrl
      });
      fetchProfile();
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
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

  const handleUpdateAcademic = async (e) => {
    e.preventDefault();
    try {
      await api.put('/student/profile', {
        cgpa: parseFloat(academicForm.cgpa),
        semester: parseInt(academicForm.semester),
        backlogs: parseInt(academicForm.backlogs)
      });
      fetchProfile();
      toast.success("Academic information saved. Note: Verification status is now PENDING.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update academic profile.");
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
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      toast.error("Failed to view resume.");
    }
  };

  const handleResumeDownload = async () => {
    try {
      const res = await api.get('/student/resume/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${basicInfo.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
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
        fetchProfile();
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
        fetchProfile();
        toast.success("Skill deleted successfully");
      } catch (error) {
        console.error(error);
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
      fetchProfile();
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
        fetchProfile();
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete project.");
      }
    }
  };

  const { percentage: completionPercentage } = calculateProfileCompletion(
    { ...basicInfo, ...academicInfo, skills, projects },
    resumeDetails
  );

  return (
    <DashboardLayout role="student">
      <div className="profile-container">
        
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-bg"></div>
          <div className="profile-header-content">
            <div className="profile-header-avatar-container" style={{position: 'relative'}}>
              <Avatar 
                size="xl" 
                src={profileImage || basicInfo.profileImageUrl || "https://ui-avatars.com/api/?name=" + basicInfo.name + "&background=F47C20&color=fff"} 
                alt={basicInfo.name}
                className="profile-header-avatar"
              />
              <label className="avatar-upload-overlay" title="Upload Profile Picture">
                <Edit2 size={16} color="white" />
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="profile-header-info">
              <div className="flex-1">
                <h1 className="profile-name flex items-center gap-2">
                  {basicInfo.name}
                  {academicInfo.verificationStatus === 'VERIFIED' && <BadgeCheck size={24} fill="#F47C20" color="white" title="Verified" />}
                </h1>
                <p className="profile-subtitle">{basicInfo.department || 'Department Not Set'} | {academicInfo.rollNumber}</p>
                
                <div className="profile-links">
                  {basicInfo.email && <span className="profile-link-item"><Mail size={14}/> {basicInfo.email}</span>}
                  {basicInfo.mobileNumber && <span className="profile-link-item"><Phone size={14}/> {basicInfo.mobileNumber}</span>}
                  {basicInfo.location && <span className="profile-link-item"><MapPin size={14}/> {basicInfo.location}</span>}
                  {basicInfo.githubUrl && <a href={basicInfo.githubUrl} target="_blank" rel="noreferrer" className="profile-link-btn"><Github size={16}/></a>}
                  {basicInfo.linkedinUrl && <a href={basicInfo.linkedinUrl} target="_blank" rel="noreferrer" className="profile-link-btn"><Linkedin size={16}/></a>}
                </div>
              </div>
              
              <div className="profile-completion">
                <span className="completion-text">Profile Completion: {completionPercentage}%</span>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${completionPercentage}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs mt-6">
          <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Personal Information</button>
          <button className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}>Academic Information</button>
          <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>Skills</button>
          <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
          <button className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`} onClick={() => setActiveTab('resume')}>Resume</button>
        </div>

        {/* Tab Content */}
        <div className="tab-content-container mt-6">
          
          {/* PERSONAL TAB */}
          {activeTab === 'personal' && (
            <div className="tab-pane bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Personal Details</h2>
              <form onSubmit={handleUpdateBasic} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={basicForm.name || ''} disabled />
                  <Input label="Email" value={basicForm.email || ''} disabled />
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                    <select 
                      value={basicForm.department || ''} 
                      onChange={e => setBasicForm({...basicForm, department: e.target.value})} 
                      required
                      className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Mobile Number" value={basicForm.mobileNumber || ''} onChange={e => setBasicForm({...basicForm, mobileNumber: e.target.value})} placeholder="e.g. +91 9876543210" required />
                  <Input label="Location" value={basicForm.location || ''} onChange={e => setBasicForm({...basicForm, location: e.target.value})} placeholder="e.g. Pune, India" required />
                </div>
                <h3 className="text-lg font-bold text-gray-800 pt-4 border-t border-gray-100">Professional Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="GitHub URL" type="url" value={basicForm.githubUrl || ''} onChange={e => setBasicForm({...basicForm, githubUrl: e.target.value})} placeholder="https://github.com/username" />
                  <Input label="LinkedIn URL" type="url" value={basicForm.linkedinUrl || ''} onChange={e => setBasicForm({...basicForm, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button type="submit" variant="primary">Save Changes</Button>
                </div>
              </form>
            </div>
          )}

          {/* ACADEMIC TAB */}
          {activeTab === 'academic' && (
            <div className="tab-pane bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-800">Academic Information</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  academicInfo.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  academicInfo.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                  'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  {academicInfo.verificationStatus === 'VERIFIED' && <CheckCircle size={14}/>}
                  {academicInfo.verificationStatus === 'VERIFIED' 
                    ? `Verified by Placement Cell` 
                    : academicInfo.verificationStatus}
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 flex gap-3 items-start mb-6">
                <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Warning: Updating any academic information will automatically reset your Verification Status to PENDING. An Admin must verify your changes before you can apply to new jobs.</p>
              </div>

              <form onSubmit={handleUpdateAcademic} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Roll Number" value={academicInfo.rollNumber || ''} disabled />
                  <Input label="Academic Year" value={academicInfo.academicYear || ''} disabled />
                  <Input label="Current Semester" type="number" min="1" max="8" value={academicForm.semester || ''} onChange={e => setAcademicForm({...academicForm, semester: e.target.value})} required />
                  <Input label="Current CGPA" type="number" step="0.01" min="0" max="10" value={academicForm.cgpa || ''} onChange={e => setAcademicForm({...academicForm, cgpa: e.target.value})} required />
                  <Input label="Active Backlogs" type="number" min="0" value={academicForm.backlogs || ''} onChange={e => setAcademicForm({...academicForm, backlogs: e.target.value})} required />
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button type="submit" variant="primary">Submit for Verification</Button>
                </div>
              </form>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="tab-pane bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-800">Technical Skills</h2>
                <Button variant="primary" onClick={() => {setEditingSkill(null); setNewSkill(''); setShowSkillModal(true);}}><Plus size={16}/> Add Skill</Button>
              </div>
              
              {skills.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No skills added yet. Add skills to improve your profile!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {skills.map(skill => (
                    <div key={skill} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-medium">
                      <span>{skill}</span>
                      <button className="hover:text-blue-900" onClick={() => { setEditingSkill(skill); setNewSkill(skill); setShowSkillModal(true); }}><Edit2 size={12}/></button>
                      <button className="hover:text-red-500 ml-1" onClick={() => deleteSkill(skill)}><X size={14}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="tab-pane bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-800">Projects</h2>
                <Button variant="primary" onClick={() => {
                  setEditingProject(null);
                  setProjectForm({ title: '', description: '', tech: '', demoUrl: '', sourceUrl: '' });
                  setShowProjectModal(true);
                }}><Plus size={16}/> Add Project</Button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No projects added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map(proj => (
                    <div key={proj.id} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50 group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">{proj.title}</h3>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            setEditingProject(proj);
                            setProjectForm({
                              title: proj.title, description: proj.description, tech: proj.tech.join(', '),
                              demoUrl: proj.demoUrl || '', sourceUrl: proj.sourceUrl || ''
                            });
                            setShowProjectModal(true);
                          }} className="p-1.5 bg-white text-gray-600 rounded shadow-sm hover:text-primary"><Edit2 size={14}/></button>
                          <button onClick={() => deleteProject(proj.id)} className="p-1.5 bg-white text-red-500 rounded shadow-sm hover:bg-red-50"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{proj.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {proj.tech.map((t, i) => <span key={i} className="px-2 py-1 bg-white border border-gray-200 text-xs text-gray-600 rounded font-medium">{t}</span>)}
                      </div>
                      <div className="flex gap-4 text-sm font-medium pt-3 border-t border-gray-200">
                        {proj.sourceUrl && <a href={proj.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gray-600 hover:text-primary"><Github size={14}/> Code</a>}
                        {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gray-600 hover:text-primary"><LinkIcon size={14}/> Live</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESUME TAB */}
          {activeTab === 'resume' && (
            <div className="tab-pane bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Resume Management</h2>
              
              <div className="max-w-3xl mx-auto py-6">
                {resumeDetails ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-gray-200 rounded-xl gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto overflow-hidden">
                      <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                        <FileText size={28}/>
                      </div>
                      <div className="flex-1 min-w-0 w-full overflow-hidden">
                        <h3 className="font-bold text-gray-900 truncate" title={resumeDetails.fileName || 'resume.pdf'}>
                          {resumeDetails.fileName || 'resume.pdf'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Type: {resumeDetails.fileType?.includes('pdf') ? 'PDF' : (resumeDetails.fileType?.includes('word') ? 'DOCX' : 'Unknown')} • Uploaded: {new Date(resumeDetails.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                      <Button variant="outline" className="flex-1 sm:flex-none justify-center whitespace-nowrap" onClick={handleResumeView}>
                        <LinkIcon size={16}/> View
                      </Button>
                      <Button variant="outline" className="flex-1 sm:flex-none justify-center whitespace-nowrap" onClick={handleResumeDownload}>
                        <Download size={16}/> Download
                      </Button>
                      <div className="flex-1 sm:flex-none w-full sm:w-auto">
                        <input type="file" id="resume-replace" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeUpload(e, true)} />
                        <label htmlFor="resume-replace" className="btn btn-primary cursor-pointer border border-transparent w-full justify-center text-center whitespace-nowrap m-0">Replace</label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm mx-auto mb-4"><FileText size={32}/></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Resume Uploaded</h3>
                    <p className="mb-6 max-w-md mx-auto">Upload your latest resume in PDF or Word format to share with recruiters when applying to jobs.</p>
                    <div>
                      <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeUpload(e, false)} />
                      <label htmlFor="resume-upload" className="btn btn-primary cursor-pointer border border-transparent inline-flex items-center gap-2 m-0"><Plus size={16}/> Upload Resume</label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title={editingSkill ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={handleAddSkill}>
          <Input label="Skill Name" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. React, Java" required />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setShowSkillModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title={editingProject ? "Edit Project" : "Add Project"}>
        <form onSubmit={handleProjectSubmit}>
          <Input label="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
            <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" rows="3" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} required></textarea>
          </div>
          <Input label="Technologies Used (comma separated)" value={projectForm.tech} onChange={e => setProjectForm({...projectForm, tech: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="GitHub/Source URL" type="url" value={projectForm.sourceUrl} onChange={e => setProjectForm({...projectForm, sourceUrl: e.target.value})} />
            <Input label="Live Demo URL" type="url" value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setShowProjectModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
}
