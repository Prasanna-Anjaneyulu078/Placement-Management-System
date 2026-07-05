import React from 'react';
import { X, Download, FileText, Calendar, User, Hash } from 'lucide-react';

const DocumentViewerModal = ({
  isOpen,
  onClose,
  documentUrl,
  fileName,
  studentName,
  rollNumber,
  uploadDate,
  children,
  customActions
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!documentUrl) return;
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName || 'Document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(documentUrl, '_blank');
    }
  };

  const isImage = fileName?.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative flex flex-col bg-white rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 truncate mb-2">
              <FileText className="text-[#F47C20]" size={20} />
              <span className="truncate" title={fileName}>{fileName || 'Document Preview'}</span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
              {studentName && (
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm shrink-0">
                  <User size={13} className="text-slate-400" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]" title={studentName}>{studentName}</span>
                </div>
              )}
              {rollNumber && (
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm shrink-0">
                  <Hash size={13} className="text-slate-400" />
                  <span>{rollNumber}</span>
                </div>
              )}
              {uploadDate && (
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm shrink-0">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{uploadDate}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {customActions}
            <button 
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF4EB] border border-[#F47C20] text-[#F47C20] font-bold text-sm rounded-xl hover:bg-white hover:text-[#F47C20] active:scale-95 transition-all shadow-sm focus:outline-none whitespace-nowrap"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {!documentUrl ? (
            <div className="text-slate-400 font-medium">No document available</div>
          ) : isImage ? (
            <div className="w-full h-full overflow-auto flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-inner p-4">
              <img 
                src={documentUrl} 
                alt={fileName} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <iframe
              src={documentUrl}
              title={fileName || 'Document Viewer'}
              className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-inner"
            />
          )}
        </div>
        
        {/* Additional Content (like OCR results or forms) */}
        {children && (
          <div className="p-4 sm:p-6 bg-white border-t border-slate-200 overflow-y-auto max-h-[30vh]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerModal;
