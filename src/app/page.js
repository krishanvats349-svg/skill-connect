"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { getSkill, initialData, navItems, normalizeData, requiredProficiency, roleLabels, roleRequirements, skillCatalog, skillNames, skillProficiency } from "@/lib/data";
import { capacityRows, candidateAnalysis, courseAnalysis, courseSupplyStatus, curriculumAnalysis, demandRows, districtDemand, districtPriorityRows, executiveMetrics, feedbackIntelligence, feedbackSummary, generateDistrictTrainingPlan, hierarchyOptions, pipelineConversions, pipelineMetrics, priorityActions, prototypeImpactScore, requiredIndustrySkills, simulateIntervention, skillIntelligenceRows, skillPulseDetail, totalOpenings, trainerAnalysis } from "@/lib/analytics";
import { firebaseEnabled } from "@/lib/firebase";
import { loadRemoteData, persistEntity, storageMode } from "@/lib/storage";
import SkillPulseCommandCenter from "@/app/skill-pulse";
import { authenticateLocal, DEMO_PASSWORD, getDemoUser } from "@/lib/auth";
import GuidedDemo from "@/app/guided-demo";
import { LanguageContext, titleKeys, translate, useLanguage } from "@/lib/translations";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import DistrictGapHeatmap from "@/app/DistrictGapHeatmap";

