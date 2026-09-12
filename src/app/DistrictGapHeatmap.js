"use client";

import { useMemo } from "react";

function gapTone(gap, maximum) {
  if (gap <= 0 || maximum <= 0) return "heatmap-cell-neutral";
  const intensity = gap / maximum;
  if (intensity >= 0.75) return "heatmap-cell-high";
  if (intensity >= 0.4) return "heatmap-cell-medium";
  return "heatmap-cell-low";
}

export default function DistrictGapHeatmap({ districts = [] }) {
  const rows = useMemo(() => districts.map((district) => ({
    name: district.district || "Unknown district",
    gap: Number.isFinite(Number(district.gap)) ? Number(district.gap) : 0,
  })), [districts]);
  const maximum = Math.max(...rows.map((row) => Math.max(row.gap, 0)), 0);

  return (
    <section className="card district-heatmap-card">
      <div className="section-head">
        <div>
          <div className="eyebrow">DISTRICT GAP HEATMAP</div>
          <h2>Training capacity gaps by district</h2>
          <p>Darker cells indicate a larger positive gap between demand and available seats.</p>
        </div>
        <span className="badge">{rows.length} districts</span>
      </div>
      {rows.length ? (
        <div className="district-heatmap" role="table" aria-label="District training capacity gaps">
          {rows.map((row) => (
            <div className={`district-heatmap-row ${gapTone(row.gap, maximum)}`} role="row" key={row.name}>
              <span role="cell"><b>{row.name}</b></span>
              <span role="cell" className="district-heatmap-value">{row.gap > 0 ? `${row.gap} seats` : row.gap < 0 ? `${Math.abs(row.gap)} spare` : "No gap"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty"><strong>No district gap data</strong><p>District capacity records will appear here when available.</p></div>
      )}
      <div className="heatmap-legend" aria-label="Gap intensity legend">
        <span>Smaller gap</span>
        <i className="heatmap-swatch heatmap-cell-low" />
        <i className="heatmap-swatch heatmap-cell-medium" />
        <i className="heatmap-swatch heatmap-cell-high" />
        <span>Larger gap</span>
      </div>
    </section>
  );
}
