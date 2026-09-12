import { getSkill, percentage, roleRequirements, requiredProficiency, skillProficiency } from "./data.js";

export const proficiencyScale = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

export const getProficiencyLevel = (entityId, skillId, data = null) => {
  const map = data?.skillProficiency || skillProficiency;
  return map?.[entityId]?.[skillId] || null;
};

export const getRequiredProficiency = (skillId, employerOrConsultation = null, data = null) => {
  return employerOrConsultation?.requiredProficiency?.[skillId] ||
    data?.requiredProficiency?.[skillId] ||
    requiredProficiency[skillId] ||
    "Intermediate";
};

const ids = (item, key = "skillIds") => Array.isArray(item?.[key]) ? item[key] : [];
export const consultationSkills = (consultation) => ids(consultation, "requiredSkillIds");

export const industryDemand = (data) => {
  const result = (data.consultations || []).reduce((acc, consultation) => {
    const openings = Number(consultation.openings) || 0;
    consultationSkills(consultation).forEach((skillId) => {
      if (!acc[skillId]) acc[skillId] = { skillId, openings: 0, employers: new Set(), consultations: 0, jobPostings: 0 };
      acc[skillId].openings += openings;
      acc[skillId].employers.add(consultation.employerId);
      acc[skillId].consultations += 1;
    });
    return acc;
  }, {});

  // Additive fold of external job posting signals
  (data.jobPostings || []).forEach((posting) => {
    const openings = Number(posting.openings) || 1;
    (posting.skillIds || []).forEach((skillId) => {
      if (!result[skillId]) result[skillId] = { skillId, openings: 0, employers: new Set(), consultations: 0, jobPostings: 0 };
      result[skillId].openings += openings;
      result[skillId].employers.add(posting.company || posting.source || posting.id);
      result[skillId].jobPostings = (result[skillId].jobPostings || 0) + 1;
    });
  });

  return result;
};

export const demandRows = (data) => Object.values(industryDemand(data)).map((row) => ({ ...row, employers: row.employers.size, skill: getSkill(row.skillId), level: row.openings >= 20 ? "High" : row.openings >= 10 ? "Medium" : "Emerging" }));
export const requiredIndustrySkills = (data) => Object.keys(industryDemand(data));
export const totalOpenings = (data) => {
  const consultOpenings = (data.consultations || []).reduce((sum, item) => sum + (Number(item.openings) || 0), 0);
  const postingOpenings = (data.jobPostings || []).reduce((sum, item) => sum + (Number(item.openings) || 1), 0);
  return consultOpenings + postingOpenings;
};
export const districtDemand = (data) => {
  const result = (data.consultations || []).reduce((acc, consultation) => {
    const district = consultation.district || "Unspecified";
    acc[district] = (acc[district] || 0) + (Number(consultation.openings) || 0);
    return acc;
  }, {});
  (data.jobPostings || []).forEach((posting) => {
    const district = posting.district || "Unspecified";
    result[district] = (result[district] || 0) + (Number(posting.openings) || 1);
  });
  return result;
};

export const courseAnalysis = (course, data) => { const required = requiredIndustrySkills(data); const covered = ids(course).filter((skillId) => required.includes(skillId)); return { covered, missing: required.filter((skillId) => !ids(course).includes(skillId)), alignment: percentage(covered.length, required.length) }; };
export const curriculumAnalysis = (curriculum, data) => { const required = requiredIndustrySkills(data); const covered = ids(curriculum).filter((skillId) => required.includes(skillId)); return { covered, missing: required.filter((skillId) => !ids(curriculum).includes(skillId)), alignment: percentage(covered.length, required.length) }; };

