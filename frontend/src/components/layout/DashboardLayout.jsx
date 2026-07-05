import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User, 
  Settings, 
  Users,
  Calendar,
  CheckSquare
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../../utils/axiosConfig';
import './DashboardLayout.css';

export default function DashboardLayout({ children, role = 'student' }) {
  const { logout, userName, userEmail } = useAuth();
  const { profileImage, updateProfileImage } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userDesignation, setUserDesignation] = useState('');

  React.useEffect(() => {
    if (role === 'student') {
      api.get('/student/profile')
        .then(res => {
          if (res.data?.profileImageUrl) {
            updateProfileImage(res.data.profileImageUrl);
          }
        })
        .catch(err => console.error(err));
    } else if (role === 'admin') {
      api.get('/admin/profile')
        .then(res => {
          if (res.data?.profileImageUrl) {
            updateProfileImage(res.data.profileImageUrl);
          }
          if (res.data?.designation) {
            setUserDesignation(res.data.designation);
          }
        })
        .catch(err => console.error(err));
    } else if (role === 'alumni') {
      api.get('/alumni/profile')
        .then(res => {
          if (res.data?.profileImageUrl) {
            updateProfileImage(res.data.profileImageUrl);
          }
        })
        .catch(err => console.error(err));
    }
    
    const handleProfileUpdate = (e) => {
      updateProfileImage(e.detail);
    };
    
    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleProfileUpdate);
  }, [role, updateProfileImage]);

  const handleLogout = () => {
    logout();
  };

  const getNavItems = () => {
    switch(role) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: Briefcase, label: 'Job Listings', path: '/student/jobs' },
          { icon: FileText, label: 'Applications', path: '/student/applications' },
          { icon: User, label: 'Profile', path: '/student/profile' },
        ];
      case 'alumni':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/alumni/dashboard' },
          { icon: Briefcase, label: 'Post Job', path: '/alumni/post-job' },
          { icon: Briefcase, label: 'My Jobs', path: '/alumni/my-jobs' },
          { icon: FileText, label: 'Applications', path: '/alumni/applications' },
          { icon: User, label: 'Profile', path: '/alumni/profile' },
        ];
      case 'admin':
      case 'SUPER_ADMIN':
        const adminItems = [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Users, label: 'Alumni', path: '/admin/alumni' },
          { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
          { icon: CheckSquare, label: 'Shortlisted', path: '/admin/shortlisted' },
          { icon: User, label: 'Manage Students', path: '/admin/users/students' }
        ];
        
        if (role === 'SUPER_ADMIN') {
          adminItems.push({ icon: Settings, label: 'Manage Admins', path: '/admin/users/admins' });
        }
        
        adminItems.push({ icon: User, label: 'Profile', path: '/admin/profile' });
        return adminItems;
      default:
        return [];
    }
  };

  const getUserInfo = () => {
    const displayName = userName || 'User';
    const roleLabel = role === 'student' ? 'Student Portal'
      : role === 'alumni' ? 'Alumni Portal'
      : (userDesignation || 'Administrator');
      
    let formattedImg = profileImage;
    if (formattedImg && !formattedImg.includes('http') && role === 'alumni') {
      formattedImg = `http://localhost:8082/api/public/alumni/profile-image/${formattedImg}`;
    }

    return { name: displayName, role: roleLabel, img: formattedImg, designation: userDesignation };
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navItems={getNavItems()} 
        user={getUserInfo()} 
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Header role={role} onToggleSidebar={() => setIsSidebarOpen(true)} user={getUserInfo()} onLogout={handleLogout} />
        <main className="page-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
