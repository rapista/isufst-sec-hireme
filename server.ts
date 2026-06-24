/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { UserRole, UserProfile, JobPost, ActivityLog, SystemConfig, Application, JobCategory } from "./src/types.js";

// Load environment variables
dotenv.config();

// Initialize Gemini client (Lazy initialization to prevent crash if key is missing)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini client successfully initialized.");
      } catch (err) {
        console.error("Failed to initialize Gemini client:", err);
      }
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// Mock Database State
// ----------------------------------------------------

let users: UserProfile[] = [
  {
    id: "std-001",
    name: "Jane Doe",
    email: "janedoe@isufst.edu.ph",
    role: UserRole.STUDENT,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    department: "College of Computer Studies",
    verifiedStatus: "approved",
    idCardUrl: "ISUFST-STUDENT-2024-8842",
    registrationDate: "2024-06-15",
    gpa: 1.45,
    courses: ["Web Development II", "Database Management Systems", "Software Engineering", "Artificial Intelligence Basics"],
    certificates: ["Oracle Database Foundations", "AWS Certified Cloud Practitioner"],
    skills: ["React", "TypeScript", "Node.js", "Express", "SQL", "Tailwind CSS", "Technical Writing"],
    rating: 4.9,
    completedGigs: 12,
    balance: 2450.00,
    availability: "Mon, Wed, Fri (1:00 PM - 5:00 PM)",
    bio: "Passionate Computer Science junior focused on full-stack web development. Eager to assist in research, database optimization, or peer tutoring."
  },
  {
    id: "std-002",
    name: "John Smith",
    email: "johnsmith@isufst.edu.ph",
    role: UserRole.STUDENT,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    department: "College of Fisheries & Aquatic Sciences",
    verifiedStatus: "approved",
    idCardUrl: "ISUFST-STUDENT-2023-4109",
    registrationDate: "2023-09-10",
    gpa: 1.75,
    courses: ["Marine Ecology", "Limnology", "Oceanography Lab", "Excel for Biologists"],
    certificates: ["PADI Open Water Diver", "Bureau of Fisheries Lab Assistant Certificate"],
    skills: ["Microsoft Excel", "Data Entry", "Marine Sample Collection", "Water Quality Analysis", "Filipino Translation"],
    rating: 4.7,
    completedGigs: 8,
    balance: 900.00,
    availability: "Tue, Thu (8:00 AM - 12:00 PM), Sat (All Day)",
    bio: "Fisheries student passionate about marine biology conservation. Experienced in field data collection and conducting laboratory water quality assays."
  },
  {
    id: "std-003",
    name: "Alice Johnson",
    email: "alicej@isufst.edu.ph",
    role: UserRole.STUDENT,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    department: "College of Education",
    verifiedStatus: "pending",
    idCardUrl: "ISUFST-STUDENT-2025-1024", // Pending approval!
    registrationDate: "2026-06-20",
    gpa: 1.20, // Wait, registrar record shows 1.80 (Demonstrate mismatch alert!)
    courses: ["Educational Technology", "Child Development", "English Communication"],
    certificates: ["TEFL Certificate (120 hours)"],
    skills: ["Tutoring", "Academic Writing", "English", "Presentation Design", "Canva", "Classroom Management"],
    rating: 5.0,
    completedGigs: 0,
    balance: 0.00,
    availability: "Mon to Fri (4:00 PM - 7:00 PM)",
    bio: "Education major hoping to offer tutoring classes to freshmen or assist professors in preparing lesson plans, slides, and educational aids."
  },
  {
    id: "fac-001",
    name: "Dr. Robert Chen",
    email: "robert.chen@isufst.edu.ph",
    role: UserRole.FACULTY,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    department: "College of Fisheries & Aquatic Sciences",
    verifiedStatus: "approved",
    idCardUrl: "ISUFST-FACULTY-1998-3312",
    registrationDate: "2018-02-01",
    certificates: ["PhD in Marine Biology", "Senior Research Fellow Certificate"],
    skills: ["Marine Biology", "Academic Research", "Grant Writing", "Data Analysis", "Python"],
    rating: 4.8,
    completedGigs: 0,
    balance: 15400.00,
    availability: "Mon-Fri (9:00 AM - 5:00 PM)",
    bio: "Senior Researcher and Professor leading local research on seagrass biomass and sustainability in Iloilo coastal areas."
  },
  {
    id: "fac-002",
    name: "Prof. Jenkins",
    email: "sarah.jenkins@isufst.edu.ph",
    role: UserRole.FACULTY,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    department: "College of Computer Studies",
    verifiedStatus: "approved",
    idCardUrl: "ISUFST-FACULTY-2015-4421",
    registrationDate: "2020-07-15",
    certificates: ["MSc in Information Technology", "CISCO Instructor Certified"],
    skills: ["Network Security", "Linux Systems", "Curriculum Design", "Python", "Cloud Architecture"],
    rating: 5.0,
    completedGigs: 0,
    balance: 8000.00,
    availability: "Mon-Thu (10:00 AM - 4:00 PM)",
    bio: "Associate Professor in IT. Actively organizing upcoming campus programming bootcamps and network infrastructure upgrades."
  },
  {
    id: "adm-001",
    name: "Dean Amanda Solis",
    email: "amanda.solis@isufst.edu.ph",
    role: UserRole.ADMIN,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    department: "Campus Academic Affairs",
    verifiedStatus: "approved",
    idCardUrl: "ISUFST-ADMIN-2010-0012",
    registrationDate: "2010-05-20",
    certificates: ["Educational Leadership Doctorate", "University Quality Auditor"],
    skills: ["Academic Oversight", "Vetting", "HR Coordination", "Student Affairs"],
    rating: 5.0,
    completedGigs: 0,
    balance: 50000.00,
    availability: "Mon-Fri (8:00 AM - 5:00 PM)",
    bio: "Head of Vetting and Student Employment Coordination. Oversees campus compliance and administrative validation queues."
  },
  {
    id: "sadm-001",
    name: "Mark Leo (IT Support)",
    email: "mark.leo@isufst.edu.ph",
    role: UserRole.SUPER_ADMIN,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    department: "IT Infrastructure Department",
    verifiedStatus: "approved",
    idCardUrl: "ISUFST-SYS-IT-0001",
    registrationDate: "2022-01-10",
    certificates: ["CompTIA Security+", "Red Hat Certified System Administrator"],
    skills: ["System Administration", "Network Firewalls", "Database Backups", "AI Model Tuning"],
    rating: 5.0,
    completedGigs: 0,
    balance: 12000.00,
    availability: "On Call 24/7",
    bio: "Lead Systems Administrator for the ISUFST_SEC community intranet and AI engine integration."
  }
];

