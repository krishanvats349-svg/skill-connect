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
  { id: "python", name: "Python", family: "Technical", demand: 18 },
  { id: "sql", name: "SQL", family: "Technical", demand: 22 },
  { id: "data-analysis", name: "Data Analysis", family: "Analytics", demand: 20 },
  { id: "power-bi", name: "Power BI", family: "Analytics", demand: 16 },
  { id: "communication", name: "Communication", family: "Professional", demand: 14 },
  { id: "excel", name: "Advanced Excel", family: "Analytics", demand: 12 },
  { id: "statistics", name: "Statistics", family: "Analytics", demand: 9 },
  { id: "legacy-office", name: "Desktop Publishing & Office Typing", family: "Legacy Administration", demand: 0 },
];

export const initialData = {
  schemaVersion: 2,
  users: [{ id: "user-gov", name: "Aarav Kulkarni", email: "gov@skillconnect.in", role: "government", organization: "District Skill Mission, Pune" }, { id: "user-employer", name: "Nisha Shah", email: "employer@technova.in", role: "employer", organization: "TechNova Solutions" }, { id: "user-institute", name: "Meera Joshi", email: "institute@skillconnect.in", role: "institute", organization: "Pune Digital Academy" }, { id: "user-trainer", name: "Rohan Patil", email: "trainer@skillconnect.in", role: "trainer", organization: "Pune Digital Academy" }, { id: "user-candidate", name: "Ishita Deshmukh", email: "candidate@skillconnect.in", role: "candidate", organization: "Pune" }],
  skills: skillCatalog,
  districts: [{ id: "pune", name: "Pune", state: "Maharashtra", status: "Active pilot" }],
  employers: [{ id: "technova", name: "TechNova Solutions", district: "Pune", sector: "Technology Services", openings: 25, role: "Data Operations Analyst", requiredSkillIds: ["python", "sql", "data-analysis", "power-bi", "communication"], status: "Hiring" }],
  consultations: [{ id: "consult-1", employerId: "technova", title: "Data Operations Analyst hiring cohort", role: "Data Operations Analyst", openings: 25, district: "Pune", requiredSkillIds: ["python", "sql", "data-analysis", "power-bi", "communication"], status: "In review", createdAt: "12 Sep 2026", note: "Seeking job-ready analysts for the Pune delivery center." }],
  courses: [
    { id: "course-1", instituteId: "pda", name: "Data Analytics Accelerator", duration: "12 weeks", seats: 30, enrolled: 28, mode: "Blended", status: "Active", skillIds: ["python", "sql", "data-analysis", "power-bi", "communication"] },
    { id: "course-2", instituteId: "pda", name: "Business Intelligence Foundations", duration: "8 weeks", seats: 30, enrolled: 18, mode: "Classroom", status: "Active", skillIds: ["sql", "power-bi", "excel", "communication"] },
    { id: "course-3", instituteId: "pda", name: "Legacy Desktop Publishing & Office Typing", duration: "6 weeks", seats: 40, enrolled: 8, mode: "Classroom", status: "Active", skillIds: ["legacy-office"] },
    { id: "course-4", instituteId: "pda", name: "Basic Office Spreadsheet Computations", duration: "4 weeks", seats: 50, enrolled: 12, mode: "Classroom", status: "Active", skillIds: ["excel"] },
  ],
  courseSkills: [
    { id: "cs-1", courseId: "course-1", skillIds: ["python", "sql", "data-analysis", "power-bi", "communication"] },
    { id: "cs-2", courseId: "course-2", skillIds: ["sql", "power-bi", "excel", "communication"] },
    { id: "cs-3", courseId: "course-3", skillIds: ["legacy-office"] },
    { id: "cs-4", courseId: "course-4", skillIds: ["excel"] },
  ],
  curriculums: [{ id: "curr-1", name: "Maharashtra Data Services Level 5", owner: "Maharashtra Skill Development Mission", status: "Needs update", skillIds: ["python", "sql", "data-analysis", "communication", "statistics"] }],
  curriculumSkills: [{ curriculumId: "curr-1", skillIds: ["python", "sql", "data-analysis", "communication", "statistics"] }],
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
  trainingInstitutes: [{ id: "pda", name: "Pune Digital Academy", district: "Pune", courses: 4, seats: 150, rating: 4.6 }],
  trainers: [{ id: "trainer-1", userId: "user-trainer", name: "Rohan Patil", instituteId: "pda", experience: "8 years", skillIds: ["python", "sql", "data-analysis"] }, { id: "trainer-2", userId: "trainer-2", name: "Ananya Rao", instituteId: "pda", experience: "6 years", skillIds: ["power-bi", "communication", "excel"] }, { id: "trainer-3", userId: "trainer-3", name: "Vikram Singh", instituteId: "pda", experience: "10 years", skillIds: ["sql", "statistics"] }],
  trainerSkills: [{ trainerId: "trainer-1", skillIds: ["python", "sql", "data-analysis"] }, { trainerId: "trainer-2", skillIds: ["power-bi", "communication", "excel"] }, { trainerId: "trainer-3", skillIds: ["sql", "statistics"] }],
  candidates: [{ id: "candidate-1", userId: "user-candidate", name: "Ishita Deshmukh", district: "Pune", education: "B.Sc. Statistics", status: "In training", skillIds: ["sql", "data-analysis", "communication"] }, { id: "candidate-2", userId: "candidate-2", name: "Aditya More", district: "Pune", education: "BCA", status: "Placed", skillIds: ["python", "sql", "data-analysis", "power-bi"] }, { id: "candidate-3", userId: "candidate-3", name: "Sneha Pawar", district: "Pune", education: "B.Com", status: "Job seeking", skillIds: ["excel", "communication"] }],
  candidateSkills: [{ candidateId: "candidate-1", skillIds: ["sql", "data-analysis", "communication"] }, { candidateId: "candidate-2", skillIds: ["python", "sql", "data-analysis", "power-bi"] }, { candidateId: "candidate-3", skillIds: ["excel", "communication"] }],
  trainingCapacity: [{ id: "cap-1", district: "Pune", skillId: "python", demand: 18, availableSeats: 12 }, { id: "cap-2", district: "Pune", skillId: "sql", demand: 22, availableSeats: 25 }, { id: "cap-3", district: "Pune", skillId: "data-analysis", demand: 20, availableSeats: 16 }, { id: "cap-4", district: "Pune", skillId: "power-bi", demand: 16, availableSeats: 10 }],
  placements: [{ id: "placement-1", candidateId: "candidate-2", employerId: "technova", role: "Data Operations Analyst", district: "Pune", salary: "₹6.2 LPA", placedAt: "18 Aug 2026", status: "Verified" }],
  employerFeedback: [{ id: "feedback-1", placementId: "placement-1", employerId: "technova", candidateId: "candidate-2", role: "Data Operations Analyst", rating: 4, skillRatings: { python: 4, sql: 5, "power-bi": 4 }, skillGaps: [], note: "Strong analytical thinking and quick to adopt Power BI workflows.", createdAt: "25 Aug 2026" }],
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
    return { ...consultation, employerId: consultation.employerId || employer?.id, role: consultation.role || employer?.role, district: consultation.district || employer?.district || "Pune", requiredSkillIds: consultation.requiredSkillIds?.length ? consultation.requiredSkillIds : employer?.requiredSkillIds || [...roleRequirements] };
  });
  const legacy = !raw.schemaVersion;
  const curriculums = (raw.curriculums || initialData.curriculums).map((curriculum) => legacy ? { ...curriculum, status: "Needs update", skillIds: curriculum.skillIds.filter((skillId) => skillId !== "power-bi") } : curriculum);
  const curriculumSkills = (raw.curriculumSkills || initialData.curriculumSkills).map((item) => legacy ? { ...item, skillIds: item.skillIds.filter((skillId) => skillId !== "power-bi") } : item);
  const curriculumProposals = raw.curriculumProposals || initialData.curriculumProposals;
  const jobPostings = raw.jobPostings || initialData.jobPostings;
  const sectorGrowth = raw.sectorGrowth || initialData.sectorGrowth;
  return { ...initialData, ...raw, schemaVersion: 2, employers, consultations, curriculums, curriculumSkills, curriculumProposals, jobPostings, sectorGrowth };
};