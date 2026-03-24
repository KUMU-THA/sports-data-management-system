// src/components/StudentReportViewer.jsx
// Usage: {page === "records" && <StudentReportViewer token={getToken()} />}
// NAV:   { id:"records", label:"Student Reports", Icon:Ic.Student, group:"Records" }
// Install: npm install jspdf html2canvas

import { useState, useEffect, useCallback, useRef } from "react";
import jsPDF       from "jspdf";
import html2canvas from "html2canvas";

const API = process.env.REACT_APP_API_URL;
const getToken = () => localStorage.getItem("token") || "";

// ─── styles ───────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("srv3-styles")) return;
  const s = document.createElement("style");
  s.id = "srv3-styles";
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

:root {
  --navy:#0c1f5e; --navy2:#1a3488; --navy3:#1e40af;
  --gold:#c8940a; --gold-lt:#fef3c7;
  --sl:#334155; --sl2:#64748b; --sl3:#94a3b8;
  --bd:#e2e8f0; --bg:#f8fafc; --wh:#ffffff;
  --gr:#166534; --gr-bg:#dcfce7;
  --rd:#991b1b; --rd-bg:#fee2e2;
  --bl:#1d4ed8; --bl-bg:#dbeafe;
  --pu:#5b21b6; --pu-bg:#ede9fe;
  --am:#92400e; --am-bg:#fef3c7;
  --te:#0f766e; --te-bg:#ccfbf1;
}

/* ── shell ── */
.srv-root { display:flex; height:100dvh; background:var(--bg); font-family:'DM Sans',sans-serif; overflow:hidden; }

