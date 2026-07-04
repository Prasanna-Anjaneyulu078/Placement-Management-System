import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, Mail, Phone, MapPin, Linkedin, Github, 
  Edit2, Download, X, Briefcase, Building, Plus, Trash2
} from 'lucide-react';
import { Modal, Input, Button } from '../../components/common';
import './AlumniProfile.css';

export default function AlumniProfile() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);

  const [editingWork, setEditingWork] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);

  // Data State
  const [basicInfo, setBasicInfo] = useState({
    name: 'Alex Johnson',
    role: 'Senior Product Designer @ Google',
    email: 'alex.j@google.com',
    phone: '+1 555 0123',
    location: 'Mountain View, CA',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson'
  });

  const [aboutMe, setAboutMe] = useState(`Senior Product Designer with over 8 years of experience in creating user-centric digital products. 
Alumni of the 2016 Computer Science batch. Currently working at Google, focusing on scalable design systems and mobile experiences. 
Always happy to mentor students and share industry insights.`);

  const [workExperience, setWorkExperience] = useState([
    {
      id: 1,
      title: 'Senior Product Designer',
      company: 'Google',
      year: '2020 - Present • Full-time'
    },
    {
      id: 2,
      title: 'Product Designer',
      company: 'Airbnb',
      year: '2017 - 2020 • 3 years'
    }
  ]);

  const [education, setEducation] = useState([
    {
      id: 1,
      degree: 'B.Tech in Computer Science',
      school: 'University of Technology',
      year: 'Batch of 2016'
    }
  ]);

  // Form States
  const [aboutForm, setAboutForm] = useState('');
  const [basicForm, setBasicForm] = useState({ ...basicInfo });
  const [workForm, setWorkForm] = useState({ title: '', company: '', year: '' });
  const [eduForm, setEduForm] = useState({ degree: '', school: '', year: '' });

  // Handlers
  const handleUpdateAbout = (e) => {
    e.preventDefault();
    setAboutMe(aboutForm);
    setShowAboutModal(false);
  };

  const handleUpdateBasic = (e) => {
    e.preventDefault();
    setBasicInfo(basicForm);
    setShowBasicModal(false);
  };

  const handleWorkSubmit = (e) => {
    e.preventDefault();
    if (editingWork) {
      setWorkExperience(workExperience.map(w => w.id === editingWork.id ? { ...workForm, id: w.id } : w));
    } else {
      setWorkExperience([...workExperience, { ...workForm, id: Date.now() }]);
    }
    closeWorkModal();
  };

  const handleEduSubmit = (e) => {
    e.preventDefault();
    if (editingEdu) {
      setEducation(education.map(edu => edu.id === editingEdu.id ? { ...eduForm, id: edu.id } : edu));
    } else {
      setEducation([...education, { ...eduForm, id: Date.now() }]);
    }
    closeEduModal();
  };

  const openEditWork = (work) => {
    setEditingWork(work);
    setWorkForm({ title: work.title, company: work.company, year: work.year });
    setShowWorkModal(true);
  };

  const deleteWork = (id) => {
    if (window.confirm('Delete this work experience?')) {
      setWorkExperience(workExperience.filter(w => w.id !== id));
    }
  };

  const openEditEdu = (edu) => {
    setEditingEdu(edu);
    setEduForm({ degree: edu.degree, school: edu.school, year: edu.year });
    setShowEduModal(true);
  };

  const deleteEdu = (id) => {
    if (window.confirm('Delete this education entry?')) {
      setEducation(education.filter(edu => edu.id !== id));
    }
  };

  const closeWorkModal = () => {
    setShowWorkModal(false);
    setEditingWork(null);
    setWorkForm({ title: '', company: '', year: '' });
  };

  const closeEduModal = () => {
    setShowEduModal(false);
    setEditingEdu(null);
    setEduForm({ degree: '', school: '', year: '' });
  };

  return (
    <DashboardLayout role="alumni">
      <div className="profile-header-bg"></div>
      
      <div className="profile-content-wrapper">
        <div className="profile-sidebar">
          <div className="profile-sidebar-info">
            <div className="profile-avatar-container">
              <div className="profile-avatar-xl alumni-profile-avatar"></div>
              <button 
                className="edit-avatar-btn" 
                onClick={() => {
                  setBasicForm({ ...basicInfo });
                  setShowBasicModal(true);
                }}
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <h2 className="sidebar-name">{basicInfo.name}</h2>
            <p className="sidebar-role">{basicInfo.role}</p>
            
            <div className="sidebar-contact">
              <div className="contact-item">
                <Mail size={16} />
                <span>{basicInfo.email}</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>{basicInfo.phone}</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>{basicInfo.location}</span>
              </div>
            </div>

            <div className="sidebar-social">
              <a href={basicInfo.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn"><Linkedin size={20} /></a>
              <a href={basicInfo.github} target="_blank" rel="noopener noreferrer" className="social-btn"><Github size={20} /></a>
              <a href="#" className="social-btn"><User size={20} /></a>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">Professional Bio</h3>
              <button 
                className="edit-btn" 
                onClick={() => {
                  setAboutForm(aboutMe);
                  setShowAboutModal(true);
                }}
              >
                <Edit2 size={14} />
                <span>Edit Bio</span>
              </button>
            </div>
            <p className="section-text">
              {aboutMe}
            </p>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">Work Experience</h3>
              <button className="edit-btn" onClick={() => setShowWorkModal(true)}>
                <Plus size={14} />
                <span>Add Experience</span>
              </button>
            </div>
            <div className="education-list">
              {workExperience.map(work => (
                <div key={work.id} className="education-item">
                  <div className="edu-icon"><Building size={20} /></div>
                  <div className="edu-details">
                    <h4 className="edu-degree">{work.title}</h4>
                    <p className="edu-school">{work.company}</p>
                    <p className="edu-year">{work.year}</p>
                  </div>
                  <div className="work-item-actions">
                    <button className="action-icon" onClick={() => openEditWork(work)}><Edit2 size={14} /></button>
                    <button className="action-icon delete" onClick={() => deleteWork(work.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">Education</h3>
            </div>
            <div className="education-list">
              {education.map(edu => (
                <div key={edu.id} className="education-item">
                  <div className="edu-icon"><Briefcase size={20} /></div>
                  <div className="edu-details">
                    <h4 className="edu-degree">{edu.degree}</h4>
                    <p className="edu-school">{edu.school}</p>
                    <p className="edu-year">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info Modal */}
      <Modal
        isOpen={showBasicModal}
        onClose={() => setShowBasicModal(false)}
        title="Edit Basic Information"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowBasicModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateBasic}>Save Changes</Button>
          </>
        }
      >
        <div className="form-group">
          <Input 
            label="Full Name"
            value={basicForm.name}
            onChange={e => setBasicForm({...basicForm, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            label="Role & Company"
            value={basicForm.role}
            onChange={e => setBasicForm({...basicForm, role: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            type="email"
            label="Email"
            value={basicForm.email}
            onChange={e => setBasicForm({...basicForm, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            label="Phone"
            value={basicForm.phone}
            onChange={e => setBasicForm({...basicForm, phone: e.target.value})}
          />
        </div>
        <div className="form-group">
          <Input 
            label="Location"
            value={basicForm.location}
            onChange={e => setBasicForm({...basicForm, location: e.target.value})}
          />
        </div>
        <div className="form-group">
          <Input 
            type="url"
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/..."
            value={basicForm.linkedin}
            onChange={e => setBasicForm({...basicForm, linkedin: e.target.value})}
          />
        </div>
        <div className="form-group">
          <Input 
            type="url"
            label="GitHub URL"
            placeholder="https://github.com/..."
            value={basicForm.github}
            onChange={e => setBasicForm({...basicForm, github: e.target.value})}
          />
        </div>
      </Modal>

      {/* About Me Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="Edit Bio"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAboutModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateAbout}>Save Changes</Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea 
            className="form-input" 
            rows={6} 
            placeholder="Tell us about your professional journey..."
            value={aboutForm}
            onChange={e => setAboutForm(e.target.value)}
            required
          ></textarea>
        </div>
      </Modal>

      {/* Work Modal */}
      <Modal
        isOpen={showWorkModal}
        onClose={closeWorkModal}
        title={editingWork ? 'Edit Work Experience' : 'Add Work Experience'}
        footer={
          <>
            <Button variant="outline" onClick={closeWorkModal}>Cancel</Button>
            <Button onClick={handleWorkSubmit}>{editingWork ? 'Save Changes' : 'Add Experience'}</Button>
          </>
        }
      >
        <div className="form-group">
          <Input 
            label="Job Title"
            value={workForm.title}
            onChange={e => setWorkForm({...workForm, title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            label="Company"
            value={workForm.company}
            onChange={e => setWorkForm({...workForm, company: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            label="Duration/Year"
            value={workForm.year}
            onChange={e => setWorkForm({...workForm, year: e.target.value})}
            required
          />
        </div>
      </Modal>

      {/* Education Modal */}
      <Modal
        isOpen={showEduModal}
        onClose={closeEduModal}
        title={editingEdu ? 'Edit Education' : 'Add Education'}
        footer={
          <>
            <Button variant="outline" onClick={closeEduModal}>Cancel</Button>
            <Button onClick={handleEduSubmit}>{editingEdu ? 'Save Changes' : 'Add Education'}</Button>
          </>
        }
      >
        <div className="form-group">
          <Input 
            label="Degree"
            value={eduForm.degree}
            onChange={e => setEduForm({...eduForm, degree: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            label="School"
            value={eduForm.school}
            onChange={e => setEduForm({...eduForm, school: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <Input 
            label="Year/Batch"
            value={eduForm.year}
            onChange={e => setEduForm({...eduForm, year: e.target.value})}
            required
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