export const courseSupplyStatus = (course, data) => {
  const required = requiredIndustrySkills(data);
  const courseSkillIds = ids(course);
  const enrolled = Number(course.enrolled) || 0;
  const seats = Number(course.seats) || 1;
  const ratio = enrolled / seats;
  const analysis = courseAnalysis(course, data);
  const capacity = capacityRows(data);
  const hasGapSkill = capacity.some((r) => r.gap > 0 && courseSkillIds.includes(r.skillId));

  const enrolmentRatio = Math.round(ratio * 100);

  if (courseSkillIds.length > 0 && !courseSkillIds.some((s) => required.includes(s))) {
    return {
      status: "Obsolete",
      enrolmentRatio,
      alignment: analysis.alignment,
      enrolled,
      seats,
      reason: `None of the course skills (${courseSkillIds.map((id) => getSkill(id).name).join(", ") || "none"}) overlap with active industry demand signals.`,
    };
  }

  if (ratio < 0.40 && analysis.alignment < 60) {
    return {
      status: "Oversupplied",
      enrolmentRatio,
      alignment: analysis.alignment,
      enrolled,
      seats,
      reason: `Low enrolment utilization (${enrolled}/${seats}, ${enrolmentRatio}%) and weak curriculum alignment (${analysis.alignment}%) indicate oversupplied training capacity.`,
    };
  }

  if (analysis.alignment >= 65 && ratio >= 0.85 && hasGapSkill) {
    return {
      status: "Undersupplied",
      enrolmentRatio,
      alignment: analysis.alignment,
      enrolled,
      seats,
      reason: `High industry alignment (${analysis.alignment}%), near-capacity enrolment (${enrolled}/${seats}, ${enrolmentRatio}%), and covers capacity-constrained skills.`,
    };
  }

  return {
    status: "Balanced",
    enrolmentRatio,
    alignment: analysis.alignment,
    enrolled,
    seats,
    reason: `Enrolment (${enrolled}/${seats}, ${enrolmentRatio}%) and alignment (${analysis.alignment}%) are balanced with market signals.`,
  };
};

export const capacityRows = (data, targetDistrict = null) => {
  const hasFilter = Boolean(targetDistrict && targetDistrict !== "All");

  let demandMap = {};
  if (hasFilter) {
    (data.consultations || []).filter((c) => c.district === targetDistrict).forEach((consultation) => {
      const openings = Number(consultation.openings) || 0;
      consultationSkills(consultation).forEach((skillId) => {
        if (!demandMap[skillId]) demandMap[skillId] = { skillId, openings: 0, employers: new Set(), consultations: 0, jobPostings: 0 };
        demandMap[skillId].openings += openings;
        demandMap[skillId].employers.add(consultation.employerId);
        demandMap[skillId].consultations += 1;
      });
    });
    (data.jobPostings || []).filter((p) => p.district === targetDistrict).forEach((posting) => {
      const openings = Number(posting.openings) || 1;
      (posting.skillIds || []).forEach((skillId) => {
        if (!demandMap[skillId]) demandMap[skillId] = { skillId, openings: 0, employers: new Set(), consultations: 0, jobPostings: 0 };
        demandMap[skillId].openings += openings;
        demandMap[skillId].employers.add(posting.company || posting.source || posting.id);
        demandMap[skillId].jobPostings = (demandMap[skillId].jobPostings || 0) + 1;
      });
    });
  } else {
    demandMap = industryDemand(data);
  }

  const capacity = (data.trainingCapacity || [])
    .filter((row) => !hasFilter || row.district === targetDistrict)
    .reduce((result, row) => {
      result[row.skillId] = (result[row.skillId] || 0) + (Number(row.availableSeats) || 0);
      return result;
    }, {});

  const allSkillIds = new Set([...Object.keys(demandMap), ...Object.keys(capacity)]);

  return Array.from(allSkillIds).map((skillId) => {
    const row = demandMap[skillId] || { skillId, openings: 0, employers: new Set(), consultations: 0, jobPostings: 0 };
    const availableSeats = capacity[skillId] || 0;
    const openings = row.openings || 0;
    const employersCount = row.employers instanceof Set ? row.employers.size : (Number(row.employers) || 0);
    return {
      skillId,
      openings,
      employers: employersCount,
      consultations: row.consultations || 0,
      jobPostings: row.jobPostings || 0,
      availableSeats,
      gap: openings - availableSeats,
      level: openings >= 20 ? "High" : openings >= 10 ? "Medium" : "Emerging",
      skill: getSkill(skillId),
    };
  });
};

