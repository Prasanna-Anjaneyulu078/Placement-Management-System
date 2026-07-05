import React from 'react';
import { MapPin, DollarSign, Calendar, Users, Briefcase, ChevronRight, CheckCircle, XCircle, User, Info, Hourglass } from 'lucide-react';
import Button from './Button';

export default function JobCard({ 
  job, 
  onSelect, 
  onApply, 
  hasApplied, 
  isAlumni = false,
  isAdmin = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  eligibility,
  customStatusBadge,
  statusOverride
}) {
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPLIED': return { bg: 'bg-[#FFF9C4]', text: 'text-[#F57F17]', dot: 'bg-[#F57F17]', label: 'Applied' };
      case 'OPEN': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Open' };
      case 'SHORTLISTED': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Shortlisted' };
      case 'SELECTED': return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Selected' };
      case 'REJECTED': return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Rejected' };
      case 'CLOSED': return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Closed' };
      case 'PENDING': return { bg: 'bg-[#FFF9C4]', text: 'text-[#F57F17]', dot: 'bg-[#F57F17]', label: 'Pending' };
      case 'ACTIVE': return { bg: 'bg-[#FFF9C4]', text: 'text-[#F57F17]', dot: 'bg-[#F57F17]', label: 'Hiring In Progress' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: status || 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(statusOverride || (hasApplied ? 'APPLIED' : job.status));
  const logoInitial = job.company ? job.company.charAt(0).toUpperCase() : 'C';

  return (
    <div 
      onClick={() => onSelect && onSelect(job)}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col p-6 relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4">
          <p className="text-[13px] font-medium text-gray-500 mb-1.5">{job.company}</p>
          <h3 className="text-[17px] font-semibold text-gray-900 leading-tight">{job.title}</h3>
        </div>
        <div className="w-12 h-12 rounded bg-white flex items-center justify-center shrink-0">
          {job.companyLogoUrl ? (
            <img src={job.companyLogoUrl} alt={job.company} className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-xl font-bold text-gray-300">{logoInitial}</span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[#F47C20]">
            <MapPin size={14} />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Location</span>
          </div>
          <p className="text-sm font-medium text-gray-800 line-clamp-1">{job.location || 'Not specified'}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[#F47C20]">
            <DollarSign size={14} />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Stipend</span>
          </div>
          <p className="text-sm font-medium text-gray-800 line-clamp-1">{job.packageDetails || 'Not Disclosed'}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[#F47C20]">
            <Users size={14} />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Openings</span>
          </div>
          <p className="text-sm font-medium text-gray-800 line-clamp-1">{job.openings || 'Multiple'}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[#F47C20]">
            <Hourglass size={14} />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Apply By</span>
          </div>
          <p className="text-sm font-medium text-gray-800 line-clamp-1">
            {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) + ', 04:00 PM' : 'Not specified'}
          </p>
        </div>
      </div>

      {isAdmin && job.postedBy && (
        <div className="mt-[-10px] mb-6 flex items-center gap-2 text-xs font-medium text-gray-500">
          <User size={14} className="text-gray-400" />
          Posted by: <span className="text-gray-800">{job.postedBy.name}</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-2">
          {customStatusBadge ? (
            customStatusBadge
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} text-[11px] font-semibold`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
              {statusConfig.label}
            </span>
          )}
          <Info size={14} className="text-gray-400 cursor-pointer" />
        </div>

        <div className="flex gap-3">
          {isAdmin ? (
            <>
              {job.status === 'PENDING' ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove && onApprove(job);
                    }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject && onReject(job);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <span className="text-[13px] font-semibold text-[#F47C20] hover:text-[#e06912] flex items-center gap-1 transition-colors">
                  View Details <ChevronRight size={16} />
                </span>
              )}
            </>
          ) : isAlumni ? (
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="rounded-lg px-4 text-[#F47C20] border-[#F47C20] hover:bg-[#F47C20]/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(job);
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="rounded-lg px-4 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(job);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          ) : (
            <span className="text-[13px] font-semibold text-[#F47C20] hover:text-[#e06912] flex items-center gap-1 transition-colors">
              View Details <ChevronRight size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

