"use client";

import React, { useState } from "react";

interface RevenueChartProps {
  monthlyTarget: number[];
  monthlyTerbayar: number[];
  monthlyTunggakan: number[];
  monthLabels: string[];
  totalBookings: number;
  conversionRate: string;
  maxVal: number;
}

export default function RevenueChart({
  monthlyTarget,
  monthlyTerbayar,
  monthlyTunggakan,
  monthLabels,
  totalBookings,
  conversionRate,
  maxVal,
}: RevenueChartProps) {
  // Default to null so no month is pre-selected on initial load
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active series toggle state
  const [activeSeries, setActiveSeries] = useState({
    target: true,
    terbayar: true,
    tunggakan: true,
  });

  const toggleSeries = (series: "target" | "terbayar" | "tunggakan") => {
    setActiveSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }));
  };

  // Bezier curve interpolation helper
  const getBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const svgWidth = 560;
  const svgHeight = 200;

  const getPoints = (arr: number[]) => {
    return arr.map((val, i) => {
      const x = 90 + i * 86;
      // scale y between 30 (top) and 160 (bottom)
      const y = 160 - (val / maxVal) * 120;
      return { x, y, val };
    });
  };

  const targetPoints = getPoints(monthlyTarget);
  const terbayarPoints = getPoints(monthlyTerbayar);
  const tunggakanPoints = getPoints(monthlyTunggakan);

  const targetPath = getBezierPath(targetPoints);
  const terbayarPath = getBezierPath(terbayarPoints);
  const tunggakanPath = getBezierPath(tunggakanPoints);

  const targetAreaPath = `${targetPath} L ${targetPoints[5].x} 160 L ${targetPoints[0].x} 160 Z`;
  const terbayarAreaPath = `${terbayarPath} L ${terbayarPoints[5].x} 160 L ${terbayarPoints[0].x} 160 Z`;
  const tunggakanAreaPath = `${tunggakanPath} L ${tunggakanPoints[5].x} 160 L ${tunggakanPoints[0].x} 160 Z`;

  // Get active points for hovered index (fallback safely to index 0 if null)
  const activeIndex = hoveredIndex !== null ? hoveredIndex : 0;
  const activeTarget = targetPoints[activeIndex];
  const activeTerbayar = terbayarPoints[activeIndex];
  const activeTunggakan = tunggakanPoints[activeIndex];
  const centerX = activeTarget.x;

  // Determine which y position and value to align the horizontal crosshair and Y-axis bubble with
  let selectedY: number | null = null;
  let selectedVal: number | null = null;

  if (activeSeries.target) {
    selectedY = activeTarget.y;
    selectedVal = activeTarget.val;
  } else if (activeSeries.terbayar) {
    selectedY = activeTerbayar.y;
    selectedVal = activeTerbayar.val;
  } else if (activeSeries.tunggakan) {
    selectedY = activeTunggakan.y;
    selectedVal = activeTunggakan.val;
  }

  // Resolve box positions vertically to prevent overlapping
  let targetBoxY = activeTarget.y - 28;
  let terbayarBoxY = activeTerbayar.y - 28;
  let tunggakanBoxY = activeTunggakan.y - 28;

  // Check and resolve overlap between target (highest) and terbayar (middle)
  if (Math.abs(targetBoxY - terbayarBoxY) < 22) {
    targetBoxY = activeTarget.y - 42;
    terbayarBoxY = activeTerbayar.y - 18;
  }

  // Check and resolve overlap between terbayar and tunggakan (lowest)
  if (Math.abs(terbayarBoxY - tunggakanBoxY) < 22) {
    terbayarBoxY = Math.min(terbayarBoxY, activeTunggakan.y - 42);
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider">Transaksi Pendapatan</span>
            <h2 className="font-display font-semibold text-ink-900 text-[16px] tracking-[-0.02em] mt-0.5">TRANSAKSI PENDAPATAN</h2>
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 bg-emerald-50 text-[#10B981] rounded-full border border-emerald-100">
            LIVE DATA
          </span>
        </div>
        <p className="text-xs text-ink-500 mb-6 font-normal">Representasi data grafik nominal transaksi pengajuan sewa 6 bulan terakhir.</p>
        
        {/* Custom Interactive SVG Chart */}
        <div className="w-full relative bg-surface-muted/50 rounded-xl border border-line p-4 overflow-hidden select-none">
          <svg 
            className="w-full h-full min-h-[220px]" 
            viewBox="0 0 560 200" 
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="glow-target" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6D3FE0" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6D3FE0" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="glow-terbayar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2FB26B" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2FB26B" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="glow-tunggakan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB400" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFB400" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Horizontal Gridlines */}
            <line x1="90" y1="30" x2="520" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="90" y1="73" x2="520" y2="73" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="90" y1="116" x2="520" y2="116" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="90" y1="160" x2="520" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Vertical Gridlines at point markers */}
            {monthLabels.map((_, idx) => {
              const x = 90 + idx * 86;
              return (
                <line key={`v-line-${idx}`} x1={x} y1="30" x2={x} y2="160" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              );
            })}

            {/* Y-Axis Currency Labels */}
            {[0, 1, 2, 3].map((idx) => {
              const val = (maxVal / 3) * (3 - idx);
              const y = 30 + idx * 43.33;
              const labelStr = val >= 1000000 
                ? (val / 1000000).toLocaleString("id-ID") + " jt" 
                : val.toLocaleString("id-ID");
              return (
                <text key={`y-lbl-${idx}`} x="80" y={y + 3.5} textAnchor="end" fill="#64748b" fontSize="8.5" fontWeight="bold">
                  {labelStr}
                </text>
              );
            })}

            {/* X-Axis Month Labels */}
            {monthLabels.map((lbl, idx) => {
              const x = 90 + idx * 86;
              return (
                <text key={`x-lbl-${idx}`} x={x} y="180" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
                  {lbl}
                </text>
              );
            })}

            {/* Area under curves */}
            {activeSeries.target && <path d={targetAreaPath} fill="url(#glow-target)" />}
            {activeSeries.terbayar && <path d={terbayarAreaPath} fill="url(#glow-terbayar)" />}
            {activeSeries.tunggakan && <path d={tunggakanAreaPath} fill="url(#glow-tunggakan)" />}
            
            {/* Main Curve Lines */}
            {activeSeries.target && <path d={targetPath} fill="none" stroke="#6D3FE0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {activeSeries.terbayar && <path d={terbayarPath} fill="none" stroke="#2FB26B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {activeSeries.tunggakan && <path d={tunggakanPath} fill="none" stroke="#FFB400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Crosshairs & Highlights: Render only on hover and when at least one series is active */}
            {hoveredIndex !== null && selectedY !== null && selectedVal !== null && (
              <>
                {/* Crosshair horizontal line to Y-axis */}
                <line x1="90" y1={selectedY} x2={centerX} y2={selectedY} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                {/* Crosshair vertical line */}
                <line x1={centerX} y1="30" x2={centerX} y2="160" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />

                {/* Black Bubble on Y-axis (left side) */}
                <g>
                  <rect x="5" y={selectedY - 9} width="80" height="18" rx="4" fill="#000000" />
                  <text x="45" y={selectedY + 3} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                    Rp {Math.round(selectedVal).toLocaleString("id-ID")}
                  </text>
                </g>

                {/* Black Bubble on X-axis (bottom side) */}
                <g>
                  <rect x={centerX - 40} y="165" width="80" height="18" rx="4" fill="#000000" />
                  <text x={centerX} y="177" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">
                    {monthLabels[hoveredIndex]}
                  </text>
                </g>
              </>
            )}

            {/* Crosshair vertical line only (when no series are selected but hovered) */}
            {hoveredIndex !== null && selectedY === null && (
              <line x1={centerX} y1="30" x2={centerX} y2="160" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
            )}
            
            {/* Data Points */}
            {activeSeries.target && targetPoints.map((p, idx) => (
              <circle key={`t-pt-${idx}`} cx={p.x} cy={p.y} r="4" fill="#6D3FE0" stroke="#ffffff" strokeWidth="2" />
            ))}
            {activeSeries.terbayar && terbayarPoints.map((p, idx) => (
              <circle key={`tb-pt-${idx}`} cx={p.x} cy={p.y} r="4" fill="#2FB26B" stroke="#ffffff" strokeWidth="2" />
            ))}
            {activeSeries.tunggakan && tunggakanPoints.map((p, idx) => (
              <circle key={`tk-pt-${idx}`} cx={p.x} cy={p.y} r="4" fill="#FFB400" stroke="#ffffff" strokeWidth="2" />
            ))}

            {/* Tooltips: Render only on hover */}
            {hoveredIndex !== null && (
              <>
                {/* Tooltip Green: Target */}
                {activeSeries.target && (
                  <g>
                    <polygon
                      points={`${centerX},${activeTarget.y - 3} ${centerX - 4},${targetBoxY + 18} ${centerX + 4},${targetBoxY + 18}`}
                      fill="#6D3FE0"
                    />
                    <rect
                      x={centerX - 85}
                      y={targetBoxY}
                      width="170"
                      height="18"
                      rx="4"
                      fill="#6D3FE0"
                    />
                    <text x={centerX} y={targetBoxY + 12} textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                      Target Pendapatan: {Math.round(activeTarget.val).toLocaleString("id-ID")}
                    </text>
                  </g>
                )}

                {/* Tooltip Blue: Terbayar */}
                {activeSeries.terbayar && (
                  <g>
                    <polygon
                      points={`${centerX},${activeTerbayar.y - 3} ${centerX - 4},${terbayarBoxY + 18} ${centerX + 4},${terbayarBoxY + 18}`}
                      fill="#2FB26B"
                    />
                    <rect
                      x={centerX - 75}
                      y={terbayarBoxY}
                      width="150"
                      height="18"
                      rx="4"
                      fill="#2FB26B"
                    />
                    <text x={centerX} y={terbayarBoxY + 12} textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                      Terbayar: {Math.round(activeTerbayar.val).toLocaleString("id-ID")}
                    </text>
                  </g>
                )}

                {/* Tooltip Red: Tunggakan */}
                {activeSeries.tunggakan && (
                  <g>
                    <polygon
                      points={`${centerX},${activeTunggakan.y - 3} ${centerX - 4},${tunggakanBoxY + 18} ${centerX + 4},${tunggakanBoxY + 18}`}
                      fill="#FFB400"
                    />
                    <rect
                      x={centerX - 75}
                      y={tunggakanBoxY}
                      width="150"
                      height="18"
                      rx="4"
                      fill="#FFB400"
                    />
                    <text x={centerX} y={tunggakanBoxY + 12} textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                      Tunggakan: {Math.round(activeTunggakan.val).toLocaleString("id-ID")}
                    </text>
                  </g>
                )}
              </>
            )}

            {/* Interactive hover rect triggers */}
            {monthLabels.map((_, idx) => {
              const x = 90 + idx * 86;
              return (
                <rect
                  key={`hover-trigger-${idx}`}
                  x={x - 43}
                  y="0"
                  width="86"
                  height="200"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              );
            })}
          </svg>
        </div>

        {/* Interactive Legend Buttons with toggling logic */}
        <div className="flex flex-wrap justify-center gap-6 text-[10.5px] font-bold text-ink-700 mt-4 border-t border-line pt-3 select-none">
          <button 
            type="button"
            onClick={() => toggleSeries("target")}
            className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer focus:outline-none"
          >
            <span className={`w-3.5 h-3.5 rounded border border-white shadow-sm inline-block transition-colors ${activeSeries.target ? "bg-[#6D3FE0]" : "bg-slate-400"}`}></span>
            <span className={activeSeries.target ? "text-ink-900" : "text-ink-500"}>Target Pendapatan</span>
          </button>
          
          <button 
            type="button"
            onClick={() => toggleSeries("terbayar")}
            className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer focus:outline-none"
          >
            <span className={`w-3.5 h-3.5 rounded border border-white shadow-sm inline-block transition-colors ${activeSeries.terbayar ? "bg-[#2FB26B]" : "bg-slate-400"}`}></span>
            <span className={activeSeries.terbayar ? "text-ink-900" : "text-ink-500"}>Terbayar</span>
          </button>
          
          <button 
            type="button"
            onClick={() => toggleSeries("tunggakan")}
            className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer focus:outline-none"
          >
            <span className={`w-3.5 h-3.5 rounded border border-white shadow-sm inline-block transition-colors ${activeSeries.tunggakan ? "bg-[#FFB400]" : "bg-slate-400"}`}></span>
            <span className={activeSeries.tunggakan ? "text-ink-900" : "text-ink-500"}>Tunggakan</span>
          </button>
        </div>
      </div>
      <div className="border-t border-line pt-4 mt-6 flex items-center justify-between text-xs font-semibold text-ink-500">
        <span>Rasio Konversi Booking: <strong className="text-ink-900">{conversionRate}%</strong></span>
        <span>Total Pengajuan Aktif: <strong className="text-brand-600">{totalBookings}</strong></span>
      </div>
    </div>
  );
}
