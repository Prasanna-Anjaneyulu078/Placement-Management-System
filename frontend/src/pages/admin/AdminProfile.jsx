import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Camera, Edit2, Shield, Lock, MapPin, Mail, Phone, Briefcase, User, Calendar, CheckCircle, Upload } from 'lucide-react';
import { Button, Input, LoadingSpinner, Avatar } from '../../components/common';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import '../student/StudentProfile.css';
import useDepartments from '../../hooks/useDepartments';

export default function AdminProfile() {
  const { departments } = useDepartments();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  
  const [personalForm, setPersonalForm] = useState({});
  const [professionalForm, setProfessionalForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/profile');
      setProfile(res.data);
      setPersonalForm({
        name: res.data.name || '',
        email: res.data.email || '',
        mobileNumber: res.data.mobileNumber || ''
      });
      setProfessionalForm({
        department: res.data.department || '',
        designation: res.data.designation || ''
      });
    } catch (err) {
      toast.error('Failed to load profile data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid image format. Supported: JPG, PNG, WEBP');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, profileImageUrl: res.data.imageUrl }));
      toast.success('Profile image uploaded successfully');
      
      // Dispatch an event to notify the Navbar to update its image
      window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: res.data.imageUrl }));
    } catch (err) {
      toast.error('Failed to upload image');
      console.error(err);
    }
  };

  const saveProfile = async (formType) => {
    try {
      setIsSaving(true);
      const emailChanged = profile?.email && personalForm.email !== profile.email;
      const updatedData = { ...profile, ...personalForm, ...professionalForm };
      const res = await api.put('/admin/profile', updatedData);
      setProfile(res.data);
      if (formType === 'personal' && emailChanged) {
        toast.success('Email updated successfully. Please log in again if your session expires.');
      } else {
        toast.success('Profile updated successfully');
      }
      setIsEditingPersonal(false);
      setIsEditingProfessional(false);
    } catch (err) {
      toast.error('Failed to save profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSaving(true);
      await api.put('/admin/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center items-center h-full min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const hasPersonalChanges = JSON.stringify(personalForm) !== JSON.stringify({
    name: profile?.name || '',
    email: profile?.email || '',
    mobileNumber: profile?.mobileNumber || ''
  });

  const hasProfessionalChanges = JSON.stringify(professionalForm) !== JSON.stringify({
    department: profile?.department || '',
    designation: profile?.designation || ''
  });

  return (
    <DashboardLayout role="admin">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-bg"></div>
          <div className="profile-header-content">
            <div className="profile-header-avatar-container" style={{position: 'relative'}}>
              <Avatar 
                size="xl" 
                src={profile?.profileImageUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'Admin'}&background=0A4D8C&color=fff`}
                alt={profile?.name || 'Admin'}
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
            
            <div className="profile-header-info flex-col lg:flex-row">
              <div className="flex-1">
                <h1 className="profile-name flex items-center gap-2">
                  {profile?.name || 'Administrator'}
                  <Shield size={24} fill="#F47C20" color="white" title="Admin" />
                </h1>
                <p className="profile-subtitle">{profile?.designation || 'System Administrator'} | {profile?.department || 'Placement Cell'}</p>
                
                <div className="profile-links">
                  {profile?.email && <span className="profile-link-item"><Mail size={14}/> {profile.email}</span>}
                  {profile?.mobileNumber && <span className="profile-link-item"><Phone size={14}/> {profile.mobileNumber}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-2">
          {/* SECTION 1: Personal Information */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
              {!isEditingPersonal && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)}>
                  <Edit2 size={14} className="mr-1" /> Edit
                </Button>
              )}
            </div>
            
            {isEditingPersonal ? (
              <form onSubmit={(e) => { e.preventDefault(); saveProfile('personal'); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={personalForm.name} onChange={e => setPersonalForm({...personalForm, name: e.target.value})} required />
                  <Input label="Email" type="email" value={personalForm.email} onChange={e => setPersonalForm({...personalForm, email: e.target.value})} required />
                  <Input label="Mobile Number" value={personalForm.mobileNumber} onChange={e => setPersonalForm({...personalForm, mobileNumber: e.target.value})} />
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsEditingPersonal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={!hasPersonalChanges || isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Full Name</span>
                  <p className="font-medium text-gray-800 mt-1">{profile?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Email</span>
                  <p className="font-medium text-gray-800 mt-1">{profile?.email || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Mobile Number</span>
                  <p className="font-medium text-gray-800 mt-1">{profile?.mobileNumber || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Professional Information */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Professional Information</h2>
              {!isEditingProfessional && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfessional(true)}>
                  <Edit2 size={14} className="mr-1" /> Edit
                </Button>
              )}
            </div>
            
            {isEditingProfessional ? (
              <form onSubmit={(e) => { e.preventDefault(); saveProfile('professional'); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input label="Department" value={professionalForm.department} onChange={e => setProfessionalForm({...professionalForm, department: e.target.value})} placeholder="e.g. Training & Placement Cell" />
                  </div>
                  <Input label="Designation" value={professionalForm.designation} onChange={e => setProfessionalForm({...professionalForm, designation: e.target.value})} />
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsEditingProfessional(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={!hasProfessionalChanges || isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Department</span>
                  <p className="font-medium text-gray-800 mt-1">{profile?.department || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Designation</span>
                  <p className="font-medium text-gray-800 mt-1">{profile?.designation || '-'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION 3: Account Information */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Shield size={18} /></div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Role</span>
                    <p className="font-medium text-gray-800">{profile?.role || 'ADMIN'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={18} /></div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Account Status</span>
                    <p className="font-medium text-gray-800">Verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><Calendar size={18} /></div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Created Date</span>
                    <p className="font-medium text-gray-800">{profile?.accountCreatedDate ? new Date(profile.accountCreatedDate).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Security Settings */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Security</h2>
              <form onSubmit={changePassword} className="space-y-4">
                <Input 
                  label="Current Password" 
                  type="password" 
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  placeholder="Minimum 8 characters"
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                />
                <div className="pt-2">
                  <Button type="submit" variant="primary" disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword} className="w-full">
                    {isSaving ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
