import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import api from "../../../utils/axiosConfig";
import {
  Search, Plus, ShieldCheck, CheckCircle, X,
  Users, Download, Upload, AlertCircle, FileText,
  Check, Copy, Ban, KeyRound, Target, UploadCloud,
  ChevronLeft, ChevronRight, RefreshCw, Mail, Phone, Filter,
  Loader2, CheckCircle2, XCircle, SkipForward, FileSpreadsheet
} from "lucide-react";
import { toast } from "react-toastify";
import ExportDataModal from "./ExportDataModal";
import useDepartments from "../../../hooks/useDepartments";
import { DocumentViewerModal } from "../../../components/common";

const Avatar = ({ name, src, size = "md" }) => {
  const sz = size === "lg" ? "w-20 h-20 text-3xl rounded-2xl" : "w-10 h-10 text-sm rounded-full";
  const colors = ["from-blue-400 to-blue-600","from-violet-400 to-violet-600","from-emerald-400 to-emerald-600","from-orange-400 to-orange-500","from-pink-400 to-pink-600"];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return src
    ? <img src={src} alt={name} className={`${sz} object-cover border-2 border-white shadow flex-shrink-0`} />
    : <div className={`${sz} bg-gradient-to-br ${color} text-white flex items-center justify-center font-bold flex-shrink-0 shadow`}>{name?.charAt(0)?.toUpperCase()}</div>;
};

