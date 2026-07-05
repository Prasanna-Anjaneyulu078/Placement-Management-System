import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataProvider } from './context/DataContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import PendingVerification from './pages/PendingVerification';
import RejectedVerification from './pages/RejectedVerification';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobs from './pages/student/StudentJobs';
import StudentApplications from './pages/student/StudentApplications';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniStudentApplications from './pages/alumni/AlumniStudentApplications';
import AlumniPostJob from './pages/alumni/AlumniPostJob';
import AlumniMyJobs from './pages/alumni/AlumniMyJobs';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminJobs from './pages/admin/AdminJobs';
import AdminShortlisted from './pages/admin/AdminShortlisted';
import AdminAlumni from './pages/admin/AdminAlumni';
import AdminProfile from './pages/admin/AdminProfile';
import StudentManagement from './pages/admin/UserManagement/StudentManagement';
import AdminManagement from './pages/admin/UserManagement/AdminManagement';
import ChangePassword from './pages/ChangePassword';

/**
 * TokenGuard - Checks JWT expiry on every app load.
 * If token is expired, clears localStorage and redirects to /login.
 */
function TokenGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token is expired — clear everything and go to login
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('profileImage');
          navigate('/login', { replace: true });
        }
      } catch {
        // Malformed token — clear and redirect
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  return children;
}

export default function App() {
  return (
    <DataProvider>
      <Router>
        <TokenGuard>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/pending-verification" element={<PendingVerification />} />
            <Route path="/rejected-verification" element={<RejectedVerification />} />

            {/* Student Routes — requires STUDENT role */}
            <Route path="/student/dashboard" element={<PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/profile"   element={<PrivateRoute role="STUDENT"><StudentProfile /></PrivateRoute>} />
            <Route path="/student/jobs"      element={<PrivateRoute role="STUDENT"><StudentJobs /></PrivateRoute>} />
            <Route path="/student/applications" element={<PrivateRoute role="STUDENT"><StudentApplications /></PrivateRoute>} />

            {/* Alumni Routes — requires ALUMNI role */}
            <Route path="/alumni/dashboard" element={<PrivateRoute role="ALUMNI"><AlumniDashboard /></PrivateRoute>} />
            <Route path="/alumni/applications" element={<PrivateRoute role="ALUMNI"><AlumniStudentApplications /></PrivateRoute>} />
            <Route path="/alumni/post-job"  element={<PrivateRoute role="ALUMNI"><AlumniPostJob /></PrivateRoute>} />
            <Route path="/alumni/my-jobs"   element={<PrivateRoute role="ALUMNI"><AlumniMyJobs /></PrivateRoute>} />
            <Route path="/alumni/profile"   element={<PrivateRoute role="ALUMNI"><AlumniProfile /></PrivateRoute>} />

            {/* Admin Routes — requires ADMIN role */}
            <Route path="/admin/dashboard"     element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/verifications" element={<PrivateRoute role="ADMIN"><AdminVerifications /></PrivateRoute>} />
            <Route path="/admin/jobs"          element={<PrivateRoute role="ADMIN"><AdminJobs /></PrivateRoute>} />
            <Route path="/admin/shortlisted"   element={<PrivateRoute role="ADMIN"><AdminShortlisted /></PrivateRoute>} />
            <Route path="/admin/alumni"        element={<PrivateRoute role="ADMIN"><AdminAlumni /></PrivateRoute>} />
            <Route path="/admin/profile"       element={<PrivateRoute role="ADMIN"><AdminProfile /></PrivateRoute>} />
            <Route path="/admin/users/students" element={<PrivateRoute role="ADMIN"><StudentManagement /></PrivateRoute>} />
            <Route path="/admin/users/admins"   element={<PrivateRoute role="SUPER_ADMIN"><AdminManagement /></PrivateRoute>} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TokenGuard>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </DataProvider>
  );
}
