/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  GraduationCap,
  Shield,
  Users,
  Search,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  Database,
  Cpu,
  History,
  DollarSign,
  Award,
  Info,
  Layers,
  Lock,
  Wifi,
  ChevronRight,
  RefreshCw,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  JobPost,
  JobCategory,
  ActivityLog,
  SystemConfig,
  DashboardStats,
  Application
} from './types';
import { RoleSwitcher } from './components/RoleSwitcher';
import { PhoneSimulator } from './components/PhoneSimulator';

export default function App() {
  // Global application states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [config, setConfig] = useState<SystemConfig | null>(null);

  // UI Interactive States
  const [activeTab, setActiveTab] = useState<'marketplace' | 'admin_queue' | 'analytics' | 'maintenance'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    category: 'academic' as JobCategory,
    payout: '1000',
    requiredSkills: ''
  });
  const [completingJobId, setCompletingJobId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isApplying, setIsApplying] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch current user and essential backend data
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [userRes, usersRes, jobsRes, logsRes, statsRes, configRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/users'),
        fetch('/api/jobs'),
        fetch('/api/logs'),
        fetch('/api/stats'),
        fetch('/api/config')
      ]);

      if (userRes.ok) setCurrentUser(await userRes.json());
      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (configRes.ok) setConfig(await configRes.json());
    } catch (err) {
      console.error('Error fetching intranet blueprint status:', err);
      showAlert('Could not establish secure sync with the ISUFST_SEC server.', 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto sync logs and status every 15 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  // Switch identity handler (simulate OAuth and credential swap)
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        showAlert(`Successfully switched view context to: ${data.user.name} (${data.user.role})`, 'success');
        
        // Auto-redirect to appropriate tabs to match role expectations
        if (data.user.role === UserRole.STUDENT) {
          setActiveTab('marketplace');
        } else if (data.user.role === UserRole.ADMIN) {
          setActiveTab('admin_queue');
        } else if (data.user.role === UserRole.SUPER_ADMIN) {
          setActiveTab('maintenance');
        }
        loadData(true);
      }
    } catch (err) {
      showAlert('Failed to switch role context.', 'error');
    }
  };

  // Student application submission with interactive AI matching
  const handleApply = async (jobId: string) => {
    if (currentUser?.verifiedStatus !== 'approved') {
      showAlert('Access Denied. Your profile is currently pending Admin vetting approval.', 'error');
      return;
    }

    setIsApplying(prev => ({ ...prev, [jobId]: true }));
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showAlert('Application submitted! AI semantic matching score is now active on this job.', 'success');
        loadData(true);
      } else {
        const errData = await res.json();
        showAlert(errData.error || 'Could not submit application.', 'error');
      }
    } catch (err) {
      showAlert('Error during application processing.', 'error');
    } finally {
      setIsApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // Faculty post job placement
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) {
      showAlert('Please fill in all requested fields.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newJob.title,
          description: newJob.description,
          category: newJob.category,
          payout: parseFloat(newJob.payout) || 500,
          requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        showAlert('New institutional role published to the campus intranet!', 'success');
        setShowCreateJobModal(false);
        setNewJob({ title: '', description: '', category: 'academic', payout: '1000', requiredSkills: '' });
        loadData(true);
      } else {
        showAlert('Failed to post job listing.', 'error');
      }
    } catch (err) {
      showAlert('Error submitting job placement.', 'error');
    }
  };

  // Faculty selects candidate to hire
  const handleSelectCandidate = async (jobId: string, studentId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (res.ok) {
        showAlert('Candidate hired successfully! Job state moved to In-Progress.', 'success');
        loadData(true);
      } else {
        const data = await res.json();
        showAlert(data.error || 'Failed to hire student.', 'error');
      }
    } catch (err) {
      showAlert('Error during student hiring.', 'error');
    }
  };

  // Faculty completes job and reviews candidate
  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingJobId) return;

    try {
      const res = await fetch(`/api/jobs/${completingJobId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingValue,
          feedback: feedbackText
        })
      });
      if (res.ok) {
        showAlert(`Job successfully closed. ₱${jobs.find(j => j.id === completingJobId)?.payout} transferred to the student's campus balance.`, 'success');
        setCompletingJobId(null);
        setFeedbackText('');
        setRatingValue(5);
        loadData(true);
      } else {
        showAlert('Failed to complete job.', 'error');
      }
    } catch (err) {
      showAlert('Error processing job finalization.', 'error');
    }
  };

  // Submit profile registration request to the backend
  const handleRegisterUser = async (formData: any) => {
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAllUsers(data.allUsers);
        showAlert(`Profile submitted successfully! Current state: PENDING ADMIN VETTING.`, 'success');
        loadData(true);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit profile.');
      }
    } catch (err: any) {
      showAlert(err.message || 'Error during profile registration.', 'error');
      throw err;
    }
  };

  // Admin approves/rejects registered user in vetting pipeline
  const handleVerifyUser = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/users/${userId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showAlert(`Registration approval updated for applicant to: ${status.toUpperCase()}`, 'success');
        loadData(true);
      } else {
        const errData = await res.json();
        showAlert(errData.error || 'Failed to execute approval mutation.', 'error');
      }
    } catch (err) {
      showAlert('Error during admin review processing.', 'error');
    }
  };

  // Super Admin clear activity terminal logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      if (res.ok) {
        setLogs(await res.json());
        showAlert('Intranet system activity logs successfully purged.', 'info');
      }
    } catch (err) {
      showAlert('Failed to purge logs.', 'error');
    }
  };

  // Super Admin toggle maintenance mode / update configuration
  const handleUpdateConfig = async (newConfig: Partial<SystemConfig>) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(await res.json());
        showAlert('Campus core system parameters successfully updated.', 'success');
        loadData(true);
      }
    } catch (err) {
      showAlert('Failed to update system config.', 'error');
    }
  };

  // Super Admin backup trigger
  const handleTriggerBackup = async () => {
    try {
      const res = await fetch('/api/config/backup', { method: 'POST' });
      if (res.ok) {
        setConfig(await res.json());
        showAlert('Manual database snapshot successfully compiled and isolated.', 'success');
        loadData(true);
      }
    } catch (err) {
      showAlert('Failed to compile database snapshot.', 'error');
    }
  };

  // Super Admin retrain AI
  const handleRetrainAi = async () => {
    try {
      const res = await fetch('/api/config/retrain', { method: 'POST' });
      if (res.ok) {
        setConfig(await res.json());
        showAlert('AI semantic parameters successfully recalibrated against completed jobs.', 'success');
        loadData(true);
      }
    } catch (err) {
      showAlert('Failed to execute AI recalibration.', 'error');
    }
  };

  // Filter jobs based on active filters and queries
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [jobs, searchQuery, categoryFilter]);

  // Vetting list of students who are pending review or rejected
  const vettingList = useMemo(() => {
    return allUsers.filter(u => u.role === UserRole.STUDENT && u.verifiedStatus !== 'approved');
  }, [allUsers]);

  if (isLoading || !currentUser) {
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-bold text-white tracking-wide font-display">Syncing Secure Intranet</h2>
          <p className="text-sm text-slate-400 font-mono">Connecting to ISUFST_SEC Intranet Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Background radial geometric design grid */}
      <div className="absolute inset-0 pointer-events-none opacity-45" style={{
        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Global Alert Notification Banner */}
      {alert && (
        <div className="fixed bottom-12 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 ${
            alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            alert.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-sky-50 border-sky-200 text-sky-800'
          }`}>
            {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {alert.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {alert.type === 'info' && <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-semibold">{alert.message}</p>
              <p className="text-xs opacity-80 mt-0.5 font-mono">ISUFST_SEC Network Msg</p>
            </div>
          </div>
        </div>
      )}

      {currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.FACULTY ? (
        /* MOBILE VIEW SIMULATION FOR STUDENTS & FACULTY */
        <div className="flex flex-col flex-1 relative z-10 min-h-screen">
          {/* Simulation Global Header Bar */}
          <header className="h-20 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between shadow-md text-white sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-500 rounded-sm flex items-center justify-center font-bold text-slate-950 italic font-display">HM</div>
              <div>
                <h1 className="text-base font-bold text-white font-display">HireMe Intranet Gateway</h1>
                <p className="text-[10px] text-sky-400 font-mono">Evaluating Mobile-only standard client architecture</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Simulator Controls</p>
                <p className="text-xs text-slate-300">Switch personas to try Admin approvals or other roles:</p>
              </div>
              <RoleSwitcher
                allUsers={allUsers}
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
              />
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center bg-slate-100/40">
            <PhoneSimulator
              currentUser={currentUser}
              allUsers={allUsers}
              jobs={jobs}
              isApplying={isApplying}
              onApply={async (jobId) => {
                await handleApply(jobId);
              }}
              onRegister={handleRegisterUser}
              onSwitchUser={handleSwitchUser}
              config={config}
              onRefresh={() => loadData(true)}
            />
          </div>
        </div>
      ) : (
        /* DESKTOP VIEW FOR ADMINS & SUPER ADMINS */
        <div className="flex flex-1 relative z-10 min-h-screen">
          
          {/* Sidebar Nav (Geometric Balance Theme Style) */}
          <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-9 h-9 bg-sky-500 rounded-sm flex items-center justify-center font-bold text-slate-950 italic font-display shadow-md">HM</div>
            <div className="flex flex-col">
              <span className="text-white font-bold leading-none tracking-tight text-lg font-display">HireMe</span>
              <span className="text-sky-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 font-mono">ISUFST_SEC CAMPUS</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border-b border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Logged in user</p>
            <RoleSwitcher
              allUsers={allUsers}
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
            />
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex-1 px-4 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Menu</div>
            
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`w-full px-3 py-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                activeTab === 'marketplace'
                  ? 'bg-slate-800 text-white font-medium border-l-4 border-sky-400'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span className="text-sm">Jobs Marketplace</span>
              <span className="ml-auto bg-slate-800 text-slate-400 text-xs font-mono px-2 py-0.5 rounded border border-slate-700">{jobs.length}</span>
            </button>

            {/* Admin Block (with visual hint if not Admin) */}
            <div className="pt-2">
              <div className="px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-widest font-display flex items-center justify-between">
                <span>Vetting / Stats</span>
                {currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1 py-0.2 rounded font-mono">Sim Required</span>
                )}
              </div>
              
              <button
                onClick={() => {
                  if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
                    showAlert('Applicant Vetting view is locked. Switch roles to Admin or Super Admin using the switcher above to gain authorization.', 'info');
                    return;
                  }
                  setActiveTab('admin_queue');
                }}
                className={`w-full mt-1 px-3 py-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                  activeTab === 'admin_queue'
                    ? 'bg-slate-800 text-white font-medium border-l-4 border-sky-400'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                } ${currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN ? 'opacity-65' : ''}`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm">Applicant Queue</span>
                {vettingList.length > 0 && (
                  <span className="ml-auto bg-rose-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">{vettingList.length}</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
                    showAlert('Analytics view requires Admin/Super Admin simulation.', 'info');
                    return;
                  }
                  setActiveTab('analytics');
                }}
                className={`w-full px-3 py-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-white font-medium border-l-4 border-sky-400'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                } ${currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN ? 'opacity-65' : ''}`}
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span className="text-sm">Talent Analytics AI</span>
              </button>
            </div>

            {/* Super Admin Block */}
            <div className="pt-2">
              <div className="px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-widest font-display flex items-center justify-between">
                <span>Infrastructure</span>
                {currentUser.role !== UserRole.SUPER_ADMIN && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-500 px-1 py-0.2 rounded font-mono">Super Admin Only</span>
                )}
              </div>

              <button
                onClick={() => {
                  if (currentUser.role !== UserRole.SUPER_ADMIN) {
                    showAlert('Maintenance panel is restricted to the IT Department Super Admin role.', 'error');
                    return;
                  }
                  setActiveTab('maintenance');
                }}
                className={`w-full mt-1 px-3 py-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-slate-800 text-white font-medium border-l-4 border-sky-400'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                } ${currentUser.role !== UserRole.SUPER_ADMIN ? 'opacity-65' : ''}`}
              >
                <Settings className="w-4 h-4 text-rose-400" />
                <span className="text-sm">System Maintenance</span>
              </button>
            </div>
          </nav>

          {/* Quick info block */}
          <div className="p-4 mt-auto border-t border-slate-800/80 bg-slate-950/20 text-xs">
            <div className="space-y-1 text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>System Domain:</span>
                <span className="text-sky-400">isufst.edu.ph</span>
              </div>
              <div className="flex justify-between">
                <span>Network Sandbox:</span>
                <span className="text-emerald-500 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col bg-slate-50/50 min-w-0">
          
          {/* Main Top Header Section */}
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-20">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                {activeTab === 'marketplace' && "Gigs & Institutional Placement Board"}
                {activeTab === 'admin_queue' && "Vetting Control Tower"}
                {activeTab === 'analytics' && "AI Talent Deficit Matrix"}
                {activeTab === 'maintenance' && "Campus Systems Terminal"}
              </h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'marketplace' && "Browse verified ISUFST_SEC tasks, campus jobs, or post new assignments."}
                {activeTab === 'admin_queue' && "Vetting pending student profiles, checking ID credentials, and flagging mismatches."}
                {activeTab === 'analytics' && "Semantic skill metrics comparing active campus demand against student registration databases."}
                {activeTab === 'maintenance' && "Scheduled backups, AI model fine-tuning, security logging, and maintenance switchboards."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Wallet/Funds simulated card for the active user */}
              <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
                <div className="p-1.5 bg-sky-100 rounded-lg text-sky-700">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Simulated Balance</p>
                  <p className="text-sm font-bold text-slate-800">₱{currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="hidden md:flex gap-3">
                {config?.isMaintenanceMode ? (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> Maintenance Active
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Network Secured
                  </span>
                )}
              </div>
            </div>
          </header>

          <div className="p-8 flex-1 overflow-y-auto space-y-8">

            {/* Context Notice to show active role guidelines */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-l-4 border-sky-500 p-4 rounded-xl shadow-sm">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Active Blueprint View: {currentUser.role} Context</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {currentUser.role === UserRole.STUDENT && "As an approved student, you can apply for active jobs. The backend will automatically run your profile through the Gemini AI Skill-Matching Engine to recommend you to the publisher!"}
                    {currentUser.role === UserRole.FACULTY && "As a faculty member, you can post institutional tasks or review applicant credentials. You'll see customized Top Gemini recommendations ranking candidates based on their skill matrices."}
                    {currentUser.role === UserRole.ADMIN && "As a Registrar Admin, you can review and active student registration queues, inspect digital campus IDs, and view campus analytical reports."}
                    {currentUser.role === UserRole.SUPER_ADMIN && "As a Super Admin, you have access to core configuration switches, backups, AI training modules, and real-time security events logs."}
                  </p>
                </div>
              </div>
            </div>

            {/* VIEW 1: Jobs Marketplace */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                
                {/* Search, Filter, and Post controls */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search jobs, skills, or departments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mr-2">Category:</span>
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        categoryFilter === 'all'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All Roles
                    </button>
                    {(['academic', 'lab_assistance', 'event_staff', 'personal'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                          categoryFilter === cat
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat.replace('_', ' ')}
                      </button>
                    ))}

                    {/* Only Faculty/Staff or Admins can post a job */}
                    {(currentUser.role === UserRole.FACULTY || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && (
                      <button
                        onClick={() => setShowCreateJobModal(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-sky-500/10 transition-all ml-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Post Job Placement
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Cards Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center">
                      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-800">No Job Placements Found</h3>
                      <p className="text-sm text-slate-500 mt-1">Try modifying your search queries or clearing active category filters.</p>
                    </div>
                  ) : (
                    filteredJobs.map(job => {
                      const hasApplied = job.applicants.some(a => a.studentId === currentUser.id);
                      const isAssignedToCurrent = job.assignedTo === currentUser.id;
                      
                      return (
                        <div
                          key={job.id}
                          className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative"
                          style={{ borderTop: '4px solid #0f172a' }} // Geometric Balance stat card signature
                        >
                          {/* Card Header */}
                          <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4">
                            <div>
                              <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold uppercase rounded-md mb-2">
                                {job.category.replace('_', ' ')}
                              </span>
                              <h3 className="text-lg font-bold text-slate-900 leading-snug">{job.title}</h3>
                              <p className="text-xs text-slate-400 mt-1">
                                Posted by <span className="font-semibold text-slate-600">{job.postedBy.name}</span> • {job.postedBy.department}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Est. Payout</span>
                              <span className="text-xl font-black text-slate-900">₱{job.payout}</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-6 flex-1 space-y-4">
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{job.description}</p>
                            
                            <div>
                              <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Desired Target Skills</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {job.requiredSkills.map(skill => (
                                  <span key={skill} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px] rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Applied Applicants details section (Only visible to the Hirer / Admin / Super Admin) */}
                            {(currentUser.id === job.postedBy.id || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                                    AI Candidates Match Queue ({job.applicants.length})
                                  </h4>
                                </div>

                                {job.applicants.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No applications submitted yet. Students must apply first to activate the Gemini matching scores.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {/* Sort applicants by highest match score */}
                                    {[...job.applicants].sort((a,b) => b.matchScore - a.matchScore).map((app, idx) => (
                                      <div key={app.id} className={`p-3 rounded-xl border transition-all ${
                                        app.status === 'selected' ? 'bg-emerald-50/50 border-emerald-200' :
                                        app.status === 'rejected' ? 'bg-slate-100 border-slate-200 opacity-60' :
                                        idx === 0 ? 'bg-sky-50/30 border-sky-100 ring-1 ring-sky-300' : 'bg-slate-50 border-slate-200'
                                      }`}>
                                        <div className="flex justify-between items-start gap-2">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold text-slate-800">{app.applicantName}</span>
                                              {idx === 0 && app.status === 'pending' && (
                                                <span className="bg-sky-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-1 py-0.2 rounded font-mono">Top Pick</span>
                                              )}
                                              {app.status === 'selected' && (
                                                <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase px-1 py-0.2 rounded">Hired</span>
                                              )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{app.applicantEmail}</p>
                                          </div>

                                          <div className="text-right">
                                            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black font-mono ${
                                              app.matchScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                              app.matchScore >= 50 ? 'bg-sky-100 text-sky-800' :
                                              'bg-slate-100 text-slate-600'
                                            }`}>
                                              {app.matchScore}% Match
                                            </span>
                                          </div>
                                        </div>

                                        <p className="text-xs text-slate-600 mt-2 italic bg-white/70 p-2 rounded-lg border border-slate-100 leading-relaxed">
                                          &ldquo;{app.aiRecommendationWhy}&rdquo;
                                        </p>

                                        {/* Action buttons (Only the hiring Faculty member can decide) */}
                                        {job.status === 'open' && currentUser.id === job.postedBy.id && (
                                          <div className="mt-3 flex justify-end gap-2">
                                            <button
                                              onClick={() => handleSelectCandidate(job.id, app.studentId)}
                                              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                            >
                                              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                                              Approve & Hire
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Job Status Banner / Progress */}
                            {job.status !== 'open' && (
                              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  {job.status === 'in_progress' ? (
                                    <>
                                      <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-ping"></span>
                                      <span className="text-slate-600">Contract Active: <strong className="text-slate-800">{job.assignedToName}</strong> is executing</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 text-emerald-500" />
                                      <span className="text-slate-600">Successfully finalized. Student rating: <strong className="text-slate-800">⭐ {job.ratingByHirer}/5</strong></span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Actions Footer */}
                          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-mono">Posted: {new Date(job.postedAt).toLocaleDateString()}</span>

                            <div className="flex gap-2">
                              {/* Student view: Apply buttons */}
                              {currentUser.role === UserRole.STUDENT && job.status === 'open' && (
                                <button
                                  onClick={() => handleApply(job.id)}
                                  disabled={hasApplied || isApplying[job.id]}
                                  className={`font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm ${
                                    hasApplied
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-slate-900/15'
                                  }`}
                                >
                                  {isApplying[job.id] ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Calibrating AI Match...
                                    </>
                                  ) : hasApplied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      Applied (Match Active)
                                    </>
                                  ) : (
                                    <>
                                      Apply Now
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                              )}

                              {/* Student view indicator for their assigned work */}
                              {currentUser.role === UserRole.STUDENT && isAssignedToCurrent && job.status === 'in_progress' && (
                                <span className="bg-sky-100 text-sky-800 font-bold text-xs px-3 py-1.5 rounded-lg border border-sky-200">
                                  You are hired & working on this!
                                </span>
                              )}

                              {/* Hirer view: Finalize & Complete Button */}
                              {currentUser.id === job.postedBy.id && job.status === 'in_progress' && (
                                <button
                                  onClick={() => setCompletingJobId(job.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                >
                                  <Check className="w-4 h-4" />
                                  Complete & Transfer Payout
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Applicant Vetting Control Tower (Admin Queue) */}
            {activeTab === 'admin_queue' && (
              <div className="space-y-6">
                
                {/* Stats row for registration queue */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 shadow-sm border border-slate-200 rounded-2xl relative overflow-hidden" style={{ borderTop: '4px solid #f43f5e' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Pending Registrations</span>
                    <div className="text-3xl font-black text-slate-950 mt-1 font-display">{vettingList.length}</div>
                    <div className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Requires manual ID validation
                    </div>
                  </div>

                  <div className="bg-white p-5 shadow-sm border border-slate-200 rounded-2xl" style={{ borderTop: '4px solid #10b981' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Active Verified Students</span>
                    <div className="text-3xl font-black text-slate-950 mt-1 font-display">
                      {allUsers.filter(u => u.role === UserRole.STUDENT && u.verifiedStatus === 'approved').length}
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-2">100% security clearance</div>
                  </div>

                  <div className="bg-white p-5 shadow-sm border border-slate-200 rounded-2xl" style={{ borderTop: '4px solid #0f172a' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Registered University Faculty</span>
                    <div className="text-3xl font-black text-slate-950 mt-1 font-display">
                      {allUsers.filter(u => u.role === UserRole.FACULTY).length}
                    </div>
                    <div className="text-xs text-slate-400 font-bold mt-2 italic">Institutional publishers</div>
                  </div>
                </div>

                {/* Main Queue Card Container */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest font-display">
                      <span className="w-1.5 h-4 bg-sky-500"></span> Pending Registration Vetting Requests
                    </h2>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                      {vettingList.length} waiting
                    </span>
                  </div>

                  {vettingList.length === 0 ? (
                    <div className="p-12 text-center">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-800">Vetting Queue is Clean!</h3>
                      <p className="text-sm text-slate-500 mt-1">All registered students have passed active credentials clearance.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 font-mono border-b border-slate-100">
                            <th className="px-6 py-4">Applicant Detail</th>
                            <th className="px-6 py-4">Uploaded Campus ID</th>
                            <th className="px-6 py-4">Claimed GPA vs Record</th>
                            <th className="px-6 py-4">Skill Matrix Preview</th>
                            <th className="px-6 py-4 text-right">Gatekeeper Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vettingList.map(user => {
                            // Let's create an illustrative system claim-mismatch alert to fulfill "Risk Flags"
                            // If student is Alice Johnson, simulated GPA mismatch exists (Claimed 1.20 but record has 1.80)
                            const hasGpaMismatch = user.id === 'std-003';
                            
                            return (
                              <tr key={user.id} className={`hover:bg-slate-50/50 transition-all ${hasGpaMismatch ? 'bg-amber-50/20' : ''}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[11px] rounded border border-slate-200">
                                      {user.idCardUrl}
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">✓ Uploaded</span>
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                                  {hasGpaMismatch ? (
                                    <div className="space-y-1">
                                      <div className="text-xs text-amber-700 font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        GPA Claim Mismatch
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        Claimed: <span className="font-bold text-slate-800">{user.gpa}</span> | Registrar: <span className="font-bold text-slate-800">1.80</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm font-bold text-slate-800">
                                      {user.gpa ? `${user.gpa} GPA` : 'N/A'}
                                    </div>
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {user.skills.slice(0, 3).map(skill => (
                                      <span key={skill} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded">
                                        {skill}
                                      </span>
                                    ))}
                                    {user.skills.length > 3 && (
                                      <span className="text-[9px] text-slate-400 italic">+{user.skills.length - 3} more</span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => handleVerifyUser(user.id, 'rejected')}
                                      className="border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => handleVerifyUser(user.id, 'approved')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                    >
                                      Approve Registration
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: Talent Analytics Engine */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-6">
                
                {/* Analytics Key Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-2xl" style={{ borderTop: '4px solid #0f172a' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Simulated Gigs Completed</span>
                    <div className="text-3xl font-black text-slate-900 mt-1 font-display">{stats.completedGigsCount}</div>
                    <div className="text-xs text-sky-600 font-bold mt-2">94% average rating score</div>
                  </div>

                  <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-2xl" style={{ borderTop: '4px solid #0f172a' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cash Circulation</span>
                    <div className="text-3xl font-black text-slate-900 mt-1 font-display">₱{stats.totalPayoutsCirculated.toLocaleString()}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-2">Zero tuition fee defaults</div>
                  </div>

                  <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-2xl" style={{ borderTop: '4px solid #0f172a' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Job Categories</span>
                    <div className="text-3xl font-black text-slate-900 mt-1 font-display">{stats.jobsByCategory.length}</div>
                    <div className="text-xs text-slate-400 font-bold mt-2 italic">Institutional + Peer-to-peer</div>
                  </div>

                  <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-2xl" style={{ borderTop: '4px solid #f43f5e' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Primary Skill Gap</span>
                    <div className="text-3xl font-black text-rose-600 mt-1 font-display">Python</div>
                    <div className="text-xs text-rose-500 font-bold mt-2">Immediate training advised</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Skill Deficits - Supply vs Demand visual progress list */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
                        <span className="w-1.5 h-4 bg-sky-500"></span> Live Supply vs Demand Talent Deficit Analysis
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Dynamic Campus Matrix</span>
                    </div>

                    <div className="space-y-5 flex-1 justify-center">
                      {stats.skillsDeficit.map(item => {
                        const pctSupply = (item.supply / item.demand) * 100;
                        const isHighDeficit = pctSupply < 50;
                        
                        return (
                          <div key={item.skill} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-800">{item.skill}</span>
                              <span className={isHighDeficit ? 'text-rose-600' : 'text-emerald-600'}>
                                {item.supply} Supply vs {item.demand} Demand
                              </span>
                            </div>
                            
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isHighDeficit ? 'bg-rose-500' : 'bg-sky-500'
                                }`}
                                style={{ width: `${Math.min(100, pctSupply)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>Supply satisfaction</span>
                              <span>{Math.round(pctSupply)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Talent recommendation insights */}
                  <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-sky-500/10 rounded-full border border-sky-500/20"></div>
                    
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-sky-400 mb-6 font-display">Talent Analytics Engine</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono">
                        AI MODEL: gemini-3.5-flash <br />
                        INTEL REPORT SEC_RE_992
                      </p>
                      
                      <div className="space-y-3 pt-4">
                        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-sky-400" />
                            Python Deficit Criticality
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Faculty Marine biology and seagrass research projects are severely bottlenecked by a deficit in Excel-to-Python data entry specialists on campus.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            Next Steps Recommendation
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Vetting officers should prioritize approving Computer Studies applicants possessing database or scripting credentials to alleviate Seagrass project blockages.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-400">
                      Recommendation generated on {new Date().toLocaleDateString()} by ISUFST AI Intranet Module.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: Super Admin Configuration */}
            {activeTab === 'maintenance' && config && (
              <div className="space-y-6">
                
                {/* Maintenance controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* System toggles card */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6" style={{ borderTop: '4px solid #f43f5e' }}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Core Safety Toggles</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">System Maintenance Mode</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Toggle switch to pause peak active hiring</p>
                        </div>
                        <button
                          onClick={() => handleUpdateConfig({ isMaintenanceMode: !config.isMaintenanceMode })}
                          className={`w-12 h-6 rounded-full transition-all relative ${
                            config.isMaintenanceMode ? 'bg-rose-500' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            config.isMaintenanceMode ? 'right-1' : 'left-1'
                          }`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Local-Only Intranet Sandbox</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Restrict external IP traffic vectors</p>
                        </div>
                        <button
                          onClick={() => handleUpdateConfig({ isLocalOnly: !config.isLocalOnly })}
                          className={`w-12 h-6 rounded-full transition-all relative ${
                            config.isLocalOnly ? 'bg-sky-500' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            config.isLocalOnly ? 'right-1' : 'left-1'
                          }`}></span>
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-700 block mb-2 font-mono">Automated Backups Frequency</label>
                        <select
                          value={config.backupFrequency}
                          onChange={(e) => handleUpdateConfig({ backupFrequency: e.target.value as any })}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs w-full focus:outline-none"
                        >
                          <option value="hourly">Hourly Automated Snapshots</option>
                          <option value="daily">Daily Cron Recovery Daemon</option>
                          <option value="weekly">Weekly Semestral Breaks Backup</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* AI calibration panel */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6" style={{ borderTop: '4px solid #10b981' }}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Gemini API Tuning</h3>
                    
                    <div className="space-y-4">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                        <Cpu className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Semantic Match Model</h4>
                          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                            Vector-embeddings matched to gemini-3.5-flash with automated temperature fallback calibration.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span>API Model Status:</span>
                          <span className="text-emerald-600 font-bold">ONLINE</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span>Successful Calibrations:</span>
                          <span className="text-slate-800 font-bold">{config.aiRetrainingCount} phases</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span>SSL / Encryption State:</span>
                          <span className="text-emerald-600 font-bold uppercase">{config.sslStatus} (AES-256)</span>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button
                          onClick={handleRetrainAi}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4 text-sky-400" />
                          Optimize Match Algorithms
                        </button>
                        <button
                          onClick={handleTriggerBackup}
                          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Database className="w-4 h-4" />
                          Compile Backup Snapshot
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* System Hardware Status */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6" style={{ borderTop: '4px solid #0f172a' }}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Network / SSL Node Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Lock className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase">SSL Cryptography Certificate</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Status: Active & Secure (Let's Encrypt)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Wifi className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase">ISUFST_SEC Local Firewall</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Policy: Restricted (Inbound 192.168.x.x)</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 leading-relaxed italic">
                        Last localized snapshot captured at <span className="font-bold text-slate-800">{new Date(config.lastBackupTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Activity Logs terminal */}
                <div className="bg-slate-900 text-slate-300 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-300 flex items-center gap-2 font-display">
                      <span className="w-1.5 h-3.5 bg-rose-500"></span> Live Activity & Firewalls Terminal Feed
                    </h3>
                    
                    <button
                      onClick={handleClearLogs}
                      className="bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Logs
                    </button>
                  </div>

                  <div className="p-5 font-mono text-[11px] leading-relaxed space-y-2 max-h-96 overflow-y-auto bg-slate-950/40">
                    {logs.map(log => (
                      <div key={log.id} className="hover:bg-slate-800/30 p-1.5 rounded transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                              log.category === 'security' ? 'bg-rose-950 text-rose-400 border border-rose-900/40' :
                              log.category === 'ai' ? 'bg-sky-950 text-sky-400 border border-sky-900/40' :
                              log.category === 'database' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {log.category}
                            </span>
                            <span className="text-slate-300">{log.description}</span>
                          </div>
                          
                          <div className="text-[10px] text-slate-500 font-mono shrink-0">
                            NodeIP: {log.ipAddress}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Status Bar (Geometric Balance Signature) */}
          <footer className="h-12 bg-slate-100 border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono shrink-0">
            <div className="flex gap-6">
              <span>Intranet Core v2.4.0</span>
              <span>DB State: <span className="text-emerald-600 underline decoration-dotted">Secure Sync</span></span>
              <span>Region Node: ISUFST-SEC-01</span>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Campus Network Secure
              </span>
              <span className="text-slate-300 px-1">|</span>
              <span>© 2026 ISUFST_SEC Systems</span>
            </div>
          </footer>
        </main>
      </div>
      )}

      {/* MODAL: Faculty Post Job Placement */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold font-display">Publish Campus Placement</h3>
                <p className="text-xs text-sky-400 mt-0.5 font-mono">ISUFST_SEC Internal Talent Registry</p>
              </div>
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="text-slate-400 hover:text-white transition-all text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seagrass Biomass Data Analytics Helper"
                  value={newJob.title}
                  onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Placement Category</label>
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob(prev => ({ ...prev, category: e.target.value as JobCategory }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none"
                  >
                    <option value="academic">Academic / Research Assistance</option>
                    <option value="lab_assistance">Laboratory Support</option>
                    <option value="event_staff">Campus Event Staff</option>
                    <option value="personal">Personal / Student-to-Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Budget / Compensation (₱)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="₱ 1000"
                    value={newJob.payout}
                    onChange={(e) => setNewJob(prev => ({ ...prev, payout: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Placement Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe task protocols, expected work hours, specific college courses needed, and deliverable format..."
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Requested Skill Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Microsoft Excel, Data Entry, Python"
                  value={newJob.requiredSkills}
                  onChange={(e) => setNewJob(prev => ({ ...prev, requiredSkills: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Separate skill requirements with commas so our AI algorithm parses matches correctly.</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-2 px-5 rounded-xl shadow-md transition-all"
                >
                  Publish Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Faculty complete job & rate worker */}
      {completingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold font-display">Finalize Placement Contract</h3>
                <p className="text-xs text-emerald-400 mt-0.5 font-mono">Transfer funds & score student helper</p>
              </div>
              <button
                onClick={() => setCompletingJobId(null)}
                className="text-slate-400 hover:text-white transition-all text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCompleteJob} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">Student Work Quality Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setRatingValue(stars)}
                      className={`p-2 rounded-xl text-lg transition-all border ${
                        ratingValue >= stars
                          ? 'bg-amber-50 border-amber-200 text-amber-500 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}
                    >
                      ⭐ {stars}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Intranet Feedback & Testimonial</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Jane was incredibly quick. She formatted all Marine seagrass datasets meticulously."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-2 text-xs text-sky-800 leading-relaxed">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  Finishing this contract releases <strong>₱{jobs.find(j => j.id === completingJobId)?.payout}</strong> from your balance directly into the student's credentials directory balance.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingJobId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider py-2 px-5 rounded-xl shadow-md transition-all"
                >
                  Confirm Completion & Disburse Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
