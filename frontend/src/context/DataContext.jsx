import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Mock Data
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // If logged in, we can fetch authenticated data
          const jobsRes = await api.get('/jobs/approved').catch(() => ({ data: [] }));
          setJobs(jobsRes.data || []);
          
          const role = localStorage.getItem('role');
          if (role === 'STUDENT') {
            const appsRes = await api.get('/applications/my').catch(() => ({ data: [] }));
            setApplications(appsRes.data || []);
          }
          // Admins and alumni will fetch applications in their specific components
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const updateProfileImage = (url) => {
    setProfileImage(url || '');
    if (url) {
      localStorage.setItem('profileImage', url);
    } else {
      localStorage.removeItem('profileImage');
    }
  };

  // Actions
  const addNotification = (notif) => {
    const newNotif = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      read: false,
      ...notif
    };
    setNotifications([newNotif, ...notifications]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addJob = (job) => {
    const newJob = {
      ...job,
      id: jobs.length + 1,
      posted: new Date().toISOString().split('T')[0],
      status: 'Pending', // Requires admin approval
      applicants: 0,
      views: 0,
      logo: 'https://via.placeholder.com/50' // Default logo
    };
    setJobs([newJob, ...jobs]);
  };

  const updateJobStatus = (id, status) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
  };

  const updateJob = (id, updatedJob) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, ...updatedJob } : j));
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const updateApplicationStatus = (id, status) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    setApplications(applications.map(a => a.id === id ? { ...a, status } : a));
    
    addNotification({
      userId: 'student',
      title: 'Application Update',
      message: `Your application for ${app.role} at ${app.company} has been updated to: ${status}`,
      type: 'status'
    });
  };

  const applyToJob = (job) => {
    const exists = applications.find(app => app.jobId === job.id);
    if (exists) return;
    
    const newApp = {
      id: applications.length + 1,
      jobId: job.id,
      company: job.company,
      role: job.title,
      date: new Date().toISOString().split('T')[0],
      status: 'Applied'
    };
    setApplications([newApp, ...applications]);
    
    addNotification({
      userId: 'student',
      title: 'Application Successful',
      message: `You have successfully applied for the ${job.title} position at ${job.company}.`,
      type: 'success'
    });
    
    // Increment applicant count
    setJobs(jobs.map(j => j.id === job.id ? { ...j, applicants: j.applicants + 1 } : j));
  };

  const verifyUser = (id, status) => {
    setUsers(users.map(u => u.id === id ? { ...u, status } : u));
  };

  return (
    <DataContext.Provider value={{
      jobs,
      applications,
      users,
      notifications,
      profileImage,
      isLoading,
      addJob,
      updateJobStatus,
      updateJob,
      deleteJob,
      updateApplicationStatus,
      applyToJob,
      verifyUser,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications,
      updateProfileImage
    }}>
      {children}
    </DataContext.Provider>
  );
};
