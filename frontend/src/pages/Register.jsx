import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Briefcase, Building, ArrowRight, Eye, EyeOff,
  Phone, Linkedin, CreditCard, GraduationCap, UploadCloud,
  AlertCircle, CheckCircle, Loader2, ScanSearch, FileText, Clock, X
} from 'lucide-react';
import api from '../utils/axiosConfig';
import useDepartments from '../hooks/useDepartments';

/* ─────────────────────────────────────────────
   Success Modal Component
───────────────────────────────────────────── */
function SuccessModal({ onClose, onGoToLogin }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,30,60,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0A4D8C] via-[#1a6fbe] to-orange-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-8 pb-7 text-center">
          {/* Animated check circle */}
          <div className="mx-auto mb-5 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
              style={{ animation: 'pulse-once 0.6s ease 0.2s both' }}
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
            Registration Submitted<br />
            <span className="text-[#0A4D8C]">Successfully!</span>
          </h2>

          {/* Message */}
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            Your alumni registration has been submitted successfully.
            Your account is currently <strong className="text-gray-700">pending verification</strong> and
            approval by the Placement Cell Administration.
            <br /><br />
            You will be able to access the Alumni Dashboard after your account has been reviewed and approved.
            Please check your email regularly for status updates.
          </p>

          {/* Status Badge */}
          <div className="mx-auto mb-6 inline-flex flex-col items-center gap-1 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Registration Status</span>
            </div>
            <span className="text-sm font-bold text-amber-700 mt-0.5">⏳ Pending Admin Approval</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGoToLogin}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg,#0A4D8C,#1565c0)' }}
            >
              Back to Login
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              OK
            </button>
          </div>

          {/* VVIT branding */}
          <p className="mt-5 text-xs text-gray-400">
            VVIT Placement Portal · Alumni Verification System
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-once {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Register Component
───────────────────────────────────────────── */
export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { departments } = useDepartments();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    rollNumber: '', department: '', degree: '',
    gradYear: '', mobile: '', gender: '',
    company: '', jobTitle: '', linkedin: '',
    document: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (file && file.type !== 'application/pdf') {
        setError('Invalid File Format — Only PDF documents are allowed for alumni verification. Please upload a valid PDF file.');
        setFormData(prev => ({ ...prev, document: null }));
        e.target.value = '';
        return;
      }
      setError('');
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // ── Frontend Validations ──
    if (!formData.document) {
      setError('Verification document is required.');
      return;
    }
    if (formData.document.type !== 'application/pdf') {
      setError('Invalid File Format — Only PDF documents are allowed for alumni verification.');
      return;
    }
    if (formData.document.size > 10 * 1024 * 1024) {
      setError('Document size exceeds the maximum allowed limit of 10 MB.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      setLoadingStage('uploading');
      const submitData = new FormData();
      submitData.append('name', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('company', formData.company);
      submitData.append('designation', formData.jobTitle);
      submitData.append('passingYear', formData.gradYear);
      submitData.append('rollNumber', formData.rollNumber);
      submitData.append('department', formData.department);
      submitData.append('degree', formData.degree);
      submitData.append('mobileNumber', formData.mobile);
      submitData.append('gender', formData.gender);
      submitData.append('linkedinUrl', formData.linkedin);
      submitData.append('document', formData.document);

      setLoadingStage('verifying');
      await api.post('/auth/register/alumni', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: () => setLoadingStage('verifying'),
      });

      setLoadingStage('creating');
      await new Promise(r => setTimeout(r, 500));
      setShowSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Registration failed. Please verify your details and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const degrees    = ['B.Tech', 'M.Tech', 'MCA', 'MBA'];
  const genders    = ['Male', 'Female', 'Other'];
  const gradYears  = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
      {/* ── Success Modal ── */}
      {showSuccess && (
        <SuccessModal
          onClose={() => { setShowSuccess(false); navigate('/login'); }}
          onGoToLogin={() => navigate('/login')}
        />
      )}

      <div className="min-h-screen flex font-sans bg-gray-50">
        {/* ── Left Branding Column ── */}
        <div className="hidden lg:flex lg:w-5/12 relative bg-blue-900 overflow-hidden sticky top-0 h-screen">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
              alt="University Alumni"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/90 to-transparent" />
          </div>
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000" />

          <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
            <div>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white p-1 shadow-lg">
                  <img src="https://res.cloudinary.com/dwxqqx0oe/image/upload/v1772097342/VVITU-logo_ejvk7p.jpg" className="w-full h-full object-contain" alt="VVIT Logo" />
                </div>
                <span className="font-bold text-2xl text-white tracking-wide">VVIT Alumni</span>
              </div>
            </div>

            <div className="mb-20">
              <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                Join the <br /><span className="text-orange-500">Global Network.</span>
              </h1>
              <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                Reconnect with your alma mater, mentor students, and unlock exclusive alumni privileges.
              </p>
              <div className="mt-12 flex gap-6 flex-col">
                {[
                  { icon: <User className="text-orange-400 w-6 h-6" />, title: 'Build Your Profile', sub: 'Showcase your achievements and expertise' },
                  { icon: <Briefcase className="text-orange-400 w-6 h-6" />, title: 'Post Opportunities', sub: 'Hire top talent from your university' },
                ].map(f => (
                  <div key={f.title} className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm shrink-0">{f.icon}</div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{f.title}</h3>
                      <p className="text-blue-200 text-sm">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form Column ── */}
        <div className="w-full lg:w-7/12 flex flex-col px-6 py-12 sm:px-16 md:px-20 xl:px-28 relative overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto">

            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
                  <img src="https://res.cloudinary.com/dwxqqx0oe/image/upload/v1772097342/VVITU-logo_ejvk7p.jpg" className="w-full h-full object-contain" alt="VVIT Logo" />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">VVIT Alumni</span>
              </div>
              <button onClick={() => navigate('/login')} className="text-sm font-bold text-orange-500">Log In</button>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
              <p className="text-gray-500 mt-2">Fill in the details below to join the alumni network.</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 shadow-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-10">

              {/* ── Personal Information ── */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <User className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="fullName" type="text" required placeholder="John Doe" value={formData.fullName} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Personal Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <Mail className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="email" type="email" required placeholder="john.doe@example.com" value={formData.email} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                  {/* Roll Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Roll Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <CreditCard className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="rollNumber" type="text" required placeholder="19BQ1A0501" value={formData.rollNumber} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <Phone className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="mobile" type="tel" required placeholder="+91 9876543210" value={formData.mobile} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                  {/* Degree */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Degree</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <GraduationCap className="h-5 w-5 transition-colors" />
                      </div>
                      <select name="degree" required value={formData.degree} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                        <option value="">Select Degree</option>
                        {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <GraduationCap className="h-5 w-5 transition-colors" />
                      </div>
                      <select name="department" required value={formData.department} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Select Department</option>
                        {departments.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <User className="h-5 w-5 transition-colors" />
                      </div>
                      <select name="gender" value={formData.gender} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                        <option value="">Select Gender</option>
                        {genders.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Graduation Year */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Graduation Year</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <GraduationCap className="h-5 w-5 transition-colors" />
                      </div>
                      <select name="gradYear" required value={formData.gradYear} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                        <option value="">Select Year</option>
                        {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Professional Information ── */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-500" /> Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Company</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <Building className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="company" type="text" required placeholder="Tech Corp Inc." value={formData.company} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Job Title</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <Briefcase className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="jobTitle" type="text" required placeholder="Senior Software Engineer" value={formData.jobTitle} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn Profile URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <Linkedin className="h-5 w-5 transition-colors" />
                      </div>
                      <input name="linkedin" type="url" placeholder="https://linkedin.com/in/johndoe" value={formData.linkedin} onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Verification & Security ── */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" /> Verification &amp; Security
                </h3>
                <div className="grid grid-cols-1 gap-5">

                  {/* Document Upload – PDF only */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Verification Document <span className="text-red-500">*</span>
                    </label>

                    {/* Guidance hint */}
                    <div className="flex items-start gap-2 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 leading-relaxed">
                        <span className="font-semibold">Accepted Format: PDF Only</span> · Maximum Size: 10 MB<br />
                        Upload your College ID Card, Degree Certificate, Provisional Certificate,
                        Hall Ticket, or Consolidated Marks Memo.
                      </div>
                    </div>

                    <label
                      className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all group
                        ${formData.document
                          ? 'border-green-400 bg-green-50 py-4'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-orange-400/60 py-8'
                        }`}
                    >
                      {formData.document ? (
                        <div className="flex items-center gap-3 px-4">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{formData.document.name}</p>
                            <p className="text-xs text-gray-500">{(formData.document.size / 1024).toFixed(1)} KB · PDF Document</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 ml-auto" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center px-4">
                          <UploadCloud className="w-10 h-10 text-gray-300 group-hover:text-orange-400 mb-2 transition-colors" />
                          <p className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">Click to upload PDF document</p>
                          <p className="text-xs text-gray-400 mt-1">PDF only · Max 10 MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        name="document"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Create Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                        <Lock className="h-5 w-5 transition-colors" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all"
                      />
                      <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── OCR Progress Overlay ── */}
              {isLoading && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      {loadingStage === 'creating'
                        ? <CheckCircle className="w-9 h-9 text-green-500" />
                        : <ScanSearch className="w-9 h-9 text-orange-500 animate-pulse" />
                      }
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {loadingStage === 'uploading' && 'Uploading Document…'}
                      {loadingStage === 'verifying' && 'Verifying Document…'}
                      {loadingStage === 'creating'  && 'Account Created!'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">
                      {loadingStage === 'uploading' && 'Securely uploading your PDF document.'}
                      {loadingStage === 'verifying' && 'Our system is reading your document to verify your Name, Roll Number, and VVIT affiliation. Please wait.'}
                      {loadingStage === 'creating'  && 'Finalising your registration…'}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${loadingStage !== '' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle className="w-3 h-3" /> Upload
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${loadingStage === 'verifying' || loadingStage === 'creating' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                        <ScanSearch className="w-3 h-3" /> OCR Verify
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${loadingStage === 'creating' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all duration-200 mt-8 btn btn-primary
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
              >
                {isLoading
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing…</>
                  : <>Create Alumni Account <ArrowRight className="w-5 h-5 ml-2" /></>
                }
              </button>
            </form>

            <div className="mt-8 text-center hidden lg:block">
              <p className="text-sm text-gray-600">
                Already a member?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-bold text-blue-800 hover:text-blue-900 transition-colors underline decoration-2 underline-offset-4"
                >
                  Sign in to your account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