export const trainerAnalysis = (trainer, data, options = {}) => {
  const required = requiredIndustrySkills(data);
  const skills = ids(trainer);
  const matched = required.filter((skillId) => skills.includes(skillId));
  const missing = required.filter((skillId) => !skills.includes(skillId));

  const trainerProf = data?.skillProficiency?.[trainer.id] || skillProficiency[trainer.id] || {};
  const reqProf = data?.requiredProficiency || requiredProficiency;

  let proficiencyPoints = 0;
  const proficiencyBreakdown = {};
  const proficiencyGaps = [];

  matched.forEach((skillId) => {
    const level = trainerProf[skillId] || "Intermediate";
    const reqLevel = reqProf[skillId] || "Intermediate";
    const scaleVal = proficiencyScale[level] || 1;
    const reqVal = proficiencyScale[reqLevel] || 1;
    const meetsRequirement = scaleVal >= reqVal;
    const score = Math.min(1, scaleVal / reqVal);
    proficiencyPoints += score;
    proficiencyBreakdown[skillId] = { level, requiredLevel: reqLevel, meetsRequirement, score };
    if (!meetsRequirement) {
      proficiencyGaps.push(skillId);
    }
  });

  const unweightedReadiness = percentage(matched.length, required.length);
  const weightedReadiness = required.length ? Math.round((proficiencyPoints / required.length) * 100) : 0;
  const readiness = options.weightProficiency ? weightedReadiness : unweightedReadiness;

  return {
    matched,
    missing,
    readiness,
    unweightedReadiness,
    weightedReadiness,
    proficiencyBreakdown,
    proficiencyGaps,
  };
};

