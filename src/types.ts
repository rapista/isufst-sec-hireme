/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STUDENT = "Student",
  FACULTY = "Faculty / Staff",
  ADMIN = "Admin",
  SUPER_ADMIN = "Super Admin"
}

export type UserVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  department: string;
  verifiedStatus: UserVerificationStatus;
  idCardUrl: string; // Simulated path or visual card
  registrationDate: string;
  gpa?: number; // Students only
  courses?: string[]; // Students only
  certificates: string[];
  skills: string[];
  rating: number;
  completedGigs: number;
  balance: number;
  availability: string; // e.g., "Mon-Wed-Fri, 2-5 PM"
  bio: string;
}

export type JobCategory = 'academic' | 'lab_assistance' | 'event_staff' | 'general' | 'personal';
export type JobStatus = 'open' | 'in_progress' | 'completed';

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  applicantName: string;
  applicantEmail: string;
  applicantSkills: string[];
  appliedAt: string;
  status: 'pending' | 'selected' | 'rejected';
  matchScore: number; // AI match score percent (0-100)
  aiRecommendationWhy: string; // Dynamic Gemini breakdown of why they fit
}

export interface JobPost {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  status: JobStatus;
  postedBy: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
  };
  postedAt: string;
  payout: number;
  requiredSkills: string[];
  applicants: Application[];
  assignedTo?: string; // studentId
  assignedToName?: string;
  ratingByHirer?: number;
  ratingByWorker?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'user' | 'job' | 'database' | 'ai' | 'security';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
  userAgent: string;
}

export interface SystemConfig {
  isMaintenanceMode: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  lastBackupTime: string;
  sslStatus: 'active' | 'updating' | 'expired';
  aiRetrainingCount: number;
  isAiOptimized: boolean;
  isLocalOnly: boolean; // campus-only firewall simulated
}

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  activeJobsCount: number;
  completedGigsCount: number;
  totalPayoutsCirculated: number;
  skillsDeficit: { skill: string; demand: number; supply: number }[];
  jobsByCategory: { category: string; count: number }[];
}
