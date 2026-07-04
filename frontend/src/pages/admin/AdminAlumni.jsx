import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Shield, Ban, CheckCircle, X, Trash2, ScanSearch } from 'lucide-react';
import { PageHeader, SearchInput, Table, Button, LoadingSpinner, Modal } from '../../components/common';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

export default function AdminAlumni() {
  const [alumniUsers, setAlumniUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [rejectingAlum, setRejectingAlum] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingDocs, setViewingDocs] = useState(null);
  const [docMetadata, setDocMetadata] = useState(null);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [deletingAlum, setDeletingAlum] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleViewDocs = async (alum) => {
    setViewingDocs(alum);
    setIsDocLoading(true);
    setDocMetadata(null);
    try {
      const res = await api.get(`/admin/alumni/${alum.id}/document`);
      setDocMetadata(res.data);
    } catch (err) {
      toast.error('Failed to load document metadata');
    } finally {
      setIsDocLoading(false);
    }
  };

  const fetchAlumni = async () => {
    try {
      const res = await api.get('/admin/alumni');
      setAlumniUsers(res.data);
    } catch (err) {
      console.error('Failed to load alumni', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const verifyUser = async (id, status, reason = null) => {
    try {
      await api.post(`/admin/alumni/verify/${id}`, { 
        approved: status === 'Verified',
        rejectionReason: reason
      });
      toast.success(status === 'Verified' ? 'Alumni Approved Successfully' : 'Alumni Rejected');
      if (rejectingAlum) setRejectingAlum(null);
      setRejectionReason('');
      fetchAlumni();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Verification Failed');
    }
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    verifyUser(rejectingAlum.id, 'Rejected', rejectionReason);
  };

  const handleDeleteAlumni = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      await api.delete(`/admin/alumni/${deletingAlum.id}`);
      toast.success('Alumni account deleted successfully.');
      setDeletingAlum(null);
      setDeleteConfirmText('');
      // Optimistic update
      setAlumniUsers(prev => prev.filter(alum => alum.id !== deletingAlum.id));
      // In a real scenario we might fetch stats here as well if they are managed in context or another component
    } catch (err) {
      console.error('Failed to delete alumni', err);
      toast.error('Unable to delete alumni account.');
    }
  };

  const filteredUsers = alumniUsers.filter(u => {
    const name = u.user?.name || '';
    const email = u.user?.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || u.verificationStatus === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'VERIFIED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const columns = [
    {
      header: 'Name & Details',
      render: (alum) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-primary/10">
            <img src={`https://ui-avatars.com/api/?name=${alum.name}&background=random`} alt={alum.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{alum.name}</div>
            <div className="text-sm text-gray-500 mt-0.5">
              {alum.jobTitle ? `${alum.jobTitle} at ${alum.company}` : 'Role not specified'}
            </div>
            <div className="text-xs font-medium text-gray-400 mt-1">Class of {alum.gradYear}</div>
          </div>
        </div>
      )
    },
    { header: 'Email', accessor: 'email', className: 'text-gray-600' },
    { header: 'Department', accessor: 'department', className: 'text-gray-600' },
    {
      header: 'Status',
      render: (alum) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(alum.verificationStatus)}`}>
          {alum.verificationStatus}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (alum) => (
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 whitespace-nowrap"
            onClick={() => handleViewDocs(alum)}
          >
            View Docs
          </Button>
          {alum.verificationStatus !== 'VERIFIED' && (
            <Button 
              size="sm"
              title="Verify"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => verifyUser(alum.id, 'Verified')}
            >
              Approve
            </Button>
          )}
          {alum.verificationStatus !== 'REJECTED' && (
            <Button 
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              title="Reject"
              onClick={() => setRejectingAlum(alum)}
            >
              Reject
            </Button>
          )}
          <Button 
            size="sm"
            variant="outline"
            className="text-[#DC2626] border-[#DC2626] bg-[#FFFFFF] hover:bg-red-50"
            title="Delete Alumni"
            onClick={() => {
              setDeletingAlum(alum);
              setDeleteConfirmText('');
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader 
        title="Alumni Directory" 
        subtitle="Manage all registered alumni and their verification status." 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="w-full md:w-96">
            <SearchInput 
              placeholder="Search alumni..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-auto">
            <select 
              className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-gray-700 outline-none transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-500 font-medium">Loading alumni directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">No alumni found matching your criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header row for desktop */}
            <div className="hidden lg:flex items-center justify-between py-3 px-6 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="w-1/4">Name & Details</div>
              <div className="w-1/4 flex">
                <div className="flex-1">Department</div>
                <div className="flex-1">Company</div>
              </div>
              <div className="w-1/6 text-center">Status</div>
              <div className="w-auto flex-1 text-right">Actions</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {currentUsers.map(alum => (
                <div key={alum.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow lg:flex lg:items-center lg:justify-between lg:py-4 lg:px-6">
                  
                  {/* Profile Image & Name */}
                  <div className="flex items-center gap-4 mb-4 lg:mb-0 lg:w-1/4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-[#0A4D8C]/10 flex items-center justify-center">
                      <img src={`https://ui-avatars.com/api/?name=${alum.user?.name || 'Unknown'}&background=0A4D8C&color=fff`} alt={alum.user?.name || 'Unknown'} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">{alum.user?.name || 'Unknown Alumni'}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">
                        {alum.passingYear ? `Class of ${alum.passingYear}` : 'Graduation Year Not Available'}
                      </div>
                      <div className="text-xs text-gray-400 block lg:hidden mt-0.5 truncate max-w-[200px] sm:max-w-xs">{alum.user?.email}</div>
                    </div>
                  </div>

                  {/* Department & Job Info */}
                  <div className="grid grid-cols-2 gap-2 mb-4 lg:mb-0 lg:flex lg:flex-row lg:w-1/4">
                    <div className="text-sm lg:flex-1">
                      <span className="text-gray-400 block lg:hidden text-[10px] uppercase font-semibold">Department</span>
                      <span className="font-medium text-gray-800">{alum.department || 'N/A'}</span>
                    </div>
                    <div className="text-sm lg:flex-1">
                      <span className="text-gray-400 block lg:hidden text-[10px] uppercase font-semibold">Company</span>
                      <span className="font-medium text-gray-800 truncate block max-w-full" title={alum.company ? `${alum.designation || ''} at ${alum.company}` : 'Not provided'}>
                        {alum.company || 'Not Provided'}
                      </span>
                      {alum.designation && <span className="text-xs text-gray-500 block truncate">{alum.designation}</span>}
                    </div>
                  </div>

                  {/* Verification Status + OCR Badge */}
                  <div className="mb-4 lg:mb-0 lg:w-1/6 flex flex-col items-start lg:items-center gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide inline-flex items-center justify-center ${getStatusBadge(alum.verificationStatus)}`}>
                      {alum.verificationStatus}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      alum.ocrVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`} title={alum.ocrVerified ? 'OCR Verified' : 'OCR not verified'}>
                      <ScanSearch className="w-3 h-3" />
                      {alum.ocrVerified ? 'OCR ✓' : 'OCR —'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 lg:pt-0 lg:border-t-0 lg:w-auto lg:flex-1 lg:justify-end">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-[#0A4D8C] border-blue-200 hover:bg-blue-50 whitespace-nowrap flex-1 lg:flex-none justify-center"
                      onClick={() => handleViewDocs(alum)}
                    >
                      View Docs
                    </Button>
                    {alum.verificationStatus !== 'VERIFIED' && (
                      <Button 
                        size="sm"
                        title="Approve"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 lg:flex-none justify-center border-none"
                        onClick={() => verifyUser(alum.id, 'Verified')}
                      >
                        Approve
                      </Button>
                    )}
                    {alum.verificationStatus !== 'REJECTED' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 flex-1 lg:flex-none justify-center"
                        title="Reject"
                        onClick={() => setRejectingAlum(alum)}
                      >
                        Reject
                      </Button>
                    )}
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-[#DC2626] border-[#DC2626] bg-[#FFFFFF] hover:bg-red-50 flex-none lg:flex-none justify-center px-2"
                      title="Delete Alumni"
                      onClick={() => {
                        setDeletingAlum(alum);
                        setDeleteConfirmText('');
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-4">
                <div className="text-sm text-gray-500 font-medium text-center sm:text-left">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      if (
                        totalPages <= 5 || 
                        i === 0 || 
                        i === totalPages - 1 || 
                        (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                              currentPage === i + 1 
                                ? 'bg-[#F47C20] text-white shadow-sm' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      } else if (
                        (i === 1 && currentPage > 3) || 
                        (i === totalPages - 2 && currentPage < totalPages - 2)
                      ) {
                        return <span key={i} className="text-gray-400 self-end px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!rejectingAlum}
        onClose={() => setRejectingAlum(null)}
        title="Reject Alumni"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setRejectingAlum(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={submitRejection}>Confirm Reject</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">Please provide a reason for rejecting {rejectingAlum?.name}. This will be stored for audit purposes.</p>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!viewingDocs}
        onClose={() => setViewingDocs(null)}
        title="Document Verification"
        footer={
          <div className="flex flex-col sm:flex-row justify-between gap-3 w-full">
            <div className="flex gap-2">
              {viewingDocs && viewingDocs.verificationStatus !== 'VERIFIED' && (
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    verifyUser(viewingDocs.id, 'Verified');
                    setViewingDocs(null);
                  }}
                >
                  Approve
                </Button>
              )}
              {viewingDocs && viewingDocs.verificationStatus !== 'REJECTED' && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setRejectingAlum(viewingDocs);
                    setViewingDocs(null);
                  }}
                >
                  Reject
                </Button>
              )}
              {viewingDocs && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-[#DC2626] border-[#DC2626] bg-[#FFFFFF] hover:bg-red-50"
                  onClick={() => {
                    setDeletingAlum(viewingDocs);
                    setDeleteConfirmText('');
                    setViewingDocs(null);
                  }}
                >
                  Delete Alumni
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-2">
              {docMetadata?.documentUrl && (
                <>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => window.open(docMetadata.documentUrl.startsWith('http') ? docMetadata.documentUrl : api.defaults.baseURL + docMetadata.documentUrl, '_blank')}
                  >
                    Open Original
                  </Button>
                  <a 
                    href={docMetadata.documentUrl.startsWith('http') ? docMetadata.documentUrl : api.defaults.baseURL + docMetadata.documentUrl} 
                    download 
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </a>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => setViewingDocs(null)}>Close</Button>
            </div>
          </div>
        }
      >
        {viewingDocs && (
          <div className="space-y-6">
            {/* Alumni Information */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-4">
               <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-[#0A4D8C]/10 flex items-center justify-center">
                  <img src={`https://ui-avatars.com/api/?name=${viewingDocs.user?.name || 'Unknown'}&background=0A4D8C&color=fff`} alt="Profile" className="w-full h-full object-cover" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 leading-tight">{viewingDocs.user?.name || 'Unknown Alumni'}</h3>
                 <p className="text-sm text-gray-500 font-medium">{viewingDocs.passingYear ? `Class of ${viewingDocs.passingYear}` : 'Graduation Year Not Available'}</p>
                 <p className="text-sm text-gray-400">{viewingDocs.department || 'Department N/A'}</p>
               </div>
            </div>

            {/* OCR Verification Results */}
            <div className={`rounded-xl border p-4 ${viewingDocs.ocrVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <ScanSearch className={`w-4 h-4 ${viewingDocs.ocrVerified ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">OCR Document Verification</span>
                <span className={`ml-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  viewingDocs.ocrVerified
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-gray-200 text-gray-500 border-gray-300'
                }`}>
                  {viewingDocs.ocrVerified ? '✓ Verified' : '— Not Verified'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Extracted Name</span>
                  <span className="font-semibold text-gray-800 break-words">{viewingDocs.ocrExtractedName || <span className="text-gray-400 font-normal italic">Not detected</span>}</span>
                </div>
                <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Extracted Roll No.</span>
                  <span className="font-semibold text-gray-800 font-mono">{viewingDocs.ocrExtractedRollNumber || <span className="text-gray-400 font-normal italic">Not detected</span>}</span>
                </div>
                <div className="bg-white/80 rounded-lg p-3 border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Detected College</span>
                  <span className="font-semibold text-gray-800">{viewingDocs.ocrDetectedCollege || <span className="text-gray-400 font-normal italic">Not detected</span>}</span>
                </div>
              </div>
            </div>

            {/* Document Content */}
            {isDocLoading ? (
               <div className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner size="medium" />
                  <p className="mt-4 text-sm text-gray-500 font-medium">Loading document metadata...</p>
               </div>
            ) : docMetadata?.documentUrl ? (
               <div className="space-y-4">
                 {/* Document Information */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">Document Type</span>
                      <span className="text-sm font-semibold text-gray-800">{docMetadata.documentType}</span>
                   </div>
                   <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">Upload Date</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {docMetadata.uploadDate ? new Date(docMetadata.uploadDate).toLocaleDateString() : 'N/A'}
                      </span>
                   </div>
                 </div>

                 {/* Document Preview Area */}
                 <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '60vh' }}>
                    {docMetadata.documentType === 'PDF Document' ? (
                        <object 
                           data={docMetadata.documentUrl.startsWith('http') ? docMetadata.documentUrl : api.defaults.baseURL + docMetadata.documentUrl} 
                           type="application/pdf" 
                           className="w-full h-[50vh] min-h-[300px]"
                        >
                          <p className="p-4 text-center text-gray-500">
                             PDF cannot be displayed. <a href={docMetadata.documentUrl.startsWith('http') ? docMetadata.documentUrl : api.defaults.baseURL + docMetadata.documentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download it here</a>.
                          </p>
                        </object>
                    ) : (
                        <div className="w-full h-full overflow-auto p-2">
                           <img 
                              src={docMetadata.documentUrl.startsWith('http') ? docMetadata.documentUrl : api.defaults.baseURL + docMetadata.documentUrl} 
                              alt={docMetadata.documentName} 
                              className="w-full h-auto max-h-full object-contain mx-auto"
                           />
                        </div>
                    )}
                 </div>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <span className="text-gray-400">📄</span>
                  </div>
                  <h4 className="text-gray-900 font-medium">Document Preview Not Available</h4>
                  <p className="text-sm text-gray-500 mt-1 text-center">This user has not uploaded any verification documents.</p>
               </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!deletingAlum}
        onClose={() => setDeletingAlum(null)}
        title="Delete Alumni Account"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setDeletingAlum(null)}>Cancel</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleDeleteAlumni}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this alumni account?<br/>
            <span className="font-semibold text-red-600">This action cannot be undone.</span>
          </p>
          
          {deletingAlum && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-1 mt-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Name:</span> <span className="font-semibold">{deletingAlum.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Roll Number:</span> <span className="font-semibold">{deletingAlum.rollNumber || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Department:</span> <span className="font-semibold">{deletingAlum.department || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Company:</span> <span className="font-semibold">{deletingAlum.company || 'N/A'}</span></div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Type <span className="font-mono text-red-600 select-none">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm"
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