export const candidateAnalysis = (candidate, data, options = {}) => {
  const required = requiredIndustrySkills(data).length ? requiredIndustrySkills(data) : roleRequirements;
  const skills = ids(candidate);
  const matched = required.filter((skillId) => skills.includes(skillId));
  const missing = required.filter((skillId) => !skills.includes(skillId));

  const candidateProf = data?.skillProficiency?.[candidate.id] || skillProficiency[candidate.id] || {};
  const reqProf = data?.requiredProficiency || requiredProficiency;

  let proficiencyPoints = 0;
  const proficiencyBreakdown = {};
  const proficiencyGaps = [];

  matched.forEach((skillId) => {
    const level = candidateProf[skillId] || "Intermediate";
    const reqLevel = reqProf[skillId] || "Intermediate";
    const scaleVal = proficiencyScale[level] || 1;
    const reqVal = proficiencyScale[reqLevel] || 1;
    const meetsRequirement = scaleVal >= reqVal;
    const score = Math.min(1, scaleVal / reqVal);
    proficiencyPoints += score;
    proficiencyBreakdown[skillId] = { level, requiredLevel: reqLevel, meetsRequirement, score };
    if (!meetsRequirement) {
      proficiencyGaps.push(skillId);
    }
  });

  const unweightedFit = percentage(matched.length, required.length);
  const weightedFit = required.length ? Math.round((proficiencyPoints / required.length) * 100) : 0;
  const fit = options.weightProficiency ? weightedFit : unweightedFit;

  return {
    matched,
    missing,
    fit,
    unweightedFit,
    weightedFit,
    proficiencyBreakdown,
    proficiencyGaps,
  };
};
export const feedbackSummary = (data) => { const ratings = data.employerFeedback.map((item) => Number(item.rating)).filter(Boolean); return { count: ratings.length, average: ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1) : "0.0" }; };
export const coverageForSkill = (skillId, data) => {
  const courses = data.courses.filter((course) => ids(course).includes(skillId)).length;
  const trainers = data.trainers.filter((trainer) => ids(trainer).includes(skillId)).length;
  const candidates = data.candidates.filter((candidate) => ids(candidate).includes(skillId)).length;
  const curriculum = data.curriculums.some((item) => ids(item).includes(skillId));
  return { courses, trainers, candidates, curriculum };
};
export const skillIntelligenceRows = (data) => demandRows(data).map((row) => {
  const coverage = coverageForSkill(row.skillId, data);
  const coveredDimensions = [coverage.courses > 0, coverage.trainers > 0, coverage.candidates > 0, coverage.curriculum].filter(Boolean).length;
  const status = coveredDimensions === 4 ? "Adequately Covered" : row.level === "High" && coveredDimensions <= 1 ? "Critical Gap" : row.level === "High" ? "High Demand" : "Moderate Demand";
  return { ...row, coverage, status, explanation: status === "Critical Gap" ? `${row.skill.name} is highly demanded but has limited ecosystem coverage.` : status === "High Demand" ? `${row.skill.name} is requested by employers and needs broader ecosystem coverage.` : `${row.skill.name} has enough coverage for the current demand signal.` };
});
export const executiveMetrics = (data) => {
  const capacity = capacityRows(data);
  const alignments = data.courses.map((course) => courseAnalysis(course, data).alignment);
  const trainerScores = data.trainers.map((trainer) => trainerAnalysis(trainer, data).readiness);
  return { openings: totalOpenings(data), employers: new Set([...data.consultations.map((item) => item.employerId), ...(data.jobPostings || []).map((p) => p.company)]).size, highDemandSkills: demandRows(data).filter((row) => row.level === "High").length, districtsWithGaps: capacity.some((row) => row.gap > 0) ? new Set(data.consultations.map((item) => item.district || "Unspecified")).size : 0, availableSeats: capacity.reduce((sum, row) => sum + row.availableSeats, 0), capacityGap: capacity.reduce((sum, row) => sum + row.gap, 0), courseAlignment: alignments.length ? Math.round(alignments.reduce((sum, value) => sum + value, 0) / alignments.length) : 0, trainerReadiness: trainerScores.length ? Math.round(trainerScores.reduce((sum, value) => sum + value, 0) / trainerScores.length) : 0, candidates: data.candidates.length, placements: data.placements.length, feedback: feedbackSummary(data).count };
};
export const feedbackIntelligence = (data) => {
  const feedback = data.employerFeedback;
  const skillGaps = feedback.flatMap((item) => Array.isArray(item.skillGaps) ? item.skillGaps : []).reduce((result, skill) => { result[skill] = (result[skill] || 0) + 1; return result; }, {});
  const skillRatings = feedback.flatMap((item) => Object.entries(item.skillRatings || {})).reduce((result, [skill, rating]) => { if (!result[skill]) result[skill] = []; result[skill].push(Number(rating)); return result; }, {});
  const strongest = Object.entries(skillRatings).sort((a, b) => (b[1].reduce((x, y) => x + y, 0) / b[1].length) - (a[1].reduce((x, y) => x + y, 0) / a[1].length))[0];
  const weakest = Object.entries(skillRatings).sort((a, b) => (a[1].reduce((x, y) => x + y, 0) / a[1].length) - (b[1].reduce((x, y) => x + y, 0) / b[1].length))[0];
  return { count: feedback.length, completionRate: data.placements.length ? Math.round(feedback.length / data.placements.length * 100) : 0, mostReportedGap: Object.entries(skillGaps).sort((a, b) => b[1] - a[1])[0]?.[0] || "No repeated gap yet", strongestSkill: strongest ? getSkill(strongest[0]).name : "Not enough feedback", weakestSkill: weakest ? getSkill(weakest[0]).name : "Not enough feedback" };
};
export const skillPulseDetail = (skillId, data) => {
  const demand = demandRows(data).find((row) => row.skillId === skillId) || { skillId, openings: 0, employers: 0, level: "Emerging", skill: getSkill(skillId) };
  const coverage = coverageForSkill(skillId, data);
  const capacity = capacityRows(data).find((row) => row.skillId === skillId) || { availableSeats: 0, gap: 0 };
  const placements = data.placements.filter((placement) => data.candidates.find((candidate) => candidate.id === placement.candidateId)?.skillIds.includes(skillId)).length;
  const relevantCourses = data.courses.filter((course) => ids(course).includes(skillId)); const courseAlignment = relevantCourses.length ? Math.round(relevantCourses.map((course) => courseAnalysis(course, data).alignment).reduce((sum, value) => sum + value, 0) / relevantCourses.length) : 0;
  return { ...demand, coverage, availableSeats: capacity.availableSeats, capacityGap: capacity.gap, placements, courseAlignment, status: skillIntelligenceRows(data).find((row) => row.skillId === skillId)?.status || "No current demand" };
};
export const districtPriorityRows = (data) => {
  const districts = new Set([...data.consultations.map((item) => item.district), ...data.trainingCapacity.map((item) => item.district), ...data.candidates.map((item) => item.district), ...(data.jobPostings || []).map((item) => item.district)].filter(Boolean));
  return [...districts].map((district) => {
    const consultations = data.consultations.filter((item) => item.district === district);
    const postings = (data.jobPostings || []).filter((item) => item.district === district);
    const openings = consultations.reduce((sum, item) => sum + (Number(item.openings) || 0), 0) + postings.reduce((sum, item) => sum + (Number(item.openings) || 1), 0);
    const seats = data.trainingCapacity.filter((item) => item.district === district).reduce((sum, item) => sum + (Number(item.availableSeats) || 0), 0);
    const criticalSkills = capacityRows(data).filter((row) => row.gap > 0 && data.trainingCapacity.some((item) => item.district === district && item.skillId === row.skillId)).map((row) => row.skill.name);
    const candidates = data.candidates.filter((item) => item.district === district).length;
    const placements = data.placements.filter((item) => item.district === district).length;
    const gap = openings - seats;
    const priority = gap > 0 && criticalSkills.length >= 2 ? "Critical Intervention" : gap > 0 ? "High Priority" : openings ? "Monitor" : "Balanced";
    return { district, openings, seats, gap, criticalSkills, institutes: new Set(data.trainingCapacity.filter((item) => item.district === district).map((item) => item.instituteId).filter(Boolean)).size, candidates, placements, priority };
  }).sort((a, b) => b.gap - a.gap);
};
export const simulateIntervention = (data, { skillId, additionalSeats, additionalTrainers, curriculumSkill }) => {
  const current = skillPulseDetail(skillId, data); const addedSeats = Number(additionalSeats) || 0; const addedTrainers = Number(additionalTrainers) || 0; const currentCurriculum = current.coverage.curriculum; const simulatedCurriculum = currentCurriculum || curriculumSkill === skillId; const currentTrainerCoverage = current.coverage.trainers; const simulatedTrainerCoverage = currentTrainerCoverage + addedTrainers; const currentCourseAlignment = data.courses.length ? Math.round(data.courses.map((course) => courseAnalysis(course, data).alignment).reduce((sum, value) => sum + value, 0) / data.courses.length) : 0; const simulatedCourseAlignment = curriculumSkill === skillId ? Math.min(100, currentCourseAlignment + Math.round(100 / Math.max(requiredIndustrySkills(data).length, 1))) : currentCourseAlignment; const missingCandidates = data.candidates.filter((candidate) => !candidate.skillIds.includes(skillId)).length; const coveredCandidates = Math.min(missingCandidates, Math.floor(addedSeats)); return { current, projected: { availableSeats: current.availableSeats + addedSeats, gap: current.capacityGap - addedSeats, trainerCoverage: simulatedTrainerCoverage, curriculum: simulatedCurriculum, courseAlignment: simulatedCourseAlignment, candidatesCovered: coveredCandidates, candidateGapReduction: missingCandidates ? Math.round(coveredCandidates / missingCandidates * 100) : 0 }, explanation: addedSeats ? `Adding ${addedSeats} seats would theoretically reduce the ${current.skill.name} capacity gap by ${Math.min(addedSeats, Math.max(current.capacityGap, 0))} seats in this prototype scenario.` : curriculumSkill === skillId ? `Adding ${current.skill.name} to curriculum coverage would project course alignment from ${currentCourseAlignment}% to ${simulatedCourseAlignment}%.` : addedTrainers ? `Adding ${addedTrainers} trainer(s) would increase projected ${current.skill.name} trainer coverage from ${currentTrainerCoverage} to ${simulatedTrainerCoverage}.` : `Change the controls to explore a projected intervention for ${current.skill.name}.` };
};
export const actionPriority = (score) => score >= 80 ? "Critical" : score >= 60 ? "High" : score >= 35 ? "Medium" : "Monitor";
export const priorityActions = (data) => {
  const actions = []; const rows = skillIntelligenceRows(data); const capacity = capacityRows(data);
  capacity.filter((row) => row.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3).forEach((row) => { const score = Math.min(100, Math.round(row.gap / Math.max(row.openings, 1) * 100) + (row.level === "High" ? 35 : 15)); actions.push({ id: `capacity-${row.skillId}`, type: "Capacity", priority: actionPriority(score), score, location: data.trainingCapacity.find((item) => item.skillId === row.skillId)?.district || "District-wide", issue: `${row.skill.name} demand exceeds available training seats.`, evidence: `${row.openings} openings · ${row.availableSeats} seats · ${row.gap} seat gap`, action: `Increase ${row.skill.name} training capacity by approximately ${row.gap} seats.`, affected: "capacity", skillId: row.skillId }); });
  rows.filter((row) => !row.coverage.curriculum).sort((a, b) => b.openings - a.openings).slice(0, 2).forEach((row) => actions.push({ id: `curriculum-${row.skillId}`, type: "Curriculum", priority: actionPriority(row.openings + 20), score: Math.min(100, row.openings + 20), location: "District-wide", issue: `${row.skill.name} is demanded by employers but missing from curriculum coverage.`, evidence: `${row.openings} openings · ${row.employers} employer(s) · curriculum missing`, action: `Add ${row.skill.name} to the selected curriculum.`, affected: "curriculum", skillId: row.skillId }));
  rows.filter((row) => row.level === "High" && row.coverage.trainers <= 1).sort((a, b) => b.openings - a.openings).slice(0, 2).forEach((row) => actions.push({ id: `trainer-${row.skillId}`, type: "Trainer", priority: actionPriority(row.openings + 10), score: Math.min(100, row.openings + 10), location: "District-wide", issue: `${row.skill.name} demand is high while trainer coverage is low.`, evidence: `${row.openings} openings · ${row.coverage.trainers} trainer(s) · high demand`, action: `Prioritize ${row.skill.name} trainer upskilling.`, affected: "trainers", skillId: row.skillId }));
  rows.filter((row) => row.level === "High" && row.coverage.candidates < Math.max(2, row.employers * 2)).slice(0, 2).forEach((row) => actions.push({ id: `candidate-${row.skillId}`, type: "Candidate", priority: actionPriority(row.openings), score: Math.min(100, row.openings), location: "District-wide", issue: `Candidates have limited ${row.skill.name} coverage against current demand.`, evidence: `${row.openings} openings · ${row.coverage.candidates} candidate(s) with skill`, action: `Add targeted ${row.skill.name} learning to candidate pathways.`, affected: "candidates", skillId: row.skillId }));

  // Flag obsolete and oversupplied courses
  (data.courses || []).forEach((course) => {
    const supply = courseSupplyStatus(course, data);
    const institute = data.trainingInstitutes?.find((i) => i.id === course.instituteId);
    const location = institute?.district || "District-wide";
    if (supply.status === "Obsolete") {
      actions.push({
        id: `course-obsolete-${course.id}`,
        type: "Course",
        priority: "Critical",
        score: 88,
        location,
        issue: `Course "${course.name}" is obsolete with zero industry demand overlap.`,
        evidence: supply.reason,
        action: `Retire or overhaul "${course.name}" to teach in-demand skills.`,
        affected: "courses",
        skillId: course.skillIds[0] || "legacy-office",
        courseId: course.id,
        status: supply.status,
      });
    } else if (supply.status === "Oversupplied") {
      actions.push({
        id: `course-oversupplied-${course.id}`,
        type: "Course",
        priority: "High",
        score: 68,
        location,
        issue: `Course "${course.name}" is oversupplied relative to market alignment.`,
        evidence: supply.reason,
        action: `Reduce allocated seats or update curriculum for "${course.name}".`,
        affected: "courses",
        skillId: course.skillIds[0] || "excel",
        courseId: course.id,
        status: supply.status,
      });
    }
  });

  return actions.sort((a, b) => b.score - a.score);
};

