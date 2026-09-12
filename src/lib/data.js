import { mockJobPostings, mockSectorGrowth } from "./externalSignals.js";

export const roleLabels = {
  government: "Government",
  employer: "Employer",
  institute: "Training Institute",
  trainer: "Trainer",
  candidate: "Candidate",
};

export const navItems = {
  government: [["overview", "Overview", "⌂"], ["skill-pulse", "Skill Pulse", "◉"], ["labour-market", "Labour Market Intelligence", "◒"], ["skill-intelligence", "Skill Intelligence", "✦"], ["skill-gap", "Skill Gap Analysis", "△"], ["course-intelligence", "Course Intelligence", "▤"], ["curriculum", "Curriculum Alignment", "≡"], ["capacity", "Training Capacity", "▥"], ["district", "District Intelligence", "⌖"], ["trainers", "Trainer Intelligence", "♙"], ["candidates", "Candidate Intelligence", "♧"], ["placements", "Placement Outcomes", "↗"]],
  employer: [["overview", "Dashboard", "⌂"], ["create-consultation", "Create Consultation", "+"], ["consultations", "My Consultations", "▤"], ["required-skills", "Required Skills", "✦"], ["curriculum-proposals", "Curriculum Proposals", "✓"], ["feedback", "Placement Feedback", "↗"]],
  institute: [["overview", "Dashboard", "⌂"], ["courses", "Courses", "▤"], ["course-skills", "Course Skills", "✦"], ["curriculum-proposals", "Curriculum Proposals", "≡"], ["capacity", "Training Capacity", "▥"], ["placements", "Placement Outcomes", "↗"]],
  trainer: [["overview", "Dashboard", "⌂"], ["skills", "My Skills", "✦"], ["gaps", "Skill Gaps", "△"], ["upskilling", "Recommended Upskilling", "↗"]],
  candidate: [["overview", "Dashboard", "⌂"], ["profile", "Profile", "♙"], ["skills", "Skills", "✦"], ["role-fit", "Role Fit", "◎"], ["skill-gap", "Skill Gap", "△"], ["courses", "Recommended Courses", "▤"], ["pathway", "Training Pathway", "→"], ["placements", "Placement Status", "↗"]],
};

export const skillCatalog = [
  { id: "python", name: "Python", code: "NCO-2514.01", family: "Technical", demand: 18 },
  { id: "sql", name: "SQL", code: "NCO-2511.02", family: "Technical", demand: 22 },
  { id: "data-analysis", name: "Data Analysis", code: "NCO-2421.03", family: "Analytics", demand: 20 },
  { id: "power-bi", name: "Power BI", code: "NCO-2521.04", family: "Analytics", demand: 16 },
  { id: "communication", name: "Communication", code: "NCO-2424.01", family: "Professional", demand: 14 },
  { id: "excel", name: "Advanced Excel", code: "NCO-3313.02", family: "Analytics", demand: 12 },
  { id: "statistics", name: "Statistics", code: "NCO-2122.01", family: "Analytics", demand: 9 },
  { id: "legacy-office", name: "Desktop Publishing & Office Typing", code: "NCO-4131.01", family: "Legacy Administration", demand: 0 },
  // Healthcare Sector
  { id: "clinical-data", name: "Clinical Data Management", code: "NCO-3252.03", family: "Healthcare Analytics", demand: 14 },
  { id: "health-informatics", name: "Health Informatics & EHR", code: "NCO-3252.04", family: "Healthcare", demand: 12 },
  { id: "medical-coding", name: "Medical Coding & Billing", code: "NCO-3252.01", family: "Healthcare", demand: 10 },
  // Advanced Manufacturing Sector
  { id: "plc-automation", name: "PLC & Industrial Automation", code: "NCO-3139.02", family: "Manufacturing", demand: 16 },
  { id: "cad-design", name: "CAD / CAM Engineering Design", code: "NCO-3118.01", family: "Manufacturing", demand: 15 },
  { id: "quality-assurance", name: "Industrial Quality Assurance", code: "NCO-3122.02", family: "Manufacturing", demand: 11 },
];

