import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building, ArrowRight, Eye, EyeOff, Phone, Linkedin, FileText, CreditCard, GraduationCap, UploadCloud, AlertCircle } from 'lucide-react';
import api from '../utils/axiosConfig';
import useDepartments from '../hooks/useDepartments';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { departments } = useDepartments();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    rollNumber: '',
    department: '',
    degree: '',
    gradYear: '',
    mobile: '',
    gender: '',
    company: '',
    jobTitle: '',
    linkedin: '',
    document: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!formData.document) {
        setError("Verification document is required.");
        setIsLoading(false);
        return;
      }

      if (!formData.document) {
        alert("Verification document is required.");
        setIsLoading(false);
        return;
      }
      if (formData.document.size > 5 * 1024 * 1024) {
        alert("Document size exceeds the maximum limit of 5MB.");
        setIsLoading(false);
        return;
      }

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

      await api.post('/auth/register/alumni', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('Registered successfully! Please wait for admin approval.');
      navigate('/login');
    } catch(err) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Registration failed";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const degrees = [
    'B.Tech',
    'M.Tech',
    'MCA',
    'MBA'
  ];

  const genders = [
    'Male',
    'Female',
    'Other'
  ];

  const gradYears = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Left Column - Branding / Imagery */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-blue-900 overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
            alt="University Alumni" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/90 to-transparent"></div>
        </div>

        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white p-1 shadow-lg">
                <img 
                  src="https://res.cloudinary.com/dwxqqx0oe/image/upload/v1772097342/VVITU-logo_ejvk7p.jpg" 
                  className="w-full h-full object-contain" 
                  alt="VVIT University Logo" 
                />
              </div>
              <span className="font-bold text-2xl text-white tracking-wide">VVIT Alumni</span>
            </div>
          </div>
          
          <div className="mb-20">
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Join the <br />
              <span className="text-orange-500">Global Network.</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Reconnect with your alma mater, mentor students, and unlock exclusive alumni privileges.
            </p>
            
            <div className="mt-12 flex gap-6 flex-col">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm shrink-0">
                  <User className="text-orange-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Build Your Profile</h3>
                  <p className="text-blue-200 text-sm">Showcase your achievements and expertise</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm shrink-0">
                  <Briefcase className="text-orange-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Post Opportunities</h3>
                  <p className="text-blue-200 text-sm">Hire top talent from your university</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-7/12 flex flex-col px-6 py-12 sm:px-16 md:px-20 xl:px-28 relative overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
                <img 
                  src="https://res.cloudinary.com/dwxqqx0oe/image/upload/v1772097342/VVITU-logo_ejvk7p.jpg" 
                  className="w-full h-full object-contain" 
                  alt="VVIT University Logo" 
                />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">VVIT Alumni</span>
            </div>
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-orange-500">Log In</button>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-gray-500 mt-2">Fill in the details below to join the alumni network.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3 shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-10">
            
            {/* Personal Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <User className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="fullName" type="text" required placeholder="John Doe" value={formData.fullName} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Personal Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <Mail className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="email" type="email" required placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Roll Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <CreditCard className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="rollNumber" type="text" required placeholder="R12345678" value={formData.rollNumber} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <Phone className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="mobile" type="tel" required placeholder="+1 234 567 8900" value={formData.mobile} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Degree</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <GraduationCap className="h-5 w-5 transition-colors" />
                    </div>
                    <select name="degree" required value={formData.degree} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Select Degree</option>
                      {degrees.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <GraduationCap className="h-5 w-5 transition-colors" />
                    </div>
                    <select name="department" required value={formData.department} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Select Department</option>
                      {departments.map(dept => <option key={dept.code} value={dept.code}>{dept.name} ({dept.code})</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender (Optional)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <User className="h-5 w-5 transition-colors" />
                    </div>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Select Gender</option>
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Graduation Year</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <GraduationCap className="h-5 w-5 transition-colors" />
                    </div>
                    <select name="gradYear" required value={formData.gradYear} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Select Year</option>
                      {gradYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Company Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <Building className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="company" type="text" required placeholder="Tech Corp Inc." value={formData.company} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Job Title</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <Briefcase className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="jobTitle" type="text" required placeholder="Senior Software Engineer" value={formData.jobTitle} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn Profile URL</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <Linkedin className="h-5 w-5 transition-colors" />
                    </div>
                    <input name="linkedin" type="url" placeholder="https://linkedin.com/in/johndoe" value={formData.linkedin} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification & Security */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-500" />
                Verification & Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verification Document <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mb-2">Upload your College ID Card, Degree Certificate, or Provisional Certificate (PDF/JPG/PNG, Max 5MB). This is required for account approval.</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-orange-500/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" />
                      <p className="text-sm text-gray-500 font-medium px-4 text-center line-clamp-1">
                        {formData.document ? formData.document.name : "Click to upload your verification document"}
                      </p>
                    </div>
                    <input type="file" name="document" accept=".pdf,.jpg,.jpeg,.png" required className="hidden" onChange={handleChange} />
                  </label>
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Create Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
                      <Lock className="h-5 w-5 transition-colors" />
                    </div>
                    <input 
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters"
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

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all duration-200 mt-8 btn btn-primary
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isLoading ? 'Creating Account...' : 'Create Alumni Account'}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
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
  );
}