const Badge = ({ variant = "default", children }) => {
  const map = {
    verified:  "bg-emerald-500 text-white border-transparent shadow-sm",
    pending:   "bg-[#F47C20]  text-white  border-transparent shadow-sm",
    ready:     "bg-blue-50   text-blue-700   border-blue-200",
    needs:     "bg-red-50    text-red-600    border-red-200",
    resume:    "bg-purple-50 text-purple-700 border-purple-200",
    active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    suspended: "bg-red-50    text-red-600    border-red-200",
    default:   "bg-slate-50  text-slate-600  border-slate-200",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${map[variant]}`}>{children}</span>;
};

export default function StudentManagement() {
  const { departments } = useDepartments();
  const [students, setStudents]               = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCredsModal, setShowCredsModal]   = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm]           = useState("");
  const [filters, setFilters] = useState({ department:"", semester:"", verificationStatus:"", placementReady:"", hasResume:"" });
  const [credentials, setCredentials]         = useState(null);
  const [currentPage, setCurrentPage]         = useState(1);
  const itemsPerPage = 10;

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showResetModal, setShowResetModal]     = useState(false);
  const [showRemoveModal, setShowRemoveModal]   = useState(false);
  const [removeConfirmText, setRemoveConfirmText] = useState("");
  const [copied, setCopied] = useState(false);

  // Document Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerMetadata, setViewerMetadata] = useState(null);

  // Import state
  const [selectedFile, setSelectedFile]         = useState(null);
  const [importing, setImporting]               = useState(false);
  const [importProgress, setImportProgress]     = useState(0);
  const [importResult, setImportResult]         = useState(null); // { created, skipped, failed }
  const [importError, setImportError]           = useState(null);
  const [isDragging, setIsDragging]             = useState(false);
  const fileInputRef                            = useRef(null);
  
  // Add Student state
  const [formData, setFormData] = useState({ 
    name:"", 
    email:"", 
    mobileNumber:"", 
    rollNumber:"", 
    department:"", 
    semester:1, 
    academicYear:"" 
  });

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting]         = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // ── Admin Resume Handlers ─────────────────────────────────────────────────
  const handleAdminViewResume = async (student) => {
    try {
      const res = await api.get(`/admin/students/${student.id}/resume/view`, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${student.rollNumber || 'Student'}_Resume.pdf`;
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      
      setViewerUrl(url);
      setViewerMetadata({
        fileName: filename,
        studentName: student.user?.name || student.name || 'Unknown Student',
        rollNumber: student.rollNumber
      });
      setViewerOpen(true);
    } catch {
      toast.error('Failed to view resume.');
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

  const handleAdminDownloadResume = async (studentId, rollNumber) => {
    try {
      const res = await api.get(`/admin/students/${studentId}/resume/download`, { responseType: 'blob' });
      // Try to read standardized filename from Content-Disposition header
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${rollNumber || 'Student'}_Resume.pdf`;
      const url  = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download resume.');
    }
  };

  /** Validate if a URL string is a well-formed http/https URL */
  const isValidUrl = (url) => {
    if (!url || !url.trim()) return false;
    try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      if (filterParam === "verified") {
        setFilters(prev => ({ ...prev, verificationStatus: "VERIFIED" }));
      } else if (filterParam === "resumeUploaded") {
        setFilters(prev => ({ ...prev, hasResume: "true" }));
      } else if (filterParam === "placementReady") {
        setFilters(prev => ({ ...prev, placementReady: "READY" }));
      } else if (filterParam === "all") {
        setFilters({ department:"", semester:"", verificationStatus:"", placementReady:"", hasResume:"" });
      }
    }
  }, [location]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try { const r = await api.get("/admin/users/students"); setStudents(r.data); }
    catch { toast.error("Failed to fetch students"); }
    finally { setIsLoading(false); }
  };

  const filteredStudents = useMemo(() => students.filter(s => {
    const q = searchTerm.toLowerCase();
    if (q && !s.user.name.toLowerCase().includes(q) && !s.rollNumber.toLowerCase().includes(q)) return false;
    if (filters.department && s.department !== filters.department) return false;
    if (filters.semester && s.semester?.toString() !== filters.semester) return false;
    if (filters.verificationStatus && s.verificationStatus !== filters.verificationStatus) return false;
    if (filters.placementReady === "READY" && !s.placementReady) return false;
    if (filters.placementReady === "NEEDS_ATTENTION" && s.placementReady) return false;
    if (filters.hasResume === "true" && !s.hasResume) return false;
    if (filters.hasResume === "false" && s.hasResume) return false;
    return true;
  }), [students, searchTerm, filters]);

  const stats = useMemo(() => ({
    total:          students.length,
    verified:       students.filter(s => s.verificationStatus === "VERIFIED").length,
    resumeUploaded: students.filter(s => s.hasResume).length,
    placementReady: students.filter(s => s.placementReady).length,
  }), [students]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);
  useEffect(() => setCurrentPage(1), [searchTerm, filters]);

  const resetFilters = () => { 
    setSearchTerm(""); 
    setFilters({ department:"", semester:"", verificationStatus:"", placementReady:"", hasResume:"" });
    if (location.search) navigate(location.pathname);
  };

  const handleApprove = async () => {
    try { 
      const res = await api.patch(`/admin/users/students/${selectedStudent.id}/approve`); 
      if (res.data.success !== false) {
        toast.success(res.data.message || "Student approved successfully."); 
        setShowApproveModal(false);
        setSelectedStudent({ ...selectedStudent, verificationStatus: "VERIFIED" });
        fetchStudents(); 
      } else {
        toast.error(res.data.message || "Student is already approved");
        setShowApproveModal(false);
      }
    }
    catch (err) { toast.error(err.response?.data?.message || "Unable to approve student"); }
  };
  const handleToggleStatus = async (userId, status) => {
    const next = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try { await api.put(`/admin/users/students/${userId}/status?status=${next}`); toast.success(`Account ${next.toLowerCase()}`); fetchStudents(); }
    catch { toast.error("Failed to update status"); }
  };
  const handleResetPassword = async () => {
    try { 
      const r = await api.post(`/admin/users/students/${selectedStudent.id}/reset-password`); 
      setCredentials(r.data); 
      setShowResetModal(false);
      setShowCredsModal(true); 
      toast.success("Password reset successfully. Temporary password generated."); 
    }
    catch { toast.error("Failed to reset password"); }
  };
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/admin/users/students", formData);
      setCredentials(r.data); toast.success("Student added!");
      setShowAddModal(false); setShowCredsModal(true); fetchStudents();
      setFormData({ name:"", email:"", mobileNumber:"", rollNumber:"", department:"", semester:1, academicYear:"" });
    } catch { toast.error("Failed to add student"); }
  };

  const handleDeleteStudent = async () => {
    if (removeConfirmText !== "DELETE") return;
    try { 
      await api.delete(`/admin/users/students/${selectedStudent.id}`); 
      toast.success("Student account removed successfully."); 
      setShowRemoveModal(false);
      setRemoveConfirmText("");
      setSelectedStudent(null);
      fetchStudents(); 
    }
    catch (e) { toast.error("Failed to remove student account"); }
  };

  const handleExport = async (format, scope, fields) => {
    setIsExporting(true);
    let idsToExport = [];
    if (scope === 'all') {
      idsToExport = students.map(s => s.id);
    } else if (scope === 'filtered') {
      idsToExport = filteredStudents.map(s => s.id);
    } else if (scope === 'current_page') {
      idsToExport = paginatedStudents.map(s => s.id);
    } else if (scope === 'selected') {
      idsToExport = Array.from(selectedStudentIds);
    }

    try {
      const res = await api.post('/admin/users/students/export', {
        format,
        studentIds: idsToExport,
        fields
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'EXCEL' ? 'xlsx' : format === 'CSV' ? 'csv' : 'pdf';
      link.setAttribute('download', `Students_Export_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Export successful!");
      setShowExportModal(false);
    } catch (e) {
      toast.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(new Set(paginatedStudents.map(s => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ─── Bulk Import ──────────────────────────────────── */
  const VALID_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
  ];

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext))
      return `Unsupported format ".${ext}". Please upload .xlsx or .csv`;
    if (file.size === 0) return "The selected file is empty.";
    if (file.size > 10 * 1024 * 1024) return "File exceeds 10 MB limit.";
    return null;
  };

  const handleFileSelect = (file) => {
    setImportError(null);
    setImportResult(null);
    const err = validateFile(file);
    if (err) { setImportError(err); setSelectedFile(null); return; }
    setSelectedFile(file);
  };

  const handleImport = async () => {
    const err = validateFile(selectedFile);
    if (err) { setImportError(err); return; }

    setImporting(true);
    setImportProgress(0);
    setImportError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/admin/users/students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setImportProgress(Math.round((evt.loaded / evt.total) * 80));
        },
      });
      setImportProgress(100);
      setImportResult(response.data);  // { created, skipped, failed }
      toast.success(`Import complete! Created: ${response.data.created ?? 0}`);
      fetchStudents();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Server error during import.";
      setImportError(typeof msg === "string" ? msg : "Import failed. Check file and try again.");
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImporting(false);
    setImportProgress(0);
    setImportResult(null);
    setImportError(null);
  };

  const actionBtn = "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] font-semibold text-xs rounded-lg hover:bg-[#FFF4EB] active:scale-95 transition-all shadow-sm focus:outline-none whitespace-nowrap";
  const inputCls  = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-2 focus:ring-[#F47C20]/20 transition-all";

  const StatCard = ({ title, count, icon: Icon, palette, active, onClick }) => (
    <button onClick={onClick} className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md focus:outline-none flex items-center justify-between h-[76px] ${active ? `border-[#F47C20] ${palette.bg}` : "bg-white border-slate-200 hover:border-[#F47C20]/50"}`}>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className={`text-2xl font-extrabold tracking-tight ${palette.text}`}>{count}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${palette.icon}`}><Icon size={18} /></div>
      {active && <div className="absolute bottom-0 left-0 h-1 w-full bg-[#F47C20]" />}
    </button>
  );

  const hasFilters = searchTerm || filters.department || filters.semester || filters.verificationStatus || filters.placementReady || filters.hasResume;

  return (
    <DashboardLayout role="admin">

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-4 mb-6 w-full">
        <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] text-sm font-bold rounded-xl hover:bg-[#FFF4EB] transition-all shadow-sm flex-1 sm:flex-none min-w-[140px]">
          <Plus size={16}/> Add Student
        </button>
        <button onClick={() => setShowImportModal(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] text-sm font-bold rounded-xl hover:bg-[#FFF4EB] transition-all shadow-sm flex-1 sm:flex-none min-w-[140px]">
          <Upload size={16}/> Import
        </button>
        <button onClick={() => setShowExportModal(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] text-sm font-bold rounded-xl hover:bg-[#FFF4EB] transition-all shadow-sm flex-1 sm:flex-none min-w-[140px]">
          <Download size={16}/> Export
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" count={stats.total} icon={Users}
          palette={{ bg:"bg-blue-50", icon:"bg-blue-100 text-blue-600", text:"text-blue-700" }}
          active={!filters.verificationStatus && !filters.placementReady && !filters.hasResume} onClick={resetFilters} />
        <StatCard title="Verified" count={stats.verified} icon={ShieldCheck}
          palette={{ bg:"bg-emerald-50", icon:"bg-emerald-100 text-emerald-600", text:"text-emerald-700" }}
          active={filters.verificationStatus==="VERIFIED"} onClick={() => setFilters({ department:"", semester:"", verificationStatus:"VERIFIED", placementReady:"", hasResume:"" })} />
        <StatCard title="Resumes Uploaded" count={stats.resumeUploaded} icon={FileText}
          palette={{ bg:"bg-purple-50", icon:"bg-purple-100 text-purple-600", text:"text-purple-700" }}
          active={filters.hasResume==="true"} onClick={() => setFilters({ department:"", semester:"", verificationStatus:"", placementReady:"", hasResume:"true" })} />
        <StatCard title="Placement Ready" count={stats.placementReady} icon={Target}
          palette={{ bg:"bg-orange-50", icon:"bg-orange-100 text-orange-500", text:"text-orange-600" }}
          active={filters.placementReady==="READY"} onClick={() => setFilters({ department:"", semester:"", verificationStatus:"", placementReady:"READY", hasResume:"" })} />
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1 md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search by Student Name or Roll Number"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#F47C20] focus:ring-2 focus:ring-[#F47C20]/20 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"><X size={14}/></button>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-1 md:pb-0">
          <select value={filters.department} onChange={e => setFilters(p=>({...p, department:e.target.value}))} className="h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F47C20] cursor-pointer shrink-0 min-w-24">
            <option value="">Department</option>
            {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
          </select>
          <select value={filters.semester} onChange={e => setFilters(p=>({...p, semester:e.target.value}))} className="h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F47C20] cursor-pointer shrink-0 min-w-16">
            <option value="">Sem</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.verificationStatus} onChange={e => setFilters(p=>({...p, verificationStatus:e.target.value}))} className="h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F47C20] cursor-pointer shrink-0 min-w-20">
            <option value="">Status</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
          </select>
          <select value={filters.placementReady} onChange={e => setFilters(p=>({...p, placementReady:e.target.value}))} className="h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F47C20] cursor-pointer shrink-0 min-w-24">
            <option value="">Placement</option>
            <option value="READY">Ready</option>
            <option value="NEEDS_ATTENTION">Needs Attn</option>
          </select>
          <button onClick={resetFilters} className="h-9 px-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-[#F47C20] hover:bg-[#FFF4EB] font-semibold rounded-lg border border-slate-200 transition-all shrink-0">
            <RefreshCw size={12}/> Clear
          </button>
        </div>
      </div>

      {/* RESULT COUNT */}
      {!isLoading && filteredStudents.length > 0 && (
        <p className="text-sm text-slate-500 font-medium mb-3 px-1">
          Showing <span className="font-bold text-slate-700">{((currentPage-1)*itemsPerPage)+1}&#8211;{Math.min(currentPage*itemsPerPage, filteredStudents.length)}</span> of <span className="font-bold text-slate-700">{filteredStudents.length}</span> students
        </p>
      )}

      {/* TABLE */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {[...Array(6)].map((_,i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"/>
              <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded w-1/3"/><div className="h-3 bg-slate-100 rounded w-1/4"/></div>
              <div className="h-4 bg-slate-200 rounded w-20 hidden sm:block"/>
              <div className="h-6 bg-slate-200 rounded-full w-16 hidden md:block"/>
              <div className="h-8 bg-slate-100 rounded-xl w-20"/>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Search size={32} className="text-slate-300"/></div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No students found</h3>
          <p className="text-slate-400 text-sm mb-6">Try adjusting your search or filters.</p>
          <button onClick={resetFilters} className="px-5 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] font-bold rounded-xl hover:bg-[#FFF4EB] text-sm shadow-sm transition-colors">Clear Filters</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" onChange={handleSelectAll} checked={paginatedStudents.length > 0 && selectedStudentIds.size >= paginatedStudents.length} className="w-3.5 h-3.5 text-[#F47C20] rounded focus:ring-[#F47C20]" />
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Roll No</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Dept</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Sem</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">CGPA</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Resume</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5">
                      <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => handleSelectStudent(s.id)} className="w-3.5 h-3.5 text-[#F47C20] rounded focus:ring-[#F47C20]" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.user.name} src={s.profileImageUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-xs truncate">{s.user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{s.rollNumber}</span>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs font-semibold text-slate-700">{s.department}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs font-semibold text-slate-700">{s.semester}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs font-semibold text-slate-700">{s.cgpa || '-'}</td>
                    <td className="px-4 py-2.5 hidden lg:table-cell">
                      <Badge variant={s.hasResume ? "resume" : "default"}>{s.hasResume ? "Uploaded" : "Missing"}</Badge>
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell">
                      <Badge variant={s.verificationStatus === "VERIFIED" ? "verified" : "pending"}>
                        {s.verificationStatus === "VERIFIED" ? <CheckCircle size={10}/> : <AlertCircle size={10}/>}
                        {s.verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] text-[11px] font-bold rounded-lg hover:bg-[#FFF4EB] active:scale-95 transition-all shadow-sm focus:outline-none whitespace-nowrap">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Page {currentPage} of {totalPages}</p>
              <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
                <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#F47C20] hover:text-[#F47C20] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={15}/>
                </button>
                {[...Array(Math.min(totalPages,7))].map((_,i) => {
                  const pg = totalPages<=7 ? i+1 : currentPage<=4 ? i+1 : currentPage>=totalPages-3 ? totalPages-6+i : currentPage-3+i;
                  return (
                    <button key={pg} onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage===pg ? "border border-[#F47C20] bg-white text-[#F47C20] shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-[#F47C20] hover:text-[#F47C20] hover:bg-[#FFF4EB]"}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#F47C20] hover:text-[#F47C20] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={15}/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT DETAILS MODAL (REDESIGNED 2-COLUMN) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}/>
          <div className="relative w-full max-w-7xl max-h-[90vh] bg-[#F8FAFC] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-extrabold text-slate-800 text-lg">Candidate Profile</h3>
              <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                
                {/* LEFT COLUMN (Student Identity) */}
                <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-0">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-white flex-shrink-0 bg-slate-100 flex items-center justify-center mb-4">
                      {selectedStudent.profileImageUrl ? (
                        <img src={selectedStudent.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-extrabold text-slate-300">
                          {selectedStudent.user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedStudent.user.name}</h2>
                    <p className="text-[#F47C20] font-bold text-base mb-4">{selectedStudent.rollNumber}</p>
                    
                    <div className="w-full h-px bg-slate-100 my-4"></div>
                    
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-semibold">Department</span>
                        <span className="font-bold text-slate-800">{selectedStudent.department || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-semibold">Semester</span>
                        <span className="font-bold text-slate-800">{selectedStudent.semester || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-semibold">CGPA</span>
                        <span className="font-bold text-slate-800">{selectedStudent.cgpa || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-slate-500 font-semibold">Status</span>
                        {selectedStudent.verificationStatus === "VERIFIED" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={10}/> VERIFIED</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF4EB] text-[#F47C20] border border-[#F47C20]/30"><AlertCircle size={10}/> PENDING</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-semibold">Backlogs</span>
                        <span className="font-bold text-slate-800">{selectedStudent.backlogs || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-[#F47C20] text-sm mb-4 flex items-center gap-2 uppercase tracking-wide"><Users size={16} /> Personal Info</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                        <p className="text-sm font-semibold text-slate-800 break-all">{selectedStudent.user.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedStudent.mobileNumber || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Status</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${selectedStudent.user.accountStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{selectedStudent.user.accountStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Administrative Actions */}
                  <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 mt-auto border-t-4 border-t-[#F47C20]">
                    <h4 className="font-bold text-[#F47C20] text-sm mb-4 flex items-center gap-2 uppercase tracking-wide"><ShieldCheck size={16}/> Administrative Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedStudent.verificationStatus !== "VERIFIED" && (
                        <button onClick={() => setShowApproveModal(true)} className="w-full py-2.5 bg-white border border-[#F47C20] text-[#F47C20] text-sm font-bold rounded-xl hover:bg-[#FFF4EB] shadow-sm flex justify-center items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">
                          <CheckCircle size={16}/> Approve Student
                        </button>
                      )}
                      <button onClick={() => setShowResetModal(true)} className="w-full py-2.5 bg-white border border-[#F47C20] text-[#F47C20] text-sm font-bold rounded-xl hover:bg-[#FFF4EB] shadow-sm flex justify-center items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">
                        <KeyRound size={16}/> Reset Password
                      </button>
                      <button onClick={() => setShowRemoveModal(true)} className="w-full py-2.5 bg-white border border-[#F47C20] text-[#F47C20] text-sm font-bold rounded-xl hover:bg-[#FFF4EB] shadow-sm flex justify-center items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">
                        <XCircle size={16}/> Remove Student
                      </button>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN (Content & Actions) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Technical Skills */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-[#F47C20] text-sm mb-4 flex items-center gap-2 uppercase tracking-wide"><KeyRound size={16} /> Technical Skills</h4>
                    {selectedStudent.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm">{skill}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No skills listed.</p>
                    )}
                  </div>

                  {/* Resume Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-[#F47C20] text-sm mb-4 flex items-center gap-2 uppercase tracking-wide"><FileText size={16}/> Resume</h4>
                    {selectedStudent.hasResume ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 bg-[#FFF4EB] rounded-xl flex items-center justify-center text-[#F47C20] flex-shrink-0">
                            <FileText size={24} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm truncate">Resume Available</h3>
                            <p className="text-xs text-slate-500">Ready for review</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => handleAdminViewResume(selectedStudent)} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-[#F47C20] text-[#F47C20] text-xs font-bold rounded-lg hover:bg-[#FFF4EB] transition-all shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">View Resume</button>
                          <button onClick={() => handleAdminDownloadResume(selectedStudent.id, selectedStudent.rollNumber)} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-[#F47C20] text-[#F47C20] text-xs font-bold rounded-lg hover:bg-[#FFF4EB] transition-all shadow-sm flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2"><Download size={14}/> Download Resume</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-sm font-semibold text-slate-500">No Resume Uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Placement Activity */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[#F47C20] text-sm flex items-center gap-2 uppercase tracking-wide"><Target size={16} /> Placement Activity</h4>
                      {selectedStudent.isPlacementReady ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4EB] text-[#F47C20] border border-[#F47C20]/30 shadow-sm">Placement Ready</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">Needs Attention</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {label:"Applied", value:selectedStudent.applicationStats?.applied||0, color:"text-slate-700", bg:"bg-slate-50 border-slate-200"},
                        {label:"Shortlisted", value:selectedStudent.applicationStats?.shortlisted||0, color:"text-blue-700", bg:"bg-blue-50 border-blue-200"},
                        {label:"Selected", value:selectedStudent.applicationStats?.selected||0, color:"text-emerald-700", bg:"bg-emerald-50 border-emerald-200"},
                        {label:"Rejected", value:selectedStudent.applicationStats?.rejected||0, color:"text-red-700", bg:"bg-red-50 border-red-200"},
                      ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm`}>
                          <p className={`text-2xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-[#F47C20] text-sm mb-4 flex items-center gap-2 uppercase tracking-wide"><CheckCircle2 size={16}/> Projects</h4>
                    {selectedStudent.projects?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudent.projects.map((p, i) => (
                          <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-2">
                            <h5 className="font-bold text-slate-800 text-sm">{p.title}</h5>
                            {p.description && <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">{p.description}</p>}
                            {p.tech && p.tech.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.tech.map((t, ti) => <span key={ti} className="px-1.5 py-0.5 bg-white border border-slate-200 text-[9px] font-semibold text-slate-600 rounded">{t}</span>)}
                              </div>
                            )}
                            <div className="flex gap-2 pt-2 border-t border-slate-100 mt-1">
                              {isValidUrl(p.sourceUrl) && <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="flex-1 text-center px-2.5 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] hover:bg-[#FFF4EB] text-[10px] font-bold rounded shadow-sm transition-colors">Code</a>}
                              {isValidUrl(p.demoUrl) && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="flex-1 text-center px-2.5 py-1.5 bg-white border border-[#F47C20] text-[#F47C20] hover:bg-[#FFF4EB] text-[10px] font-bold rounded shadow-sm transition-colors">Demo</a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-sm font-semibold text-slate-500">No projects added yet.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE STUDENT MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-[#FFF4EB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#F47C20]">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Approve this student?</h3>
            <p className="text-sm text-slate-500 mb-6">This action will mark the student as verified by the Placement Cell.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2.5 text-[#F47C20] font-bold hover:bg-[#FFF4EB] rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Cancel</button>
              <button onClick={handleApprove} className="flex-1 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] font-bold rounded-xl hover:bg-[#FFF4EB] transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-[#FFF4EB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#F47C20]">
              <KeyRound size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Reset password for this student?</h3>
            <p className="text-sm text-slate-500 mb-6">A temporary password will be generated for {selectedStudent?.user?.name}.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 py-2.5 text-[#F47C20] font-bold hover:bg-[#FFF4EB] rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Cancel</button>
              <button onClick={handleResetPassword} className="flex-1 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] font-bold rounded-xl hover:bg-[#FFF4EB] transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE STUDENT MODAL */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Remove student account?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. To confirm, type <span className="font-bold text-slate-800">DELETE</span> below.</p>
            </div>
            <input 
              type="text" 
              placeholder="Type DELETE" 
              value={removeConfirmText}
              onChange={(e) => setRemoveConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-800 mb-6 outline-none focus:border-red-300 focus:bg-white transition-all"
            />
            <div className="flex gap-3">
              <button onClick={() => {setShowRemoveModal(false); setRemoveConfirmText("");}} className="flex-1 py-2.5 text-[#F47C20] font-bold hover:bg-[#FFF4EB] rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Cancel</button>
              <button 
                onClick={handleDeleteStudent} 
                disabled={removeConfirmText !== "DELETE"}
                className="flex-1 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] font-bold rounded-xl hover:bg-[#FFF4EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">
                Remove Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Add New Student</h3>
                <p className="text-slate-400 text-xs mt-0.5">A temporary password will be generated automatically.</p>
              </div>
              <button onClick={()=>setShowAddModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="e.g. Ravi Kumar" className={inputCls}/>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                  <input required type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="student@example.com" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Roll Number *</label>
                  <input required type="text" value={formData.rollNumber} onChange={e=>setFormData({...formData,rollNumber:e.target.value})} placeholder="22A91A0501" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile *</label>
                  <input required type="text" value={formData.mobileNumber} onChange={e=>setFormData({...formData,mobileNumber:e.target.value})} placeholder="9999999999" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department *</label>
                  <select required value={formData.department} onChange={e=>setFormData({...formData,department:e.target.value})} className={inputCls}>
                    <option value="">Select Department</option>
                    {departments.map(d=><option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Semester *</label>
                  <select required value={formData.semester} onChange={e=>setFormData({...formData,semester:parseInt(e.target.value)})} className={inputCls}>
                    {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Academic Year</label>
                  <input type="text" value={formData.academicYear} onChange={e=>setFormData({...formData,academicYear:e.target.value})} placeholder="e.g. 2024-25" className={inputCls}/>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                <button type="button" onClick={()=>setShowAddModal(false)} className="px-5 py-2.5 text-[#F47C20] font-bold hover:bg-[#FFF4EB] rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-white border border-[#F47C20] text-[#F47C20] font-bold rounded-xl hover:bg-[#FFF4EB] transition-colors shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Create Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL */}
      {showCredsModal && credentials && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#F47C20] to-orange-600 p-7 text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                <CheckCircle size={32} className="text-white"/>
              </div>
              <h3 className="text-xl font-extrabold text-white">Account Created!</h3>
              <p className="text-orange-100 text-sm mt-1">Share these credentials with the student.</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-sm">Roll Number:</span>
                  <span className="font-bold text-slate-800 font-mono">{credentials?.identifier}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-sm">Email (Login ID):</span>
                  <span className="font-bold text-slate-800 font-mono">{credentials?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Temporary Password:</span>
                  <span className="font-bold text-slate-800 font-mono tracking-wider">{credentials?.temporaryPassword}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>{navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors">
                  {copied?<><Check size={16} className="text-emerald-500"/>Copied!</>:<><Copy size={16}/>Copy Credentials</>}
                </button>
                <button onClick={()=>setShowCredsModal(false)} className="w-full py-3 bg-white border border-[#F47C20] text-[#F47C20] font-bold text-sm rounded-xl hover:bg-[#FFF4EB] transition-colors shadow-sm">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800">Bulk Import Students</h3>
              <button onClick={closeImportModal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400"><X size={18}/></button>
            </div>
            
            <div className="p-6 space-y-5">
              {!importResult ? (
                <>
                  <p className="text-sm text-slate-500">Upload an Excel (.xlsx) or CSV file. Duplicates are skipped.</p>
                  
                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>{importError}</p>
                    </div>
                  )}

                  <div 
                    onClick={() => !importing && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (!importing && e.dataTransfer.files?.length) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-8 transition-all text-center group ${importing ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : isDragging ? 'border-[#F47C20] bg-[#FFF4EB]' : 'border-slate-200 bg-slate-50 hover:border-[#F47C20] hover:bg-[#FFF4EB] cursor-pointer'}`}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />
                    
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet size={36} className="text-[#F47C20]" />
                        <p className="text-sm font-bold text-slate-800 break-all">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={36} className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-[#F47C20]' : 'text-slate-300 group-hover:text-[#F47C20]'}`} />
                        <p className="text-slate-600 font-semibold text-sm">Click to browse or drag and drop</p>
                        <p className="text-slate-400 text-xs mt-1">.xlsx or .csv, max 10 MB</p>
                      </>
                    )}
                  </div>

                  {importing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Uploading & Processing...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-[#F47C20] h-2.5 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={closeImportModal} disabled={importing} className="flex-1 py-3 text-[#F47C20] font-bold hover:bg-[#FFF4EB] rounded-xl text-sm transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">Cancel</button>
                    <button 
                      onClick={handleImport}
                      disabled={!selectedFile || importing} 
                      className="flex-1 py-3 bg-white border border-[#F47C20] text-[#F47C20] font-bold rounded-xl text-sm hover:bg-[#FFF4EB] transition-colors shadow disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2"
                    >
                      {importing ? <><Loader2 size={16} className="animate-spin" /> Importing...</> : "Upload File"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-800">Import Complete</h4>
                    <p className="text-slate-500 text-sm mt-1">The student data has been processed.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                      <p className="text-2xl font-extrabold text-emerald-600">{importResult.created ?? 0}</p>
                      <p className="text-[10px] font-bold text-emerald-700/70 uppercase">Created</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                      <p className="text-2xl font-extrabold text-amber-600">{importResult.skipped ?? 0}</p>
                      <p className="text-[10px] font-bold text-amber-700/70 uppercase">Skipped</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                      <p className="text-2xl font-extrabold text-red-600">{importResult.failed ?? 0}</p>
                      <p className="text-[10px] font-bold text-red-700/70 uppercase">Failed</p>
                    </div>
                  </div>

                  <button onClick={closeImportModal} className="w-full py-3 bg-white border border-[#F47C20] text-[#F47C20] font-bold text-sm rounded-xl hover:bg-[#FFF4EB] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER PADDING FIX FOR OVERFLOWING CONTENT IN MODAL */}
      {selectedStudent && (
        <style dangerouslySetInnerHTML={{__html: `
          .flex-1.overflow-y-auto {
            /* padding-bottom to ensure admin actions are scrollable if screen is very short */
            padding-bottom: 2rem !important;
          }
        `}} />
      )}

      <ExportDataModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        onExport={handleExport}
        isExporting={isExporting}
        filteredCount={filteredStudents.length}
        totalCount={students.length}
        selectedCount={selectedStudentIds.size}
        currentPageCount={paginatedStudents.length}
      />
      {/* DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={closeDocumentViewer}
        documentUrl={viewerUrl}
        fileName={viewerMetadata?.fileName}
        studentName={viewerMetadata?.studentName}
        rollNumber={viewerMetadata?.rollNumber}
      />
    </DashboardLayout>
  );
}