export const skillProficiency = {
  // Candidates
  "candidate-1": { sql: "Intermediate", "data-analysis": "Intermediate", communication: "Advanced" },
  "candidate-2": { python: "Advanced", sql: "Advanced", "data-analysis": "Advanced", "power-bi": "Intermediate" },
  "candidate-3": { excel: "Intermediate", communication: "Beginner" },
  "candidate-4": { "health-informatics": "Intermediate", "clinical-data": "Intermediate", communication: "Intermediate" },
  "candidate-5": { "medical-coding": "Advanced", communication: "Intermediate", excel: "Beginner" },
  "candidate-6": { "cad-design": "Intermediate", "plc-automation": "Beginner" },
  "candidate-7": { "plc-automation": "Advanced", "cad-design": "Advanced", "quality-assurance": "Intermediate", communication: "Intermediate" },
  // Trainers
  "trainer-1": { python: "Advanced", sql: "Advanced", "data-analysis": "Advanced" },
  "trainer-2": { "power-bi": "Advanced", communication: "Advanced", excel: "Advanced" },
  "trainer-3": { sql: "Advanced", statistics: "Advanced" },
  "trainer-4": { "clinical-data": "Advanced", "health-informatics": "Advanced", "data-analysis": "Intermediate" },
  "trainer-5": { "medical-coding": "Advanced", "health-informatics": "Intermediate", communication: "Advanced" },
  "trainer-6": { "plc-automation": "Advanced", "cad-design": "Advanced", "quality-assurance": "Advanced" },
  "trainer-7": { "cad-design": "Advanced", "quality-assurance": "Intermediate", python: "Intermediate" },
  // Courses
  "course-1": { python: "Intermediate", sql: "Intermediate", "data-analysis": "Intermediate", "power-bi": "Intermediate", communication: "Intermediate" },
  "course-2": { sql: "Beginner", "power-bi": "Intermediate", excel: "Intermediate", communication: "Beginner" },
  "course-3": { "legacy-office": "Beginner" },
  "course-4": { excel: "Beginner" },
  "course-5": { "clinical-data": "Intermediate", "health-informatics": "Intermediate", "data-analysis": "Intermediate", communication: "Intermediate" },
  "course-6": { "medical-coding": "Intermediate", "health-informatics": "Beginner", excel: "Intermediate" },
  "course-7": { "plc-automation": "Intermediate", "cad-design": "Intermediate", "quality-assurance": "Intermediate" },
  "course-8": { "cad-design": "Intermediate", "quality-assurance": "Beginner", excel: "Beginner" },
};

export const requiredProficiency = {
  python: "Intermediate",
  sql: "Advanced",
  "data-analysis": "Intermediate",
  "power-bi": "Intermediate",
  communication: "Intermediate",
  excel: "Intermediate",
  statistics: "Intermediate",
  "legacy-office": "Beginner",
  "clinical-data": "Intermediate",
  "health-informatics": "Intermediate",
  "medical-coding": "Intermediate",
  "plc-automation": "Intermediate",
  "cad-design": "Advanced",
  "quality-assurance": "Intermediate",
};