/* ── left panel ── */
.srv-left { width:286px; flex-shrink:0; background:var(--wh); border-right:1px solid var(--bd); display:flex; flex-direction:column; overflow:hidden; }
.srv-lhdr { padding:18px 15px 12px; background:var(--navy); }
.srv-ltitle { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:#fff; }
.srv-lsub { font-size:11px; color:rgba(255,255,255,.42); margin-top:2px; }
.srv-sw { position:relative; margin:10px 10px 0; }
.srv-sw svg { position:absolute; left:9px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--sl2); }
.srv-si { width:100%; padding:8px 10px 8px 30px; border-radius:7px; border:1.5px solid var(--bd); font-family:'DM Sans',sans-serif; font-size:12px; color:var(--sl); background:var(--bg); outline:none; }
.srv-si:focus { border-color:var(--navy3); }
.srv-chips { display:flex; gap:5px; flex-wrap:wrap; padding:8px 10px 10px; border-bottom:1px solid var(--bd); }
.srv-chip { padding:2px 9px; border-radius:20px; border:1px solid var(--bd); font-size:11px; font-weight:500; color:var(--sl2); background:var(--wh); cursor:pointer; transition:all .12s; white-space:nowrap; }
.srv-chip:hover { border-color:var(--navy3); color:var(--navy3); }
.srv-chip.on { background:var(--navy); border-color:var(--navy); color:#fff; }
.srv-list { flex:1; overflow-y:auto; padding:6px 0; }
.srv-list::-webkit-scrollbar { width:3px; }
.srv-list::-webkit-scrollbar-thumb { background:var(--bd); border-radius:3px; }
.srv-row { display:flex; align-items:center; gap:10px; padding:9px 13px; cursor:pointer; transition:background .11s; border-left:3px solid transparent; }
.srv-row:hover { background:#f0f4ff; }
.srv-row.on { background:#eff6ff; border-left-color:var(--navy3); }
.srv-av { width:36px; height:36px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-weight:700; font-size:14px; color:#fff; background:var(--navy2); }
.srv-sn { font-size:13px; font-weight:500; color:var(--sl); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.srv-sm { font-size:11px; color:var(--sl2); margin-top:1px; }

/* ── right panel ── */
.srv-right { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
.srv-topbar { height:52px; background:var(--wh); border-bottom:1px solid var(--bd); display:flex; align-items:center; justify-content:space-between; padding:0 20px; flex-shrink:0; gap:12px; }
.srv-ttl { font-family:'Playfair Display',serif; font-weight:700; font-size:15px; color:var(--navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.srv-acts { display:flex; gap:7px; flex-shrink:0; }
.srv-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:7px; border:none; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:all .13s; white-space:nowrap; }
.srv-bp { background:var(--navy); color:#fff; }
.srv-bp:hover { background:var(--navy2); }
.srv-bp:disabled { opacity:.5; cursor:not-allowed; }
.srv-bo { background:var(--wh); color:var(--sl); border:1px solid var(--bd); }
.srv-bo:hover { background:var(--bg); }

/* ── FILTER BAR ── */
.flt-bar {
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  padding:10px 20px; background:var(--wh);
  border-bottom:1px solid var(--bd); flex-shrink:0;
}
.flt-label { font-size:11px; font-weight:600; color:var(--sl2); white-space:nowrap; }
.flt-btn {
  padding:5px 13px; border-radius:20px; border:1.5px solid var(--bd);
  background:var(--wh); font-family:'DM Sans',sans-serif; font-size:12px;
  font-weight:500; color:var(--sl2); cursor:pointer; transition:all .13s; white-space:nowrap;
}
.flt-btn:hover  { border-color:var(--navy3); color:var(--navy3); }
.flt-btn.active { background:var(--navy); border-color:var(--navy); color:#fff; box-shadow:0 2px 8px rgba(12,31,94,.22); }
.flt-divider { width:1px; height:20px; background:var(--bd); flex-shrink:0; }
.flt-date-group { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.flt-date-lbl { font-size:11px; color:var(--sl2); font-weight:500; white-space:nowrap; }
.flt-date-in {
  padding:5px 10px; border-radius:7px; border:1.5px solid var(--bd);
  font-family:'DM Sans',sans-serif; font-size:12px; color:var(--sl);
  background:var(--wh); outline:none; transition:border .15s;
}
.flt-date-in:focus { border-color:var(--navy3); }
.flt-apply {
  padding:5px 13px; border-radius:7px; border:none;
  background:var(--navy3); color:#fff; font-family:'DM Sans',sans-serif;
  font-size:12px; font-weight:500; cursor:pointer; transition:all .13s;
}
.flt-apply:hover { background:var(--navy2); }

/* ── period badge shown in report cover ── */
.rp-period-badge {
  display:inline-block; background:rgba(255,255,255,.15);
  border:1px solid rgba(255,255,255,.25); border-radius:20px;
  padding:3px 12px; font-size:11px; color:rgba(255,255,255,.85); margin-top:8px;
}

.srv-scroll { flex:1; overflow-y:auto; padding:20px; background:var(--bg); }
.srv-scroll::-webkit-scrollbar { width:4px; }
.srv-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
.srv-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:10px; color:var(--sl2); }
.srv-empty-ic { font-size:42px; opacity:.28; }
.srv-empty-t { font-family:'Playfair Display',serif; font-size:17px; color:var(--sl); }
.srv-spin { width:20px; height:20px; border:2.5px solid rgba(12,31,94,.12); border-top-color:var(--navy); border-radius:50%; animation:sSpin .7s linear infinite; }
@keyframes sSpin  { to{transform:rotate(360deg)} }
@keyframes sFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

/* ════════════════════════════════
   REPORT PAPER
   ════════════════════════════════ */
.rp { background:var(--wh); border:1px solid var(--bd); border-radius:2px; max-width:860px; margin:0 auto; font-family:'DM Sans',sans-serif; color:var(--sl); animation:sFadeUp .28s ease; overflow:hidden; }

/* cover */
.rp-cov { background:var(--navy); }
.rp-ctop { display:flex; justify-content:space-between; align-items:flex-start; padding:22px 28px 16px; border-bottom:1px solid rgba(255,255,255,.1); gap:16px; flex-wrap:wrap; }
.rp-iname { font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:#fff; }
.rp-isub  { font-size:11px; color:rgba(255,255,255,.5); margin-top:2px; }
.rp-iaddr { font-size:10px; color:rgba(255,255,255,.3); margin-top:3px; line-height:1.7; }
.rp-dmeta { text-align:right; font-size:11px; color:rgba(255,255,255,.45); line-height:1.9; flex-shrink:0; }
.rp-dmeta b { color:rgba(255,255,255,.8); font-weight:500; }
.rp-cbody { padding:16px 28px 22px; display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; }
.rp-rtag  { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.36); margin-bottom:5px; }
.rp-rtitle { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#fff; line-height:1.2; }
.rp-rsub  { font-size:11px; color:rgba(255,255,255,.48); margin-top:4px; }
.rp-stamps { display:flex; gap:8px; flex-shrink:0; }
.rp-stamp { border:1px solid rgba(255,255,255,.18); border-radius:3px; padding:7px 12px; text-align:center; }
.rp-slbl  { font-size:9px; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,.36); }
.rp-sval  { font-size:12px; font-weight:500; color:rgba(255,255,255,.82); margin-top:2px; }
.rp-gold  { height:3px; background:var(--gold); }

/* section header */
.rp-sec { display:flex; align-items:center; gap:8px; padding:9px 28px; background:var(--bg); border-top:1px solid var(--bd); border-bottom:1px solid var(--bd); }
.rp-sbar   { width:3px; height:16px; background:var(--navy); flex-shrink:0; }
.rp-snum   { font-size:10px; font-weight:600; color:var(--sl3); }
.rp-stitle { font-family:'Playfair Display',serif; font-size:13px; font-weight:600; color:var(--navy); }
.rp-scnt   { margin-left:auto; font-size:11px; color:var(--sl2); background:var(--wh); border:1px solid var(--bd); border-radius:20px; padding:2px 9px; white-space:nowrap; }

/* identity table */
.rp-id-wrap { display:flex; border-bottom:1px solid var(--bd); }
.rp-id-avcol { width:82px; flex-shrink:0; background:var(--bg); border-right:1px solid var(--bd); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 6px; gap:6px; }
.rp-id-av { width:52px; height:52px; border-radius:50%; background:var(--navy); color:#fff; font-family:'Playfair Display',serif; font-size:20px; font-weight:700; display:flex; align-items:center; justify-content:center; }
.rp-id-avlbl { font-size:9px; color:var(--sl3); letter-spacing:.7px; text-transform:uppercase; }
.rp-id-tbl { flex:1; border-collapse:collapse; }
.rp-id-tbl td { padding:9px 14px; border-bottom:1px solid var(--bd); vertical-align:middle; font-size:12px; line-height:1.4; }
.rp-id-tbl tr:last-child td { border-bottom:none; }
.rp-id-tbl .lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.7px; color:var(--sl2); white-space:nowrap; background:var(--bg); width:1%; border-right:1px solid var(--bd); }
.rp-id-tbl .val { color:var(--sl); }
.rp-id-tbl .sep { border-left:2px solid var(--bd); }

/* KPI */
.rp-kpi { display:grid; grid-template-columns:repeat(5,1fr); border-bottom:1px solid var(--bd); }
.rp-kc { padding:14px 10px; text-align:center; border-right:1px solid var(--bd); }
.rp-kc:last-child { border-right:none; }
.rp-kv { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:var(--navy); line-height:1; }
.rp-kl { font-size:10px; color:var(--sl2); margin-top:4px; text-transform:uppercase; letter-spacing:.4px; }
.rp-ks { font-size:11px; color:var(--sl3); margin-top:2px; }

/* tables */
.rp-tw { overflow-x:auto; }
table.rp-t { width:100%; border-collapse:collapse; font-size:12px; }
table.rp-t th { padding:8px 12px; text-align:left; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:var(--sl2); background:var(--bg); border-bottom:1px solid var(--bd); white-space:nowrap; }
table.rp-t td { padding:9px 12px; border-bottom:1px solid #f1f5f9; color:var(--sl); vertical-align:middle; }
table.rp-t tbody tr:last-child td { border-bottom:none; }
table.rp-t tbody tr:nth-child(even) td { background:#fafbfd; }
table.rp-t tbody tr:hover td { background:#eff6ff; }
.rp-tftr { padding:8px 14px; background:var(--bg); border-top:1px solid var(--bd); font-size:11px; color:var(--sl3); }
tr.sum td { background:#eef2ff !important; font-weight:600; color:var(--navy) !important; border-top:1px solid var(--bd); }

/* att bar */
.ab { display:flex; align-items:center; gap:7px; }
.ab-track { flex:1; height:5px; background:#e2e8f0; border-radius:3px; overflow:hidden; min-width:40px; }
.ab-fill { height:100%; border-radius:3px; }
.ab-pct { font-size:11px; font-weight:600; min-width:34px; }

/* achievement cards */
.ach-grid { display:grid; grid-template-columns:repeat(2,1fr); }
.ach-card { padding:12px 16px; border-right:1px solid var(--bd); border-bottom:1px solid var(--bd); }
.ach-card:nth-child(2n) { border-right:none; }
.ach-card:nth-last-child(-n+2):nth-child(odd),.ach-card:last-child { border-bottom:none; }
.ach-sport { font-size:10px; font-weight:600; color:var(--sl2); text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
.ach-evt { font-size:12px; color:var(--sl); margin-bottom:6px; font-weight:500; }
.ach-tags { display:flex; gap:4px; flex-wrap:wrap; }

/* pills */
.pill { display:inline-block; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:500; white-space:nowrap; line-height:1.5; }
.p-gr { background:var(--gr-bg); color:var(--gr); }
.p-rd { background:var(--rd-bg); color:var(--rd); }
.p-bl { background:var(--bl-bg); color:var(--bl); }
.p-gd { background:var(--gold-lt); color:var(--am); }
.p-pu { background:var(--pu-bg);  color:var(--pu); }
.p-te { background:var(--te-bg);  color:var(--te); }
.p-sl { background:#f1f5f9;       color:var(--sl); }
.num  { color:var(--sl3); font-size:11px; }

/* declaration */
.rp-decl { padding:13px 28px; background:#fffbeb; border-top:1px solid #fde68a; border-bottom:1px solid var(--bd); font-size:11.5px; color:var(--sl); line-height:1.8; font-style:italic; }
.rp-decl b { font-style:normal; color:var(--navy); }

/* signatures */
.rp-sigs { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--bd); }
.rp-sg { padding:15px 20px; border-right:1px solid var(--bd); }
.rp-sg:last-child { border-right:none; }
.rp-sgline { border-top:1px solid var(--sl); margin-bottom:6px; width:100%; }
.rp-sgname { font-size:12px; font-weight:600; color:var(--navy); }
.rp-sgrole { font-size:10px; color:var(--sl2); margin-top:2px; line-height:1.5; }
.rp-circle { width:58px; height:58px; border-radius:50%; border:1px solid var(--bd); margin:0 auto; display:flex; align-items:center; justify-content:center; flex-direction:column; }
.rp-circle span { font-size:9px; color:var(--sl2); line-height:1.4; text-align:center; }

/* footer */
.rp-ftr { background:var(--navy); padding:10px 28px; display:flex; justify-content:space-between; align-items:center; }
.rp-ftr span { font-size:10px; color:rgba(255,255,255,.38); }
.rp-ftr b { color:rgba(255,255,255,.68); font-weight:500; }

.rp-nodata { padding:16px 28px; font-size:12px; color:var(--sl2); font-style:italic; }

/* print */
@media print {
  .srv-left,.srv-topbar,.srv-acts,.flt-bar { display:none !important; }
  .srv-scroll { padding:0; background:#fff; }
  .rp { border:none; border-radius:0; max-width:100%; }
}
  `;
  document.head.appendChild(s);
};
injectStyles();

// ─── date utils ───────────────────────────────────────────────────
// Safe local-date parse — avoids timezone shift from ISO strings
const parseLocalDate = d => {
  if (!d) return null;
  const safe = String(d).slice(0, 10);           // "2003-08-14"
  const [y, m, day] = safe.split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
};

const fmtDate = d => {
  const dt = parseLocalDate(d);
  if (!dt) return "—";
  return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
};

// Human-readable age from DOB
const calcAge = d => {
  const dt = parseLocalDate(d);
  if (!dt) return null;
  const today = new Date();
  let age = today.getFullYear() - dt.getFullYear();
  const m = today.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dt.getDate())) age--;
  return age;
};

const fmtTime = t => t ? String(t).slice(0, 5) : "";
const fmtAmt  = n => Number(n) > 0 ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const dash    = v => (v !== null && v !== undefined && v !== "") ? v : "—";

const attColor     = p => p >= 75 ? "#22c55e" : p >= 50 ? "#f59e0b" : "#ef4444";
const attTextColor = p => p >= 75 ? "var(--gr)"  : p >= 50 ? "var(--am)"  : "var(--rd)";

const posPill = pos => {
  const p = (pos || "").toLowerCase();
  if (p.includes("gold") || p.includes("1st") || p.includes("champion")) return "p-gd";
  if (p.includes("silver") || p.includes("2nd")) return "p-sl";
  if (p.includes("bronze") || p.includes("3rd")) return "p-te";
  return "p-bl";
};

// Period label shown inside the report
const PERIOD_LABELS = {
  all:    "All Time",
  day:    "Today",
  week:   "This Week",
  month:  "This Month",
  year:   "This Year",
  custom: "Custom Period",
};

// ─── Section header ───────────────────────────────────────────────
function Sec({ num, title, count }) {
  return (
    <div className="rp-sec">
      <div className="rp-sbar"/>
      <span className="rp-snum">§ {num}</span>
      <span className="rp-stitle" dangerouslySetInnerHTML={{ __html: title }}/>
      {count != null && <span className="rp-scnt">{count}</span>}
    </div>
  );
}

function AttBar({ pct }) {
  const p = parseFloat(pct) || 0;
  return (
    <div className="ab">
      <div className="ab-track"><div className="ab-fill" style={{ width:`${Math.min(p,100)}%`, background:attColor(p) }}/></div>
      <span className="ab-pct" style={{ color:attTextColor(p) }}>{p.toFixed(1)}%</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  THE REPORT
// ═══════════════════════════════════════════════════════════════════
function FullReport({ data, filter, customFrom, customTo }) {
  const { student, summary, attendance, performance, events, achievements } = data;

  // per-program attendance
  const progAtt = {};
  attendance.forEach(r => {
    const k = r.program_title || "Unknown";
    if (!progAtt[k]) progAtt[k] = { present:0, absent:0 };
    r.present ? progAtt[k].present++ : progAtt[k].absent++;
  });

  // per-program performance
  const progPerf = {};
  performance.forEach(r => {
    const k = r.program_title || "Unknown";
    if (!progPerf[k]) progPerf[k] = { ratings:[], vals:[], unit:"" };
    if (r.rating)       progPerf[k].ratings.push(parseFloat(r.rating));
    if (r.metric_value) { progPerf[k].vals.push(parseFloat(r.metric_value)); progPerf[k].unit = r.metric_unit || ""; }
  });

  const today    = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const initials = (student.name || student.username || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const reportNo = `SCE/SPT/${new Date().getFullYear()}/${String(student.id).padStart(4,"0")}`;

  // Period display string for cover
  const periodLabel = filter === "custom" && customFrom && customTo
    ? `${fmtDate(customFrom)} — ${fmtDate(customTo)}`
    : PERIOD_LABELS[filter] || "All Time";

  // Range string shown in the range stamp
  const rangeStr = data.range
    ? `${fmtDate(data.range.start)} to ${fmtDate(data.range.end)}`
    : "—";

  // Age calculation
  const age = calcAge(student.dob);

  // Identity rows: [leftLabel, leftValue, rightLabel, rightValue]
  const idRows = [
    ["Full Name",     <strong style={{color:"var(--navy)"}}>{dash(student.name)}</strong>,
     "Roll Number",   <strong style={{color:"var(--navy)"}}>{dash(student.rollno)}</strong>],
    ["Reg. Number",   dash(student.reg_number),
     "Department",    dash(student.department)],
    ["Batch",         dash(student.batch),
     "Batch Year",    dash(student.batch_year)],
    ["Gender",        student.gender ? <span className="pill p-bl">{student.gender}</span> : "—",
     "Date of Birth", student.dob
       ? <span>{fmtDate(student.dob)}{age !== null ? <span style={{fontSize:10,color:"var(--sl2)",marginLeft:6}}>({age} yrs)</span> : null}</span>
       : "—"],
    ["Blood Group",   student.blood_group ? <span className="pill p-gd">{student.blood_group}</span> : "—",
     "Phone",         dash(student.phone)],
    ["Email",         <span style={{fontSize:11,wordBreak:"break-all"}}>{dash(student.email)}</span>,
     "Status",        <span className={`pill ${student.status==="active"?"p-gr":student.status==="passout"?"p-sl":"p-rd"}`}>{student.status||"active"}</span>],
  ];

  return (
    <div className="rp" id="rpt-root">

      {/* ══ COVER ══ */}
      <div className="rp-cov">
        <div className="rp-ctop">
          <div>
            <div className="rp-iname">Dr. Sivanthi Aditanar College of Engineering</div>
            <div className="rp-isub">Department of Physical Education &amp; Sports</div>
            <div className="rp-iaddr">Tiruchendur, Thoothukudi · Affiliated to Anna University, Chennai</div>
          </div>
          <div className="rp-dmeta">
            <div>Report No: <b>{reportNo}</b></div>
            <div>Generated: <b>{today}</b></div>
            <div>Period: <b>{periodLabel}</b></div>
            <div>Classification: <b>Official</b></div>
          </div>
        </div>
        <div className="rp-cbody">
          <div>
            <div className="rp-rtag">Official Academic Document</div>
            <div className="rp-rtitle">Comprehensive Student<br/>Sports History Report</div>
            <div className="rp-rsub">Events · Training · Attendance · Performance · Achievements</div>
            <div className="rp-period-badge">{periodLabel} &nbsp;·&nbsp; {rangeStr}</div>
          </div>
          <div className="rp-stamps">
            <div className="rp-stamp">
              <div className="rp-slbl">Batch Year</div>
              <div className="rp-sval">{student.batch_year || student.batch || "—"}</div>
            </div>
            <div className="rp-stamp">
              <div className="rp-slbl">Status</div>
              <div className="rp-sval">{(student.status||"active").toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="rp-gold"/>

      {/* ══ S1: IDENTITY ══ */}
      <Sec num="1" title="Student identity &amp; profile"/>
      <div className="rp-id-wrap">
        <div className="rp-id-avcol">
          <div className="rp-id-av">{initials}</div>
          <div className="rp-id-avlbl">Student</div>
        </div>
        <table className="rp-id-tbl">
          <tbody>
            {idRows.map(([l1,v1,l2,v2], i) => (
              <tr key={i}>
                <td className="lbl">{l1}</td>
                <td className="val">{v1}</td>
                <td className="lbl sep">{l2}</td>
                <td className="val">{v2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══ S2: KPI ══ */}
      <Sec num="2" title={`Overall performance summary — ${periodLabel}`} count={rangeStr}/>
      <div className="rp-kpi">
        {[
          [summary.total_sessions,              "Total Sessions", `${summary.attendance.present} present / ${summary.attendance.total}`, null],
          [`${summary.attendance.percentage}%`,  "Attendance",    `${summary.attendance.present} of ${summary.attendance.total}`, attTextColor(parseFloat(summary.attendance.percentage))],
          [summary.avg_rating ?? "—",            "Avg. Rating",   "out of 10", null],
          [summary.total_achievements,           "Achievements",  "approved records", null],
          [summary.total_events,                 "Events",        "registered", null],
        ].map(([val, lbl, sub, col], i) => (
          <div key={i} className="rp-kc">
            <div className="rp-kv" style={col?{color:col}:{}}>{val}</div>
            <div className="rp-kl">{lbl}</div>
            <div className="rp-ks">{sub}</div>
          </div>
        ))}
      </div>

      {/* ══ S3: EVENTS ══ */}
      <Sec num="3" title="Event registrations" count={`${events.length}`}/>
      {events.length === 0
        ? <div className="rp-nodata">No event registrations in this period.</div>
        : (
          <div className="rp-tw">
            <table className="rp-t" style={{tableLayout:"auto"}}>
              <thead><tr>
                <th style={{width:32}}>#</th><th>Event name</th>
                <th style={{width:80}}>Type</th>
                <th style={{width:105}}>Event date</th>
                <th style={{width:115}}>Registered on</th>
              </tr></thead>
              <tbody>
                {events.map((r,i) => (
                  <tr key={i}>
                    <td className="num">{String(i+1).padStart(2,"0")}</td>
                    <td style={{fontWeight:500}}>{r.title}</td>
                    <td><span className={`pill ${r.event_type==="external"?"p-pu":"p-bl"}`}>{r.event_type}</span></td>
                    <td style={{whiteSpace:"nowrap"}}>{fmtDate(r.date)}</td>
                    <td style={{fontSize:11,color:"var(--sl2)",whiteSpace:"nowrap"}}>{fmtDate(r.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rp-tftr">{events.length} event{events.length!==1?"s":""} total in this period</div>
          </div>
        )
      }

      {/* ══ S4: ATTENDANCE EVERY SESSION ══ */}
      <Sec num="4" title="Attendance history — every session" count={`${attendance.length} sessions`}/>
      {attendance.length === 0
        ? <div className="rp-nodata">No attendance records in this period.</div>
        : (
          <div className="rp-tw">
            <table className="rp-t" style={{tableLayout:"auto"}}>
              <thead><tr>
                <th style={{width:32}}>#</th>
                <th style={{width:100}}>Date</th>
                <th>Program</th>
                <th>Event</th>
                <th style={{width:90}}>Time</th>
                <th style={{width:75}}>Status</th>
                <th style={{width:130}}>Remarks</th>
              </tr></thead>
              <tbody>
                {attendance.map((r,i) => (
                  <tr key={i}>
                    <td className="num">{String(i+1).padStart(2,"0")}</td>
                    <td style={{fontWeight:500,whiteSpace:"nowrap"}}>{fmtDate(r.date)}</td>
                    <td>{r.program_title}</td>
                    <td style={{fontSize:11,color:"var(--sl2)"}}>{r.event_title}</td>
                    <td style={{fontSize:11,whiteSpace:"nowrap"}}>{fmtTime(r.start_time)}{r.end_time?`–${fmtTime(r.end_time)}`:""}</td>
                    <td><span className={`pill ${r.present?"p-gr":"p-rd"}`}>{r.present?"Present":"Absent"}</span></td>
                    <td style={{fontSize:11,color:"var(--sl2)"}}>{r.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rp-tftr">
              {summary.attendance.present} Present &nbsp;·&nbsp; {summary.attendance.absent} Absent &nbsp;·&nbsp; Overall {summary.attendance.percentage}%
            </div>
          </div>
        )
      }

      {/* ══ S5: ATTENDANCE SUMMARY ══ */}
      <Sec num="5" title="Attendance summary by program"/>
      {Object.keys(progAtt).length === 0
        ? <div className="rp-nodata">No attendance data in this period.</div>
        : (
          <div className="rp-tw">
            <table className="rp-t" style={{tableLayout:"auto"}}>
              <thead><tr>
                <th style={{width:32}}>#</th><th>Program</th>
                <th style={{width:60}}>Total</th><th style={{width:65}}>Present</th>
                <th style={{width:60}}>Absent</th><th style={{width:180}}>Attendance %</th>
              </tr></thead>
              <tbody>
                {Object.entries(progAtt).map(([prog,v],i) => {
                  const tot = v.present+v.absent;
                  const pct = tot?(v.present/tot)*100:0;
                  return (
                    <tr key={i}>
                      <td className="num">{String(i+1).padStart(2,"0")}</td>
                      <td style={{fontWeight:500}}>{prog}</td>
                      <td>{tot}</td><td>{v.present}</td><td>{v.absent}</td>
                      <td><AttBar pct={pct}/></td>
                    </tr>
                  );
                })}
                <tr className="sum">
                  <td/><td>Overall Total</td>
                  <td>{summary.attendance.total}</td>
                  <td>{summary.attendance.present}</td>
                  <td>{summary.attendance.absent}</td>
                  <td><AttBar pct={summary.attendance.percentage}/></td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      }

      {/* ══ S6: PERFORMANCE EVERY SESSION ══ */}
      <Sec num="6" title="Performance history — every session" count={`${performance.length} records`}/>
      {performance.length === 0
        ? <div className="rp-nodata">No performance records in this period.</div>
        : (
          <div className="rp-tw">
            <table className="rp-t" style={{tableLayout:"auto"}}>
              <thead><tr>
                <th style={{width:32}}>#</th>
                <th style={{width:100}}>Date</th>
                <th>Program</th><th>Event</th>
                <th style={{width:70}}>Rating</th>
                <th style={{width:65}}>Value</th>
                <th style={{width:50}}>Unit</th>
                <th>Notes</th>
              </tr></thead>
              <tbody>
                {performance.map((r,i) => (
                  <tr key={i}>
                    <td className="num">{String(i+1).padStart(2,"0")}</td>
                    <td style={{fontWeight:500,whiteSpace:"nowrap"}}>{fmtDate(r.date)}</td>
                    <td>{r.program_title}</td>
                    <td style={{fontSize:11,color:"var(--sl2)"}}>{r.event_title}</td>
                    <td>
                      {r.rating
                        ? <><span style={{fontWeight:600,color:"var(--navy)"}}>{r.rating}</span><span className="num">/10</span></>
                        : "—"}
                    </td>
                    <td>{r.metric_value ?? "—"}</td>
                    <td style={{fontSize:11,color:"var(--sl2)"}}>{r.metric_unit||"—"}</td>
                    <td style={{fontSize:11,color:"var(--sl2)"}}>{r.performance_text||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {summary.avg_rating && (
              <div className="rp-tftr">Overall avg. rating: <b style={{color:"var(--navy)"}}>{summary.avg_rating} / 10</b></div>
            )}
          </div>
        )
      }

      {/* ══ S7: PERFORMANCE SUMMARY ══ */}
      <Sec num="7" title="Performance summary by program"/>
      <div className="rp-tw">
        <table className="rp-t" style={{tableLayout:"auto"}}>
          <thead><tr>
            <th style={{width:32}}>#</th><th>Program</th>
            <th style={{width:70}}>Sessions</th>
            <th style={{width:95}}>Avg Rating</th>
            <th style={{width:85}}>Best Value</th>
            <th style={{width:85}}>Avg Value</th>
            <th style={{width:50}}>Unit</th>
          </tr></thead>
          <tbody>
            {Object.keys(progPerf).length === 0
              ? <tr><td colSpan={7} style={{padding:"14px",color:"var(--sl2)",fontStyle:"italic",fontSize:12}}>No performance data in this period.</td></tr>
              : Object.entries(progPerf).map(([prog,v],i) => {
                  const avgR = v.ratings.length ? (v.ratings.reduce((a,b)=>a+b,0)/v.ratings.length).toFixed(1) : null;
                  const best = v.vals.length ? Math.max(...v.vals).toFixed(2) : null;
                  const avgV = v.vals.length ? (v.vals.reduce((a,b)=>a+b,0)/v.vals.length).toFixed(2) : null;
                  return (
                    <tr key={i}>
                      <td className="num">{String(i+1).padStart(2,"0")}</td>
                      <td style={{fontWeight:500}}>{prog}</td>
                      <td>{Math.max(v.ratings.length,v.vals.length)||"—"}</td>
                      <td>{avgR?<><span style={{fontWeight:600,color:"var(--navy)"}}>{avgR}</span><span className="num">/10</span></>:"—"}</td>
                      <td>{best??"—"}</td><td>{avgV??"—"}</td>
                      <td style={{fontSize:11,color:"var(--sl2)"}}>{v.unit||"—"}</td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* ══ S8: ACHIEVEMENTS ══ */}
      <Sec num="8" title="Achievements &amp; honours" count={`${achievements.length}`}/>
      {achievements.length === 0
        ? <div className="rp-nodata">No achievement records in this period.</div>
        : (
          <>
            <div className="rp-tw">
              <table className="rp-t" style={{tableLayout:"auto"}}>
                <thead><tr>
                  <th style={{width:32}}>#</th>
                  <th style={{width:100}}>Date</th>
                  <th>Competition</th>
                  <th style={{width:85}}>Sport</th>
                  <th style={{width:85}}>Level</th>
                  <th style={{width:85}}>Position</th>
                  <th style={{width:70}}>Type</th>
                  <th style={{width:70}}>Prize</th>
                  <th style={{width:50}}>Cert.</th>
                </tr></thead>
                <tbody>
                  {achievements.map((r,i) => (
                    <tr key={i}>
                      <td className="num">{String(i+1).padStart(2,"0")}</td>
                      <td style={{fontWeight:500,whiteSpace:"nowrap"}}>{fmtDate(r.date)}</td>
                      <td style={{fontWeight:500}}>{r.eventname}</td>
                      <td style={{fontSize:11}}>{r.sport||"—"}</td>
                      <td><span className="pill p-pu">{r.level}</span></td>
                      <td><span className={`pill ${posPill(r.position)}`}>{r.position}</span></td>
                      <td><span className={`pill ${r.achievement_type==="team"?"p-te":"p-bl"}`}>{r.achievement_type||"individual"}</span></td>
                      <td style={{fontWeight:500,color:"var(--gr)",fontSize:12}}>{fmtAmt(r.cashprize)}</td>
                      <td><span className={`pill ${r.certificate?"p-gr":"p-sl"}`}>{r.certificate?"Yes":"No"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {achievements.some(a=>parseFloat(a.cashprize)>0) && (
                <div className="rp-tftr">
                  Total prize money: <b style={{color:"var(--gr)"}}>
                    ₹{achievements.reduce((s,a)=>s+(parseFloat(a.cashprize)||0),0).toLocaleString("en-IN")}
                  </b>
                </div>
              )}
            </div>
            {achievements.slice(0,4).length > 0 && (
              <div className="ach-grid">
                {achievements.slice(0,4).map((a,i) => (
                  <div key={i} className="ach-card">
                    <div className="ach-sport">{a.sport||"Sport"} · {a.level}</div>
                    <div className="ach-evt">{a.eventname}</div>
                    <div className="ach-tags">
                      <span className={`pill ${posPill(a.position)}`}>{a.position}</span>
                      <span className={`pill ${a.achievement_type==="team"?"p-te":"p-bl"}`}>{a.achievement_type||"individual"}</span>
                      {parseFloat(a.cashprize)>0 && <span className="pill p-gr">{fmtAmt(a.cashprize)}</span>}
                      <span className="pill p-sl">{fmtDate(a.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      }

      {/* DECLARATION */}
      <div className="rp-decl">
        This is to certify that the above is a true and accurate record of the sports activities of{" "}
        <b>{student.name||student.username}</b> (Roll No. <b>{student.rollno||"—"}</b>,
        Reg. No. <b>{student.reg_number||"—"}</b>), student of the Department of{" "}
        <b>{student.department||"—"}</b>, Batch {student.batch_year||student.batch||"—"},
        at Dr. Sivanthi Aditanar College of Engineering, for the period <b>{periodLabel}</b>.
        All data has been recorded by authorised staff and verified by the Department of
        Physical Education &amp; Sports. This document is confidential and intended for
        official academic and administrative purposes only.
      </div>

      {/* SIGNATURES */}
      <div className="rp-sigs">
        <div className="rp-sg">
          <div style={{height:34}}/><div className="rp-sgline"/>
          <div className="rp-sgname">Physical Education Director</div>
          <div className="rp-sgrole">Dr. Sivanthi Aditanar College of Engineering<br/>Seal &amp; Signature</div>
        </div>
        <div className="rp-sg">
          <div style={{height:34}}/><div className="rp-sgline"/>
          <div className="rp-sgname">Sports Staff In-charge</div>
          <div className="rp-sgrole">Department of Physical Education &amp; Sports<br/>Seal &amp; Signature</div>
        </div>
        <div className="rp-sg" style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{border:"1px solid var(--bd)",borderRadius:3,padding:10,textAlign:"center"}}>
            <div style={{fontSize:10,color:"var(--sl2)",marginBottom:6}}>Official stamp</div>
            <div className="rp-circle"><span>SCE<br/>Sports</span></div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="rp-ftr">
        <span>Report No: <b>{reportNo}</b> &nbsp;·&nbsp; Period: <b>{periodLabel}</b> &nbsp;·&nbsp; Generated: <b>{today}</b></span>
        <span>Dr. Sivanthi Aditanar College of Engineering &nbsp;·&nbsp; <b>Confidential</b></span>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  FILTER BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════
function FilterBar({ filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo, onApply, disabled }) {
  const FILTERS = [
    { id:"all",   label:"All Time" },
    { id:"day",   label:"Today" },
    { id:"week",  label:"This Week" },
    { id:"month", label:"This Month" },
    { id:"year",  label:"This Year" },
    { id:"custom",label:"Custom" },
  ];

  const handleFilter = id => {
    setFilter(id);
    if (id !== "custom") onApply(id, "", "");
  };

  return (
    <div className="flt-bar">
      <span className="flt-label">Period:</span>
      {FILTERS.map(f => (
        <button
          key={f.id}
          className={`flt-btn ${filter===f.id?"active":""}`}
          onClick={() => handleFilter(f.id)}
          disabled={disabled}
        >
          {f.label}
        </button>
      ))}
      {filter === "custom" && (
        <>
          <div className="flt-divider"/>
          <div className="flt-date-group">
            <span className="flt-date-lbl">From</span>
            <input type="date" className="flt-date-in" value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}/>
            <span className="flt-date-lbl">To</span>
            <input type="date" className="flt-date-in" value={customTo}
              onChange={e => setCustomTo(e.target.value)}/>
            <button className="flt-apply"
              onClick={() => onApply("custom", customFrom, customTo)}
              disabled={!customFrom || !customTo || disabled}>
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function StudentReportViewer({ token: tokenProp }) {
  const tk = () => tokenProp || getToken();

  const [students,   setStudents]   = useState([]);
  const [stuLoad,    setStuLoad]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [dept,       setDept]       = useState("all");
  const [dlLoad,     setDlLoad]     = useState(false);

  // filter state
  const [filter,     setFilter]     = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");

  const reportRef = useRef();

  // load all students
  useEffect(() => {
    (async () => {
      setStuLoad(true);
      try {
        const r = await fetch(`${API}/staff/students`, { headers:{ Authorization:"Bearer "+tk() } });
        const d = await r.json();
        setStudents(Array.isArray(d) ? d : []);
      } catch { setStudents([]); }
      finally { setStuLoad(false); }
    })();
  }, []);

  // fetch report for a student + filter
  const fetchReport = useCallback(async (stu, f, from, to) => {
    if (!stu) return;
    setReportData(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter: f });
      if (f === "custom" && from && to) { params.set("from", from); params.set("to", to); }
      const r = await fetch(`${API}/staff/students/${stu.id}/records?${params}`, {
        headers:{ Authorization:"Bearer "+tk() }
      });
      const d = await r.json();
      if (r.ok) setReportData(d);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // when student clicked — load with current filter
  const handleSelectStudent = (stu) => {
    setSelected(stu);
    fetchReport(stu, filter, customFrom, customTo);
  };

  // when filter changes — reload current student
  const handleApplyFilter = (f, from, to) => {
    setFilter(f);
    if (selected) fetchReport(selected, f, from, to);
  };

  // PDF download — pin to 860px for consistent layout
  const downloadPDF = async () => {
    if (!reportRef.current || !selected) return;
    setDlLoad(true);
    try {
      const el   = reportRef.current;
      const prev = { w: el.style.width, mw: el.style.maxWidth };
      el.style.width = "860px";
      el.style.maxWidth = "860px";

      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0, scrollY: -window.scrollY,
        windowWidth: 900, logging: false,
      });
      el.style.width    = prev.w;
      el.style.maxWidth = prev.mw;

      const pdf  = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const pW   = pdf.internal.pageSize.getWidth();
      const pH   = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pW) / canvas.width;
      const img  = canvas.toDataURL("image/png");
      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(img, "PNG", 0, -y, pW, imgH);
        y += pH;
      }
      const periodSlug = PERIOD_LABELS[filter]?.replace(/\s+/g,"_").toLowerCase() || filter;
      pdf.save(`${selected.rollno||selected.username}_${periodSlug}_report.pdf`);
    } catch {
      alert("PDF failed.\nRun: npm install jspdf html2canvas");
    } finally { setDlLoad(false); }
  };

  const depts    = [...new Set(students.map(s=>s.department).filter(Boolean))].sort();
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (dept==="all" || s.department===dept) &&
      (!search || s.name?.toLowerCase().includes(q) || s.rollno?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q));
  });
  const sc = { active:"p-gr", passout:"p-sl", suspended:"p-rd", transferred:"p-gd" };

  return (
    <div className="srv-root">

      {/* ── LEFT: student list ── */}
      <div className="srv-left">
        <div className="srv-lhdr">
          <div className="srv-ltitle">Student Reports</div>
          <div className="srv-lsub">Click any student → view full history</div>
          <div className="srv-sw">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="srv-si" placeholder="Name, roll no…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="srv-chips">
          <button className={`srv-chip ${dept==="all"?"on":""}`} onClick={()=>setDept("all")}>All</button>
          {depts.map(d=>(
            <button key={d} className={`srv-chip ${dept===d?"on":""}`} onClick={()=>setDept(d)}>{d}</button>
          ))}
        </div>
        <div className="srv-list">
          {stuLoad
            ? <div style={{display:"flex",justifyContent:"center",padding:28}}><div className="srv-spin"/></div>
            : filtered.length===0
              ? <div style={{textAlign:"center",padding:"28px 12px",color:"var(--sl2)",fontSize:12}}>No students found</div>
              : filtered.map(s => (
                  <div key={s.id} className={`srv-row ${selected?.id===s.id?"on":""}`} onClick={()=>handleSelectStudent(s)}>
                    <div className="srv-av">{(s.name||s.username||"?").charAt(0).toUpperCase()}</div>
                    <div style={{minWidth:0,flex:1}}>
                      <div className="srv-sn">{s.name||s.username}</div>
                      <div className="srv-sm">{[s.rollno,s.department].filter(Boolean).join(" · ")}</div>
                      <span className={`pill ${sc[s.status]||"p-sl"}`} style={{fontSize:10,marginTop:3,display:"inline-block"}}>{s.status||"active"}</span>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="srv-right">

        {/* topbar */}
        <div className="srv-topbar">
          <div className="srv-ttl">
            {selected ? `${selected.name||selected.username} — Sports History` : "Select a student"}
          </div>
          {selected && reportData && (
            <div className="srv-acts">
              <button className="srv-btn srv-bo" onClick={()=>window.print()}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print
              </button>
              <button className="srv-btn srv-bp" onClick={downloadPDF} disabled={dlLoad}>
                {dlLoad
                  ? <><div className="srv-spin" style={{width:13,height:13,borderWidth:2,borderTopColor:"#fff"}}/> Generating…</>
                  : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF</>
                }
              </button>
            </div>
          )}
        </div>

        {/* filter bar — always visible when a student is selected */}
        {selected && (
          <FilterBar
            filter={filter} setFilter={setFilter}
            customFrom={customFrom} setCustomFrom={setCustomFrom}
            customTo={customTo}   setCustomTo={setCustomTo}
            onApply={handleApplyFilter}
            disabled={loading}
          />
        )}

        {/* content */}
        <div className="srv-scroll">
          {!selected && (
            <div className="srv-empty">
              <div className="srv-empty-ic">📋</div>
              <div className="srv-empty-t">No student selected</div>
              <div style={{fontSize:13}}>Click any student on the left to view their complete sports history report</div>
            </div>
          )}
          {selected && loading && (
            <div className="srv-empty">
              <div className="srv-spin" style={{width:28,height:28,borderWidth:3}}/>
              <div style={{fontSize:13,color:"var(--sl2)"}}>
                Loading {PERIOD_LABELS[filter]||filter} history for {selected.name||selected.username}…
              </div>
            </div>
          )}
          {selected && !loading && !reportData && (
            <div className="srv-empty">
              <div className="srv-empty-ic">⚠️</div>
              <div className="srv-empty-t">Could not load report</div>
              <div style={{fontSize:13}}>Check backend connection or try again</div>
            </div>
          )}
          {selected && !loading && reportData && (
            <div ref={reportRef}>
              <FullReport
                data={reportData}
                filter={filter}
                customFrom={customFrom}
                customTo={customTo}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
