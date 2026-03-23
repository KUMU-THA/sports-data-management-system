import { useEffect, useState, useCallback } from "react";
import AchievementPage from "../components/AchievementPage";
import MyTraining from "../components/MyTraining";
import MyKits from "../components/Mykits";
/* ─── Inject Styles (same architecture as Director/Staff Dashboard) ──────────── */
const injectStyles = () => {
  if (document.getElementById("stu-dash-styles")) return;
  const s = document.createElement("style");
  s.id = "stu-dash-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --blue-900: #0c1f5e;
      --blue-800: #1a3488;
      --blue-700: #1e40af;
      --blue-600: #2563eb;
      --blue-500: #3b82f6;
      --blue-100: #dbeafe;
      --blue-50:  #eff6ff;
      --slate-900: #0f172a;
      --slate-700: #334155;
      --slate-500: #64748b;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50:  #f8fafc;
      --red-500:   #ef4444;
      --red-100:   #fee2e2;
      --green-600: #16a34a;
      --green-500: #22c55e;
      --green-100: #dcfce7;
      --amber-100: #fef3c7;
      --amber-700: #b45309;
      --sidebar-w: 68px;
      --topbar-h:  60px;
    }

    @keyframes stuFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes stuFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes stuRow     { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes stuSpin    { to{transform:rotate(360deg)} }
    @keyframes stuTipIn   { from{opacity:0;transform:translateY(-50%) translateX(-6px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }
    @keyframes stuCardIn  { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes stuPulse   { 0%,100%{opacity:1} 50%{opacity:.5} }

    .stu-root { display:flex; height:100dvh; background:#edf0f7; font-family:'Inter',sans-serif; overflow:hidden; }

    /* ══ SIDEBAR ══ */
    .stu-sb {
      width:var(--sidebar-w); flex-shrink:0;
      background:linear-gradient(175deg, var(--blue-900) 0%, var(--blue-800) 55%, var(--blue-700) 100%);
      display:flex; flex-direction:column; align-items:center;
      position:relative; z-index:100;
      box-shadow:4px 0 28px rgba(12,31,94,.4);
      transition:width .28s cubic-bezier(.4,0,.2,1);
      overflow:hidden;
    }
    .stu-sb.open { width:240px; }

    .stu-brand {
      width:100%; padding:16px 0 14px;
      display:flex; align-items:center; justify-content:center;
      border-bottom:1px solid rgba(255,255,255,.08);
      cursor:pointer; overflow:hidden; flex-shrink:0;
      transition:padding .28s;
    }
    .stu-sb.open .stu-brand { justify-content:flex-start; padding-left:16px; }
    .stu-brand-icon {
      width:38px; height:38px; flex-shrink:0; border-radius:10px;
      background:white; display:flex; align-items:center; justify-content:center;
      font-size:19px; box-shadow:0 3px 10px rgba(0,0,0,.3); min-width:38px;
      transition:transform .2s;
    }
    .stu-brand:hover .stu-brand-icon { transform:scale(1.06); }
    .stu-brand-text {
      overflow:hidden; max-width:0; opacity:0; margin-left:0; white-space:nowrap;
      transition:max-width .28s, opacity .22s, margin .28s;
    }
    .stu-sb.open .stu-brand-text { max-width:170px; opacity:1; margin-left:10px; }
    .stu-brand-name { font-family:'Sora',sans-serif; font-size:12.5px; font-weight:700; color:white; line-height:1.3; }
    .stu-brand-sub  { font-size:9.5px; color:rgba(255,255,255,.42); letter-spacing:1.1px; text-transform:uppercase; }

    .stu-sb-sec {
      width:100%; padding:10px 10px 4px;
      font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
      color:rgba(255,255,255,.3); overflow:hidden; white-space:nowrap;
      opacity:0; max-height:0;
      transition:opacity .2s, max-height .28s;
    }
    .stu-sb.open .stu-sb-sec { opacity:1; max-height:30px; }

    .stu-nav {
      flex:1; width:100%; padding:10px 0;
      display:flex; flex-direction:column; align-items:center;
      overflow-y:auto; overflow-x:hidden; gap:2px;
    }

    .stu-nav-item {
      position:relative; width:calc(100% - 14px); margin:0 7px;
      border:none; background:transparent; cursor:pointer;
      display:flex; align-items:center;
      height:44px; border-radius:11px;
      color:rgba(255,255,255,.5); transition:all .18s;
      padding:0 13px; gap:12px; overflow:hidden;
    }
    .stu-nav-item:hover { background:rgba(255,255,255,.10); color:white; }
    .stu-nav-item.active {
      background:rgba(255,255,255,.14); color:white;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);
    }
    .stu-nav-item.active::before {
      content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
      width:3px; height:22px; background:white; border-radius:0 3px 3px 0;
    }
    .stu-nav-item svg { flex-shrink:0; min-width:18px; }
    .stu-item-lbl {
      font-size:13px; font-weight:500; white-space:nowrap;
      overflow:hidden; max-width:0; opacity:0;
      transition:max-width .28s, opacity .22s;
    }
    .stu-sb.open .stu-item-lbl { max-width:170px; opacity:1; }
    .stu-tip {
      position:absolute; left:calc(var(--sidebar-w) + 6px); top:50%;
      transform:translateY(-50%) translateX(-6px);
      background:var(--slate-900); color:white; font-size:12px; font-weight:600;
      padding:5px 11px; border-radius:8px; white-space:nowrap; pointer-events:none;
      opacity:0; font-family:'Inter',sans-serif; z-index:200;
    }
    .stu-sb:not(.open) .stu-nav-item:hover .stu-tip { opacity:1; animation:stuTipIn .15s ease forwards; }
    .stu-sb.open .stu-tip { display:none; }

    .stu-divider { width:calc(100% - 24px); height:1px; background:rgba(255,255,255,.08); margin:6px 12px; flex-shrink:0; }

    .stu-sb-bottom {
      width:100%; padding:10px 7px;
      border-top:1px solid rgba(255,255,255,.08);
      display:flex; flex-direction:column; gap:6px; flex-shrink:0;
    }
    .stu-logout-btn {
      width:100%; height:44px; border-radius:11px; border:none;
      background:rgba(239,68,68,.12); color:#fca5a5;
      display:flex; align-items:center; justify-content:center; gap:11px;
      cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
      transition:all .18s; overflow:hidden; padding:0 13px;
    }
    .stu-logout-btn:hover { background:rgba(239,68,68,.25); color:#fecaca; }
    .stu-logout-btn svg { flex-shrink:0; min-width:18px; }
    .stu-logout-lbl {
      white-space:nowrap; overflow:hidden; max-width:0; opacity:0;
      transition:max-width .28s, opacity .22s;
    }
    .stu-sb.open .stu-logout-lbl { max-width:80px; opacity:1; }

    /* ══ MAIN ══ */
    .stu-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
    .stu-topbar {
      height:var(--topbar-h); background:white; border-bottom:1px solid var(--slate-100);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 22px; flex-shrink:0; box-shadow:0 1px 6px rgba(0,0,0,.04);
    }
    .stu-topbar-left { display:flex; align-items:center; gap:14px; }
    .stu-hamburger {
      width:34px; height:34px; border-radius:9px; border:none;
      background:var(--slate-100); cursor:pointer; display:flex;
      align-items:center; justify-content:center; color:var(--slate-700);
      transition:background .15s; flex-shrink:0;
    }
    .stu-hamburger:hover { background:var(--slate-200); }
    .stu-page-title { font-family:'Sora',sans-serif; font-weight:700; font-size:16px; color:var(--slate-900); }
    .stu-topbar-right { display:flex; align-items:center; gap:12px; }
    .stu-org { font-size:12px; color:var(--slate-500); white-space:nowrap; }
    .stu-avatar {
      width:34px; height:34px; border-radius:50%;
      background:linear-gradient(135deg,#059669,#047857);
      color:white; font-weight:700; font-size:13px;
      display:flex; align-items:center; justify-content:center;
      font-family:'Sora',sans-serif; box-shadow:0 2px 8px rgba(5,150,105,.3); flex-shrink:0;
    }

    /* ══ CONTENT ══ */
    .stu-content { flex:1; overflow-y:auto; padding:22px; }
    .stu-content::-webkit-scrollbar { width:5px; }
    .stu-content::-webkit-scrollbar-thumb { background:#c7d2e7; border-radius:5px; }

    /* ══ PAGE HEADER ══ */
    .pg-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:12px; animation:stuFadeUp .35s ease; }
    .pg-title { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:var(--slate-900); }
    .pg-sub   { font-size:13px; color:var(--slate-500); margin-top:3px; }

    /* ══ STAT CARDS ══ */
    .stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; margin-bottom:20px; }
    .stat-card {
      background:white; border-radius:14px; padding:15px 17px;
      border:1px solid var(--slate-100); animation:stuFadeUp .4s ease both;
      transition:transform .18s, box-shadow .18s;
    }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }
    .stat-val { font-family:'Sora',sans-serif; font-weight:800; font-size:26px; color:var(--blue-600); }
    .stat-lbl { font-size:12px; color:var(--slate-500); margin-top:2px; }

    /* ══ EVENT CARDS ══ */
    .events-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
      gap:16px;
    }

    .event-card {
      background:white; border-radius:16px;
      border:1px solid var(--slate-100);
      box-shadow:0 2px 14px rgba(0,0,0,.04);
      overflow:hidden;
      animation:stuCardIn .4s ease both;
      transition:transform .2s, box-shadow .2s;
      display:flex; flex-direction:column;
    }
    .event-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,0,0,.09); }

    .event-card-top {
      padding:18px 20px 14px;
      flex:1;
    }

    .event-card-type {
      display:inline-flex; align-items:center; gap:5px;
      padding:3px 10px; border-radius:20px;
      font-size:11px; font-weight:700; margin-bottom:10px;
    }
    .type-internal { background:var(--blue-100); color:#1d4ed8; }
    .type-external { background:var(--amber-100); color:var(--amber-700); }

    .event-card-title {
      font-family:'Sora',sans-serif; font-weight:700; font-size:15px;
      color:var(--slate-900); margin-bottom:8px; line-height:1.35;
    }

    .event-card-desc {
      font-size:13px; color:var(--slate-500); line-height:1.55;
      margin-bottom:12px;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
    }

    .event-card-meta {
      display:flex; gap:14px; flex-wrap:wrap;
    }

    .event-meta-item {
      display:flex; align-items:center; gap:5px;
      font-size:12px; color:var(--slate-500);
    }

    .event-meta-item svg { flex-shrink:0; }

    .event-card-footer {
      padding:12px 20px;
      border-top:1px solid var(--slate-100);
      background:#fafbfc;
      display:flex; align-items:center; justify-content:space-between; gap:10px;
    }

    .btn-register {
      display:inline-flex; align-items:center; gap:7px;
      padding:8px 18px; border-radius:9px; border:none;
      background:linear-gradient(135deg,var(--blue-600),var(--blue-700));
      color:white; font-size:13px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .18s;
      box-shadow:0 3px 10px rgba(37,99,235,.25);
    }
    .btn-register:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(37,99,235,.35); }

    .btn-registered {
      display:inline-flex; align-items:center; gap:7px;
      padding:8px 18px; border-radius:9px; border:none;
      background:var(--green-100); color:var(--green-600);
      font-size:13px; font-weight:700; cursor:default;
      font-family:'Inter',sans-serif;
    }

    .reg-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:3px 9px; border-radius:20px;
      background:var(--green-100); color:var(--green-600);
      font-size:11px; font-weight:700;
    }
    .reg-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:stuPulse 2s infinite; }

    /* ══ REGISTERED EVENTS LIST ══ */
    .tbl-card { background:white; border-radius:16px; border:1px solid var(--slate-100); overflow:hidden; box-shadow:0 2px 14px rgba(0,0,0,.04); animation:stuFadeUp .4s ease both; }
    .tbl-toolbar { padding:12px 16px; background:#fafbfc; border-bottom:1px solid var(--slate-100); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .srch-wrap { position:relative; flex:1; min-width:160px; }
    .srch-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--slate-500); pointer-events:none; }
    .srch-in {
      width:100%; padding:8px 12px 8px 34px; border-radius:9px;
      border:1.5px solid var(--slate-200); font-family:'Inter',sans-serif;
      font-size:13px; color:var(--slate-900); background:white;
      transition:border .2s, box-shadow .2s; outline:none;
    }
    .srch-in:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.11); }

    .g-tbl { width:100%; border-collapse:collapse; }
    .g-tbl th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--slate-500); background:var(--slate-50); border-bottom:1px solid var(--slate-100); white-space:nowrap; }
    .g-tbl td { padding:13px 16px; border-bottom:1px solid #f8fafc; font-size:13px; color:var(--slate-700); }
    .g-row { animation:stuRow .3s ease both; transition:background .12s; }
    .g-row:hover td { background:#f4f8ff; }
    .g-row:last-child td { border-bottom:none; }

    .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:11.5px; font-weight:600; }
    .badge-blue   { background:var(--blue-100); color:#1d4ed8; }
    .badge-green  { background:var(--green-100); color:#15803d; }
    .badge-yellow { background:var(--amber-100); color:var(--amber-700); }
    .bdot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }

    .tbl-footer { padding:10px 16px; background:#fafbfc; border-top:1px solid var(--slate-100); font-size:12px; color:var(--slate-500); }

    .spinner { width:18px; height:18px; border:2px solid rgba(37,99,235,.2); border-top-color:var(--blue-600); border-radius:50%; animation:stuSpin .7s linear infinite; }

    .empty-st { text-align:center; padding:48px 20px; }
    .empty-ic { font-size:44px; margin-bottom:12px; }
    .empty-title { font-weight:700; font-size:15px; color:#334155; margin-bottom:5px; }
    .empty-sub   { font-size:13px; color:#64748b; }

    /* mobile overlay */
    .stu-mob-veil { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99; animation:stuFadeIn .18s ease; }
    .stu-mob-veil.show { display:block; }

    /* ══ RESPONSIVE ══ */
    @media (max-width:900px) { .stu-org { display:none; } }
    @media (max-width:768px) {
      .stu-sb { position:fixed; top:0; left:0; height:100dvh; z-index:100; transform:translateX(-100%); transition:transform .28s cubic-bezier(.4,0,.2,1), width .28s; width:var(--sidebar-w) !important; }
      .stu-sb.open { transform:translateX(0); width:240px !important; }
      .stu-content { padding:14px; }
      .events-grid { grid-template-columns:1fr; }
    }
    @media (max-width:500px) {
      .stat-row { grid-template-columns:1fr 1fr; }
      .pg-hdr { flex-direction:column; }
    }
  `;
  document.head.appendChild(s);
};
injectStyles();

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const Ic = {
  Menu:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Events:  () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01"/></svg>,
  MyEvents:() => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Trophy:  () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  Logout:  () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Calendar:() => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Tag:     () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Check:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
  Training: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01"/></svg>,
  Shirt: () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
  </svg>
),
  Search:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

/* ─── NAV CONFIG ─────────────────────────────────────────────────────────────── */
const NAV = [
  { id:"events",     label:"Available Events",  Icon:Ic.Events,   group:"Events"  },
  { id:"registered", label:"My Registrations",  Icon:Ic.MyEvents, group:"Events"  },
  { id:"training", label:"My Training", Icon:Ic.Training, group:"Events" },
  { id:"kits", label:"Kit Management", Icon:Ic.Shirt, group:"Operations" },
  { id:"achievement",label:"Achievements",       Icon:Ic.Trophy,   group:"Records" },
];

/* ═══════════════════════════════════════════════════════════════
   AVAILABLE EVENTS PAGE
═══════════════════════════════════════════════════════════════ */
function AvailableEvents({ token, events, registeredEvents, onRegister, loading }) {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = events
    .filter(e => e.title?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase()))
    .filter(e => typeFilter === "all" ? true : e.event_type === typeFilter);

  const totalReg = registeredEvents.length;
  //const upcoming = events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length;

  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : null;

  return (
    <div>
      <div className="pg-hdr">
        <div>
          <div className="pg-title">Available Events</div>
          <div className="pg-sub">Browse and register for sports events</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        {[
          { val:events.length, lbl:"Total Events",       delay:"0s"   },
         // { val:upcoming,      lbl:"Upcoming",           delay:".07s" },
          { val:totalReg,      lbl:"My Registrations",   delay:".14s" },
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:s.delay }}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="tbl-card" style={{ marginBottom:18 }}>
        <div className="tbl-toolbar">
          <div className="srch-wrap">
            <Ic.Search />
            <input className="srch-in" placeholder="Search events…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select
            style={{ padding:"8px 11px", borderRadius:"9px", border:"1.5px solid var(--slate-200)", fontFamily:"Inter,sans-serif", fontSize:"13px", color:"var(--slate-700)", background:"white", cursor:"pointer", outline:"none", minWidth:120 }}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="internal">🏫 Internal</option>
            <option value="external">🌐 External</option>
          </select>
          {(search || typeFilter !== "all") && (
            <button
              style={{ padding:"8px 13px", borderRadius:"9px", border:"1.5px solid var(--slate-200)", background:"white", fontSize:"12px", fontWeight:600, color:"var(--slate-500)", cursor:"pointer" }}
              onClick={() => { setSearch(""); setTypeFilter("all"); }}
            >✕ Clear</button>
          )}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:60 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="tbl-card">
          <div className="empty-st">
            <div className="empty-ic">📅</div>
            <div className="empty-title">No events found</div>
          </div>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map((evt, i) => {
            const alreadyRegistered = registeredEvents.some(e => e.id === evt.id);
            return (
              <div key={evt.id} className="event-card" style={{ animationDelay:`${i*.06}s` }}>
                <div className="event-card-top">
                  <span className={`event-card-type ${evt.event_type === "internal" ? "type-internal" : "type-external"}`}>
                    {evt.event_type === "internal" ? "🏫 Internal" : "🌐 External"}
                  </span>
                  <div className="event-card-title">{evt.title}</div>
                  {evt.description && <div className="event-card-desc">{evt.description}</div>}
                  <div className="event-card-meta">
                    {evt.event_date && (
                      <div className="event-meta-item">
                        <Ic.Calendar />
                        {fmt(evt.event_date)}
                      </div>
                    )}
                    {evt.last_registration_date && (
                      <div className="event-meta-item">
                        <Ic.Tag />
                        Reg. by {fmt(evt.last_registration_date)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="event-card-footer">
                  {alreadyRegistered ? (
                    <>
                      <span className="reg-badge"><span className="reg-dot"/>Registered</span>
                      <button className="btn-registered" disabled>
                        <Ic.Check /> Enrolled
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize:12, color:"var(--slate-500)" }}>Open for registration</span>
                      <button className="btn-register" onClick={() => onRegister(evt.id)}>
                        Register →
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MY REGISTRATIONS PAGE
═══════════════════════════════════════════════════════════════ */
function MyRegistrations({ registeredEvents, loading }) {
  const [search, setSearch] = useState("");

  const filtered = registeredEvents.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  return (
    <div>
      <div className="pg-hdr">
        <div>
          <div className="pg-title">My Registrations</div>
          <div className="pg-sub">Events you have registered for</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-val">{registeredEvents.length}</div>
          <div className="stat-lbl">Registered Events</div>
        </div>
        <div className="stat-card" style={{ animationDelay:".07s" }}>
          <div className="stat-val">{registeredEvents.filter(e=>e.event_type==="internal").length}</div>
          <div className="stat-lbl">Internal</div>
        </div>
        <div className="stat-card" style={{ animationDelay:".14s" }}>
          <div className="stat-val">{registeredEvents.filter(e=>e.event_type==="external").length}</div>
          <div className="stat-lbl">External</div>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-toolbar">
          <div className="srch-wrap">
            <Ic.Search />
            <input className="srch-in" placeholder="Search my events…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:48 }}><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-st">
            <div className="empty-ic">🗓️</div>
            <div className="empty-title">{search ? "No results found" : "No registrations yet"}</div>
            <div className="empty-sub">{search ? "Try a different search" : "Browse Available Events and register to get started"}</div>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="g-tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Event Date</th>
                  <th>Registered On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((evt, i) => (
                  <tr key={evt.id} className="g-row" style={{ animationDelay:`${i*.04}s` }}>
                    <td style={{ color:"#94a3b8", width:36 }}>{i+1}</td>
                    <td style={{ fontWeight:600, color:"var(--slate-900)", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {evt.title}
                    </td>
                    <td>
                      <span className={`badge ${evt.event_type==="internal"?"badge-blue":"badge-yellow"}`}>
                        {evt.event_type==="internal"?"🏫 Internal":"🌐 External"}
                      </span>
                    </td>
                    <td style={{ fontSize:13, color:"#475569" }}>{fmt(evt.event_date)}</td>
                    <td style={{ fontSize:12, color:"#64748b" }}>{fmt(evt.registered_on)}</td>
                    <td><span className="badge badge-green"><span className="bdot"/>Registered</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="tbl-footer">
          Showing <strong>{filtered.length}</strong> of <strong>{registeredEvents.length}</strong> registrations
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const token = localStorage.getItem("token");

  const [page,             setPage]             = useState("events");
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [events,           setEvents]           = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading,          setLoading]          = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res  = await fetch("http://127.0.0.1:5000/student/events", { headers:{ Authorization:"Bearer "+token } });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch { setEvents([]); }
  }, [token]);

  const fetchMyEvents = useCallback(async () => {
    try {
      const res  = await fetch("http://127.0.0.1:5000/student/my-events", { headers:{ Authorization:"Bearer "+token } });
      const data = await res.json();
      setRegisteredEvents(Array.isArray(data) ? data : []);
    } catch { setRegisteredEvents([]); }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchMyEvents()]).finally(() => setLoading(false));
  }, [fetchEvents, fetchMyEvents]);

  const registerEvent = async (eventId) => {
    try {
      const res  = await fetch(`http://127.0.0.1:5000/student/register/${eventId}`, {
        method:"POST", headers:{ Authorization:"Bearer "+token }
      });
      const data = await res.json();
      alert(data.message);
      fetchMyEvents();
    } catch { alert("Registration failed. Try again."); }
  };

  const logout    = () => { localStorage.removeItem("token"); window.location.href = "/"; };
  const isMobile  = () => window.innerWidth < 768;
  const handleNav = id => { setPage(id); if (isMobile()) setSidebarOpen(false); };
  const currentLabel = NAV.find(n=>n.id===page)?.label || "Dashboard";

  return (
    <div className="stu-root">
      {/* Mobile overlay */}
      <div className={`stu-mob-veil ${sidebarOpen&&isMobile()?"show":""}`} onClick={()=>setSidebarOpen(false)} />

      {/* ══ SIDEBAR ══ */}
      <aside className={`stu-sb ${sidebarOpen?"open":""}`}>

        {/* Brand */}
        <div className="stu-brand" onClick={()=>setSidebarOpen(o=>!o)} title="Toggle sidebar">
          <div className="stu-brand-icon">🎓</div>
          <div className="stu-brand-text">
            <div className="stu-brand-name">Student Portal</div>
            <div className="stu-brand-sub">Sports Dept.</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="stu-nav">
          {NAV.map(({ id, label, Icon, group }, idx) => {
            const prevGroup = idx > 0 ? NAV[idx-1].group : null;
            return (
              <div key={id} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
                {group !== prevGroup && (
                  <>
                    {idx > 0 && <div className="stu-divider" />}
                    <div className="stu-sb-sec">{group}</div>
                  </>
                )}
                <button
                  className={`stu-nav-item ${page===id?"active":""}`}
                  onClick={() => handleNav(id)}
                  title={label}
                >
                  <Icon />
                  <span className="stu-item-lbl">{label}</span>
                  <span className="stu-tip">{label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="stu-sb-bottom">
          <button className="stu-logout-btn" onClick={logout} title="Logout">
            <Ic.Logout />
            <span className="stu-logout-lbl">Logout</span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="stu-main">
        {/* Topbar */}
        <header className="stu-topbar">
          <div className="stu-topbar-left">
            <button className="stu-hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label="Toggle menu">
              <Ic.Menu />
            </button>
            <span className="stu-page-title">{currentLabel}</span>
          </div>
          <div className="stu-topbar-right">
            <span className="stu-org">Dr. Sivanthi Aditanar College of Engineering</span>
            <div className="stu-avatar" title="Student">S</div>
          </div>
        </header>

        {/* Content */}
        <main className="stu-content">
          {page === "events" && (
            <AvailableEvents
              token={token}
              events={events}
              registeredEvents={registeredEvents}
              onRegister={registerEvent}
              loading={loading}
            />
          )}
          {page === "registered" && (
            <MyRegistrations
              registeredEvents={registeredEvents}
              loading={loading}
            />
          )}
          {page === "training" && <MyTraining token={token} />}
          {page === "kits" && <MyKits token={token} />}
          {page === "achievement" && <AchievementPage />}
          
        </main>
      </div>
    </div>
  );
}