export const generateDistrictTrainingPlan = (district, data) => {
  const targetDistrict = district || data.districts?.[0]?.name || "Pune";
  const consults = (data.consultations || []).filter((c) => c.district === targetDistrict);
  const postings = (data.jobPostings || []).filter((p) => p.district === targetDistrict);
  const totalDistrictOpenings = consults.reduce((s, c) => s + (Number(c.openings) || 0), 0) +
    postings.reduce((s, p) => s + (Number(p.openings) || 1), 0);
  const employers = new Set([...consults.map((c) => c.employerId), ...postings.map((p) => p.company)]);
  const roles = [...new Set([...consults.map((c) => c.role || c.title), ...postings.map((p) => p.title)])];

  // District-specific demand and capacity rows
  const districtCapacity = capacityRows(data, targetDistrict);
  const capacityGaps = districtCapacity
    .filter((row) => row.gap > 0)
    .map((row) => ({
      skillId: row.skillId,
      skillName: row.skill.name,
      openings: row.openings,
      availableSeats: row.availableSeats,
      gap: row.gap,
      level: row.level,
    }));

  // Recommended seat increases
  const recommendedSeatIncreases = capacityGaps.map((gap) => ({
    skillId: gap.skillId,
    skillName: gap.skillName,
    currentSeats: gap.availableSeats,
    recommendedIncrease: gap.gap,
    targetCapacity: gap.availableSeats + gap.gap,
    reason: `Expand ${gap.skillName} capacity by ${gap.gap} seats to eliminate the shortage across ${gap.openings} active vacancies in ${targetDistrict}.`,
  }));

  // Trainer upskilling recommendations for trainers in target district
  const districtInstitutes = new Set((data.trainingInstitutes || []).filter((i) => i.district === targetDistrict).map((i) => i.id));
  const districtTrainers = (data.trainers || []).filter((t) => districtInstitutes.has(t.instituteId) || !districtInstitutes.size);
  const recommendedTrainerUpskilling = districtTrainers.flatMap((trainer) => {
    const analysis = trainerAnalysis(trainer, data);
    const upskillSkills = [...new Set([...analysis.missing, ...(analysis.proficiencyGaps || [])])];
    if (!upskillSkills.length) return [];
    return [{
      trainerId: trainer.id,
      trainerName: trainer.name,
      experience: trainer.experience,
      missingSkills: upskillSkills.map((id) => getSkill(id).name),
      recommendedSkills: upskillSkills.slice(0, 2).map((id) => getSkill(id).name).join(" and "),
      reason: `${trainer.name} (${trainer.experience}) matches ${analysis.matched.length} demanded skills (${analysis.readiness}% readiness). Upskilling in ${upskillSkills.map((id) => getSkill(id).name).join(", ")} develops ${targetDistrict} instructional readiness.`,
    }];
  });

  // Recommended curriculum changes
  const recommendedCurriculumChanges = (data.curriculums || []).flatMap((curr) => {
    const analysis = curriculumAnalysis(curr, data);
    if (!analysis.missing.length) return [];
    return [{
      curriculumId: curr.id,
      curriculumName: curr.name,
      owner: curr.owner,
      alignment: analysis.alignment,
      missingSkills: analysis.missing.map((id) => getSkill(id).name),
      action: `Incorporate ${analysis.missing.map((id) => getSkill(id).name).join(", ")} into curriculum framework.`,
      reason: `Current curriculum alignment is ${analysis.alignment}%. Adding demanded skills aligns government standards with live employer requirements.`,
    }];
  });

  // Obsolete & Oversupplied courses in target district to retire or rationalize
  const districtCourses = (data.courses || []).filter((course) => {
    const inst = (data.trainingInstitutes || []).find((i) => i.id === course.instituteId);
    return districtInstitutes.size ? districtInstitutes.has(course.instituteId) : (inst?.district === targetDistrict);
  });

  const obsoleteCoursesToRetire = (districtCourses.length ? districtCourses : data.courses || [])
    .map((course) => ({ course, supply: courseSupplyStatus(course, data) }))
    .filter(({ supply }) => supply.status === "Obsolete" || supply.status === "Oversupplied")
    .map(({ course, supply }) => ({
      courseId: course.id,
      courseName: course.name,
      seats: course.seats,
      enrolled: course.enrolled,
      status: supply.status,
      reason: supply.reason,
      action: supply.status === "Obsolete"
        ? `Decommission "${course.name}" and redeploy instructional capacity to high-deficit courses in ${targetDistrict}.`
        : `Reduce intake from ${course.seats} to ${Math.max(course.enrolled, 15)} seats and revamp coursework.`,
    }));

  return {
    district: targetDistrict,
    totalOpenings: totalDistrictOpenings,
    generatedAt: "12 Sep 2026",
    demandSummary: {
      totalOpenings: totalDistrictOpenings,
      activeEmployers: employers.size,
      topDemandedSkills: districtCapacity.slice().sort((a, b) => b.openings - a.openings).slice(0, 5).map((d) => ({ name: d.skill.name, openings: d.openings, level: d.level })),
      primaryRoles: roles.slice(0, 4),
    },
    capacityGaps,
    recommendedSeatIncreases,
    recommendedTrainerUpskilling,
    recommendedCurriculumChanges,
    obsoleteCoursesToRetire,
  };
};