export const initialData = {
  schemaVersion: 2,
  users: [
    { id: "user-gov", name: "Aarav Kulkarni", email: "gov@skillconnect.in", role: "government", organization: "District Skill Mission, Pune" },
    { id: "user-employer", name: "Nisha Shah", email: "employer@technova.in", role: "employer", organization: "TechNova Solutions" },
    { id: "user-employer-nagpur", name: "Dr. Alok Verma", email: "employer.nagpur@vidarbhahealth.in", role: "employer", organization: "Vidarbha Health Diagnostics" },
    { id: "user-employer-nashik", name: "Kavita Shinde", email: "employer.nashik@sahyadri.in", role: "employer", organization: "Sahyadri Precision Engineering" },
    { id: "user-institute", name: "Meera Joshi", email: "institute@skillconnect.in", role: "institute", organization: "Pune Digital Academy" },
    { id: "user-trainer", name: "Rohan Patil", email: "trainer@skillconnect.in", role: "trainer", organization: "Pune Digital Academy" },
    { id: "user-candidate", name: "Ishita Deshmukh", email: "candidate@skillconnect.in", role: "candidate", organization: "Pune" },
  ],
  skills: skillCatalog,
  districts: [
    { id: "pune", name: "Pune", state: "Maharashtra", status: "Active pilot" },
    { id: "nagpur", name: "Nagpur", state: "Maharashtra", status: "Active expansion" },
    { id: "nashik", name: "Nashik", state: "Maharashtra", status: "Active expansion" },
  ],
  employers: [
    {
      id: "technova",
      name: "TechNova Solutions",
      district: "Pune",
      sector: "Technology Services",
      openings: 25,
      role: "Data Operations Analyst",
      requiredSkillIds: ["python", "sql", "data-analysis", "power-bi", "communication"],
      requiredProficiency: { python: "Intermediate", sql: "Advanced", "data-analysis": "Intermediate", "power-bi": "Intermediate", communication: "Intermediate" },
      status: "Hiring",
    },
    {
      id: "vidarbha-health",
      name: "Vidarbha Health Diagnostics",
      district: "Nagpur",
      sector: "Healthcare",
      openings: 20,
      role: "Health Informatics Specialist",
      requiredSkillIds: ["clinical-data", "health-informatics", "data-analysis", "sql", "communication"],
      requiredProficiency: { "clinical-data": "Intermediate", "health-informatics": "Intermediate", "data-analysis": "Intermediate", sql: "Intermediate", communication: "Intermediate" },
      status: "Hiring",
    },
    {
      id: "sahyadri-auto",
      name: "Sahyadri Precision Engineering",
      district: "Nashik",
      sector: "Manufacturing",
      openings: 18,
      role: "Automation & QA Engineer",
      requiredSkillIds: ["plc-automation", "cad-design", "quality-assurance", "python", "communication"],
      requiredProficiency: { "plc-automation": "Intermediate", "cad-design": "Advanced", "quality-assurance": "Intermediate", python: "Beginner", communication: "Intermediate" },
      status: "Hiring",
    },
    {
      id: "nashik-tech",
      name: "Nashik FinTech Labs",
      district: "Nashik",
      sector: "Technology Services",
      openings: 15,
      role: "Operations Data Associate",
      requiredSkillIds: ["python", "sql", "excel", "communication"],
      requiredProficiency: { python: "Intermediate", sql: "Intermediate", excel: "Advanced", communication: "Intermediate" },
      status: "Hiring",
    },
  ],
  consultations: [
    {
      id: "consult-1",
      employerId: "technova",
      title: "Data Operations Analyst hiring cohort",
      role: "Data Operations Analyst",
      openings: 25,
      district: "Pune",
      requiredSkillIds: ["python", "sql", "data-analysis", "power-bi", "communication"],
      requiredProficiency: { python: "Intermediate", sql: "Advanced", "data-analysis": "Intermediate", "power-bi": "Intermediate", communication: "Intermediate" },
      status: "In review",
      createdAt: "12 Sep 2026",
      note: "Seeking job-ready analysts for the Pune delivery center.",
    },
    {
      id: "consult-2",
      employerId: "vidarbha-health",
      title: "Clinical Informatics hiring cohort",
      role: "Health Informatics Specialist",
      openings: 20,
      district: "Nagpur",
      requiredSkillIds: ["clinical-data", "health-informatics", "data-analysis", "sql", "communication"],
      requiredProficiency: { "clinical-data": "Intermediate", "health-informatics": "Intermediate", "data-analysis": "Intermediate", sql: "Intermediate", communication: "Intermediate" },
      status: "In review",
      createdAt: "12 Sep 2026",
      note: "Seeking trained EHR and clinical data specialists for Nagpur hospital network.",
    },
    {
      id: "consult-3",
      employerId: "sahyadri-auto",
      title: "Industrial Automation cohort",
      role: "Automation & QA Engineer",
      openings: 18,
      district: "Nashik",
      requiredSkillIds: ["plc-automation", "cad-design", "quality-assurance", "python", "communication"],
      requiredProficiency: { "plc-automation": "Intermediate", "cad-design": "Advanced", "quality-assurance": "Intermediate", python: "Beginner", communication: "Intermediate" },
      status: "In review",
      createdAt: "12 Sep 2026",
      note: "Recruiting for Ambad and Satpur plant lines.",
    },
    {
      id: "consult-4",
      employerId: "nashik-tech",
      title: "Operations Data Analyst batch",
      role: "Operations Data Associate",
      openings: 15,
      district: "Nashik",
      requiredSkillIds: ["python", "sql", "excel", "communication"],
      requiredProficiency: { python: "Intermediate", sql: "Intermediate", excel: "Advanced", communication: "Intermediate" },
      status: "In review",
      createdAt: "11 Sep 2026",
      note: "Financial reporting automation cohort.",
    },
  ],
  courses: [
    { id: "course-1", instituteId: "pda", name: "Data Analytics Accelerator", duration: "12 weeks", seats: 30, enrolled: 28, mode: "Blended", status: "Active", skillIds: ["python", "sql", "data-analysis", "power-bi", "communication"] },
    { id: "course-2", instituteId: "pda", name: "Business Intelligence Foundations", duration: "8 weeks", seats: 30, enrolled: 18, mode: "Classroom", status: "Active", skillIds: ["sql", "power-bi", "excel", "communication"] },
    { id: "course-3", instituteId: "pda", name: "Legacy Desktop Publishing & Office Typing", duration: "6 weeks", seats: 40, enrolled: 8, mode: "Classroom", status: "Active", skillIds: ["legacy-office"] },
    { id: "course-4", instituteId: "pda", name: "Basic Office Spreadsheet Computations", duration: "4 weeks", seats: 50, enrolled: 12, mode: "Classroom", status: "Active", skillIds: ["excel"] },
    // Nagpur Courses
    { id: "course-5", instituteId: "ndi", name: "Healthcare Data Management & EHR", duration: "10 weeks", seats: 25, enrolled: 22, mode: "Classroom", status: "Active", skillIds: ["clinical-data", "health-informatics", "data-analysis", "communication"] },
    { id: "course-6", instituteId: "ndi", name: "Medical Coding & Records Processing", duration: "8 weeks", seats: 30, enrolled: 15, mode: "Blended", status: "Active", skillIds: ["medical-coding", "health-informatics", "excel"] },
    // Nashik Courses
    { id: "course-7", instituteId: "nti", name: "PLC Industrial Automation & Robotics", duration: "12 weeks", seats: 25, enrolled: 21, mode: "Classroom", status: "Active", skillIds: ["plc-automation", "cad-design", "quality-assurance"] },
    { id: "course-8", instituteId: "nti", name: "Applied CAD Modeling & Quality Inspection", duration: "6 weeks", seats: 30, enrolled: 12, mode: "Classroom", status: "Active", skillIds: ["cad-design", "quality-assurance", "excel"] },
  ],
  courseSkills: [
    { id: "cs-1", courseId: "course-1", skillIds: ["python", "sql", "data-analysis", "power-bi", "communication"] },
    { id: "cs-2", courseId: "course-2", skillIds: ["sql", "power-bi", "excel", "communication"] },
    { id: "cs-3", courseId: "course-3", skillIds: ["legacy-office"] },
    { id: "cs-4", courseId: "course-4", skillIds: ["excel"] },
    { id: "cs-5", courseId: "course-5", skillIds: ["clinical-data", "health-informatics", "data-analysis", "communication"] },
    { id: "cs-6", courseId: "course-6", skillIds: ["medical-coding", "health-informatics", "excel"] },
    { id: "cs-7", courseId: "course-7", skillIds: ["plc-automation", "cad-design", "quality-assurance"] },
    { id: "cs-8", courseId: "course-8", skillIds: ["cad-design", "quality-assurance", "excel"] },
  ],
  curriculums: [
    { id: "curr-1", name: "Maharashtra Data Services Level 5", owner: "Maharashtra Skill Development Mission", status: "Needs update", skillIds: ["python", "sql", "data-analysis", "communication", "statistics"] },
    { id: "curr-2", name: "Maharashtra Healthcare Informatics Standard", owner: "MSDE Health Skill Council", status: "Aligned", skillIds: ["clinical-data", "health-informatics", "data-analysis", "medical-coding", "communication"] },
    { id: "curr-3", name: "Maharashtra Smart Manufacturing Framework", owner: "Maharashtra Industry Department", status: "Aligned", skillIds: ["plc-automation", "cad-design", "quality-assurance", "python"] },
  ],
  curriculumSkills: [
    { curriculumId: "curr-1", skillIds: ["python", "sql", "data-analysis", "communication", "statistics"] },
    { curriculumId: "curr-2", skillIds: ["clinical-data", "health-informatics", "data-analysis", "medical-coding", "communication"] },
    { curriculumId: "curr-3", skillIds: ["plc-automation", "cad-design", "quality-assurance", "python"] },
  ],
  curriculumProposals: [
    {
      id: "prop-1",
      targetType: "curriculum",
      targetId: "curr-1",
      targetName: "Maharashtra Data Services Level 5",
      proposedSkillIds: ["power-bi"],
      proposedBy: "Pune Digital Academy",
      employerId: "technova",
      status: "Pending",
      employerComment: "",
      createdAt: "10 Sep 2026",
      rationale: "Power BI demand is rising across Pune consultations; adding to curriculum aligns training with hiring cohorts.",
    },
  ],
  jobPostings: mockJobPostings,
  sectorGrowth: mockSectorGrowth,
  trainingInstitutes: [
    { id: "pda", name: "Pune Digital Academy", district: "Pune", courses: 4, seats: 150, rating: 4.6 },
    { id: "ndi", name: "Nagpur Digital & Skills Institute", district: "Nagpur", courses: 2, seats: 55, rating: 4.5 },
    { id: "nti", name: "Nashik Technical Training Centre", district: "Nashik", courses: 2, seats: 55, rating: 4.4 },
  ],
  trainers: [
    { id: "trainer-1", userId: "user-trainer", name: "Rohan Patil", instituteId: "pda", experience: "8 years", skillIds: ["python", "sql", "data-analysis"] },
    { id: "trainer-2", userId: "trainer-2", name: "Ananya Rao", instituteId: "pda", experience: "6 years", skillIds: ["power-bi", "communication", "excel"] },
    { id: "trainer-3", userId: "trainer-3", name: "Vikram Singh", instituteId: "pda", experience: "10 years", skillIds: ["sql", "statistics"] },
    { id: "trainer-4", userId: "trainer-4", name: "Dr. Sandeep Deshpande", instituteId: "ndi", experience: "9 years", skillIds: ["clinical-data", "health-informatics", "data-analysis"] },
    { id: "trainer-5", userId: "trainer-5", name: "Pallavi Bhende", instituteId: "ndi", experience: "5 years", skillIds: ["medical-coding", "health-informatics", "communication"] },
    { id: "trainer-6", userId: "trainer-6", name: "Ganesh Kulkarni", instituteId: "nti", experience: "11 years", skillIds: ["plc-automation", "cad-design", "quality-assurance"] },
    { id: "trainer-7", userId: "trainer-7", name: "Pooja Jadhav", instituteId: "nti", experience: "7 years", skillIds: ["cad-design", "quality-assurance", "python"] },
  ],
  trainerSkills: [
    { trainerId: "trainer-1", skillIds: ["python", "sql", "data-analysis"] },
    { trainerId: "trainer-2", skillIds: ["power-bi", "communication", "excel"] },
    { trainerId: "trainer-3", skillIds: ["sql", "statistics"] },
    { trainerId: "trainer-4", skillIds: ["clinical-data", "health-informatics", "data-analysis"] },
    { trainerId: "trainer-5", skillIds: ["medical-coding", "health-informatics", "communication"] },
    { trainerId: "trainer-6", skillIds: ["plc-automation", "cad-design", "quality-assurance"] },
    { trainerId: "trainer-7", skillIds: ["cad-design", "quality-assurance", "python"] },
  ],
  candidates: [
    { id: "candidate-1", userId: "user-candidate", name: "Ishita Deshmukh", district: "Pune", education: "B.Sc. Statistics", status: "In training", skillIds: ["sql", "data-analysis", "communication"] },
    { id: "candidate-2", userId: "candidate-2", name: "Aditya More", district: "Pune", education: "BCA", status: "Placed", skillIds: ["python", "sql", "data-analysis", "power-bi"] },
    { id: "candidate-3", userId: "candidate-3", name: "Sneha Pawar", district: "Pune", education: "B.Com", status: "Job seeking", skillIds: ["excel", "communication"] },
    { id: "candidate-4", userId: "candidate-4", name: "Kunal Gawande", district: "Nagpur", education: "B.Pharm", status: "In training", skillIds: ["health-informatics", "clinical-data", "communication"] },
    { id: "candidate-5", userId: "candidate-5", name: "Priya Meshram", district: "Nagpur", education: "B.Sc. Nursing", status: "Job seeking", skillIds: ["medical-coding", "communication", "excel"] },
    { id: "candidate-6", userId: "candidate-6", name: "Swapnil Shinde", district: "Nashik", education: "Diploma Mech Engg", status: "In training", skillIds: ["cad-design", "plc-automation"] },
    { id: "candidate-7", userId: "candidate-7", name: "Tanvi Gangurde", district: "Nashik", education: "BE Mechanical", status: "Placed", skillIds: ["plc-automation", "cad-design", "quality-assurance", "communication"] },
  ],
  candidateSkills: [
    { candidateId: "candidate-1", skillIds: ["sql", "data-analysis", "communication"] },
    { candidateId: "candidate-2", skillIds: ["python", "sql", "data-analysis", "power-bi"] },
    { candidateId: "candidate-3", skillIds: ["excel", "communication"] },
    { candidateId: "candidate-4", skillIds: ["health-informatics", "clinical-data", "communication"] },
    { candidateId: "candidate-5", skillIds: ["medical-coding", "communication", "excel"] },
    { candidateId: "candidate-6", skillIds: ["cad-design", "plc-automation"] },
    { candidateId: "candidate-7", skillIds: ["plc-automation", "cad-design", "quality-assurance", "communication"] },
  ],
  trainingCapacity: [
    // Pune
    { id: "cap-1", district: "Pune", skillId: "python", demand: 18, availableSeats: 12 },
    { id: "cap-2", district: "Pune", skillId: "sql", demand: 22, availableSeats: 25 },
    { id: "cap-3", district: "Pune", skillId: "data-analysis", demand: 20, availableSeats: 16 },
    { id: "cap-4", district: "Pune", skillId: "power-bi", demand: 16, availableSeats: 10 },
    // Nagpur
    { id: "cap-5", district: "Nagpur", skillId: "clinical-data", demand: 14, availableSeats: 10 },
    { id: "cap-6", district: "Nagpur", skillId: "health-informatics", demand: 12, availableSeats: 8 },
    { id: "cap-7", district: "Nagpur", skillId: "medical-coding", demand: 10, availableSeats: 15 },
    // Nashik
    { id: "cap-8", district: "Nashik", skillId: "plc-automation", demand: 16, availableSeats: 10 },
    { id: "cap-9", district: "Nashik", skillId: "cad-design", demand: 15, availableSeats: 12 },
    { id: "cap-10", district: "Nashik", skillId: "quality-assurance", demand: 11, availableSeats: 8 },
  ],
  placements: [
    { id: "placement-1", candidateId: "candidate-2", employerId: "technova", role: "Data Operations Analyst", district: "Pune", salary: "₹6.2 LPA", placedAt: "18 Aug 2026", status: "Verified" },
    { id: "placement-2", candidateId: "candidate-7", employerId: "sahyadri-auto", role: "Automation & QA Engineer", district: "Nashik", salary: "₹5.8 LPA", placedAt: "22 Aug 2026", status: "Verified" },
    { id: "placement-3", candidateId: "candidate-4", employerId: "vidarbha-health", role: "Health Informatics Specialist", district: "Nagpur", salary: "₹5.2 LPA", placedAt: "01 Sep 2026", status: "Verified" },
  ],
  employerFeedback: [
    { id: "feedback-1", placementId: "placement-1", employerId: "technova", candidateId: "candidate-2", role: "Data Operations Analyst", rating: 4, skillRatings: { python: 4, sql: 5, "power-bi": 4 }, skillGaps: [], note: "Strong analytical thinking and quick to adopt Power BI workflows.", createdAt: "25 Aug 2026" },
    { id: "feedback-2", placementId: "placement-2", employerId: "sahyadri-auto", candidateId: "candidate-7", role: "Automation & QA Engineer", rating: 5, skillRatings: { "plc-automation": 5, "cad-design": 4, "quality-assurance": 5 }, skillGaps: [], note: "Exceptional hands-on PLC troubleshooting and QA documentation skills.", createdAt: "28 Aug 2026" },
    { id: "feedback-3", placementId: "placement-3", employerId: "vidarbha-health", candidateId: "candidate-4", role: "Health Informatics Specialist", rating: 4, skillRatings: { "health-informatics": 4, "clinical-data": 4, communication: 4 }, skillGaps: ["sql"], note: "Well prepared on EHR protocols; additional SQL training recommended for complex queries.", createdAt: "05 Sep 2026" },
  ],
  skillProficiency,
  requiredProficiency,
};

