import React from 'react';
import { MapPin, Briefcase, DollarSign, Award } from 'lucide-react';
import Button from './Button';
import './JobCard.css';

export default function JobCard({ 
  job, 
  onSelect, 
  onApply, 
  hasApplied, 
  isAlumni = false,
  onEdit,
  onDelete,
  eligibility
}) {
  const getJobTypeClass = (type) => {
    switch(type) {
      case 'Full-time': return 'full-time';
      case 'Part-time': return 'part-time';
      case 'Internship': return 'internship';
      case 'Contract': return 'contract';
      default: return '';
    }
  };

  const getJobLevelClass = (level) => {
    switch(level) {
      case 'Entry Level': return 'entry-level';
      case 'Mid Level': return 'mid-level';
      case 'Senior Level': return 'senior-level';
      default: return 'entry-level';
    }
  };

  return (
    <div className="job-card" onClick={() => onSelect && onSelect(job)}>
      <div className="job-card-header">
        <div className="job-main-info">
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">{job.company}</p>
        </div>
        {!isAlumni && (
          <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
            <button className="save-btn">
              <Briefcase size={18} />
            </button>
            {eligibility && (
              <div 
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${eligibility.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                title={eligibility.message || (eligibility.eligible ? 'You are eligible to apply' : '')}
              >
                {eligibility.eligible ? 'Eligible ✓' : 'Not Eligible ✗'}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="job-tags">
        <div className="job-tag location-tag"><MapPin size={14} /> {job.location}</div>
        <div className={`job-tag ${getJobTypeClass(job.type)}`}>
          <Briefcase size={12} style={{ marginRight: '4px' }} /> {job.type}
        </div>
        <div className={`job-tag ${getJobLevelClass(job.level)}`}>
          <Award size={12} style={{ marginRight: '4px' }} /> {job.level || 'Entry Level'}
        </div>
        <div className="job-tag salary-tag"><DollarSign size={14} /> {job.salary}</div>
      </div>

      <div className="job-skills">
        {job.tags.map(tag => (
          <span key={tag} className="skill-chip">{tag}</span>
        ))}
      </div>

      <div className="job-card-footer">
        <span className="posted-date">Posted {job.posted}</span>
        <div className="job-card-actions">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(job);
            }}
          >
            View Details
          </Button>
          
          {!isAlumni ? (
            <Button 
              size="sm"
              className={hasApplied || (eligibility && !eligibility.eligible) ? 'applied' : ''}
              onClick={(e) => {
                e.stopPropagation();
                onApply && onApply(job);
              }}
              disabled={hasApplied || (eligibility && !eligibility.eligible)}
            >
              {hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
          ) : (
            <>
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="outline"
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
                  size="sm" 
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(job);
                  }}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
