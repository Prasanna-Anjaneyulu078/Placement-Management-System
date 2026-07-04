import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, PageHeader, LoadingSpinner } from '../../components/common';
import AlumniStats from '../../features/alumni/components/AlumniStats';
import ActiveJobListings from '../../features/alumni/components/ActiveJobListings';
import ShortlistedStudents from '../../features/alumni/components/ShortlistedStudents';
import api from '../../utils/axiosConfig';

export default function AlumniDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api.get('/alumni/stats'),
          api.get('/alumni/my-jobs')
        ]);
        setStats(statsRes.data);
        setMyJobs(jobsRes.data);
      } catch (err) {
        console.error('Failed to fetch alumni dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeJobs = myJobs.filter(job => job.status === 'APPROVED');

  return (
    <DashboardLayout role="alumni">
      <PageHeader 
        title="Alumni Dashboard" 
        subtitle="Manage your job postings and connect with students."
        actions={
          <Button 
            icon={Plus}
            onClick={() => navigate('/alumni/post-job')}
            className="post-job-btn"
          >
            Post New Job
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AlumniStats 
            totalPosted={stats?.jobsPosted || 0}
            activeCount={stats?.activeJobs || 0}
            applicantsCount={stats?.totalApplicants || 0}
            shortlistedCount={stats?.shortlisted || 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActiveJobListings jobs={activeJobs} />
            </div>

            <div className="lg:col-span-1">
              <ShortlistedStudents jobs={myJobs} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
