"use client";

import { useEffect, useState } from "react";
import { getSkill } from "@/lib/data";
import { capacityRows, candidateAnalysis, demandRows, districtPriorityRows, executiveMetrics, hierarchyOptions, pipelineConversions, pipelineMetrics, priorityActions, prototypeImpactScore, requiredIndustrySkills, simulateIntervention, skillIntelligenceRows, skillPulseDetail } from "@/lib/analytics";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

function Button({ children, variant = "primary", ...props }) { return <button className={`button button-${variant}`} {...props}>{children}</button>; }
function Badge({ children, tone = "blue" }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
function Card({ children, className = "" }) { return <section className={`card ${className}`}>{children}</section>; }
function Metric({ label, value, detail, tone = "blue" }) { return <Card className="metric"><div className={`metric-mark mark-${tone}`} /><div><div className="metric-label">{label}</div><strong>{value}</strong><div className="metric-detail">{detail}</div></div></Card>; }
function Progress({ value, tone = "blue" }) { return <div className="progress"><span className={`progress-fill fill-${tone}`} style={{ width: `${Math.max(0, Math.min(value || 0, 100))}%` }} /></div>; }
function Table({ children }) { return <div className="table-wrap"><table>{children}</table></div>; }
function PageHeader({ title, description, action }) { return <div className="page-header"><div><div className="eyebrow">Government intelligence / decision support</div><h1>{title}</h1><p>{description}</p></div>{action}</div>; }
function Status({ value }) { return <Badge tone={value === "Critical" || value === "Critical Intervention" ? "coral" : value === "High" || value === "High Priority" ? "yellow" : "green"}>{value}</Badge>; }

function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <b>{label}</b>
        {payload.map((item, index) => (
          <p key={index}>
            <span style={{ color: item.color }}>●</span> {item.name}: <b>{item.value}</b>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function Evidence({ action, data }) {
  if (action.type === "Course") {
    const course = data.courses.find((c) => c.id === action.courseId);
    return (
      <div className="evidence-panel">
        <div className="eyebrow">COURSE SUPPLY INTELLIGENCE · {action.status?.toUpperCase() || "FLAGGED"}</div>
        <div className="evidence-grid">
          <div><span>Course name</span><b>{course?.name || "Course"}</b></div>
          <div><span>Allocated seats</span><b>{course?.seats || 0} seats</b></div>
          <div><span>Current enrolment</span><b>{course?.enrolled || 0} enrolled</b></div>
          <div><span>Enrolment ratio</span><b>{course ? Math.round((course.enrolled / Math.max(course.seats, 1)) * 100) : 0}%</b></div>
          <div><span>Supply flag</span><b>{action.status}</b></div>
          <div><span>Location</span><b>{action.location}</b></div>
        </div>
        <p>{action.evidence} Recommended intervention: {action.action} (Deterministic evaluation against connected demand signals).</p>
      </div>
    );
  }
  const detail = skillPulseDetail(action.skillId, data);
  return (
    <div className="evidence-panel">
      <div className="eyebrow">WHY IS {detail.skill.name.toUpperCase()} A PRIORITY?</div>
      <div className="evidence-grid">
        <div><span>Industry demand</span><b>{detail.openings} openings</b></div>
        <div><span>Employers requesting</span><b>{detail.employers}</b></div>
        <div><span>Training coverage</span><b>{detail.coverage.courses} course(s)</b></div>
        <div><span>Trainer coverage</span><b>{detail.coverage.trainers} trainer(s)</b></div>
        <div><span>Candidate coverage</span><b>{detail.coverage.candidates} candidate(s)</b></div>
        <div><span>Current gap</span><b>{Math.max(detail.capacityGap, 0)} seats</b></div>
      </div>
      <p>{detail.skill.name} is being prioritized because employer demand is high while the relevant ecosystem coverage is comparatively low. Evidence: {action.evidence}. This is a deterministic prototype recommendation.</p>
    </div>
  );
}

function ActionCenter({ data }) { const actions = priorityActions(data); const [expanded, setExpanded] = useState(null); return <Card className="action-center"><div className="section-head"><div><div className="eyebrow">GOVERNMENT ACTION CENTER</div><h2>Priority Actions</h2><p>Sorted by transparent intervention score from demand, gap, and coverage evidence.</p></div><Badge tone="coral">{actions.length} action(s)</Badge></div>{actions.length ? actions.map((action) => <div className="action-item" key={action.id}><div className="action-item-main"><div><Status value={action.priority} /><span className="action-type">{action.type} · {action.affected}</span></div><h3>{action.issue}</h3><p><b>{action.location}</b> · {action.evidence}</p><strong>Recommended action: {action.action}</strong></div><button className="evidence-toggle" aria-expanded={expanded === action.id} onClick={() => setExpanded(expanded === action.id ? null : action.id)}>{expanded === action.id ? "Hide evidence" : "Why?"}</button>{expanded === action.id && <Evidence action={action} data={data} />}</div>) : <div className="empty"><strong>No interventions detected</strong><p>Current connected data does not contain an actionable gap.</p></div>}</Card>; }

function PipelinePanel({ data }) { const options = hierarchyOptions(data); const [district, setDistrict] = useState("All"); const [role, setRole] = useState("All"); const pipeline = pipelineMetrics(data, district, role); const conversion = pipelineConversions(pipeline); const stages = [["Industry openings", pipeline.openings, null], ["Training seats", pipeline.seats, conversion.trainingCoverage], ["Candidates prepared", pipeline.readyCandidates, conversion.candidateReadiness], ["Placements", pipeline.placements, conversion.placementConversion], ["Employer feedback", pipeline.feedback, conversion.feedbackCoverage]]; return <Card className="pipeline-card"><div className="section-head"><div><div className="eyebrow">OUTCOME PIPELINE</div><h2>Demand → Training → Placement</h2><p>Actual recorded values for the selected hierarchy. No values are inferred when records are unavailable.</p></div><div className="hierarchy-controls"><label>District<select value={district} onChange={(event) => setDistrict(event.target.value)}>{options.districts.map((item) => <option key={item}>{item}</option>)}</select></label><label>Role<select value={role} onChange={(event) => setRole(event.target.value)}>{options.roles.map((item) => <option key={item}>{item}</option>)}</select></label></div></div><div className="pipeline-stages">{stages.map(([label, value, percent], index) => <div className="pipeline-stage" key={label}><div className="pipeline-node"><strong>{value}</strong><span>{label}</span></div>{percent !== null && <div className="pipeline-rate"><b>{percent}%</b><small>conversion</small></div>}{index < stages.length - 1 && <i>↓</i>}</div>)}</div><p className="data-note">Values are actual prototype records. A missing or zero stage is shown as zero; percentages are suppressed when the denominator is zero.</p></Card>; }

function WhatChanged({ data }) { const demand = demandRows(data); const critical = skillIntelligenceRows(data).filter((row) => row.status === "Critical Gap").length; const district = data.consultations[0]?.district || "the active district"; return <Card className="changed-card"><div className="eyebrow">WHAT CHANGED?</div><h2>Current-state signal</h2><p>Active employer demand recorded across <b>{data.districts?.length || 3} districts</b> (led by {district}).</p><div className="change-list"><span><b>{data.consultations.length}</b> consultation(s) tracked</span><span><b>{demand.length}</b> demanded skills</span><span><b>{critical}</b> critical gap(s)</span><span><b>{data.placements.length}</b> placement(s) recorded</span></div><small>Historical deltas are not shown unless a prior safe snapshot exists; this summary avoids fabricating change values.</small></Card>; }

function Drilldown({ data, skillId }) { const detail = skillPulseDetail(skillId, data); return <Card className="drilldown-card"><div className="eyebrow">SKILL DRILL-DOWN</div><h2>{detail.skill.name}</h2><p>{detail.employers} employer(s) / {detail.openings} openings · <Status value={detail.status} /></p><div className="drilldown-grid"><div><span>Training</span><b>{detail.coverage.courses} course(s) · {detail.availableSeats} seats</b></div><div><span>Curriculum</span><b>{detail.coverage.curriculum ? "Covered" : "Missing"}</b></div><div><span>Trainers</span><b>{detail.coverage.trainers} ready</b></div><div><span>Candidates</span><b>{detail.coverage.candidates} have skill</b></div><div><span>Placements</span><b>{detail.placements} relevant</b></div><div><span>Feedback</span><b>{data.employerFeedback.length} total record(s)</b></div></div><p className="explain">Recommended action: {detail.capacityGap > 0 ? `increase ${detail.skill.name} capacity by approximately ${detail.capacityGap} seats` : `monitor ${detail.skill.name} as demand changes`}.</p></Card>; }

function Simulator({ data, selectedSkill, setSelectedSkill }) { const [scenario, setScenario] = useState({ additionalSeats: 0, additionalTrainers: 0, curriculumSkill: "" }); const detail = skillPulseDetail(selectedSkill, data); const simulation = simulateIntervention(data, { skillId: selectedSkill, ...scenario }); const impact = prototypeImpactScore(detail, simulation.projected); const scenarioPreset = (type) => { if (type === "capacity") setScenario({ additionalSeats: Math.max(10, Math.ceil(Math.max(detail.capacityGap, 0) / 5) * 5), additionalTrainers: 0, curriculumSkill: "" }); if (type === "trainer") setScenario({ additionalSeats: 0, additionalTrainers: 1, curriculumSkill: "" }); if (type === "curriculum") setScenario({ additionalSeats: 0, additionalTrainers: 0, curriculumSkill: selectedSkill }); }; return <Card className="simulator-card"><div className="section-head"><div><div className="eyebrow">SIMULATION — DOES NOT MODIFY LIVE DATA</div><h2>Intervention Simulator</h2><p>Hypothetical controls only. No Firestore or local records are changed.</p></div><Badge tone="yellow">Prototype scenario</Badge></div><div className="scenario-buttons"><button onClick={() => scenarioPreset("capacity")}>Expand training capacity</button><button onClick={() => scenarioPreset("trainer")}>Add trainer upskilling</button><button onClick={() => scenarioPreset("curriculum")}>Curriculum skill update</button></div><div className="simulator-controls"><label>Skill<select value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value)}>{data.skills.filter((skill) => requiredIndustrySkills(data).includes(skill.id)).map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></label><label>Additional seats<input type="number" min="0" max="100" value={scenario.additionalSeats} onChange={(event) => setScenario((current) => ({ ...current, additionalSeats: Number(event.target.value) || 0 }))} /></label><label>Additional trainers<input type="number" min="0" max="20" value={scenario.additionalTrainers} onChange={(event) => setScenario((current) => ({ ...current, additionalTrainers: Number(event.target.value) || 0 }))} /></label><label>Curriculum skill<select value={scenario.curriculumSkill} onChange={(event) => setScenario((current) => ({ ...current, curriculumSkill: event.target.value }))}><option value="">No change</option>{data.skills.filter((skill) => requiredIndustrySkills(data).includes(skill.id)).map((skill) => <option key={skill.id} value={skill.id}>Add {skill.name}</option>)}</select></label></div><div className="before-after"><div><div className="eyebrow">CURRENT</div><h3>{detail.skill.name}</h3><p>Capacity: <b>{detail.availableSeats}</b> · Gap: <b>{Math.max(detail.capacityGap, 0)}</b></p><Progress value={detail.openings ? detail.availableSeats / detail.openings * 100 : 0} tone="coral" /></div><div><div className="eyebrow">SIMULATED</div><h3>{detail.skill.name}</h3><p>Capacity: <b>{simulation.projected.availableSeats}</b> · Gap: <b>{Math.max(simulation.projected.gap, 0)}</b></p><Progress value={detail.openings ? simulation.projected.availableSeats / detail.openings * 100 : 0} tone="green" /></div></div><div className="impact-score"><div><span>Prototype intervention score</span><strong>{impact.score}/100</strong></div><div className="impact-breakdown">Capacity {impact.breakdown.capacity}% · Trainer {impact.breakdown.trainer}% · Course {impact.breakdown.course}% · Candidates {impact.breakdown.candidate}% · Curriculum {impact.breakdown.curriculum}%</div></div><div className="simulation-insight"><b>Why this matters</b><p>{simulation.explanation} This is a projected prototype score, not a scientifically validated prediction or guaranteed outcome.</p></div></Card>; }

export default function SkillPulseCommandCenter({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const demand = demandRows(data);
  const rows = skillIntelligenceRows(data);
  const metrics = executiveMetrics(data);
  const districts = districtPriorityRows(data);
  const [selectedSkill, setSelectedSkill] = useState(demand[0]?.skillId || "power-bi");
  const top = rows.slice().sort((a, b) => b.openings - a.openings)[0];
  const detail = skillPulseDetail(selectedSkill, data);
  const situation = `${top?.skill.name || "Current skills"} is the strongest demand signal with ${top?.openings || 0} openings. ${detail.skill.name} has ${Math.max(detail.capacityGap, 0)} seat(s) of current capacity gap.`;

  // Chart data 1: Top Demanded Skills by Openings
  const chartDemandData = demand
    .slice()
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 8)
    .map((d) => ({
      name: d.skill.name,
      openings: d.openings,
      employers: d.employers,
      skillId: d.skillId,
    }));

  // Chart data 2: Seat Capacity vs Demand across Districts
  const districtChartData = districts.map((d) => ({
    district: d.district,
    openings: d.openings,
    seats: d.seats,
    gap: d.gap,
  }));

  return (
    <>
      <PageHeader
        title="Skill Pulse & Decision Center"
        description="Government command center for prioritizing interventions from live demand, supply, readiness, and outcome data."
        action={<Badge tone="green">Live data · Recharts interactive</Badge>}
      />

      <Card className="pulse-story">
        <div className="eyebrow">EXECUTIVE SUMMARY</div>
        <h2>Current situation: {situation}</h2>
        <p>Primary gap: {detail.skill.name} has {detail.coverage.curriculum ? "curriculum coverage" : "no curriculum coverage"} and {detail.coverage.trainers} trainer(s). Recommended action: target the highest-gap intervention. Expected prototype impact is shown only in the simulator.</p>
      </Card>

      <div className="metrics-grid pulse-status-grid">
        <Metric label="Industry openings" value={metrics.openings} detail="current demand" tone="coral" />
        <Metric label="Active employers" value={metrics.employers} detail="requesting skills" />
        <Metric label="Critical skill gaps" value={rows.filter((row) => row.status === "Critical Gap").length} detail="high demand / low coverage" tone="coral" />
        <Metric label="District capacity gaps" value={metrics.districtsWithGaps} detail="priority districts" tone="yellow" />
        <Metric label="Training seats" value={metrics.availableSeats} detail="current supply" />
        <Metric label="Candidates upskilling" value={data.candidates.filter((candidate) => candidateAnalysis(candidate, data).missing.length > 0).length} detail="with current gaps" />
        <Metric label="Placements" value={metrics.placements} detail="verified outcomes" tone="green" />
        <Metric label="Feedback coverage" value={`${data.placements.length ? Math.round(metrics.feedback / data.placements.length * 100) : 0}%`} detail="placements with feedback" tone="blue" />
      </div>

      {/* RECHARTS DATA VISUALIZATION CARDS */}
      <div className="dashboard-grid">
        <Card className="chart-card">
          <div className="section-head">
            <div>
              <div className="eyebrow">RECHARTS VISUALIZATION</div>
              <h2>Skill Demand by Openings</h2>
              <p>Top demanded canonical skills across consultations & scraped postings. Click any bar to drill down.</p>
            </div>
            <Badge tone="coral">Demand signal</Badge>
          </div>
          <div className="chart-container">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDemandData} margin={{ top: 10, right: 10, left: -15, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8efea" vertical={false} />
                  <XAxis dataKey="name" stroke="#6d7b77" fontSize={10} interval={0} angle={-25} textAnchor="end" height={45} />
                  <YAxis stroke="#6d7b77" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="openings"
                    name="Openings"
                    fill="var(--teal)"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => entry?.skillId && setSelectedSkill(entry.skillId)}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-head">
            <div>
              <div className="eyebrow">MULTI-DISTRICT INTELLIGENCE</div>
              <h2>Seat Capacity vs Demand across Districts</h2>
              <p>Comparison of openings vs available training seats across Maharashtra districts</p>
            </div>
            <Badge tone="green">{districts.length} districts</Badge>
          </div>
          <div className="chart-container">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtChartData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8efea" vertical={false} />
                  <XAxis dataKey="district" stroke="#6d7b77" fontSize={11} />
                  <YAxis stroke="#6d7b77" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="openings" name="Market Openings" fill="var(--coral)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="seats" name="Available Seats" fill="var(--teal)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <ActionCenter data={data} />
      <PipelinePanel data={data} />
      <WhatChanged data={data} />

      <div className="pulse-grid">
        <Card>
          <div className="section-head">
            <div>
              <h2>National → District → Role → Skill</h2>
              <p>Choose a skill to drive the drill-down and simulator.</p>
            </div>
            <Badge>Selected: {detail.skill.name}</Badge>
          </div>
          <div className="hierarchy-breadcrumb">
            <span>Overall</span><i>→</i>
            <span>{data.consultations[0]?.district || "District unavailable"}</span><i>→</i>
            <span>{data.consultations[0]?.role || "Role unavailable"}</span><i>→</i>
            <strong>{detail.skill.name}</strong>
          </div>
          <Table>
            <thead>
              <tr><th>Skill</th><th>Demand</th><th>Course</th><th>Trainer</th><th>Candidate</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className={row.skillId === selectedSkill ? "selected-row" : ""} key={row.skillId}>
                  <td>
                    <button className="skill-row-button" onClick={() => setSelectedSkill(row.skillId)}>
                      <b>{row.skill.name}</b>
                      <small>{row.explanation}</small>
                    </button>
                  </td>
                  <td>{row.openings}</td>
                  <td>{row.coverage.courses}</td>
                  <td>{row.coverage.trainers}</td>
                  <td>{row.coverage.candidates}</td>
                  <td><Status value={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Drilldown data={data} skillId={selectedSkill} />
      </div>

      <Simulator data={data} selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill} />
    </>
  );
}