const clone = () => JSON.parse(JSON.stringify(initialData));
const emptySubscribe = () => () => {};
const storedRole = () => typeof window === "undefined" ? null : window.localStorage.getItem("skillconnect-role");
const storedData = () => typeof window === "undefined" ? "" : window.localStorage.getItem("skillconnect-data") || "";
const emptySnapshot = () => null;
const emptyDataSnapshot = () => "";
const storedGuided = () => typeof window === "undefined" ? false : window.localStorage.getItem("skillconnect-guided-demo") === "active" || window.location.search.includes("demo=1");
const emptyGuidedSnapshot = () => false;
const storedLanguage = () => typeof window === "undefined" ? "en" : window.localStorage.getItem("skillconnect-language") || "en";
const emptyLanguageSnapshot = () => "en";
const today = "12 Sep 2026";
function Button({ children, variant = "primary", ...props }) { return <button className={`button button-${variant}`} {...props}>{children}</button>; }
function Badge({ children, tone = "blue" }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
function Card({ children, className = "" }) { return <section className={`card ${className}`}>{children}</section>; }
function PageHeader({ eyebrow, title, description, action }) { const { language } = useLanguage(); const titleKey = titleKeys[title]; return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{titleKey ? translate(language, titleKey) : title}</h1><p>{description}</p></div>{action}</div>; }
const ExecutiveNavigationContext = createContext(null);
function Metric({ label, value, detail, tone = "blue" }) { const navigate = useContext(ExecutiveNavigationContext); return <>{<Card className="metric"><div className={`metric-mark mark-${tone}`} /><div><div className="metric-label">{label}</div><strong>{value}</strong><div className="metric-detail">{detail}</div></div></Card>}{label === "Employer feedback" && navigate && <EcosystemWorkflow setView={navigate} />}</>; }
function Progress({ value, tone = "blue" }) { return <div className="progress"><span className={`progress-fill fill-${tone}`} style={{ width: `${Math.max(0, Math.min(value || 0, 100))}%` }} /></div>; }
function Table({ children }) { return <div className="table-wrap"><table>{children}</table></div>; }
function EmptyState({ title, body }) { return <div className="empty"><span>◌</span><strong>{title}</strong><p>{body}</p></div>; }
function SkillTags({ ids = [], entityId = null, proficiencies = null, data = null }) {
  const profMap = proficiencies || (entityId && data?.skillProficiency?.[entityId]) || (entityId && skillProficiency?.[entityId]) || null;
  return (
    <div className="tag-list">
      {ids.map((id) => {
        const level = profMap?.[id];
        return (
          <span key={id} className="skill-badge-wrap">
            <Badge>{getSkill(id).name}</Badge>
            {level && (
              <small className={`proficiency-pill ${level.toLowerCase()}`}>
                {level.slice(0, 3)}
              </small>
            )}
          </span>
        );
      })}
    </div>
  );
}

function LoginPage({ onSelect, onDemo }) {
  const [form, setForm] = useState({ email: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = (event) => { event.preventDefault(); if (!form.email.trim() || !form.password) { setError("Enter both email and password to continue."); return; } setBusy(true); window.setTimeout(() => { const result = authenticateLocal(form.email, form.password); if (result.ok) { setError(""); onSelect(result.user); } else { setError(result.message); setBusy(false); } }, 250); };
  return <main className="login-page"><div className="login-brand"><div className="brand-mark">SC</div><span>Skill<span>Connect</span></span></div><div className="login-copy"><div className="eyebrow">SIH 2026 · Maharashtra Multi-District Skill Intelligence</div><h1>Make skills visible.<br /><em>Make opportunity</em> actionable.</h1><p>A connected intelligence platform for government, employers, training partners, trainers, and candidates.</p><div className="login-proof"><span>01</span><div><b>One connected skills graph</b><small>Demand, supply, readiness, and outcomes in one workspace.</small></div></div><div className="login-proof"><span>02</span><div><b>Explainable decisions</b><small>Every recommendation traces back to current records.</small></div></div></div><div className="login-card-stack"><Card className="login-card"><div className="card-kicker">SECURE WORKSPACE</div><h2>Sign in to SkillConnect</h2><p className="muted">Use your organization account to open its role-based workspace.</p><form onSubmit={submit} className="login-form"><label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@organization.in" /></label><label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /></label>{error && <div className="login-error" role="alert">{error}</div>}<Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button></form><p className="login-helper">Prototype sign-in uses the local session adapter. Demo password: <b>{DEMO_PASSWORD}</b></p></Card><Card className="demo-card"><div className="demo-heading"><div><div className="card-kicker">SIH PRESENTATION MODE</div><h2>Demo Access</h2></div><Badge tone="yellow">Fast entry</Badge></div><p className="muted">Jump into a role workspace using the same connected dataset.</p><Button className="guided-entry-button" onClick={onDemo}>Start Guided SIH Demo →</Button><div className="role-grid">{Object.entries(roleLabels).map(([key, label]) => <button className="role-choice" key={key} onClick={() => onSelect(getDemoUser(key))}><span>{({ government: "⌘", employer: "◈", institute: "▤", trainer: "♙", candidate: "◎" })[key]}</span><div><strong>{label}</strong><small>{getDemoUser(key)?.name} · Enter workspace →</small></div></button>)}</div><p className="demo-note">{storageMode === "firebase" ? "Shared Firebase persistence is active." : "Local demo persistence is active for this presentation."}</p></Card></div></main>;
}
function Sidebar({ role, view, setView, onLogout, data }) { const { language } = useLanguage(); const navKeys = { overview: role === "government" ? "overview" : "dashboard", "skill-pulse": "skillPulse", "labour-market": "labourMarket", "skill-intelligence": "skillIntelligence", "skill-gap": "skillGap", "course-intelligence": "courseIntelligence", curriculum: "curriculum", capacity: "capacity", district: "districtIntelligence", trainers: "trainers", candidates: "candidates", placements: "placements", "create-consultation": "createConsultation", consultations: "consultations", "required-skills": "requiredSkills", "curriculum-proposals": "curriculumProposals", feedback: "feedback", courses: "courses", "course-skills": "courseSkills", skills: "skills", gaps: "gaps", upskilling: "upskilling", profile: "profile", "role-fit": "roleFit", pathway: "pathway" }; return <aside className="sidebar"><div className="brand"><div className="brand-mark">SC</div><span>Skill<span>Connect</span></span></div><div className="workspace"><div className="avatar">{roleLabels[role][0]}</div><div><b>{translate(language, role)}</b><small>{data?.districts?.length ? `${data.districts.length} districts · Maharashtra` : "Maharashtra Pilot"}</small></div></div><nav>{navItems[role].map(([id, label, icon]) => <button className={view === id ? "active" : ""} key={id} onClick={() => setView(id)}><span>{icon}</span>{translate(language, navKeys[id]) || label}</button>)}</nav><div className="sidebar-bottom"><div className="pilot-status"><i /><span><b>System connected</b><small>{firebaseEnabled ? "Firebase production mode" : "Local demo mode"}</small></span></div><button className="logout" onClick={onLogout}>↪ Sign out</button></div></aside>; }
function Topbar({ role, data, onLogout, onToggleLanguage }) { const { language } = useLanguage(); const user = data.users.find((item) => item.role === role); return <header className="topbar"><div className="crumb"><span>Workspace</span><b>/</b><strong>{translate(language, role)}</strong></div><div className="top-actions"><div className="search">⌕ <span>Search platform</span><kbd>⌘ K</kbd></div><button className="language-toggle" onClick={onToggleLanguage} aria-label="Toggle language">{translate(language, "language")}</button><button className="icon-button">◔</button><button className="user-chip" onClick={onLogout}><span className="avatar small">{user?.name?.[0] || "U"}</span><span>{user?.name || "Demo user"}</span><b>⌄</b></button></div></header>; }

function DecisionCard({ eyebrow, title, children, action }) { return <Card className="decision-card"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><div className="decision-body">{children}</div>{action}</Card>; }
const ecosystemStages = [["Industry Demand", "labour-market"], ["Labour Market Intelligence", "labour-market"], ["Skill Intelligence", "skill-intelligence"], ["Skill Gap", "skill-gap"], ["Training & Curriculum", "course-intelligence"], ["District Action", "district"], ["Trainer & Candidate", "trainers"], ["Placement", "placements"], ["Employer Feedback", "placements"]];
function EcosystemWorkflow({ setView }) { return <Card className="ecosystem-workflow"><div className="section-head"><div><div className="eyebrow">CONNECTED OPERATING MODEL</div><h2>How the ecosystem connects</h2><p>Industry signals flow through skills, training and outcomes to support government action.</p></div><Badge tone="green">End-to-end flow</Badge></div><div className="ecosystem-flow" aria-label="SkillConnect ecosystem workflow">{ecosystemStages.map(([label, view], index) => <div className="ecosystem-stage-wrap" key={label}><button type="button" className="ecosystem-stage" onClick={() => setView(view)}>{label}</button>{index < ecosystemStages.length - 1 && <span className="ecosystem-arrow" aria-hidden="true">→</span>}</div>)}<span className="ecosystem-feedback" aria-hidden="true">↺</span><span className="ecosystem-return-label">back to Government Intelligence</span></div></Card>; }
function WhyButton({ expanded, onClick }) { return <button type="button" className="evidence-toggle" aria-expanded={expanded} onClick={onClick}>{expanded ? "Hide evidence" : "Why this?"}</button>; }
function EvidencePanel({ title = "Why this action?", signal, evidence = [], logic, recommendation, onClose }) { return <div className="evidence-panel evidence-panel-local"><div className="evidence-panel-head"><div className="eyebrow">{title.toUpperCase()}</div>{onClose && <button type="button" className="evidence-close" onClick={onClose} aria-label="Close evidence">×</button>}</div><div className="evidence-sections"><div><span>Signal</span><b>{signal}</b></div><div><span>Evidence</span><b>{evidence.length ? evidence.join(" · ") : "No additional records available"}</b></div><div><span>Decision logic</span><b>{logic}</b></div><div><span>Recommendation</span><b>{recommendation}</b></div></div></div>; }
function EvidenceReview({ title, items }) { const [expanded, setExpanded] = useState(null); return <Card className="evidence-review"><div className="section-head"><div><div className="eyebrow">SYSTEM RATIONALE</div><h2>{title}</h2><p>Open an item to see the signal, evidence, decision logic, and recommendation.</p></div><Badge tone="blue">{items.length} evidence item(s)</Badge></div><div className="evidence-review-list">{items.map((item) => <div className="evidence-review-item" key={item.id}><div className="evidence-review-summary"><div><b>{item.title}</b><small>{item.signal}</small></div><WhyButton expanded={expanded === item.id} onClick={() => setExpanded(expanded === item.id ? null : item.id)} /></div>{expanded === item.id && <EvidencePanel signal={item.signal} evidence={item.evidence} logic={item.logic} recommendation={item.recommendation} />}</div>)}</div></Card>; }
function ExecutiveView({ data, setView }) { return <ExecutiveNavigationContext.Provider value={setView}><ExecutiveViewContent data={data} setView={setView} /></ExecutiveNavigationContext.Provider>; }
function ExecutiveViewContent({ data, setView }) {
  const metrics = executiveMetrics(data); const demand = demandRows(data); const capacity = capacityRows(data); const feedback = feedbackIntelligence(data); const maxDemand = Math.max(...demand.map((row) => row.openings), 1);
  const districtNames = data.districts?.map((d) => d.name).join(" · ") || "Maharashtra";
  return <><PageHeader eyebrow={`Government intelligence / ${districtNames}`} title="District decision centre" description="A live operating view of demand, readiness, capacity, and outcomes for policy and delivery decisions." action={<Button onClick={() => setView("skill-intelligence")}>Open skill intelligence ↗</Button>} /><div className="metrics-grid executive-metrics"><Metric label="Industry openings" value={metrics.openings} detail="from employer consultations" tone="coral" /><Metric label="Active employers" value={metrics.employers} detail="with submitted demand" /><Metric label="High-demand skills" value={metrics.highDemandSkills} detail="above explainable threshold" tone="yellow" /><Metric label="Districts with gaps" value={metrics.districtsWithGaps} detail="capacity below demand" tone="coral" /><Metric label="Available capacity" value={metrics.availableSeats} detail="relevant training seats" /><Metric label="Capacity gap" value={metrics.capacityGap} detail="demand minus seats" tone="coral" /><Metric label="Course alignment" value={`${metrics.courseAlignment}%`} detail="average demanded skill coverage" tone="green" /><Metric label="Trainer readiness" value={`${metrics.trainerReadiness}%`} detail="average against demand" tone="blue" /><Metric label="Candidates" value={metrics.candidates} detail="in connected profiles" /><Metric label="Placements" value={metrics.placements} detail="verified outcomes" tone="green" /><Metric label="Employer feedback" value={metrics.feedback} detail="feedback records" tone="yellow" /></div><div className="dashboard-grid"><Card><div className="section-head"><div><h2>Top demanded skills</h2><p>Opening demand versus the highest current skill signal</p></div><Badge>Dynamic</Badge></div><div className="bars">{demand.slice().sort((a, b) => b.openings - a.openings).slice(0, 6).map((row) => <div className="bar-row" key={row.skillId}><div><span>{row.skill.name}</span><b>{row.openings} openings · {row.employers} employer(s)</b></div><Progress value={row.openings / maxDemand * 100} tone={row.level === "High" ? "coral" : "blue"} /></div>)}</div></Card><Card><div className="section-head"><div><h2>Demand versus capacity</h2><p>Skill-level capacity gaps needing attention</p></div><button className="text-button" onClick={() => setView("capacity")}>Details →</button></div><div className="bars">{capacity.slice().sort((a, b) => b.gap - a.gap).slice(0, 5).map((row) => <div className="bar-row" key={row.skillId}><div><span>{row.skill.name}</span><b>{row.gap > 0 ? `${row.gap} seat gap` : `${Math.abs(row.gap)} surplus`}</b></div><Progress value={row.openings ? row.availableSeats / row.openings * 100 : 0} tone={row.gap > 0 ? "coral" : "green"} /></div>)}</div></Card></div><div className="decision-grid"><DecisionCard eyebrow="State & District · capacity gap" title="Increase relevant training capacity"><p><b>{metrics.openings} openings</b> are competing for <b>{metrics.availableSeats} relevant seats</b>, creating a net gap of <b>{metrics.capacityGap}</b>.</p><p className="explain">What happened: demand exceeds supply. Why: current seats are distributed below employer demand. Action: increase seats for the highest-gap skills.</p><Button variant="secondary" onClick={() => setView("capacity")}>Review capacity</Button></DecisionCard><DecisionCard eyebrow="Employer feedback intelligence" title="Close the outcome loop"><p><b>{feedback.count}</b> feedback record(s) cover <b>{feedback.completionRate}%</b> of placements.</p><p className="explain">Strongest signal: {feedback.strongestSkill}. Weakest signal: {feedback.weakestSkill}. Most reported gap: {feedback.mostReportedGap}.</p><Button variant="secondary" onClick={() => setView("placements")}>Review outcomes</Button></DecisionCard></div></>;
}
function SkillIntelligenceView({ data }) { const items = skillIntelligenceRows(data).map((row) => ({ id: row.skillId, title: row.skill.name, signal: `${row.openings} openings · ${row.status}`, evidence: [`${row.employers} employer(s)`, `${row.coverage.courses} course(s)`, `${row.coverage.trainers} trainer(s)`, `${row.coverage.candidates} candidate(s)`], logic: row.status === "Critical Gap" ? "High demand with limited ecosystem coverage." : "Demand and coverage determine the current status.", recommendation: row.status === "Critical Gap" ? `Prioritize ${row.skill.name} ecosystem coverage.` : `Monitor ${row.skill.name} as demand changes.` })); return <><SkillIntelligenceViewContent data={data} /><EvidenceReview title="Skill intelligence evidence" items={items} /></>; }
function SkillIntelligenceViewContent({ data }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("All"); const rows = skillIntelligenceRows(data).filter((row) => row.skill.name.toLowerCase().includes(query.toLowerCase()) && (status === "All" || row.status === status));
  return <><PageHeader eyebrow="Government intelligence" title="Skill intelligence" description="Demand, ecosystem coverage, and gap status are calculated from connected records." /><Card className="filter-card"><div className="filter-row"><label>Search skills<input aria-label="Search skills" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skill name" /></label><label>Status<select aria-label="Filter skill status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Critical Gap</option><option>High Demand</option><option>Moderate Demand</option><option>Adequately Covered</option></select></label></div></Card><Card><Table><thead><tr><th>Skill</th><th>Demand</th><th>Employers</th><th>Course</th><th>Curriculum</th><th>Trainers</th><th>Candidates</th><th>Status</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.skillId}><td><b>{row.skill.name}</b><small className="table-sub">{row.explanation}</small></td><td><b>{row.openings}</b></td><td>{row.employers}</td><td>{row.coverage.courses}</td><td>{row.coverage.curriculum ? "Covered" : "Missing"}</td><td>{row.coverage.trainers}</td><td>{row.coverage.candidates}</td><td><Badge tone={row.status === "Critical Gap" ? "coral" : row.status === "High Demand" ? "yellow" : "green"}>{row.status}</Badge></td></tr>) : <tr><td colSpan="8"><EmptyState title="No matching skills" body="Try a different search or status filter." /></td></tr>}</tbody></Table></Card></>;
}
function PulseStatus({ status }) { return <Badge tone={status === "Critical Intervention" || status === "Critical Gap" ? "coral" : status === "High Priority" || status === "High Demand" ? "yellow" : "green"}>{status}</Badge>; }
function SkillPulseView({ data }) {
  const demand = demandRows(data); const skillRows = skillIntelligenceRows(data); const districts = districtPriorityRows(data); const metrics = executiveMetrics(data); const [selectedSkill, setSelectedSkill] = useState(demand[0]?.skillId || "power-bi"); const [scenario, setScenario] = useState({ additionalSeats: 0, additionalTrainers: 0, curriculumSkill: "" }); const detail = skillPulseDetail(selectedSkill, data); const simulation = simulateIntervention(data, { skillId: selectedSkill, ...scenario }); const selectScenario = (name) => { if (name === "capacity") setScenario({ additionalSeats: Math.max(10, Math.ceil(Math.max(detail.capacityGap, 0) / 5) * 5), additionalTrainers: 0, curriculumSkill: "" }); if (name === "trainer") setScenario({ additionalSeats: 0, additionalTrainers: 1, curriculumSkill: "" }); if (name === "curriculum") setScenario({ additionalSeats: 0, additionalTrainers: 0, curriculumSkill: selectedSkill }); };
  const rising = skillRows.filter((row) => row.level === "High").sort((a, b) => b.openings - a.openings); const narrative = rising[0] ? `${rising[0].skill.name} is the strongest current demand signal with ${rising[0].openings} openings. ${detail.skill.name} shows ${detail.capacityGap > 0 ? "a training capacity gap" : "capacity coverage"}, so the highest-impact prototype intervention is targeted ecosystem coverage.` : "Current employer demand is still forming; monitor new consultations before changing capacity.";
  return <><PageHeader eyebrow="Government intelligence / decision support" title="Skill Pulse" description="A deterministic command centre for seeing where demand is rising and testing what an intervention could change." action={<Badge tone="green">Live data · simulation safe</Badge>} /><Card className="pulse-story"><div className="eyebrow">EXECUTIVE STORY</div><h2>{narrative}</h2><p>Generated from current consultations, training capacity, course coverage, trainer profiles, candidate profiles, and outcomes.</p></Card><div className="metrics-grid pulse-status-grid"><Metric label="Industry openings" value={metrics.openings} detail="current demand" tone="coral" /><Metric label="Active employers" value={metrics.employers} detail="requesting skills" /><Metric label="Critical skill gaps" value={skillRows.filter((row) => row.status === "Critical Gap").length} detail="high demand with low coverage" tone="coral" /><Metric label="District capacity gaps" value={metrics.districtsWithGaps} detail="priority districts" tone="yellow" /><Metric label="Training seats" value={metrics.availableSeats} detail="current supply" /><Metric label="Candidates upskilling" value={data.candidates.filter((candidate) => candidateAnalysis(candidate, data).missing.length > 0).length} detail="with current skill gaps" /><Metric label="Placements" value={metrics.placements} detail="verified outcomes" tone="green" /><Metric label="Feedback coverage" value={`${data.placements.length ? Math.round(metrics.feedback / data.placements.length * 100) : 0}%`} detail="placements with feedback" tone="blue" /></div><div className="pulse-grid"><Card><div className="section-head"><div><h2>Top rising / high-demand skills</h2><p>Select a skill to open its drill-down and simulate an intervention.</p></div><Badge>Click a row</Badge></div><Table><thead><tr><th>Skill</th><th>Demand</th><th>Employers</th><th>Coverage</th><th>Gap score</th><th>Status</th></tr></thead><tbody>{skillRows.sort((a, b) => b.openings - a.openings).map((row) => <tr key={row.skillId}><td><button className="skill-row-button" onClick={() => setSelectedSkill(row.skillId)}><b>{row.skill.name}</b><small>{row.explanation}</small></button></td><td>{row.openings}</td><td>{row.employers}</td><td>{[row.coverage.courses > 0, row.coverage.trainers > 0, row.coverage.candidates > 0, row.coverage.curriculum].filter(Boolean).length}/4</td><td><Progress value={(4 - [row.coverage.courses > 0, row.coverage.trainers > 0, row.coverage.candidates > 0, row.coverage.curriculum].filter(Boolean).length) / 4 * 100} tone={row.status.includes("Gap") ? "coral" : "yellow"} /></td><td><PulseStatus status={row.status} /></td></tr>)}</tbody></Table></Card><Card><div className="section-head"><div><h2>District priority panel</h2><p>Sorted by openings minus relevant available seats.</p></div><Badge>Intervention priority</Badge></div><div className="district-stack">{districts.length ? districts.map((district) => <button className="district-pulse" key={district.district} onClick={() => setSelectedSkill(district.criticalSkills[0] ? data.skills.find((skill) => skill.name === district.criticalSkills[0])?.id || selectedSkill : selectedSkill)}><div><b>{district.district}</b><small>{district.openings} openings · {district.seats} seats · {district.candidates} candidates</small></div><div><strong>{district.gap > 0 ? `-${district.gap}` : `+${Math.abs(district.gap)}`}</strong><PulseStatus status={district.priority} /></div></button>) : <EmptyState title="No district data" body="District priorities appear when consultations or capacity records are available." />}</div></Card></div><Card><div className="section-head"><div><h2>Demand → supply matrix</h2><p>High demand plus low supply is the strongest intervention signal.</p></div><Badge>Selected: {detail.skill.name}</Badge></div><Table><thead><tr><th>Skill</th><th>Industry demand</th><th>Course coverage</th><th>Trainer coverage</th><th>Candidate coverage</th><th>Overall gap</th></tr></thead><tbody>{skillRows.map((row) => <tr className={row.skillId === selectedSkill ? "selected-row" : ""} key={row.skillId}><td><b>{row.skill.name}</b></td><td><Badge tone={row.level === "High" ? "coral" : "yellow"}>{row.openings} / {row.level}</Badge></td><td>{row.coverage.courses} course(s)</td><td>{row.coverage.trainers} trainer(s)</td><td>{row.coverage.candidates} candidate(s)</td><td><PulseStatus status={row.status} /></td></tr>)}</tbody></Table></Card><div className="decision-grid"><DecisionCard eyebrow={`${detail.skill.name} · skill drill-down`} title="What does this skill need?"><p><b>Demand:</b> {detail.employers} employer(s) / {detail.openings} openings.</p><p><b>Training:</b> {detail.coverage.courses} course(s), {detail.availableSeats} available seats.</p><p><b>Curriculum:</b> {detail.coverage.curriculum ? "Covered" : "Missing"}. <b>Trainers:</b> {detail.coverage.trainers} ready. <b>Candidates:</b> {detail.coverage.candidates} have the skill. <b>Placements:</b> {detail.placements} relevant.</p><p className="explain">Recommended action: {detail.capacityGap > 0 ? `increase ${detail.skill.name} training capacity by approximately ${detail.capacityGap} seats` : `monitor ${detail.skill.name} coverage as demand changes`}.</p></DecisionCard><DecisionCard eyebrow="Recommended government actions" title="Turn signals into action"><p><b>Capacity:</b> {detail.skill.name} has {detail.openings} openings and {detail.availableSeats} seats, leaving a gap of {Math.max(detail.capacityGap, 0)}.</p><p><b>Curriculum:</b> {detail.coverage.curriculum ? `${detail.skill.name} is represented in the curriculum.` : `${detail.skill.name} is demanded but missing from the curriculum.`}</p><p><b>Trainer:</b> {detail.coverage.trainers ? `${detail.coverage.trainers} trainer(s) cover ${detail.skill.name}.` : `${detail.skill.name} demand is high while trainer coverage is low.`}</p></DecisionCard></div><Simulator data={data} selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill} scenario={scenario} setScenario={setScenario} selectScenario={selectScenario} simulation={simulation} detail={detail} /></>;
}
function Simulator({ data, selectedSkill, setSelectedSkill, scenario, setScenario, selectScenario, simulation, detail }) { const chain = [["Industry demand", true], ["Skill gap", simulation.projected.gap > 0], ["Training intervention", scenario.additionalSeats > 0 || scenario.additionalTrainers > 0 || Boolean(scenario.curriculumSkill)], ["Trainer readiness", simulation.projected.trainerCoverage > detail.coverage.trainers], ["Candidate readiness", simulation.projected.candidatesCovered > 0], ["Placement potential", simulation.projected.gap <= 0 || simulation.projected.candidateGapReduction > 50]]; return <Card className="simulator-card"><div className="section-head"><div><div className="eyebrow">SIMULATION — DOES NOT MODIFY LIVE DATA</div><h2>Intervention simulator</h2><p>Change hypothetical inputs to project how the selected skill could respond. No Firestore or local records are written.</p></div><Badge tone="yellow">Scenario mode</Badge></div><div className="scenario-buttons"><button onClick={() => selectScenario("capacity")}>Expand training capacity</button><button onClick={() => selectScenario("trainer")}>Add trainer upskilling</button><button onClick={() => selectScenario("curriculum")}>Curriculum skill update</button></div><div className="simulator-controls"><label>Selected skill<select value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value)}>{data.skills.filter((skill) => requiredIndustrySkills(data).includes(skill.id)).map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></label><label>Additional training seats<input type="number" min="0" max="100" value={scenario.additionalSeats} onChange={(event) => setScenario((current) => ({ ...current, additionalSeats: Number(event.target.value) || 0 }))} /></label><label>Additional trainers<input type="number" min="0" max="20" value={scenario.additionalTrainers} onChange={(event) => setScenario((current) => ({ ...current, additionalTrainers: Number(event.target.value) || 0 }))} /></label><label>Curriculum improvement<select value={scenario.curriculumSkill} onChange={(event) => setScenario((current) => ({ ...current, curriculumSkill: event.target.value }))}><option value="">No curriculum change</option>{data.skills.filter((skill) => requiredIndustrySkills(data).includes(skill.id)).map((skill) => <option key={skill.id} value={skill.id}>Add {skill.name}</option>)}</select></label></div><div className="before-after"><div><div className="eyebrow">CURRENT STATE</div><h3>{detail.skill.name}</h3><p>Capacity: <b>{detail.availableSeats}</b> · Gap: <b>{Math.max(detail.capacityGap, 0)}</b></p><Progress value={detail.openings ? detail.availableSeats / detail.openings * 100 : 0} tone="coral" /></div><div><div className="eyebrow">SIMULATED STATE</div><h3>{detail.skill.name}</h3><p>Capacity: <b>{simulation.projected.availableSeats}</b> · Gap: <b>{Math.max(simulation.projected.gap, 0)}</b></p><Progress value={detail.openings ? simulation.projected.availableSeats / detail.openings * 100 : 0} tone="green" /></div></div><div className="sim-impact"><div><span>Candidate gap reduction</span><strong>{simulation.projected.candidateGapReduction}%</strong></div><div><span>Projected trainer coverage</span><strong>{simulation.projected.trainerCoverage}</strong></div><div><span>Projected course alignment</span><strong>{simulation.projected.courseAlignment}%</strong></div><div><span>Potentially covered</span><strong>{simulation.projected.candidatesCovered} candidates</strong></div></div><div className="impact-chain">{chain.map(([label, active], index) => <div className={active ? "chain-node active" : "chain-node"} key={label}><span>{index + 1}</span><b>{label}</b>{index < chain.length - 1 && <i>→</i>}</div>)}</div><div className="simulation-insight"><b>Why this matters</b><p>{simulation.explanation} This is a projected result based on current prototype data, not a guaranteed real-world outcome.</p></div></Card>; }
function PeopleEvidenceReview({ type, data }) { const trainers = type === "trainers"; const items = (trainers ? data.trainers : data.candidates).map((item) => { const result = trainers ? trainerAnalysis(item, data) : candidateAnalysis(item, data); const score = trainers ? result.readiness : result.fit; return { id: item.id, title: item.name, signal: `${score}% ${trainers ? "readiness" : "role fit"}`, evidence: [`${result.matched.length} matched skill(s)`, `${result.missing.length} missing skill(s)`, ...(trainers ? [] : [`Target role: ${item.targetRole || "Data Operations Analyst"}`])], logic: trainers ? "Readiness compares trainer skills with current industry requirements." : "Role fit compares candidate skills with current required industry skills.", recommendation: result.missing.length ? `Prioritize ${skillNames(result.missing).join(", ")} through the existing ${trainers ? "upskilling" : "training pathway"}.` : "Maintain the current profile and monitor changing demand." }; }); return <EvidenceReview title={trainers ? "Trainer readiness evidence" : "Candidate guidance evidence"} items={items} />; }
function SkillGapEvidenceReview({ data }) { const items = skillIntelligenceRows(data).map((row) => ({ id: row.skillId, title: row.skill.name, signal: `${row.openings} industry openings`, evidence: [`${row.coverage.courses} course(s)`, `${row.coverage.curriculum ? "Curriculum covered" : "Curriculum missing"}`, `${row.coverage.trainers} trainer(s)`, `${row.coverage.candidates} candidate(s)`], logic: "Industry demand is compared with ecosystem coverage.", recommendation: row.status === "Critical Gap" ? `Prioritize ${row.skill.name} training and ecosystem coverage.` : `Monitor ${row.skill.name} as demand changes.` })); return <EvidenceReview title="Skill gap evidence" items={items} />; }
function GovernmentView({ view, data, setView }) {
  if (view === "overview") return <ExecutiveView data={data} setView={setView} />;
  if (view === "skill-pulse") return <SkillPulseCommandCenter data={data} />;
  if (view === "labour-market") return <LabourMarketView data={data} />;
  if (view === "skill-intelligence") return <SkillIntelligenceView data={data} />;
  if (view === "skill-gap") return <><SkillGapView data={data} /><SkillGapEvidenceReview data={data} /></>;
  if (view === "course-intelligence" || view === "curriculum") return <AlignmentView type={view} data={data} />;
  if (view === "capacity" || view === "district") return <CapacityView type={view} data={data} />;
  if (view === "trainers" || view === "candidates") return <><PeopleIntelligence type={view} data={data} /><PeopleEvidenceReview type={view} data={data} /></>;
  return <PlacementOutcomes data={data} />;
}

