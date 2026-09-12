// Simulated external labour-market intelligence feeds
// Simulates live scraping/crawling from National Career Service (NCS), industry boards, and PLFS reports.
// Replace this file with a live scheduled ingestion service or pipeline in production.

export const mockJobPostings = [
  {
    id: "jp-ncs-101",
    title: "Junior Data Analyst & BI Developer",
    company: "Tata Consultancy Services (NCS Posting)",
    district: "Pune",
    skillIds: ["python", "sql", "power-bi", "data-analysis"],
    openings: 15,
    postedAt: "08 Sep 2026",
    source: "National Career Service (NCS)",
  },
  {
    id: "jp-jobfair-102",
    title: "Business Reporting Associate",
    company: "Infosys BPM",
    district: "Pune",
    skillIds: ["sql", "excel", "power-bi", "communication"],
    openings: 12,
    postedAt: "05 Sep 2026",
    source: "Maharashtra State Job Fair Portal",
  },
  {
    id: "jp-indeed-103",
    title: "Python Data Automation Intern",
    company: "Persistent Systems",
    district: "Pune",
    skillIds: ["python", "sql", "data-analysis"],
    openings: 8,
    postedAt: "02 Sep 2026",
    source: "Industry Job Portal Crawl",
  },
  {
    id: "jp-ncs-104",
    title: "Quantitative Analytics Assistant",
    company: "FinEdge Analytics",
    district: "Pune",
    skillIds: ["python", "statistics", "data-analysis", "excel"],
    openings: 6,
    postedAt: "09 Sep 2026",
    source: "National Career Service (NCS)",
  },
];

export const mockSectorGrowth = [
  {
    sector: "Technology & Digital Services",
    yoyGrowthPercent: 18.4,
    projectedHiring: "42,000 across Maharashtra",
    emergingSkillIds: ["power-bi", "python", "data-analysis"],
    source: "NASSCOM & Maharashtra State Innovation Society Survey 2026",
    driver: "High enterprise adoption of automated BI reporting and analytics workflows.",
  },
  {
    sector: "Financial & Analytics Operations (BFSI)",
    yoyGrowthPercent: 14.2,
    projectedHiring: "28,500 across Mumbai-Pune corridor",
    emergingSkillIds: ["sql", "statistics", "excel"],
    source: "PLFS & BFSI Sector Skill Council 2026",
    driver: "Regulatory compliance reporting and real-time transaction ledger intelligence.",
  },
  {
    sector: "Public & Healthcare Systems Management",
    yoyGrowthPercent: 9.8,
    projectedHiring: "15,200 across Western Maharashtra",
    emergingSkillIds: ["data-analysis", "communication"],
    source: "State Health Systems Resource Center Report",
    driver: "Digitization of primary health centers and district health dashboards.",
  },
];