export const pipelineMetrics = (data, district = "All", role = "All") => {
  const consultations = data.consultations.filter((item) => (district === "All" || item.district === district) && (role === "All" || item.role === role)); const openings = consultations.reduce((sum, item) => sum + (Number(item.openings) || 0), 0); const seats = data.trainingCapacity.filter((item) => district === "All" || item.district === district).reduce((sum, item) => sum + (Number(item.availableSeats) || 0), 0); const candidates = data.candidates.filter((candidate) => district === "All" || candidate.district === district); const placements = data.placements.filter((placement) => district === "All" || placement.district === district); const placementIds = new Set(placements.map((placement) => placement.id)); const feedback = data.employerFeedback.filter((item) => placementIds.has(item.placementId)); const readyCandidates = candidates.filter((candidate) => candidateAnalysis(candidate, data).fit >= 80).length; return { openings, seats, candidates: candidates.length, readyCandidates, placements: placements.length, feedback: feedback.length, district, role };
};
export const pipelineConversions = (pipeline) => ({ trainingCoverage: pipeline.openings ? Math.round(pipeline.seats / pipeline.openings * 100) : null, candidateReadiness: pipeline.candidates ? Math.round(pipeline.readyCandidates / pipeline.candidates * 100) : null, placementConversion: pipeline.candidates ? Math.round(pipeline.placements / pipeline.candidates * 100) : null, feedbackCoverage: pipeline.placements ? Math.round(pipeline.feedback / pipeline.placements * 100) : null });
export const hierarchyOptions = (data) => ({ districts: ["All", ...new Set(data.consultations.map((item) => item.district).filter(Boolean))], roles: ["All", ...new Set(data.consultations.map((item) => item.role).filter(Boolean))] });
export const prototypeImpactScore = (current, projected) => {
  const capacity = current.capacityGap > 0 ? Math.max(0, Math.min(100, (current.capacityGap - Math.max(projected.gap, 0)) / current.capacityGap * 100)) : 0; const trainer = current.coverage.trainers ? Math.max(0, Math.min(100, (projected.trainerCoverage - current.coverage.trainers) / current.coverage.trainers * 100)) : projected.trainerCoverage ? 100 : 0; const course = Math.max(0, projected.courseAlignment - (current.courseAlignment || 0)); const candidate = projected.candidateGapReduction || 0; const curriculum = projected.curriculum && !current.coverage.curriculum ? 100 : 0; const breakdown = { capacity: Math.round(capacity), trainer: Math.round(trainer), course: Math.round(Math.min(course * 5, 100)), candidate: Math.round(candidate), curriculum }; const score = Math.round(breakdown.capacity * .35 + breakdown.trainer * .2 + breakdown.course * .2 + breakdown.candidate * .15 + breakdown.curriculum * .1); return { score, breakdown };
};