function SkillGapView({ data }) { const required = requiredIndustrySkills(data); const courses = data.courses.flatMap((course) => course.skillIds); const curriculum = data.curriculums[0]; return <><PageHeader eyebrow="Government intelligence" title="Skill gap analysis" description="Industry demand is compared with course, curriculum, trainer, and candidate coverage." /><Card><Table><thead><tr><th>Skill</th><th>Industry demand</th><th>Courses</th><th>Curriculum</th><th>Trainers</th><th>Priority</th></tr></thead><tbody>{required.map((skillId) => { const courseCovered = courses.includes(skillId); const curriculumCovered = curriculum?.skillIds.includes(skillId); const trainerCount = data.trainers.filter((trainer) => trainer.skillIds.includes(skillId)).length; const candidateCount = data.candidates.filter((candidate) => candidate.skillIds.includes(skillId)).length; const gapCount = [courseCovered, curriculumCovered, trainerCount > 0, candidateCount > 0].filter(Boolean).length; return <tr key={skillId}><td><b>{getSkill(skillId).name}</b></td><td><Badge tone="coral">Demanded</Badge></td><td>{courseCovered ? "Covered" : "Missing"}</td><td>{curriculumCovered ? "Covered" : "Missing"}</td><td>{trainerCount} trainer(s)</td><td><Badge tone={gapCount < 2 ? "coral" : gapCount < 4 ? "yellow" : "green"}>{gapCount < 2 ? "Critical" : gapCount < 4 ? "Watch" : "Covered"}</Badge></td></tr>; })}</tbody></Table></Card><Card><div className="section-head"><div><h2>Power BI explanation</h2><p>Why this skill is a current intervention priority.</p></div><Badge tone="coral">Actionable gap</Badge></div><div className="recommendation"><span className="action-icon coral">!</span><div><b>Power BI is demanded by {data.consultations.filter((item) => item.requiredSkillIds.includes("power-bi")).length} consultation(s)</b><p>{data.courses.filter((course) => course.skillIds.includes("power-bi")).length} course(s) cover it, the current curriculum {curriculum?.skillIds.includes("power-bi") ? "covers it" : "does not cover it"}, and {data.trainers.filter((trainer) => trainer.skillIds.includes("power-bi")).length} trainer(s) are ready. Add Power BI/Data Visualization to the curriculum when curriculum coverage is missing.</p></div></div></Card></>; }
function LabourMarketView({ data }) {
  const demand = demandRows(data);
  const total = totalOpenings(data);
  const consultOpenings = (data.consultations || []).reduce((sum, item) => sum + (Number(item.openings) || 0), 0);
  const postingsOpenings = (data.jobPostings || []).reduce((sum, item) => sum + (Number(item.openings) || 1), 0);
  const postings = data.jobPostings || [];
  const sectors = data.sectorGrowth || [];

  return (
    <>
      <PageHeader
        eyebrow="Government intelligence"
        title="Labour market intelligence"
        description="Aggregated hiring signals combining direct employer consultations, web job postings, and state sector reports."
      />

      <Card style={{ background: "#e8f3ef", border: "1px solid #79c8a8", marginBottom: "18px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "20px", color: "var(--teal)" }}>ℹ</span>
          <div>
            <b style={{ color: "var(--navy)", fontSize: "12px" }}>Simulated Real-Time Labour Market Ingestion Pipeline</b>
            <p style={{ color: "var(--navy)", fontSize: "11px", margin: "3px 0 0" }}>
              Demo data below simulates a job-posting/NCS/PLFS integration. Replace externalSignals.js with a live ingestion job in production.
            </p>
          </div>
        </div>
      </Card>

      <div className="metrics-grid">
        <Metric label="Total market demand" value={total} detail="consultations + crawled postings" tone="coral" />
        <Metric label="Employer consultations" value={consultOpenings} detail="direct submitted cohort demand" tone="blue" />
        <Metric label="Ingested job postings" value={postingsOpenings} detail="from NCS & job boards" tone="green" />
        <Metric label="Monitored sectors" value={sectors.length} detail="state-level growth tracking" tone="yellow" />
      </div>

      <Card className="chart-card" style={{ marginTop: "24px", marginBottom: "24px" }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">RECHARTS SECTOR TRENDS</div>
            <h2>Annual Sector Expansion Rate (YoY Growth %)</h2>
            <p>Monitored annual hiring growth across Maharashtra industry corridors</p>
          </div>
          <Badge tone="yellow">Macro Trend</Badge>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sectors.map((s) => ({
                name: s.sector.length > 20 ? `${s.sector.slice(0, 18)}…` : s.sector,
                fullName: s.sector,
                growth: s.yoyGrowthPercent,
              }))}
              margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8efea" vertical={false} />
              <XAxis dataKey="name" stroke="#6d7b77" fontSize={10} interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis stroke="#6d7b77" fontSize={10} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="custom-chart-tooltip">
                        <b>{item.fullName}</b>
                        <p>Annual Growth: <span>+{item.growth}% YoY</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="growth" name="YoY Growth %" fill="var(--yellow)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="section-head" style={{ marginTop: "24px" }}>
        <div>
          <h2>Sector Growth & Macro Projections (PLFS / MSDE)</h2>
          <p>YoY expansion rate and emerging technology signals across Maharashtra.</p>
        </div>
        <Badge tone="green">State growth data</Badge>
      </div>
      <div className="course-grid" style={{ marginBottom: "24px" }}>
        {sectors.map((sec) => (
          <Card key={sec.sector}>
            <div className="section-head">
              <div>
                <div className="eyebrow">ANNUAL GROWTH: +{sec.yoyGrowthPercent}%</div>
                <h2>{sec.sector}</h2>
                <p>{sec.projectedHiring}</p>
              </div>
              <Badge tone="yellow">+{sec.yoyGrowthPercent}% YoY</Badge>
            </div>
            <p className="explain"><b>Primary Growth Driver:</b> {sec.driver}</p>
            <div style={{ margin: "12px 0" }}>
              <small style={{ display: "block", color: "var(--muted)", marginBottom: "6px", fontWeight: "700" }}>Emerging Skill Signals:</small>
              <SkillTags ids={sec.emergingSkillIds} />
            </div>
            <small style={{ display: "block", color: "#8a9992", fontSize: "10px", marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "8px" }}>
              Source: {sec.source}
            </small>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <div className="section-head">
          <div>
            <h2>Ingested Job Postings (National Career Service & Web Crawl)</h2>
            <p>Real-time market signals parsed into canonical platform Skill IDs.</p>
          </div>
          <Badge tone="coral">{postings.length} live posting(s)</Badge>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Employer / Organization</th>
              <th>District</th>
              <th>Parsed Canonical Skills</th>
              <th>Vacancies</th>
              <th>Ingestion Source</th>
            </tr>
          </thead>
          <tbody>
            {postings.map((post) => (
              <tr key={post.id}>
                <td>
                  <b>{post.title}</b>
                  <small className="table-sub">Posted {post.postedAt}</small>
                </td>
                <td>{post.company}</td>
                <td>{post.district}</td>
                <td><SkillTags ids={post.skillIds} /></td>
                <td><strong>{post.openings}</strong></td>
                <td><Badge tone="blue">{post.source}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <div className="section-head">
          <div>
            <h2>Combined Industry Skill Demand Matrix</h2>
            <p>Multi-source demand aggregation feeding Skill Pulse, Course Alignment, and District Plans.</p>
          </div>
          <Badge>Canonical Skill IDs</Badge>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Total Openings</th>
              <th>Consultation Demand</th>
              <th>Job Posting Signal</th>
              <th>Demand Level</th>
            </tr>
          </thead>
          <tbody>
            {demand.map((row) => (
              <tr key={row.skillId}>
                <td><b>{row.skill.name}</b></td>
                <td><strong>{row.openings} openings</strong></td>
                <td>{(data.consultations || []).filter((c) => c.requiredSkillIds?.includes(row.skillId)).reduce((s, c) => s + (Number(c.openings) || 0), 0)} openings</td>
                <td>{(data.jobPostings || []).filter((p) => p.skillIds?.includes(row.skillId)).reduce((s, p) => s + (Number(p.openings) || 1), 0)} openings</td>
                <td><Badge tone={row.level === "High" ? "coral" : "yellow"}>{row.level}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

function DistrictTrainingPlanReport({ plan, onClose }) {
  return (
    <div className="training-plan-print" style={{ marginBottom: "22px" }}>
      <Card className="plan-report-card">
        <div className="section-head">
          <div>
            <div className="eyebrow">GOVERNMENT OF MAHARASHTRA · SKILL ACTION PLAN</div>
            <h2>District Skilling & Training Plan: {plan.district}</h2>
            <p>Generated: {plan.generatedAt} · Dept of Skills, Employment, Entrepreneurship & Innovation (PS 26134)</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => window.print()}>⎙ Export Official Plan (Print / PDF)</Button>
            {onClose && <Button variant="secondary" onClick={onClose}>Close Report</Button>}
          </div>
        </div>

        <div className="plan-summary-grid">
          <div className="plan-summary-box">
            <span>District Openings</span>
            <strong>{plan.demandSummary.totalOpenings}</strong>
          </div>
          <div className="plan-summary-box">
            <span>Active Hiring Employers</span>
            <strong>{plan.demandSummary.activeEmployers}</strong>
          </div>
          <div className="plan-summary-box">
            <span>Capacity Deficit Skills</span>
            <strong>{plan.capacityGaps.length}</strong>
          </div>
          <div className="plan-summary-box">
            <span>Flagged Courses</span>
            <strong>{plan.obsoleteCoursesToRetire.length}</strong>
          </div>
        </div>

        <div className="plan-section">
          <h3>1. Regional Industry Demand Overview</h3>
          <p className="muted" style={{ marginBottom: "10px" }}>Primary hiring roles: {plan.demandSummary.primaryRoles.join(", ") || "Data Operations"}</p>
          <Table>
            <thead>
              <tr>
                <th>Top Demanded Skill</th>
                <th>Openings (Consultations + Ingested)</th>
                <th>Priority Tier</th>
              </tr>
            </thead>
            <tbody>
              {plan.demandSummary.topDemandedSkills.map((s) => (
                <tr key={s.name}>
                  <td><b>{s.name}</b></td>
                  <td>{s.openings} vacancies</td>
                  <td><Badge tone={s.level === "High" ? "coral" : "yellow"}>{s.level} Priority</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="plan-section">
          <h3>2. Seat Capacity Expansion Directives</h3>
          <Table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Current Seats</th>
                <th>Demand Shortage</th>
                <th>Recommended Expansion</th>
                <th>Directive Rationale</th>
              </tr>
            </thead>
            <tbody>
              {plan.recommendedSeatIncreases.length ? plan.recommendedSeatIncreases.map((rec) => (
                <tr key={rec.skillId}>
                  <td><b>{rec.skillName}</b></td>
                  <td>{rec.currentSeats} seats</td>
                  <td><Badge tone="coral">-{rec.recommendedIncrease} deficit</Badge></td>
                  <td><strong>+{rec.recommendedIncrease} seats</strong> (Target: {rec.targetCapacity})</td>
                  <td className="muted">{rec.reason}</td>
                </tr>
              )) : <tr><td colSpan={5}>Training capacity meets current demand across all skills.</td></tr>}
            </tbody>
          </Table>
        </div>

        <div className="plan-section">
          <h3>3. Trainer Upskilling & Capacity Building Directives</h3>
          <Table>
            <thead>
              <tr>
                <th>Trainer</th>
                <th>Experience</th>
                <th>Recommended Upskilling</th>
                <th>Target Skills</th>
                <th>Intervention Rationale</th>
              </tr>
            </thead>
            <tbody>
              {plan.recommendedTrainerUpskilling.length ? plan.recommendedTrainerUpskilling.map((rec) => (
                <tr key={rec.trainerId}>
                  <td><b>{rec.trainerName}</b></td>
                  <td>{rec.experience}</td>
                  <td><Badge tone="yellow">Upskilling Required</Badge></td>
                  <td>{rec.missingSkills.join(", ")}</td>
                  <td className="muted">{rec.reason}</td>
                </tr>
              )) : <tr><td colSpan={5}>All district instructional staff are fully aligned with current demand.</td></tr>}
            </tbody>
          </Table>
        </div>

        <div className="plan-section">
          <h3>4. State Curriculum Modernization Directives</h3>
          <Table>
            <thead>
              <tr>
                <th>Curriculum Framework</th>
                <th>Owner / Authority</th>
                <th>Current Alignment</th>
                <th>Directive</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {plan.recommendedCurriculumChanges.length ? plan.recommendedCurriculumChanges.map((rec) => (
                <tr key={rec.curriculumId}>
                  <td><b>{rec.curriculumName}</b></td>
                  <td>{rec.owner}</td>
                  <td><strong style={{ color: "var(--teal)" }}>{rec.alignment}%</strong></td>
                  <td>{rec.action}</td>
                  <td className="muted">{rec.reason}</td>
                </tr>
              )) : <tr><td colSpan={5}>All curricula meet 100% industry alignment.</td></tr>}
            </tbody>
          </Table>
        </div>

        <div className="plan-section">
          <h3>5. Course Rationalization & Decommissioning Directives</h3>
          <Table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Enrolment / Seats</th>
                <th>Status</th>
                <th>Decommissioning / Rationalization Action</th>
                <th>Deterministic Evidence</th>
              </tr>
            </thead>
            <tbody>
              {plan.obsoleteCoursesToRetire.length ? plan.obsoleteCoursesToRetire.map((rec) => (
                <tr key={rec.courseId}>
                  <td><b>{rec.courseName}</b></td>
                  <td>{rec.enrolled} / {rec.seats}</td>
                  <td><Badge tone={rec.status === "Obsolete" ? "coral" : "yellow"}>{rec.status}</Badge></td>
                  <td><b>{rec.action}</b></td>
                  <td className="muted">{rec.reason}</td>
                </tr>
              )) : <tr><td colSpan={5}>No obsolete or oversupplied courses detected in this district.</td></tr>}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function AlignmentView({ type, data }) {
  const items = (type === "curriculum" ? data.curriculums : data.courses).map((item) => {
    const result = type === "curriculum" ? curriculumAnalysis(item, data) : courseAnalysis(item, data);
    const supply = type === "curriculum" ? null : courseSupplyStatus(item, data);
    return { id: item.id, title: item.name || item.title, signal: `${result.alignment}% alignment${supply ? ` · ${supply.status}` : ""}`, evidence: [`${result.covered.length} matched skill(s)`, `${result.missing.length} missing skill(s)`, ...(supply ? [`${supply.enrolmentRatio}% enrolment`] : [])], logic: supply?.reason || "Matched required skills divided by total required industry skills.", recommendation: result.missing.length ? `Add ${skillNames(result.missing).join(", ")} to improve alignment.` : "Maintain current coverage and monitor new demand." };
  });
  return <><AlignmentViewContent type={type} data={data} /><EvidenceReview title={type === "curriculum" ? "Curriculum alignment evidence" : "Course status evidence"} items={items} /></>;
}
function AlignmentViewContent({ type, data }) {
  const items = type === "curriculum" ? data.curriculums : data.courses;
  return (
    <>
      <PageHeader
        eyebrow="Government intelligence"
        title={type === "curriculum" ? "Curriculum alignment" : "Course intelligence"}
        description="Alignment is matched required skills divided by total required industry skills."
      />
      <div className="course-grid">
        {items.map((item) => {
          const result = type === "curriculum" ? curriculumAnalysis(item, data) : courseAnalysis(item, data);
          const supply = type !== "curriculum" ? courseSupplyStatus(item, data) : null;
          return (
            <Card key={item.id}>
              <div className="course-title">
                <span className="course-icon">▤</span>
                <div style={{ flex: 1 }}>
                  <h2>{item.name || item.title}</h2>
                  <p>{item.duration || item.owner || "Industry pathway"}</p>
                </div>
                {supply && (
                  <Badge tone={supply.status === "Obsolete" || supply.status === "Undersupplied" ? "coral" : supply.status === "Oversupplied" ? "yellow" : "green"}>
                    {supply.status}
                  </Badge>
                )}
              </div>
              <div className="course-score">
                <strong>{result.alignment}%</strong>
                <span>{type === "curriculum" ? "curriculum alignment" : "course alignment"}</span>
              </div>
              <Progress value={result.alignment} tone={result.alignment >= 80 ? "green" : "yellow"} />
              {supply && (
                <div style={{ background: "#f5f8f5", border: "1px solid var(--line)", borderRadius: "6px", padding: "8px 12px", margin: "12px 0", fontSize: "11px", color: "var(--navy)" }}>
                  <b>Supply evaluation:</b> {supply.reason}
                </div>
              )}
              <p className="explain">
                Matched: {result.covered.length ? skillNames(result.covered).join(", ") : "None"}. Missing: {result.missing.length ? skillNames(result.missing).join(", ") : "None"}.
              </p>
              {result.missing.length > 0 && (
                <div className="recommendation">
                  <span className="action-icon yellow">→</span>
                  <div>
                    <b>Recommended addition</b>
                    <p>Add {skillNames(result.missing).join(" and ")} to improve alignment with current employer demand.</p>
                  </div>
                </div>
              )}
              <SkillTags ids={item.skillIds} />
            </Card>
          );
        })}
      </div>
    </>
  );
}

function CapacityView({ type, data }) {
  const items = capacityRows(data).map((row) => ({ id: row.skillId, title: row.skill.name, signal: `${row.gap > 0 ? "Capacity gap" : "Capacity covered"} · ${row.gap} net`, evidence: [`${row.openings} openings`, `${row.availableSeats} available seats`, `${row.gap} seat gap`], logic: row.gap > 0 ? "Demand exceeds available training capacity." : "Available capacity meets or exceeds current demand.", recommendation: row.gap > 0 ? `Increase ${row.skill.name} training capacity by ${row.gap} seats.` : `Monitor ${row.skill.name} capacity.` }));
  return <><CapacityViewContent type={type} data={data} /><EvidenceReview title={type === "district" ? "District action evidence" : "Training capacity evidence"} items={items} /></>;
}
function CapacityViewContent({ type, data }) {
  const districtList = data.districts || [{ id: "pune", name: "Pune" }];
  const [planDistrict, setPlanDistrict] = useState(districtList[0]?.name || "Pune");
  const [showPlan, setShowPlan] = useState(false);

  const rows = capacityRows(data, planDistrict === "All" ? null : planDistrict);
  const districts = districtDemand(data);
  const targetDistrictForPlan = planDistrict === "All" ? districtList[0]?.name : planDistrict;
  const plan = generateDistrictTrainingPlan(targetDistrictForPlan, data);

  const districtLabel = planDistrict === "All" ? "All Districts (Maharashtra)" : planDistrict;
  const currentDemand = planDistrict === "All"
    ? Object.values(districts).reduce((s, v) => s + v, 0)
    : (districts[planDistrict] || 0);

  return (
    <>
      <PageHeader
        eyebrow={`Government intelligence / ${districtLabel}`}
        title={type === "district" ? "District intelligence" : "Training capacity"}
        description={`Demand minus available training capacity, calculated from connected ${districtLabel} records.`}
        action={
          type === "district" ? (
            <Button onClick={() => setShowPlan(!showPlan)}>
              {showPlan ? "Hide Training Plan" : "⚡ Generate District Training Plan"}
            </Button>
          ) : null
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", background: "#fff", padding: "12px 18px", borderRadius: "8px", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--muted)" }}>Filter District:</label>
          <select
            value={planDistrict}
            onChange={(e) => setPlanDistrict(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "5px", border: "1px solid var(--line)", background: "#fbfdfb", fontSize: "12px" }}
          >
            <option value="All">All Districts (State Overview)</option>
            {districtList.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <Badge tone="green">{type === "district" ? "SIH PS 26134 Core Deliverable" : `${rows.length} skills tracked`}</Badge>
      </div>

      {showPlan && <DistrictTrainingPlanReport plan={plan} onClose={() => setShowPlan(false)} />}

      <div className="metrics-grid">
        <Metric label={`${districtLabel} demand`} value={currentDemand} detail="openings from consultations & job postings" tone="coral" />
        <Metric label="Available seats" value={rows.reduce((sum, row) => sum + row.availableSeats, 0)} detail={`across ${rows.length} tracked skills`} />
        <Metric label="Net capacity gap" value={rows.reduce((sum, row) => sum + row.gap, 0)} detail="demand minus seats" tone="yellow" />
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Demand</th>
              <th>Available</th>
              <th>Gap</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.skillId}>
                <td><b>{row.skill.name}</b></td>
                <td>{row.openings}</td>
                <td>{row.availableSeats}</td>
                <td><Badge tone={row.gap > 0 ? "coral" : "green"}>{row.gap > 0 ? `-${row.gap}` : `+${Math.abs(row.gap)}`}</Badge></td>
                <td className="muted">{row.gap > 0 ? `Add ${row.gap} seats` : "Capacity meets demand"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      {type === "district" && <DistrictGapHeatmap districts={districtPriorityRows(data)} />}
    </>
  );
}
function PeopleIntelligence({ type, data }) { const trainers = type === "trainers"; const items = trainers ? data.trainers : data.candidates; return <><PageHeader eyebrow="Government intelligence" title={trainers ? "Trainer intelligence" : "Candidate intelligence"} description="Readiness and fit are calculated against the same industry skill demand." /><Card><Table><thead><tr><th>{trainers ? "Trainer" : "Candidate"}</th><th>Readiness / fit</th><th>Matched skills</th><th>Missing skills</th><th>Status</th></tr></thead><tbody>{items.map((item) => { const result = trainers ? trainerAnalysis(item, data) : candidateAnalysis(item, data); return <tr key={item.id}><td><b>{item.name}</b><small className="table-sub">{item.experience || item.education} · {item.district}</small></td><td><b>{result.readiness || result.fit}%</b><Progress value={result.readiness || result.fit} tone={(result.readiness || result.fit) >= 80 ? "green" : "yellow"} /></td><td><SkillTags ids={result.matched} entityId={item.id} data={data} /></td><td>{result.missing.length ? skillNames(result.missing).join(", ") : "None"}</td><td><Badge tone={item.status === "Placed" ? "green" : "blue"}>{item.status || "Active"}</Badge></td></tr>; })}</tbody></Table></Card></>; }
function PlacementOutcomes({ data }) { const feedback = feedbackSummary(data); return <><PageHeader eyebrow="Government intelligence" title="Placement outcomes" description="Verified placement records and employer feedback close the loop." /><div className="metrics-grid"><Metric label="Verified placements" value={data.placements.length} detail="real placement records" tone="green" /><Metric label="Feedback records" value={feedback.count} detail="submitted by employers" /><Metric label="Average rating" value={`${feedback.average} / 5`} detail="from connected feedback" tone="yellow" /></div><Card>{data.placements.length ? <Table><thead><tr><th>Candidate</th><th>Role</th><th>District</th><th>Employer</th><th>Outcome</th><th>Feedback</th></tr></thead><tbody>{data.placements.map((placement) => <tr key={placement.id}><td><b>{data.candidates.find((item) => item.id === placement.candidateId)?.name || "Unknown candidate"}</b></td><td>{placement.role}</td><td>{placement.district || data.districts?.[0]?.name || "Pune"}</td><td>{data.employers.find((item) => item.id === placement.employerId)?.name || placement.employerId}</td><td><Badge tone="green">{placement.status}</Badge></td><td>{data.employerFeedback.some((item) => item.placementId === placement.id) ? "Received" : "Pending"}</td></tr>)}</tbody></Table> : <EmptyState title="No placements yet" body="Candidate placement records will appear here once submitted." />}</Card></>; }

function ConsultationForm({ data, onAdd }) {
  const [selectedEmployerId, setSelectedEmployerId] = useState(data.employers[0]?.id || "technova");
  const employer = data.employers.find((e) => e.id === selectedEmployerId) || data.employers[0];
  const [form, setForm] = useState({
    title: `${employer.role} hiring cohort`,
    openings: employer.openings || 10,
    note: `Seeking job-ready talent for the ${employer.district} delivery hub.`,
    role: employer.role,
    district: employer.district,
    requiredSkillIds: employer.skillIds ? [...employer.skillIds] : [...roleRequirements],
  });
  const toggle = (id) =>
    setForm((current) => ({
      ...current,
      requiredSkillIds: current.requiredSkillIds.includes(id)
        ? current.requiredSkillIds.filter((skillId) => skillId !== id)
        : [...current.requiredSkillIds, id],
    }));
  return (
    <>
      <PageHeader
        eyebrow="Employer workspace"
        title="Create consultation"
        description="Submit structured demand that immediately feeds government intelligence."
      />
      <Card className="form-card">
        <div className="form-grid">
          <label>
            Company
            <select
              value={selectedEmployerId}
              onChange={(e) => {
                const empId = e.target.value;
                setSelectedEmployerId(empId);
                const emp = data.employers.find((item) => item.id === empId);
                if (emp) {
                  setForm((prev) => ({
                    ...prev,
                    role: emp.role,
                    district: emp.district,
                    openings: emp.openings || 10,
                    title: `${emp.role} hiring cohort`,
                    note: `Seeking job-ready talent for the ${emp.district} delivery hub.`,
                    requiredSkillIds: emp.skillIds ? [...emp.skillIds] : prev.requiredSkillIds,
                  }));
                }
              }}
            >
              {data.employers.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.district})</option>
              ))}
            </select>
          </label>
          <label>
            District
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            >
              {(data.districts || [{ name: "Pune" }]).map((d) => (
                <option key={d.name || d} value={d.name || d}>{d.name || d}</option>
              ))}
            </select>
          </label>
          <label>
            Role
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </label>
          <label>
            Openings
            <input
              type="number"
              min="1"
              value={form.openings}
              onChange={(e) => setForm({ ...form, openings: e.target.value })}
            />
          </label>
          <label className="full">
            Consultation title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="full">
            Context and outcome
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
        </div>
        <div className="section-head">
          <div>
            <h2>Required skills</h2>
            <p>Uses canonical Skill IDs across every downstream module.</p>
          </div>
          <Badge>{form.requiredSkillIds.length} selected</Badge>
        </div>
        <div className="skill-pills">
          {skillCatalog.map((skill) => (
            <button
              type="button"
              className={`skill-pill ${form.requiredSkillIds.includes(skill.id) ? "selected" : ""}`}
              key={skill.id}
              onClick={() => toggle(skill.id)}
            >
              <span>{form.requiredSkillIds.includes(skill.id) ? "✓" : "+"}</span>
              <b>{skill.name}</b>
            </button>
          ))}
        </div>
        <div className="form-footer">
          <span className="muted">This submission updates Labour Market and Skill Intelligence.</span>
          <Button
            disabled={!form.role || Number(form.openings) < 1 || !form.requiredSkillIds.length}
            onClick={() => onAdd({ type: "consultation", employerId: selectedEmployerId, ...form })}
          >
            Submit consultation
          </Button>
        </div>
      </Card>
    </>
  );
}
function FeedbackForm({ data, onAdd }) { const placement = data.placements[0]; const [form, setForm] = useState({ rating: 4, skillGaps: "", note: "" }); return <><PageHeader eyebrow="Employer workspace" title="Placement feedback" description="Share structured post-placement feedback that feeds outcome intelligence." /><Card className="form-card"><label>Placement<select><option>{placement?.role || "No placement available"} · {data.candidates.find((item) => item.id === placement?.candidateId)?.name || "Candidate"}</option></select></label><label>Overall rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}><option value="5">5 - Excellent</option><option value="4">4 - Strong</option><option value="3">3 - Developing</option><option value="2">2 - Needs support</option><option value="1">1 - Poor</option></select></label><label>Skill gaps<input value={form.skillGaps} onChange={(e) => setForm({ ...form, skillGaps: e.target.value })} placeholder="e.g. stakeholder communication" /></label><label>Comments<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Share an observation about job readiness" /></label><div className="form-footer"><span className="muted">Feedback is attached to this placement record.</span><Button disabled={!placement || !form.note} onClick={() => onAdd({ type: "feedback", ...form, placementId: placement.id })}>Submit feedback</Button></div></Card></>; }

function InstituteProposalsView({ data, onAdd }) {
  const [targetKey, setTargetKey] = useState("curriculum:curr-1");
  const [selectedSkills, setSelectedSkills] = useState(["power-bi"]);
  const [rationale, setRationale] = useState("Align offering with rising industry hiring requirements and capacity deficit.");
  const [showForm, setShowForm] = useState(false);

  const proposals = data.curriculumProposals || [];

  const toggleSkill = (id) => {
    setSelectedSkills((curr) =>
      curr.includes(id) ? curr.filter((s) => s !== id) : [...curr, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSkills.length) return;
    const [targetType, targetId] = targetKey.split(":");
    let targetName = targetId;
    if (targetType === "curriculum") {
      const c = data.curriculums?.find((item) => item.id === targetId);
      targetName = c ? c.title || c.name : "Curriculum Framework";
    } else {
      const c = data.courses?.find((item) => item.id === targetId);
      targetName = c ? c.name : "Course Cohort";
    }
    onAdd({
      type: "curriculum-proposal",
      targetType,
      targetId,
      targetName,
      proposedSkillIds: selectedSkills,
      rationale,
    });
    setShowForm(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Training institute / Curriculum"
        title="Curriculum change proposals"
        description="Propose curriculum enhancements and skill updates for industry validation."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ Propose curriculum update"}</Button>}
      />

      {showForm && (
        <Card className="form-card" style={{ marginBottom: "20px" }}>
          <div className="section-head">
            <div>
              <h2>Submit curriculum enhancement</h2>
              <p>Propose adding in-demand skills to a course or state curriculum framework.</p>
            </div>
            <Badge tone="blue">Industry Validation Workflow</Badge>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="full">
                Target course or curriculum framework
                <select
                  value={targetKey}
                  onChange={(e) => setTargetKey(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                >
                  <optgroup label="State Curriculums">
                    {(data.curriculums || []).map((c) => (
                      <option key={`curriculum:${c.id}`} value={`curriculum:${c.id}`}>
                        {c.title || c.name} (Curriculum)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Institute Courses">
                    {(data.courses || []).map((c) => (
                      <option key={`course:${c.id}`} value={`course:${c.id}`}>
                        {c.name} (Course)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>

              <label className="full">
                Proposal rationale / evidence
                <input
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Explain why this skill addition is needed based on labour market signals..."
                />
              </label>
            </div>

            <div className="section-head" style={{ marginTop: "16px" }}>
              <div>
                <h2>Proposed skill additions</h2>
                <p>Select canonical skills to add to this target syllabus.</p>
              </div>
              <Badge>{selectedSkills.length} selected</Badge>
            </div>

            <div className="skill-pills">
              {skillCatalog.map((skill) => (
                <button
                  type="button"
                  className={`skill-pill ${selectedSkills.includes(skill.id) ? "selected" : ""}`}
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                >
                  <span>{selectedSkills.includes(skill.id) ? "✓" : "+"}</span>
                  <b>{skill.name}</b>
                </button>
              ))}
            </div>

            <div className="form-footer" style={{ marginTop: "16px" }}>
              <span className="muted">This proposal will be sent to partner employers for validation.</span>
              <Button type="submit" disabled={!selectedSkills.length || !rationale.trim()}>
                Submit proposal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="section-head">
          <div>
            <h2>Submitted curriculum proposals</h2>
            <p>Track employer validation status and curriculum update lifecycle.</p>
          </div>
          <Badge tone="green">{proposals.length} record(s)</Badge>
        </div>

        {proposals.length ? (
          <Table>
            <thead>
              <tr>
                <th>Target syllabus</th>
                <th>Type</th>
                <th>Proposed skills</th>
                <th>Rationale</th>
                <th>Status</th>
                <th>Employer validation notes</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((prop) => (
                <tr key={prop.id}>
                  <td>
                    <b>{prop.targetName}</b>
                    <small className="table-sub">Submitted {prop.createdAt}</small>
                  </td>
                  <td>
                    <Badge tone="blue">{prop.targetType === "curriculum" ? "Curriculum" : "Course"}</Badge>
                  </td>
                  <td>
                    <SkillTags ids={prop.proposedSkillIds} />
                  </td>
                  <td style={{ maxWidth: "260px", fontSize: "12px" }}>{prop.rationale}</td>
                  <td>
                    <Badge tone={prop.status === "Approved" ? "green" : prop.status === "Rejected" ? "coral" : "yellow"}>
                      {prop.status}
                    </Badge>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    {prop.employerComment ? (
                      <div>
                        <b>Feedback:</b> {prop.employerComment}
                      </div>
                    ) : (
                      <span className="muted">Pending review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            title="No proposals submitted"
            body="Submit a curriculum proposal to request employer review and update syllabus content."
          />
        )}
      </Card>
    </>
  );
}

function EmployerProposalsView({ data, onAdd }) {
  const proposals = data.curriculumProposals || [];
  const [comments, setComments] = useState({});

  const handleCommentChange = (id, value) => {
    setComments((prev) => ({ ...prev, [id]: value }));
  };

  const handleAction = (proposalId, status) => {
    onAdd({
      type: "proposal-action",
      proposalId,
      status,
      employerComment: comments[proposalId] || (status === "Approved" ? "Validated and approved for hiring alignment." : "Curriculum change rejected."),
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Employer workspace / Validation"
        title="Curriculum validation & review"
        description="Review curriculum update proposals from training institutes. Approved updates are merged directly into official course/curriculum skills."
      />

      <div className="metrics-grid">
        <Metric
          label="Pending proposals"
          value={proposals.filter((p) => p.status === "Pending").length}
          detail="requiring employer validation"
          tone="yellow"
        />
        <Metric
          label="Approved updates"
          value={proposals.filter((p) => p.status === "Approved").length}
          detail="applied to live syllabi"
          tone="green"
        />
        <Metric
          label="Total proposals"
          value={proposals.length}
          detail="submitted by institutes"
        />
      </div>

      <Card>
        <div className="section-head">
          <div>
            <h2>Institute curriculum change requests</h2>
            <p>Direct employer feedback ensures training institutes teach what industry actually hires for.</p>
          </div>
          <Badge tone="blue">Direct Industry Input</Badge>
        </div>

        {proposals.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {proposals.map((prop) => {
              const isPending = prop.status === "Pending";
              return (
                <div
                  key={prop.id}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "16px",
                    background: isPending ? "#fff" : "#fcfdfc",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px" }}>{prop.targetName}</h3>
                        <Badge tone="blue">{prop.targetType}</Badge>
                        <Badge tone={prop.status === "Approved" ? "green" : prop.status === "Rejected" ? "coral" : "yellow"}>
                          {prop.status}
                        </Badge>
                      </div>
                      <small className="muted">Proposed by {prop.proposedBy || "Training Institute"} · Submitted {prop.createdAt}</small>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "4px", color: "var(--muted)" }}>PROPOSED SKILLS TO ADD:</div>
                    <SkillTags ids={prop.proposedSkillIds} />
                  </div>

                  <div style={{ background: "#f8faf9", padding: "10px 14px", borderRadius: "6px", marginBottom: "12px", fontSize: "12px" }}>
                    <b>Institute Rationale:</b> {prop.rationale}
                  </div>

                  {isPending ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", borderTop: "1px dashed var(--line)", paddingTop: "12px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "600" }}>
                        Employer validation comment:
                        <input
                          type="text"
                          value={comments[prop.id] || ""}
                          onChange={(e) => handleCommentChange(prop.id, e.target.value)}
                          placeholder="e.g. Validated. We have immediate openings requiring these skills."
                          style={{ marginTop: "4px", width: "100%", padding: "8px 12px", borderRadius: "5px", border: "1px solid var(--line)" }}
                        />
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          variant="primary"
                          onClick={() => handleAction(prop.id, "Approved")}
                        >
                          ✓ Approve & Apply to Syllabus
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleAction(prop.id, "Rejected")}
                        >
                          ✕ Reject Proposal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: "10px", fontSize: "12px" }}>
                      <b>Employer Feedback:</b> {prop.employerComment || "No comment provided."}
                      {prop.resolvedAt && <span className="muted" style={{ marginLeft: "8px" }}>· Resolved {prop.resolvedAt}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No proposals pending review"
            body="Training institutes haven't submitted any curriculum update proposals yet."
          />
        )}
      </Card>
    </>
  );
}

function EmployerView({ view, data, onAdd }) {
  const employer = data.employers[0];
  const demand = demandRows(data);
  const requiredProf = employer.requiredProficiency || data.requiredProficiency?.[employer.id];
  if (view === "create-consultation") return <ConsultationForm data={data} onAdd={onAdd} />;
  if (view === "consultations") return <><PageHeader eyebrow="Employer workspace" title="My consultations" description="Track demand submissions that feed the district intelligence layer." action={<Button onClick={() => onAdd({ type: "navigate", view: "create-consultation" })}>+ New consultation</Button>} /><Card><Table><thead><tr><th>Consultation</th><th>Role</th><th>District</th><th>Openings</th><th>Status</th></tr></thead><tbody>{data.consultations.filter((item) => item.employerId === employer.id).map((item) => <tr key={item.id}><td><b>{item.title}</b><small className="table-sub">Created {item.createdAt}</small></td><td>{item.role || item.title}</td><td>{item.district}</td><td>{item.openings}</td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></Table></Card></>;
  if (view === "required-skills") return <><PageHeader eyebrow="Employer workspace" title="Required skills" description="The same canonical requirements used by government, courses, trainers, and candidates." /><Card><div className="role-card"><div><div className="eyebrow">OPEN ROLE · {employer.openings} OPENINGS</div><h2>{employer.role}</h2><p>{employer.name} · {employer.district}</p></div><Badge tone="coral">Hiring now</Badge></div><SkillTags ids={requiredIndustrySkills(data)} proficiencies={requiredProf} /></Card></>;
  if (view === "curriculum-proposals") return <EmployerProposalsView data={data} onAdd={onAdd} />;
  if (view === "feedback") return <FeedbackForm data={data} onAdd={onAdd} />;
  return <><PageHeader eyebrow="Employer workspace" title={`Good morning, ${data.users.find((user) => user.role === "employer")?.name?.split(" ")[0] || "partner"}.`} description={`Your submitted demand is connected to the Maharashtra skill intelligence network (${employer.district} delivery hub).`} action={<Button onClick={() => onAdd({ type: "navigate", view: "create-consultation" })}>+ Create consultation</Button>} /><div className="metrics-grid"><Metric label="Open role" value={employer.role} detail={`${totalOpenings(data)} openings across demand`} tone="coral" /><Metric label="Consultations" value={data.consultations.filter((item) => item.employerId === employer.id).length} detail="submitted demand records" /><Metric label="Demanded skills" value={demand.length} detail="canonical requirements" tone="green" /></div><Card><div className="section-head"><div><h2>Current hiring signal</h2><p>Live required skills with proficiency tiers from your consultations</p></div><Badge>Connected</Badge></div><SkillTags ids={requiredIndustrySkills(data)} proficiencies={requiredProf} /></Card></>;
}

function InstituteView({ view, data, onAdd }) {
  if (view === "curriculum-proposals") return <InstituteProposalsView data={data} onAdd={onAdd} />;
  if (view === "courses" || view === "course-skills") return (
    <>
      <PageHeader
        eyebrow="Training institute"
        title={view === "courses" ? "Courses" : "Course skills"}
        description="Course coverage is evaluated against current industry demand and supply flags."
        action={<Button onClick={() => onAdd({ type: "course" })}>+ Add course</Button>}
      />
      <div className="course-grid">
        {data.courses.map((course) => {
          const result = courseAnalysis(course, data);
          const supply = courseSupplyStatus(course, data);
          const supplyTone = supply.status === "Obsolete" ? "coral" : supply.status === "Oversupplied" ? "yellow" : supply.status === "Undersupplied" ? "blue" : "green";
          return (
            <Card key={course.id}>
              <div className="course-title">
                <span className="course-icon">▤</span>
                <div>
                  <h2>{course.name}</h2>
                  <p>{course.duration} · {course.mode}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>
                <Badge tone={supplyTone}>{supply.status}</Badge>
                <small className="muted">{supply.enrolmentRatio}% enrolment</small>
              </div>
              <p className="explain" style={{ fontSize: "11px", margin: "4px 0 10px 0" }}>
                {supply.reason}
              </p>
              <div className="course-score">
                <strong>{result.alignment}%</strong>
                <span>alignment</span>
              </div>
              <Progress value={result.alignment} tone="green" />
              <div className="capacity-line">
                <span>Enrolment</span>
                <b>{course.enrolled} / {course.seats}</b>
              </div>
              <SkillTags ids={course.skillIds} />
            </Card>
          );
        })}
      </div>
    </>
  );
  if (view === "capacity") {
    const seats = data.courses.reduce((sum, course) => sum + Math.max(0, course.seats - course.enrolled), 0);
    return <><PageHeader eyebrow="Training institute" title="Training capacity" description="Available seats are derived from course seats minus enrolment." /><div className="metrics-grid"><Metric label="Total seats" value={data.courses.reduce((sum, course) => sum + course.seats, 0)} detail="across connected courses" /><Metric label="Available" value={seats} detail="ready for learners" tone="green" /><Metric label="Utilisation" value={`${data.courses.reduce((sum, course) => sum + course.enrolled, 0)} enrolled`} detail="from course records" tone="yellow" /></div><Card><EmptyState title="Capacity linked to courses" body="Government capacity intelligence uses the same course and training capacity records." /></Card></>;
  }
  return (
    <>
      <PageHeader eyebrow="Training institute" title="Institute dashboard" description="A connected operating view of courses, seats, and outcomes." action={<Button onClick={() => onAdd({ type: "course" })}>+ Add course</Button>} />
      <div className="metrics-grid">
        <Metric label="Active courses" value={data.courses.length} detail="connected offerings" />
        <Metric label="Learners enrolled" value={data.courses.reduce((sum, course) => sum + course.enrolled, 0)} detail="from course records" tone="blue" />
        <Metric label="Placements" value={data.placements.filter((placement) => data.courses.some((course) => course.id === placement.courseId) || placement.employerId).length} detail="verified outcomes" tone="green" />
      </div>
      <Card>
        {data.courses.map((course) => {
          const supply = courseSupplyStatus(course, data);
          return (
            <div className="course-row" key={course.id}>
              <div className="course-icon">▤</div>
              <div>
                <b>{course.name}</b>
                <p>{course.duration} · {course.mode}</p>
                <div style={{ marginTop: "4px" }}>
                  <Badge tone={supply.status === "Obsolete" ? "coral" : supply.status === "Oversupplied" ? "yellow" : "green"}>{supply.status}</Badge>
                </div>
              </div>
              <div className="course-row-progress">
                <Progress value={course.enrolled / Math.max(course.seats, 1) * 100} />
                <small>{course.enrolled}/{course.seats} seats</small>
              </div>
              <Badge tone="green">{course.status}</Badge>
            </div>
          );
        })}
      </Card>
    </>
  );
}

function TrainerView({ view, data, onAdd }) {
  const trainer = data.trainers[0];
  const result = trainerAnalysis(trainer, data);
  if (view === "skills") {
    return (
      <>
        <PageHeader
          eyebrow="Trainer workspace"
          title="My skills"
          description="Update the same canonical skills used in trainer intelligence."
          action={<Button onClick={() => onAdd({ type: "trainer-skill", skillId: "power-bi" })}>+ Add Power BI</Button>}
        />
        <Card>
          <div className="profile-heading">
            <div className="avatar large">R</div>
            <div>
              <h2>{trainer.name}</h2>
              <p>{trainer.experience} experience · {trainer.district || "Maharashtra"}</p>
            </div>
          </div>
          <SkillTags ids={trainer.skillIds} entityId={trainer.id} data={data} />
        </Card>
      </>
    );
  }
  if (view === "gaps" || view === "upskilling") {
    return (
      <>
        <PageHeader
          eyebrow="Trainer workspace"
          title={view === "gaps" ? "Skill gaps" : "Recommended upskilling"}
          description="Missing skills are derived by comparing trainer skills with live employer demand."
        />
        <Card>
          <div className="section-head">
            <div>
              <h2>{result.missing.length} skills to strengthen</h2>
              <p>Required industry skills not present in this trainer profile</p>
            </div>
            <Badge tone="yellow">Explainable</Badge>
          </div>
          {result.missing.map((skillId) => (
            <div className="recommendation" key={skillId}>
              <span className="action-icon yellow">✦</span>
              <div>
                <b>{getSkill(skillId).name}</b>
                <p>Demand is present and no match exists in this trainer profile.</p>
              </div>
              <Button variant="secondary" onClick={() => onAdd({ type: "trainer-skill", skillId })}>
                Add to profile
              </Button>
            </div>
          ))}
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHeader
        eyebrow="Trainer workspace"
        title={`Hello, ${trainer.name.split(" ")[0]}.`}
        description="Your readiness is calculated against current consultation demand."
        action={<Button onClick={() => onAdd({ type: "trainer-skill", skillId: "power-bi" })}>Update skills</Button>}
      />
      <div className="metrics-grid">
        <Metric label="Profile readiness" value={`${result.readiness}%`} detail="matched demand skills" tone="green" />
        <Metric label="Missing skills" value={result.missing.length} detail="recommended for upskilling" tone="coral" />
        <Metric label="Skills verified" value={trainer.skillIds.length} detail="canonical platform skills" tone="blue" />
      </div>
      <Card>
        <div className="recommendation">
          <span className="action-icon yellow">✦</span>
          <div>
            <b>{result.missing.length ? `Add ${getSkill(result.missing[0]).name} to your profile` : "Profile covers current demand"}</b>
            <p>{result.missing.length ? "This recommendation is generated from the employer consultation skill set." : "No missing skills detected against current demand."}</p>
          </div>
          {result.missing.length > 0 && (
            <Button onClick={() => onAdd({ type: "trainer-skill", skillId: result.missing[0] })}>Add skill</Button>
          )}
        </div>
      </Card>
    </>
  );
}

function CandidateHome({ candidate, result, data, onAdd }) {
  return (
    <>
      <PageHeader
        eyebrow="Candidate workspace"
        title={`Welcome back, ${candidate.name.split(" ")[0]}.`}
        description="Your next step is calculated from your profile and current employer demand."
        action={<Button onClick={() => onAdd({ type: "navigate", view: "role-fit" })}>Open role fit</Button>}
      />
      <Card className="candidate-hero">
        <div>
          <div className="eyebrow">TARGET ROLE</div>
          <h2>{candidate.targetRole || "Data Operations Analyst"}</h2>
          <p>{candidate.preferredEmployer || "TechNova Solutions"} · {candidate.district} · {totalOpenings(data)} current openings</p>
        </div>
        <div className="candidate-score">
          <strong>{result.fit}%</strong>
          <span>current role fit</span>
        </div>
      </Card>
      <div className="dashboard-grid">
        <Card>
          <div className="section-head">
            <div>
              <h2>You have</h2>
              <p>Skills matched to the target role</p>
            </div>
            <Badge tone="green">{result.matched.length} matched</Badge>
          </div>
          <SkillTags ids={result.matched} entityId={candidate.id} data={data} />
        </Card>
        <Card>
          <div className="section-head">
            <div>
              <h2>You are missing</h2>
              <p>Skills required by current demand</p>
            </div>
            <Badge tone="coral">{result.missing.length} to build</Badge>
          </div>
          <SkillTags ids={result.missing} />
        </Card>
      </div>
      <DecisionCard
        eyebrow="Recommended next step"
        title={result.missing.length ? `Complete a ${getSkill(result.missing[0]).name}-focused course` : "You are ready for the role signal"}
      >
        <p>
          You match <b>{result.matched.length} of {result.matched.length + result.missing.length}</b> required skills. {result.missing.length ? `You are missing ${getSkill(result.missing[0]).name}, so courses covering that gap are ranked first.` : "Keep your profile current as employer demand changes."}
        </p>
        <Button onClick={() => onAdd({ type: "navigate", view: result.missing.length ? "courses" : "role-fit" })}>
          {result.missing.length ? "See recommended courses" : "Review role fit"}
        </Button>
      </DecisionCard>
    </>
  );
}

function CandidateView({ view, data, onAdd }) {
  const candidate = data.candidates[0];
  const result = candidateAnalysis(candidate, data);
  if (view === "overview") return <CandidateHome candidate={candidate} result={result} data={data} onAdd={onAdd} />;
  if (view === "profile") {
    return (
      <>
        <PageHeader
          eyebrow="Candidate workspace"
          title="My profile"
          description="Your skills connect to roles, courses, pathways, and placements."
        />
        <Card>
          <div className="profile-heading">
            <div className="avatar large">I</div>
            <div>
              <h2>{candidate.name}</h2>
              <p>{candidate.education} · {candidate.district}</p>
            </div>
            <Badge tone="yellow">{candidate.status}</Badge>
          </div>
          <div className="profile-facts">
            <div><small>Target role</small><b>{candidate.targetRole || "Data Operations Analyst"}</b></div>
            <div><small>Role fit</small><b>{result.fit}%</b></div>
            <div><small>Profile skills</small><b>{candidate.skillIds.length}</b></div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <SkillTags ids={candidate.skillIds} entityId={candidate.id} data={data} />
          </div>
        </Card>
      </>
    );
  }
  if (view === "skills" || view === "skill-gap") {
    return (
      <>
        <PageHeader
          eyebrow="Candidate workspace"
          title={view === "skills" ? "My skills" : "Skill gap"}
          description={view === "skills" ? "Manage canonical skills in your candidate profile." : "Missing skills are derived from current employer requirements."}
          action={<Button onClick={() => onAdd({ type: "candidate-skill", skillId: result.missing[0] || "power-bi" })}>+ Add next skill</Button>}
        />
        <Card>
          {view === "skills" ? (
            <SkillTags ids={candidate.skillIds} entityId={candidate.id} data={data} />
          ) : (
            result.missing.map((skillId) => (
              <div className="recommendation" key={skillId}>
                <span className="action-icon coral">!</span>
                <div>
                  <b>{getSkill(skillId).name}</b>
                  <p>Required by current industry demand and missing from your profile.</p>
                </div>
                <Badge tone="coral">Priority</Badge>
              </div>
            ))
          )}
        </Card>
      </>
    );
  }
  if (view === "role-fit") {
    return (
      <>
        <PageHeader
          eyebrow="Candidate workspace"
          title="Role fit"
          description="Matched candidate skills divided by total required role skills."
        />
        <Card className="fit-card">
          <div className="fit-score">
            <strong>{result.fit}<span>%</span></strong>
            <div>
              <h2>{candidate.targetRole || "Data Operations Analyst"}</h2>
              <p>{candidate.preferredEmployer || "TechNova Solutions"} · {candidate.district}</p>
            </div>
          </div>
          <Progress value={result.fit} tone="green" />
          <div className="fit-breakdown">
            <span><i className="dot green" /> {result.matched.length} matched skills</span>
            <span><i className="dot coral" /> {result.missing.length} skills to build</span>
          </div>
        </Card>
      </>
    );
  }
  if (view === "courses" || view === "pathway") {
    return (
      <>
        <PageHeader
          eyebrow="Candidate workspace"
          title={view === "courses" ? "Recommended courses" : "Training pathway"}
          description="Courses are ranked by how many current skill gaps they cover."
        />
        <div className="course-grid">
          {data.courses.map((course) => {
            const analysis = courseAnalysis(course, data);
            const coveredGaps = analysis.covered.filter((skillId) => result.missing.includes(skillId));
            return (
              <Card key={course.id}>
                <div className="course-title">
                  <span className="course-icon">▤</span>
                  <div>
                    <h2>{course.name}</h2>
                    <p>{course.duration} · {course.mode}</p>
                  </div>
                </div>
                <Badge tone={coveredGaps.length ? "green" : "gray"}>
                  {coveredGaps.length} gap skill(s) covered
                </Badge>
                <p className="explain">
                  Recommended because it covers {coveredGaps.length} of your {result.missing.length} missing skill(s):{" "}
                  {coveredGaps.length ? skillNames(coveredGaps).join(", ") : "none"}.
                </p>
                <SkillTags ids={course.skillIds} />
                <Button variant="secondary" onClick={() => onAdd({ type: "enrol", courseId: course.id })}>
                  {view === "pathway" ? "Add to pathway" : "View course"}
                </Button>
              </Card>
            );
          })}
        </div>
      </>
    );
  }
  if (view === "placements") return <PlacementForm data={data} onAdd={onAdd} />;
  return <CandidateHome candidate={candidate} result={result} data={data} onAdd={onAdd} />;
}

function PlacementForm({ data, onAdd }) {
  const [form, setForm] = useState({
    candidateId: data.candidates[0]?.id || "",
    employerId: data.employers[0]?.id || "",
    role: data.employers[0]?.role || "Data Operations Analyst",
    district: data.candidates[0]?.district || data.districts?.[0]?.name || "Pune",
    status: "Verified",
    placedAt: today,
  });
  return (
    <>
      <PageHeader
        eyebrow="Candidate workspace"
        title="Placement status"
        description="Record a verified placement and close the loop with employer feedback."
      />
      <Card className="form-card">
        <label>
          Candidate
          <select
            value={form.candidateId}
            onChange={(e) => {
              const cand = data.candidates.find((c) => c.id === e.target.value);
              setForm({ ...form, candidateId: e.target.value, district: cand?.district || form.district });
            }}
          >
            {data.candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} ({candidate.district})
              </option>
            ))}
          </select>
        </label>
        <label>
          Employer
          <select value={form.employerId} onChange={(e) => setForm({ ...form, employerId: e.target.value })}>
            {data.employers.map((employer) => (
              <option key={employer.id} value={employer.id}>
                {employer.name} ({employer.district})
              </option>
            ))}
          </select>
        </label>
        <label>
          Role
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </label>
        <label>
          District
          <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
            {(data.districts || [{ name: "Pune" }]).map((d) => {
              const name = d.name || d;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        </label>
        <div className="form-footer">
          <span className="muted">This record will appear in Government Placement Outcomes.</span>
          <Button onClick={() => onAdd({ type: "placement", ...form })}>Mark as placed</Button>
        </div>
      </Card>
    </>
  );
}

export default function Home() {
  const persistedRole = useSyncExternalStore(emptySubscribe, storedRole, emptySnapshot); const persistedData = useSyncExternalStore(emptySubscribe, storedData, emptyDataSnapshot); const persistedGuided = useSyncExternalStore(emptySubscribe, storedGuided, emptyGuidedSnapshot); const persistedLanguage = useSyncExternalStore(emptySubscribe, storedLanguage, emptyLanguageSnapshot); const [roleOverride, setRoleOverride] = useState(null); const [dataOverride, setDataOverride] = useState(null); const [guidedOverride, setGuidedOverride] = useState(null); const [languageOverride, setLanguageOverride] = useState(null); const [view, setView] = useState("overview"); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); const role = roleOverride ?? persistedRole; const guided = guidedOverride ?? persistedGuided; const language = languageOverride ?? persistedLanguage; const data = dataOverride ?? normalizeData(persistedData ? JSON.parse(persistedData) : clone());
  useEffect(() => { let active = true; loadRemoteData().then((remote) => { if (active && remote) setDataOverride((current) => normalizeData({ ...(current || clone()), ...remote })); }).catch(() => { if (active) setNotice("Firestore unavailable; using the local demo dataset"); }); return () => { active = false; }; }, []);
  useEffect(() => { if (guided) window.localStorage.setItem("skillconnect-guided-demo", "active"); else window.localStorage.removeItem("skillconnect-guided-demo"); }, [guided]);
  useEffect(() => { if (role) window.localStorage.setItem("skillconnect-role", role); }, [role]); useEffect(() => { if (dataOverride) window.localStorage.setItem("skillconnect-data", JSON.stringify(dataOverride)); }, [dataOverride]);
  useEffect(() => { if (language) window.localStorage.setItem("skillconnect-language", language); }, [language]);
  const selectRole = (nextUser) => { setRoleOverride(nextUser?.role || ""); setView("overview"); };
  const onAdd = async (action) => {
    if (busy) return;
    if (action.type === "navigate") { setView(action.view); return; }
    setBusy(true);
    const id = `${action.type}-${Date.now()}`;
    let name = "";
    let record = null;
    let nextView = view;
    if (action.type === "consultation") { name = "consultations"; record = { id, employerId: "technova", title: action.title, role: action.role, openings: Number(action.openings), district: action.district, requiredSkillIds: action.requiredSkillIds, status: "Submitted", createdAt: today, note: action.note }; nextView = "consultations"; }
    if (action.type === "course") { name = "courses"; record = { id, instituteId: "pda", name: "New skills cohort", duration: "10 weeks", seats: 25, enrolled: 0, mode: "Blended", status: "Draft", skillIds: ["sql", "data-analysis"] }; nextView = "courses"; }
    if (action.type === "trainer-skill") { const trainer = data.trainers[0]; if (trainer.skillIds.includes(action.skillId)) { setNotice(`${getSkill(action.skillId).name} is already on the profile`); setBusy(false); return; } name = "trainers"; record = { ...trainer, skillIds: [...trainer.skillIds, action.skillId] }; }
    if (action.type === "candidate-skill") { const candidate = data.candidates[0]; if (candidate.skillIds.includes(action.skillId)) { setNotice(`${getSkill(action.skillId).name} is already on the profile`); setBusy(false); return; } name = "candidates"; record = { ...candidate, skillIds: [...candidate.skillIds, action.skillId] }; }
    if (action.type === "placement") { name = "placements"; record = { id, candidateId: action.candidateId, employerId: action.employerId, role: action.role, district: action.district, status: action.status, placedAt: action.placedAt }; nextView = "placements"; }
    if (action.type === "feedback") { name = "employerFeedback"; record = { id, placementId: action.placementId, employerId: "technova", candidateId: data.placements.find((item) => item.id === action.placementId)?.candidateId, role: data.placements.find((item) => item.id === action.placementId)?.role, rating: Number(action.rating), skillGaps: action.skillGaps ? action.skillGaps.split(",").map((item) => item.trim()).filter(Boolean) : [], note: action.note, createdAt: today }; }
    if (action.type === "curriculum-proposal") {
      name = "curriculumProposals";
      record = {
        id,
        targetType: action.targetType || "curriculum",
        targetId: action.targetId || "curr-1",
        targetName: action.targetName || "Maharashtra Data Services Level 5",
        proposedSkillIds: action.proposedSkillIds || [],
        proposedBy: "Pune Digital Academy",
        employerId: "technova",
        status: "Pending",
        employerComment: "",
        createdAt: today,
        rationale: action.rationale || "Aligned with live employer demand.",
      };
      nextView = "curriculum-proposals";
    }
    if (action.type === "proposal-action") {
      name = "curriculumProposals";
      const existing = (data.curriculumProposals || []).find((p) => p.id === action.proposalId);
      if (!existing) {
        setBusy(false);
        return;
      }
      record = {
        ...existing,
        status: action.status,
        employerComment: action.employerComment || existing.employerComment,
        resolvedAt: today,
      };
      nextView = "curriculum-proposals";
    }

    try {
      await persistEntity(name, record);
      if (name === "courses") await persistEntity("courseSkills", { id: `${id}-skills`, courseId: id, skillIds: record.skillIds });
      if (name === "trainers") await persistEntity("trainerSkills", { id: `${record.id}-skills`, trainerId: record.id, skillIds: record.skillIds });
      if (name === "candidates") await persistEntity("candidateSkills", { id: `${record.id}-skills`, candidateId: record.id, skillIds: record.skillIds });
      if (action.type === "proposal-action" && action.status === "Approved") {
        if (record.targetType === "curriculum") {
          const curr = data.curriculums?.find((c) => c.id === record.targetId);
          if (curr) {
            const updatedSkillIds = Array.from(new Set([...(curr.skillIds || []), ...record.proposedSkillIds]));
            await persistEntity("curriculums", { ...curr, skillIds: updatedSkillIds, status: "Validated" });
            await persistEntity("curriculumSkills", { curriculumId: curr.id, skillIds: updatedSkillIds });
          }
        } else if (record.targetType === "course") {
          const course = data.courses?.find((c) => c.id === record.targetId);
          if (course) {
            const updatedSkillIds = Array.from(new Set([...(course.skillIds || []), ...record.proposedSkillIds]));
            await persistEntity("courses", { ...course, skillIds: updatedSkillIds });
            await persistEntity("courseSkills", { id: `${course.id}-skills`, courseId: course.id, skillIds: updatedSkillIds });
          }
        }
      }
      setDataOverride((current) => {
        const next = { ...(current || data) };
        if (name === "trainers") {
          next.trainers = data.trainers.map((item, index) => index === 0 ? record : item);
          next.trainerSkills = data.trainerSkills.map((item) => item.trainerId === record.id ? { ...item, skillIds: record.skillIds } : item);
        } else if (name === "candidates") {
          next.candidates = data.candidates.map((item, index) => index === 0 ? record : item);
          next.candidateSkills = data.candidateSkills.map((item) => item.candidateId === record.id ? { ...item, skillIds: record.skillIds } : item);
        } else if (action.type === "proposal-action") {
          next.curriculumProposals = (data.curriculumProposals || []).map((p) => p.id === record.id ? record : p);
          if (action.status === "Approved") {
            if (record.targetType === "curriculum") {
              next.curriculums = (data.curriculums || []).map((c) => c.id === record.targetId ? { ...c, skillIds: Array.from(new Set([...(c.skillIds || []), ...record.proposedSkillIds])), status: "Validated" } : c);
              next.curriculumSkills = (data.curriculumSkills || []).map((cs) => cs.curriculumId === record.targetId ? { ...cs, skillIds: Array.from(new Set([...(cs.skillIds || []), ...record.proposedSkillIds])) } : cs);
            } else if (record.targetType === "course") {
              next.courses = (data.courses || []).map((c) => c.id === record.targetId ? { ...c, skillIds: Array.from(new Set([...(c.skillIds || []), ...record.proposedSkillIds])) } : c);
              next.courseSkills = (data.courseSkills || []).map((cs) => cs.courseId === record.targetId ? { ...cs, skillIds: Array.from(new Set([...(cs.skillIds || []), ...record.proposedSkillIds])) } : cs);
            }
          }
        } else {
          next[name] = [record, ...(data[name] || [])];
          if (name === "courses") next.courseSkills = [{ id: `${id}-skills`, courseId: id, skillIds: record.skillIds }, ...data.courseSkills];
          if (name === "placements") next.candidates = data.candidates.map((item) => item.id === record.candidateId ? { ...item, status: "Placed" } : item);
        }
        return next;
      });
      setView(nextView);
      setNotice(
        action.type === "consultation" ? "Consultation submitted and saved" :
        action.type === "placement" ? "Placement recorded and saved" :
        action.type === "feedback" ? "Employer feedback submitted and saved" :
        action.type === "curriculum-proposal" ? "Curriculum proposal submitted for employer validation" :
        action.type === "proposal-action" ? (action.status === "Approved" ? "Proposal approved and skills merged into curriculum!" : "Proposal marked as rejected") :
        "Change saved"
      );
    } catch {
      setNotice("The change could not be saved. Your current local state is unchanged.");
    } finally {
      setBusy(false);
      window.setTimeout(() => setNotice(""), 3500);
    }
  };
  const content = role === "government" ? <GovernmentView view={view} data={data} setView={setView} /> : role === "employer" ? <EmployerView view={view} data={data} onAdd={onAdd} /> : role === "institute" ? <InstituteView view={view} data={data} onAdd={onAdd} /> : role === "trainer" ? <TrainerView view={view} data={data} onAdd={onAdd} /> : <CandidateView view={view} data={data} onAdd={onAdd} />;
  if (guided) return <GuidedDemo data={data} onExit={() => { setGuidedOverride(false); window.localStorage.removeItem("skillconnect-guided-step"); window.history.replaceState({}, "", window.location.pathname); }} />;
  if (!role) return <LoginPage onSelect={selectRole} onDemo={() => setGuidedOverride(true)} />; return <LanguageContext.Provider value={{ language, setLanguage: setLanguageOverride }}><div className="app-shell"><Sidebar role={role} view={view} setView={setView} data={data} onLogout={() => { window.localStorage.removeItem("skillconnect-role"); setRoleOverride(""); }} /><div className="main-shell"><Topbar role={role} data={data} onLogout={() => { window.localStorage.removeItem("skillconnect-role"); setRoleOverride(""); }} onToggleLanguage={() => setLanguageOverride(language === "en" ? "mr" : "en")} /><main className="content">{content}</main></div>{busy && <div className="toast"><span>…</span>Saving change</div>}{notice && !busy && <div className="toast"><span>✓</span>{notice}</div>}</div></LanguageContext.Provider>;
}