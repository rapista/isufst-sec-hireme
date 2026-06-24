/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  User,
  Search,
  Sparkles,
  Check,
  Smartphone,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Send,
  HelpCircle,
  CheckCircle2,
  Cpu,
  Bookmark,
  Award,
  ChevronRight,
  RefreshCw,
  SearchCode
} from 'lucide-react';
import { UserProfile, UserRole, JobPost, JobCategory, SystemConfig } from '../types';
import { RoleSwitcher } from './RoleSwitcher';

interface PhoneSimulatorProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  jobs: JobPost[];
  isApplying: Record<string, boolean>;
  onApply: (jobId: string) => Promise<void>;
  onRegister: (formData: any) => Promise<void>;
  onSwitchUser: (userId: string) => void;
  config: SystemConfig | null;
  onRefresh: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  currentUser,
  allUsers,
  jobs,
  isApplying,
  onApply,
  onRegister,
  onSwitchUser,
  config,
  onRefresh
}) => {
  // Mobile sub-tab state inside phone simulator
  const [mobileTab, setMobileTab] = useState<'jobs' | 'register' | 'search_skills' | 'profile'>('jobs');
  
  // Search & Filter state inside phone
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneCategory, setPhoneCategory] = useState<string>('all');
  
  // Peer skills search state (the user can search peer students who can help them!)
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    role: UserRole.STUDENT,
    department: 'College of Computer Studies',
    gpa: '1.75',
    bio: '',
    skills: '',
    courses: '',
    idCardUrl: '',
    availability: 'Mon-Wed-Fri, 1:00 PM - 5:00 PM'
  });
  
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState('');

  // Submit registration form handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regForm.name || !regForm.email || !regForm.department) {
      setRegError('Please fill in Name, Email and Department.');
      return;
    }
    setIsSubmittingReg(true);
    try {
      await onRegister({
        ...regForm,
        courses: regForm.courses.split(',').map(c => c.trim()).filter(Boolean),
        skills: regForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setMobileTab('profile'); // Send them to their profile to show the "Pending" status!
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Filter jobs based on phone states
  const phoneFilteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(phoneSearch.toLowerCase()) ||
        job.description.toLowerCase().includes(phoneSearch.toLowerCase()) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(phoneSearch.toLowerCase()));
      const matchesCategory = phoneCategory === 'all' || job.category === phoneCategory;
      return matchesSearch && matchesCategory;
    });
  }, [jobs, phoneSearch, phoneCategory]);

  // Find other students who are approved and have specific skills for AI matching
  const matchingStudents = useMemo(() => {
    if (!skillSearchQuery) {
      // Return approved students by default
      return allUsers.filter(u => u.role === UserRole.STUDENT && u.verifiedStatus === 'approved');
    }
    const query = skillSearchQuery.toLowerCase();
    return allUsers
      .filter(u => u.role === UserRole.STUDENT && u.verifiedStatus === 'approved')
      .map(student => {
        // Simple AI/Semantic match algorithm simulator based on searched skills
        let score = 30; // base score
        let matchedCount = 0;
        student.skills.forEach(s => {
          if (s.toLowerCase().includes(query) || query.includes(s.toLowerCase())) {
            score += 20;
            matchedCount++;
          }
        });
        student.courses?.forEach(c => {
          if (c.toLowerCase().includes(query)) {
            score += 10;
            matchedCount++;
          }
        });
        score = Math.min(100, score);
        return { student, score, matchedCount };
      })
      .sort((a, b) => b.score - a.score);
  }, [allUsers, skillSearchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full px-4 py-6">
      
      {/* LEFT SIDE: Beautiful Simulator Explanation & Walkthrough */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-sky-500/10 rounded-2xl text-sky-400">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-sky-400 font-mono font-bold block">Architecture Simulation</span>
              <h2 className="text-xl font-bold font-display leading-none">Strict Mobile Access Policy</h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              Under current university security constraints, <strong className="text-white">Students</strong> and <strong className="text-white">Faculty / Staff</strong> can strictly only use 
              the mobile client application (simulated here on the right).
            </p>
            <p className="text-xs bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 font-mono text-slate-400">
              💡 <span className="text-emerald-400 font-bold">Admin Controls:</span> The wide-screen desktop dashboard you saw earlier is reserved exclusively for the <strong>Registrar Admins</strong> to approve student accounts and manage the security vetting gate.
            </p>
          </div>

          {/* Interactive instruction step card */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Try the Gatekeeper Flow:
            </h3>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Click the phone's top role switcher and select <span className="text-sky-300 font-bold">Create New Profile</span> (or register via Register tab).</li>
              <li>Fill in the student details and click submit. Your profile status is marked as <span className="text-amber-500 font-bold font-mono">PENDING APPROVAL</span>.</li>
              <li>Use the Switch Persona card to swap to <strong className="text-white">Dean Amanda Solis (Admin)</strong>.</li>
              <li>The system will auto-load the <strong className="text-white">Desktop View</strong>, opening the Vetting Control Tower!</li>
              <li>Click <strong className="text-emerald-400">Approve</strong> to activate the student so they can use the AI matching system.</li>
            </ol>
          </div>
        </div>

        {/* AI Matching System overview card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
            <Cpu className="w-5 h-5 text-sky-500" />
            AI-Matching Capabilities
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every job application automatically invokes the <strong>Gemini 3.5 Flash Matching Engine</strong>. 
            The system weighs GPA claims, student certificates, and course backgrounds against faculty requirements to rank recommendations.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] font-mono text-slate-500">
            <div className="flex justify-between">
              <span>Model Node:</span>
              <span className="text-emerald-600 font-bold">gemini-3.5-flash</span>
            </div>
            <div className="flex justify-between">
              <span>Embedding Vector:</span>
              <span className="text-sky-600 font-bold">Active Match Matrix</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Gorgeous iPhone Simulator Case */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-[390px] h-[820px] bg-slate-950 rounded-[56px] p-3.5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.4)] border-[6px] border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-slate-900/5 select-none">
          
          {/* Phone Speaker Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-3xl z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
            {/* Camera dot */}
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3 mb-1 ring-1 ring-slate-800"></div>
          </div>

          {/* Simulated Mobile Status Bar */}
          <div className="h-10 bg-slate-900 text-slate-400 px-6 pt-2 pb-1 flex justify-between items-center text-[11px] font-bold font-mono z-30 shrink-0">
            <span>12:45 <span className="text-[9px]">PM</span></span>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[9px] font-bold bg-slate-800 px-1 py-0.2 rounded text-emerald-400">5G</span>
              <span>100%</span>
              {/* Battery */}
              <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-0.5 flex items-center">
                <div className="bg-emerald-500 h-full w-full rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Simulated Mobile screen inner container */}
          <div className="flex-1 bg-slate-50 flex flex-col rounded-[38px] overflow-hidden relative text-slate-900 font-sans select-none">
            
            {/* Mini Mobile Header */}
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 shrink-0 flex items-center justify-between shadow-sm z-20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-sky-500 rounded flex items-center justify-center font-bold text-slate-950 italic text-sm">HM</div>
                <div>
                  <h1 className="text-sm font-bold font-display">HireMe Mobile</h1>
                  <p className="text-[8px] text-sky-400 font-mono tracking-widest uppercase">ISUFST INTRANET</p>
                </div>
              </div>

              {/* Refresh Sync Button */}
              <button onClick={onRefresh} className="text-slate-400 hover:text-white transition-all p-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
              </button>
            </div>

            {/* Mobile User Context Header */}
            <div className="p-3 bg-slate-950 text-white border-b border-slate-800 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full border border-slate-700 shrink-0 object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{currentUser.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono truncate">{currentUser.role}</p>
                </div>
              </div>

              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                currentUser.verifiedStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                currentUser.verifiedStatus === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {currentUser.verifiedStatus}
              </span>
            </div>

            {/* Main Phone viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-slate-50">
              
              {/* Alert pending verification banner inside app */}
              {currentUser.role === UserRole.STUDENT && currentUser.verifiedStatus !== 'approved' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-xs flex gap-2 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Vetting Approval Required</h4>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-normal">
                      Your institutional profile has been sent to the Admin queue for GPA validation and ID clearance. 
                    </p>
                    <div className="mt-2 text-[10px] bg-white/60 p-1.5 rounded border border-amber-200 font-mono text-amber-800">
                      ID card claim: <span className="font-bold">{currentUser.idCardUrl}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 1: Active Jobs Marketplace */}
              {mobileTab === 'jobs' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Available Gigs</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{phoneFilteredJobs.length} active</span>
                  </div>

                  {/* Tiny Job Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search jobs or required skills..."
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Filter Categories badges */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                    <button
                      onClick={() => setPhoneCategory('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${
                        phoneCategory === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      All
                    </button>
                    {(['academic', 'lab_assistance', 'event_staff', 'personal'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setPhoneCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all capitalize shrink-0 ${
                          phoneCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {cat.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Jobs List inside phone */}
                  <div className="space-y-3">
                    {phoneFilteredJobs.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                        <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No placements match your filter.</p>
                      </div>
                    ) : (
                      phoneFilteredJobs.map(job => {
                        const hasApplied = job.applicants.some(a => a.studentId === currentUser.id);
                        const isAssigned = job.assignedTo === currentUser.id;
                        
                        return (
                          <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-800 text-[8px] font-bold font-mono uppercase rounded-sm">
                                  {job.category}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 mt-1">{job.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">By {job.postedBy.name} • {job.postedBy.department}</p>
                              </div>
                              <span className="text-xs font-bold text-slate-800">₱{job.payout}</span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2">{job.description}</p>
                            
                            {/* Skills Tag block */}
                            <div className="flex flex-wrap gap-1">
                              {job.requiredSkills.map(skill => (
                                <span key={skill} className="px-1.5 py-0.2 bg-slate-50 border border-slate-150 text-slate-500 font-mono text-[9px] rounded-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {/* Applied detail */}
                            {hasApplied && (
                              <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-1.5 text-[10px] text-emerald-800">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Applied with AI Match Score active!</span>
                              </div>
                            )}

                            {isAssigned && (
                              <div className="mt-2 p-2 bg-sky-50 rounded-lg border border-sky-100 flex items-center gap-1.5 text-[10px] text-sky-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                                <span>You are hired for this gig contract!</span>
                              </div>
                            )}

                            {/* Apply trigger */}
                            {currentUser.role === UserRole.STUDENT && job.status === 'open' && !hasApplied && (
                              <button
                                onClick={() => onApply(job.id)}
                                disabled={isApplying[job.id]}
                                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                              >
                                {isApplying[job.id] ? (
                                  <>
                                    <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Syncing Gemini Match...
                                  </>
                                ) : (
                                  <>
                                    Ask for Job (Submit Fit)
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: Register New Profile inside Phone */}
              {mobileTab === 'register' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-sky-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Create Profile</h3>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
                    {regError && (
                      <p className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2 rounded">{regError}</p>
                    )}

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maria Clara"
                        value={regForm.name}
                        onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Institutional Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. maria.clara@isufst.edu.ph"
                        value={regForm.email}
                        onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Role Type</label>
                        <select
                          value={regForm.role}
                          onChange={(e) => setRegForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                        >
                          <option value={UserRole.STUDENT}>Student</option>
                          <option value={UserRole.FACULTY}>Faculty / Staff</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Claimed GPA</label>
                        <input
                          type="text"
                          placeholder="e.g. 1.45"
                          value={regForm.gpa}
                          onChange={(e) => setRegForm(prev => ({ ...prev, gpa: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Campus Department</label>
                      <select
                        value={regForm.department}
                        onChange={(e) => setRegForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      >
                        <option value="College of Computer Studies">College of Computer Studies</option>
                        <option value="College of Fisheries & Aquatic Sciences">College of Fisheries & Aquatic Sciences</option>
                        <option value="College of Education">College of Education</option>
                        <option value="IT Infrastructure Department">IT Infrastructure Department</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Skills (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Excel, Java, Python, Tutoring"
                        value={regForm.skills}
                        onChange={(e) => setRegForm(prev => ({ ...prev, skills: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Upload Campus ID (Details)</label>
                      <input
                        type="text"
                        placeholder="e.g. ISUFST-STUDENT-2026-9912"
                        value={regForm.idCardUrl}
                        onChange={(e) => setRegForm(prev => ({ ...prev, idCardUrl: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono">Short Biography</label>
                      <textarea
                        rows={2}
                        placeholder="Explain your goals or active research focus..."
                        value={regForm.bio}
                        onChange={(e) => setRegForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReg}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                    >
                      {isSubmittingReg ? 'Syncing Profile...' : 'Submit Profile for Vetting'}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 3: Peer Assistance & Skills AI Search */}
              {mobileTab === 'search_skills' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Peer Skill Finder</h3>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono font-bold">AI Match</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    Search specific skills (e.g. &ldquo;Excel&rdquo; or &ldquo;Python&rdquo;) to find peers who can help you with tasks, showing instant AI Match compatibility.
                  </p>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type a skill (e.g. Python, Excel, SQL)..."
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>

                  {/* Matching peers cards */}
                  <div className="space-y-2">
                    {matchingStudents.map(({ student, score, matchedCount }) => (
                      <div key={student.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 items-center">
                            <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{student.name}</h4>
                              <p className="text-[9px] text-slate-400">{student.department}</p>
                            </div>
                          </div>

                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black font-mono ${
                            score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            score >= 50 ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {score}% Match
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-2 italic">&ldquo;{student.bio}&rdquo;</p>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {student.skills.map(skill => {
                            const isMatch = skillSearchQuery && skill.toLowerCase().includes(skillSearchQuery.toLowerCase());
                            return (
                              <span
                                key={skill}
                                className={`px-1.5 py-0.2 rounded-xs text-[9px] font-mono border ${
                                  isMatch 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 4: User Mobile Profile Detail */}
              {mobileTab === 'profile' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center space-y-3 relative">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-16 h-16 rounded-full mx-auto border-2 border-slate-200 object-cover" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
                      <p className="text-xs text-slate-400">{currentUser.email}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{currentUser.department}</p>
                    </div>

                    <div className="flex justify-center gap-1.5">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        Rating: ⭐ {currentUser.rating}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        Completed: {currentUser.completedGigs}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 text-left space-y-2 text-[11px] text-slate-600">
                      <div>
                        <strong className="text-slate-800 font-mono text-[9px] uppercase tracking-wider block">Bio:</strong>
                        <p>{currentUser.bio || "No biography details set."}</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 font-mono text-[9px] uppercase tracking-wider block">Availability:</strong>
                        <p>{currentUser.availability}</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 font-mono text-[9px] uppercase tracking-wider block">Verified Credentials Check:</strong>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${currentUser.verifiedStatus === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span className="font-mono text-[10px] capitalize font-bold text-slate-700">{currentUser.verifiedStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet details on phone */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2">
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block">Wallet / Balance</span>
                    <div className="text-xl font-black text-white">₱{currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <p className="text-[9px] text-sky-300">Intranet payout ledger synchronized.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Mobile bottom navigation bar */}
            <div className="h-14 bg-slate-900 border-t border-slate-800 flex justify-around items-center shrink-0 z-20">
              <button
                onClick={() => setMobileTab('jobs')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${mobileTab === 'jobs' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Gigs</span>
              </button>

              <button
                onClick={() => setMobileTab('search_skills')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${mobileTab === 'search_skills' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
              >
                <SearchCode className="w-4 h-4" />
                <span>Skills Match</span>
              </button>

              <button
                onClick={() => setMobileTab('register')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${mobileTab === 'register' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
              >
                <Plus className="w-4 h-4" />
                <span>Register</span>
              </button>

              <button
                onClick={() => setMobileTab('profile')}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold ${mobileTab === 'profile' ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>
            </div>

            {/* Home indicator bar */}
            <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0 select-none z-20">
              <div className="w-28 h-1 bg-slate-700 rounded-full mb-1"></div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