let jobs: JobPost[] = [
  {
    id: "job-001",
    title: "Marine Biology Research Excel Data Entry",
    description: "Looking for an meticulous student to encode local marine biology research records, seagrass measurements, and coastal coordinates into Excel spreadsheets. Requires basic knowledge of marine terms and expert Excel spreadsheet management.",
    category: "academic",
    status: "open",
    postedBy: {
      id: "fac-001",
      name: "Dr. Robert Chen",
      email: "robert.chen@isufst.edu.ph",
      role: UserRole.FACULTY,
      department: "College of Fisheries & Aquatic Sciences"
    },
    postedAt: "2026-06-21T10:00:00Z",
    payout: 850.00,
    requiredSkills: ["Microsoft Excel", "Data Entry", "Marine Sample Collection", "Water Quality Analysis"],
    applicants: [
      {
        id: "app-001",
        jobId: "job-001",
        studentId: "std-002",
        applicantName: "John Smith",
        applicantEmail: "johnsmith@isufst.edu.ph",
        applicantSkills: ["Microsoft Excel", "Data Entry", "Marine Sample Collection", "Water Quality Analysis", "Filipino Translation"],
        appliedAt: "2026-06-22T08:30:00Z",
        status: "pending",
        matchScore: 95,
        aiRecommendationWhy: "Excellent alignment. John is a Fisheries student who has completed 'Excel for Biologists' and holds certificates in fisheries labs. His core skills overlap perfectly with the requirements."
      },
      {
        id: "app-002",
        jobId: "job-001",
        studentId: "std-001",
        applicantName: "Jane Doe",
        applicantEmail: "janedoe@isufst.edu.ph",
        applicantSkills: ["React", "TypeScript", "Node.js", "Express", "SQL", "Tailwind CSS", "Technical Writing"],
        appliedAt: "2026-06-22T09:15:00Z",
        status: "pending",
        matchScore: 60,
        aiRecommendationWhy: "Partial alignment. While Jane is a highly capable Computer Studies student with strong analytical and technical writing skills, she lacks specific biology domain knowledge and lab experience required for advanced validation."
      }
    ]
  },
  {
    id: "job-002",
    title: "Computer Studies Helpdesk Support",
    description: "Seeking a student technician to assist in managing laboratory network setups, debugging Linux workstations, and installing software updates for upcoming IT classes.",
    category: "lab_assistance",
    status: "open",
    postedBy: {
      id: "fac-002",
      name: "Prof. Jenkins",
      email: "sarah.jenkins@isufst.edu.ph",
      role: UserRole.FACULTY,
      department: "College of Computer Studies"
    },
    postedAt: "2026-06-22T14:30:00Z",
    payout: 1200.00,
    requiredSkills: ["React", "TypeScript", "Node.js", "SQL"],
    applicants: [
      {
        id: "app-003",
        jobId: "job-002",
        studentId: "std-001",
        applicantName: "Jane Doe",
        applicantEmail: "janedoe@isufst.edu.ph",
        applicantSkills: ["React", "TypeScript", "Node.js", "Express", "SQL", "Tailwind CSS", "Technical Writing"],
        appliedAt: "2026-06-23T10:00:00Z",
        status: "pending",
        matchScore: 98,
        aiRecommendationWhy: "Prime Candidate. Jane is a stellar junior in Computer Studies with direct expertise in the required technology stack (React, TypeScript, Node.js) and is currently excelling in Web Dev II and software engineering."
      }
    ]
  }
];