export const getSkill = (id) => skillCatalog.find((skill) => skill.id === id) || { id, name: id, family: "Other" };
export const skillNames = (ids = []) => ids.map((id) => getSkill(id).name);
export const roleRequirements = ["python", "sql", "data-analysis", "power-bi", "communication"];
export const percentage = (matched, total) => total ? Math.round((matched / total) * 100) : 0;
export const roleFit = (skillIds = []) => percentage(roleRequirements.filter((id) => skillIds.includes(id)).length, roleRequirements.length);
export const normalizeData = (raw = initialData) => {
  const employers = raw.employers || initialData.employers;
  const consultations = (raw.consultations || []).map((consultation) => {
    const employer = employers.find((item) => item.id === consultation.employerId) || employers[0];
    return {
      ...consultation,
      employerId: consultation.employerId || employer?.id,
      role: consultation.role || employer?.role,
      district: consultation.district || employer?.district || "Pune",
      requiredSkillIds: consultation.requiredSkillIds?.length ? consultation.requiredSkillIds : employer?.requiredSkillIds || [...roleRequirements],
      requiredProficiency: consultation.requiredProficiency || employer?.requiredProficiency || { ...requiredProficiency },
    };
  });
  const legacy = !raw.schemaVersion;
  const curriculums = (raw.curriculums || initialData.curriculums).map((curriculum) => legacy ? { ...curriculum, status: "Needs update", skillIds: curriculum.skillIds.filter((skillId) => skillId !== "power-bi") } : curriculum);
  const curriculumSkills = (raw.curriculumSkills || initialData.curriculumSkills).map((item) => legacy ? { ...item, skillIds: item.skillIds.filter((skillId) => skillId !== "power-bi") } : item);
  const curriculumProposals = raw.curriculumProposals || initialData.curriculumProposals;
  const jobPostings = raw.jobPostings || initialData.jobPostings;
  const sectorGrowth = raw.sectorGrowth || initialData.sectorGrowth;
  const districts = raw.districts || initialData.districts;
  const rawSkillProf = raw.skillProficiency || {};
  const mergedSkillProf = { ...skillProficiency, ...rawSkillProf };
  const rawReqProf = raw.requiredProficiency || {};
  const mergedReqProf = { ...requiredProficiency, ...rawReqProf };

  return {
    ...initialData,
    ...raw,
    schemaVersion: 2,
    employers,
    consultations,
    curriculums,
    curriculumSkills,
    curriculumProposals,
    jobPostings,
    sectorGrowth,
    districts,
    skillProficiency: mergedSkillProf,
    requiredProficiency: mergedReqProf,
  };
};