let activityLogs: ActivityLog[] = [
  {
    id: "log-001",
    timestamp: "2026-06-23T11:00:00Z",
    category: "security",
    description: "ISUFST_SEC Local Firewall rule applied. Restricting external traffic to trusted local campus ranges.",
    severity: "info",
    ipAddress: "192.168.10.1",
    userAgent: "System Intranet Engine"
  },
  {
    id: "log-002",
    timestamp: "2026-06-23T12:30:00Z",
    category: "database",
    description: "Weekly automated campus backup successfully validated and saved securely in server-node-B.",
    severity: "info",
    ipAddress: "127.0.0.1",
    userAgent: "Backup Cron Daemon"
  },
  {
    id: "log-003",
    timestamp: "2026-06-23T14:15:00Z",
    category: "ai",
    description: "Gemini semantic-matching matrix calibrated with latest successful student contracts.",
    severity: "info",
    ipAddress: "192.168.10.15",
    userAgent: "AI Training Pipeline"
  }
];

let systemConfig: SystemConfig = {
  isMaintenanceMode: false,
  backupFrequency: "daily",
  lastBackupTime: "2026-06-23T12:30:00Z",
  sslStatus: "active",
  aiRetrainingCount: 4,
  isAiOptimized: true,
  isLocalOnly: true
};

// ----------------------------------------------------
// AI Skill-Matching Calculation Logic
// ----------------------------------------------------

async function calculateMatchWithGemini(jobTitle: string, jobDescription: string, requiredSkills: string[], student: UserProfile): Promise<{ matchScore: number; explanation: string }> {
  const gemini = getGeminiClient();
  const studentDetails = `
Name: ${student.name}
Department: ${student.department}
Skills: ${student.skills.join(", ")}
Courses: ${(student.courses || []).join(", ")}
Certificates: ${student.certificates.join(", ")}
GPA: ${student.gpa || "N/A"}
Bio: ${student.bio}
`;

  if (gemini) {
    try {
      console.log(`Analyzing application using Gemini API. Model: gemini-3.5-flash`);
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following student profile for compatibility with this campus job posting. 
Calculate a matchScore (0 to 100) based on how well their skills, courses, certificates, and background fit.
Provide a clear, engaging 2-3 sentence breakdown explaining why they fit, what matches, or if they have gaps.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}
REQUIRED SKILLS: ${requiredSkills.join(", ")}

STUDENT PROFILE:
${studentDetails}
`,
        config: {
          systemInstruction: "You are the HR Vetting Coordinator AI for ISUFST_SEC campus job board. You evaluate student fit for peer-to-peer and faculty jobs objectively.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: {
                type: Type.INTEGER,
                description: "Integer score from 0 to 100 representing compatibility."
              },
              aiRecommendationWhy: {
                type: Type.STRING,
                description: "2-3 sentence explanation of the score and fit details."
              }
            },
            required: ["matchScore", "aiRecommendationWhy"]
          }
        }
      });

      const text = response.text?.trim() || "";
      const parsed = JSON.parse(text);
      return {
        matchScore: parsed.matchScore || 50,
        explanation: parsed.aiRecommendationWhy || "Calculated matches on background compatibility."
      };
    } catch (err) {
      console.error("Gemini semantic analysis failed, executing localized calculation fallback:", err);
    }
  }

  // Fallback localized logic
  console.log("Using localized matchmaking algorithm fallback.");
  let matchCount = 0;
  const matchedSkills: string[] = [];
  requiredSkills.forEach(req => {
    if (student.skills.some(s => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))) {
      matchCount++;
      matchedSkills.push(req);
    }
  });

  const percentOverlap = requiredSkills.length > 0 ? (matchCount / requiredSkills.length) * 100 : 50;
  const matchScore = Math.min(100, Math.max(20, Math.round(percentOverlap + (student.gpa ? (4 - student.gpa) * 10 : 10))));
  
  let explanation = "";
  if (matchScore >= 80) {
    explanation = `Excellent localized alignment of ${matchScore}%. ${student.name} possesses key requested skills including ${matchedSkills.join(", ") || "essential tools"}. Their academic achievements in ${student.department} indicate highly proficient output potential.`;
  } else if (matchScore >= 50) {
    explanation = `Moderate match score of ${matchScore}%. Student has foundational knowledge of ${matchedSkills.join(", ") || "some requirements"} but may require short initial training regarding specific lab protocols or deep domain tasks.`;
  } else {
    explanation = `Basic compatibility of ${matchScore}%. Major skill gaps exist. While highly qualified in other fields, the student's primary focus in ${student.department} has lower technical overlap with the current task requirements.`;
  }

  return { matchScore, explanation };
}

// ----------------------------------------------------
// Express App Server Setup
// ----------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser
  app.use(express.json());

  // 1. Get current logged-in user context
  let currentUserId = "fac-001"; // Default role to Faculty Chen to show jobs easily
  
  app.get("/api/auth/me", (req, res) => {
    const user = users.find(u => u.id === currentUserId);
    res.json(user || users[0]);
  });

  app.post("/api/auth/switch", (req, res) => {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
      currentUserId = userId;
      // Add trace log
      activityLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: "user",
        description: `User switched session active role to ${user.name} (${user.role}).`,
        severity: "info",
        ipAddress: "127.0.0.1",
        userAgent: "Browser Intrusion Node"
      });
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // 2. Users Endpoint
  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      activityLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: "user",
        description: `Profile credentials updated for ${users[index].name} (${users[index].role}).`,
        severity: "info",
        ipAddress: "127.0.0.1",
        userAgent: "ISUFST Central Directory"
      });
      res.json(users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Verification & Vetting Pipeline (Gatekeeper approval)
  app.post("/api/users/:id/verify", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'
    const adminUser = users.find(u => u.id === currentUserId);

    if (!adminUser || (adminUser.role !== UserRole.ADMIN && adminUser.role !== UserRole.SUPER_ADMIN)) {
      return res.status(403).json({ error: "Unauthorized. Vetting queue actions are reserved for Admins." });
    }

    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].verifiedStatus = status;
      activityLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: "security",
        description: `Vetting Queue: ${users[index].name} has been ${status.toUpperCase()} by Admin ${adminUser.name}.`,
        severity: status === 'approved' ? 'info' : 'warning',
        ipAddress: "192.168.10.45",
        userAgent: "Academic Vetting Portal"
      });
      res.json(users[index]);
    } else {
      res.status(404).json({ error: "User profile not found in verification queue." });
    }
  });

  // 3. Jobs Endpoint
  app.get("/api/jobs", (req, res) => {
    res.json(jobs);
  });

  app.post("/api/jobs", (req, res) => {
    const { title, description, category, payout, requiredSkills } = req.body;
    const poster = users.find(u => u.id === currentUserId);

    if (!poster) {
      return res.status(404).json({ error: "Poster session not found." });
    }

    const newJob: JobPost = {
      id: `job-${Date.now()}`,
      title,
      description,
      category,
      status: 'open',
      postedBy: {
        id: poster.id,
        name: poster.name,
        email: poster.email,
        role: poster.role,
        department: poster.department
      },
      postedAt: new Date().toISOString(),
      payout: Number(payout) || 500,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      applicants: []
    };

    jobs.unshift(newJob);

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "job",
      description: `New institutional role posted: "${title}" by ${poster.name} (Budget: ₱${payout}).`,
      severity: "info",
      ipAddress: "127.0.0.1",
      userAgent: "Employment Posting API"
    });

    res.status(201).json(newJob);
  });

  // Apply to a job (including AI Skill-matching analysis)
  app.post("/api/jobs/:id/apply", async (req, res) => {
    const { id } = req.params;
    const applicant = users.find(u => u.id === currentUserId);

    if (!applicant) {
      return res.status(401).json({ error: "Please configure student session first." });
    }

    if (applicant.role !== UserRole.STUDENT) {
      return res.status(403).json({ error: "Application failed. Only students are eligible for this peer/faculty job." });
    }

    if (applicant.verifiedStatus !== 'approved') {
      return res.status(403).json({ error: "Access Denied. Your profile is currently pending Admin vetting approval." });
    }

    const job = jobs.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: "This job is no longer accepting submissions." });
    }

    if (job.applicants.some(a => a.studentId === applicant.id)) {
      return res.status(400).json({ error: "You have already applied for this job." });
    }

    // Trigger AI semantic analyzer (Gemini or Fallback logic)
    const { matchScore, explanation } = await calculateMatchWithGemini(job.title, job.description, job.requiredSkills, applicant);

    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      studentId: applicant.id,
      applicantName: applicant.name,
      applicantEmail: applicant.email,
      applicantSkills: applicant.skills,
      appliedAt: new Date().toISOString(),
      status: 'pending',
      matchScore,
      aiRecommendationWhy: explanation
    };

    job.applicants.push(newApplication);

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "ai",
      description: `AI Matchmaking: Analyzed applicant ${applicant.name} for "${job.title}" (Match score: ${matchScore}%).`,
      severity: "info",
      ipAddress: "192.168.10.15",
      userAgent: "Gemini Matching Pipeline"
    });

    res.json({ success: true, job });
  });

  // Hire/Select candidate
  app.post("/api/jobs/:jobId/select", (req, res) => {
    const { jobId } = req.params;
    const { studentId } = req.body;
    const hirer = users.find(u => u.id === currentUserId);

    const job = jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.postedBy.id !== hirer?.id && hirer?.role !== UserRole.ADMIN && hirer?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Unauthorized. Only the job creator can hire applicants." });
    }

    const studentProfile = users.find(u => u.id === studentId);
    if (!studentProfile) return res.status(404).json({ error: "Student not found" });

    // Mark job status
    job.status = 'in_progress';
    job.assignedTo = studentId;
    job.assignedToName = studentProfile.name;

    // Update application statuses
    job.applicants.forEach(app => {
      if (app.studentId === studentId) {
        app.status = 'selected';
      } else {
        app.status = 'rejected';
      }
    });

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "job",
      description: `Contract Live: ${studentProfile.name} hired for "${job.title}" by ${hirer.name}.`,
      severity: "info",
      ipAddress: "127.0.0.1",
      userAgent: "Campus Hiring Center"
    });

    res.json(job);
  });

  // Complete job & award payout
  app.post("/api/jobs/:jobId/complete", (req, res) => {
    const { jobId } = req.params;
    const { rating, feedback } = req.body;
    const hirer = users.find(u => u.id === currentUserId);

    const job = jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.status !== 'in_progress' || !job.assignedTo) {
      return res.status(400).json({ error: "This job is not currently in progress." });
    }

    if (job.postedBy.id !== hirer?.id && hirer?.role !== UserRole.ADMIN && hirer?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Unauthorized. Only the job creator can finalize the gig." });
    }

    const studentProfile = users.find(u => u.id === job.assignedTo);
    if (!studentProfile) return res.status(404).json({ error: "Assigned student not found" });

    // Finalize state
    job.status = 'completed';
    job.ratingByHirer = Number(rating) || 5;

    // Process payment transfer simulation
    if (hirer.balance >= job.payout) {
      hirer.balance -= job.payout;
      studentProfile.balance += job.payout;
      studentProfile.completedGigs += 1;
      
      // Re-average student rating based on ratings
      const totalRatingsCount = studentProfile.completedGigs;
      studentProfile.rating = Number(((studentProfile.rating * (totalRatingsCount - 1) + job.ratingByHirer) / totalRatingsCount).toFixed(1));
    } else {
      // Intranet credit overdraft fallback
      studentProfile.balance += job.payout;
      studentProfile.completedGigs += 1;
    }

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "database",
      description: `Transaction Successful: Transfer of ₱${job.payout} finalized from ${hirer.name} to ${studentProfile.name} for completing "${job.title}".`,
      severity: "info",
      ipAddress: "127.0.0.1",
      userAgent: "Intranet Transaction Settlement"
    });

    res.json({ success: true, job });
  });

  // 4. Logs Endpoint
  app.get("/api/logs", (req, res) => {
    res.json(activityLogs);
  });

  app.post("/api/logs/clear", (req, res) => {
    const activeUser = users.find(u => u.id === currentUserId);
    if (!activeUser || activeUser.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Access Denied. Log management is restricted to Super Admins." });
    }
    activityLogs = [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: "security",
        description: `Security Log manual clearance executed by Super Admin ${activeUser.name}.`,
        severity: "critical",
        ipAddress: "127.0.0.1",
        userAgent: "Console Session"
      }
    ];
    res.json(activityLogs);
  });

  // 5. System Configuration Endpoint
  app.get("/api/config", (req, res) => {
    res.json(systemConfig);
  });

  app.put("/api/config", (req, res) => {
    const activeUser = users.find(u => u.id === currentUserId);
    if (!activeUser || activeUser.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Access Denied. System configuration can only be altered by Super Admins." });
    }
    systemConfig = { ...systemConfig, ...req.body };
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "security",
      description: `System parameters modified. Maintenance mode toggle: ${systemConfig.isMaintenanceMode}. Intranet sandbox: ${systemConfig.isLocalOnly}.`,
      severity: "warning",
      ipAddress: "127.0.0.1",
      userAgent: "Security Module"
    });
    res.json(systemConfig);
  });

  app.post("/api/config/backup", (req, res) => {
    const activeUser = users.find(u => u.id === currentUserId);
    if (!activeUser || activeUser.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Access Denied. Core system backups require Super Admin authentication." });
    }
    systemConfig.lastBackupTime = new Date().toISOString();
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "database",
      description: `System Backup Success: Intranet backup saved securely. SSL state checked: ${systemConfig.sslStatus.toUpperCase()}.`,
      severity: "info",
      ipAddress: "127.0.0.1",
      userAgent: "Intranet Recovery Tool"
    });
    res.json(systemConfig);
  });

  app.post("/api/config/retrain", (req, res) => {
    const activeUser = users.find(u => u.id === currentUserId);
    if (!activeUser || activeUser.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Access Denied." });
    }
    systemConfig.aiRetrainingCount += 1;
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "ai",
      description: `AI Calibration Phase ${systemConfig.aiRetrainingCount}: Vector model weights successfully optimized using localized student gig history.`,
      severity: "info",
      ipAddress: "192.168.10.15",
      userAgent: "Machine Learning Supervisor"
    });
    res.json(systemConfig);
  });

  // Stats for Admin / Super Admin Dashboards
  app.get("/api/stats", (req, res) => {
    const totalStudents = users.filter(u => u.role === UserRole.STUDENT).length;
    const totalFaculty = users.filter(u => u.role === UserRole.FACULTY).length;
    const activeJobsCount = jobs.filter(j => j.status === 'open' || j.status === 'in_progress').length;
    const completedGigsCount = jobs.filter(j => j.status === 'completed').length;
    
    // Total simulated campus payout
    const totalPayoutsCirculated = jobs
      .filter(j => j.status === 'completed')
      .reduce((sum, j) => sum + j.payout, 0);

    // Simulated high demand vs deficit skills on campus
    const skillsDeficit = [
      { skill: "Microsoft Excel", demand: 18, supply: 6 },
      { skill: "React & TypeScript", demand: 14, supply: 4 },
      { skill: "Data Entry", demand: 12, supply: 10 },
      { skill: "Tutoring & English", demand: 10, supply: 12 },
      { skill: "Marine Sample Collection", demand: 8, supply: 3 },
      { skill: "Classroom Management", demand: 6, supply: 8 }
    ];

    // Job posts by Category
    const categoryCounts: Record<JobCategory, number> = {
      academic: 0,
      lab_assistance: 0,
      event_staff: 0,
      general: 0,
      personal: 0
    };
    jobs.forEach(j => {
      if (categoryCounts[j.category] !== undefined) {
        categoryCounts[j.category]++;
      }
    });

    const jobsByCategory = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat.replace('_', ' ').toUpperCase(),
      count
    }));

    res.json({
      totalStudents,
      totalFaculty,
      activeJobsCount,
      completedGigsCount,
      totalPayoutsCirculated,
      skillsDeficit,
      jobsByCategory
    });
  });

  // ----------------------------------------------------
  // Vite Dev Server / Static Ingress Fallbacks
  // ----------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Intranet Server booted successfully on port ${PORT}`);
  });
}

startServer();
