// src/pages/StaffDashboard.jsx  — complete professional rewrite
import { useEffect, useState, useCallback, useRef } from "react";
import AchievementPage       from "../components/AchievementPage";
import AttendanceManagement  from "../components/AttendanceManagement";
import TrainingManagement    from "../components/TrainingManagement";
import PerformanceManagement from "../components/PerformanceManagement";
import SelectionReport       from "../components/SelectionReport";
import KitManagement    from "../components/KitManagement";
import StudentRecords  from "../components/Studentrecords";
const API = "http://127.0.0.1:5000";

// ─── Get token — always read fresh from localStorage ────────────
// IMPORTANT: Never cache token in a variable at module load time.
// After role-switch the token is replaced; always call getToken() fresh.
const getToken = () => localStorage.getItem("token") || "";

// ─── Inject global styles ────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("staff-dash-styles")) return;
  const s = document.createElement("style");
  s.id = "staff-dash-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --blue-900:#0c1f5e; --blue-800:#1a3488; --blue-700:#1e40af;
      --blue-600:#2563eb; --blue-500:#3b82f6; --blue-100:#dbeafe; --blue-50:#eff6ff;
      --slate-900:#0f172a; --slate-700:#334155; --slate-500:#64748b;
      --slate-200:#e2e8f0; --slate-100:#f1f5f9; --slate-50:#f8fafc;
      --red-500:#ef4444; --red-100:#fee2e2;
      --green-600:#16a34a; --green-500:#22c55e; --green-100:#dcfce7;
      --amber-100:#fef3c7; --amber-700:#b45309;
      --purple-100:#f5f3ff; --purple-700:#7c3aed;
      --sidebar-w:68px; --topbar-h:60px;
    }
    @keyframes stfFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes stfFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes stfScaleIn { from{opacity:0;transform:scale(.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes stfRow     { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes stfSpin    { to{transform:rotate(360deg)} }
    @keyframes stfTipIn   { from{opacity:0;transform:translateY(-50%) translateX(-6px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }
    @keyframes stfSlideIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }

    .stf-root { display:flex; height:100dvh; background:#edf0f7; font-family:'Inter',sans-serif; overflow:hidden; }

    /* ── SIDEBAR ── */
    .stf-sb {
      width:var(--sidebar-w); flex-shrink:0;
      background:linear-gradient(175deg,var(--blue-900) 0%,var(--blue-800) 55%,var(--blue-700) 100%);
      display:flex; flex-direction:column; align-items:center;
      position:relative; z-index:100;
      box-shadow:4px 0 28px rgba(12,31,94,.4);
      transition:width .28s cubic-bezier(.4,0,.2,1); overflow:hidden;
    }
    .stf-sb.open { width:248px; }
    .stf-brand {
      width:100%; padding:16px 0 14px;
      display:flex; align-items:center; justify-content:center;
      border-bottom:1px solid rgba(255,255,255,.08);
      cursor:pointer; overflow:hidden; flex-shrink:0; transition:padding .28s;
    }
    .stf-sb.open .stf-brand { justify-content:flex-start; padding-left:16px; }
    .stf-brand-icon {
      width:38px; height:38px; flex-shrink:0; border-radius:10px;
      background:white; display:flex; align-items:center; justify-content:center;
      font-size:19px; box-shadow:0 3px 10px rgba(0,0,0,.3); min-width:38px; transition:transform .2s;
    }
    .stf-brand:hover .stf-brand-icon { transform:scale(1.06); }
    .stf-brand-text { overflow:hidden; max-width:0; opacity:0; margin-left:0; white-space:nowrap; transition:max-width .28s,opacity .22s,margin .28s; }
    .stf-sb.open .stf-brand-text { max-width:180px; opacity:1; margin-left:10px; }
    .stf-brand-name { font-family:'Sora',sans-serif; font-size:12.5px; font-weight:700; color:white; line-height:1.3; }
    .stf-brand-sub  { font-size:9.5px; color:rgba(255,255,255,.42); letter-spacing:1.1px; text-transform:uppercase; }
    .stf-sb-sec { width:100%; padding:10px 10px 4px; font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,.3); overflow:hidden; white-space:nowrap; opacity:0; max-height:0; transition:opacity .2s,max-height .28s; }
    .stf-sb.open .stf-sb-sec { opacity:1; max-height:30px; }
    .stf-nav { flex:1; width:100%; padding:10px 0; display:flex; flex-direction:column; align-items:center; overflow-y:auto; overflow-x:hidden; gap:2px; }
    .stf-nav::-webkit-scrollbar { width:3px; }
    .stf-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:3px; }
    .stf-nav-item {
      position:relative; width:calc(100% - 14px); margin:0 7px;
      border:none; background:transparent; cursor:pointer;
      display:flex; align-items:center;
      height:44px; border-radius:11px;
      color:rgba(255,255,255,.5); transition:all .18s;
      padding:0 13px; gap:12px; overflow:hidden;
    }
    .stf-nav-item:hover { background:rgba(255,255,255,.10); color:white; }
    .stf-nav-item.active { background:rgba(255,255,255,.14); color:white; box-shadow:inset 0 0 0 1px rgba(255,255,255,.12); }
    .stf-nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:22px; background:white; border-radius:0 3px 3px 0; }
    .stf-nav-item svg { flex-shrink:0; min-width:18px; }
    .stf-item-lbl { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; max-width:0; opacity:0; transition:max-width .28s,opacity .22s; }
    .stf-sb.open .stf-item-lbl { max-width:180px; opacity:1; }
    .stf-tip { position:absolute; left:calc(var(--sidebar-w) + 6px); top:50%; transform:translateY(-50%) translateX(-6px); background:var(--slate-900); color:white; font-size:12px; font-weight:600; padding:5px 11px; border-radius:8px; white-space:nowrap; pointer-events:none; opacity:0; font-family:'Inter',sans-serif; z-index:200; }
    .stf-sb:not(.open) .stf-nav-item:hover .stf-tip { opacity:1; animation:stfTipIn .15s ease forwards; }
    .stf-sb.open .stf-tip { display:none; }
    .stf-divider { width:calc(100% - 24px); height:1px; background:rgba(255,255,255,.08); margin:6px 12px; flex-shrink:0; }
    .stf-sb-bottom { width:100%; padding:10px 7px; border-top:1px solid rgba(255,255,255,.08); display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
    .stf-logout-btn { width:100%; height:44px; border-radius:11px; border:none; background:rgba(239,68,68,.12); color:#fca5a5; display:flex; align-items:center; justify-content:center; gap:11px; cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:500; transition:all .18s; overflow:hidden; padding:0 13px; }
    .stf-logout-btn:hover { background:rgba(239,68,68,.25); color:#fecaca; }
    .stf-logout-btn svg { flex-shrink:0; min-width:18px; }
    .stf-logout-lbl { white-space:nowrap; overflow:hidden; max-width:0; opacity:0; transition:max-width .28s,opacity .22s; }
    .stf-sb.open .stf-logout-lbl { max-width:80px; opacity:1; }

    /* ── ROLE SWITCHER ── */
    .sb-role-btn { width:100%; height:44px; border-radius:11px; border:none; background:rgba(255,255,255,.09); color:rgba(255,255,255,.75); display:flex; align-items:center; justify-content:center; gap:11px; cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:500; transition:all .18s; overflow:hidden; padding:0 13px; }
    .sb-role-btn:hover { background:rgba(255,255,255,.17); color:white; }
    .sb-role-btn svg { flex-shrink:0; min-width:18px; }
    .sb-role-lbl { white-space:nowrap; overflow:hidden; max-width:0; opacity:0; transition:max-width .28s,opacity .22s; }
    .stf-sb.open .sb-role-lbl { max-width:120px; opacity:1; }
    .role-dd-wrap { position:relative; width:100%; }
    .role-dd { position:absolute; bottom:calc(100% + 8px); left:0; background:white; border-radius:14px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.25),0 4px 16px rgba(0,0,0,.1); animation:stfScaleIn .18s ease; transform-origin:bottom left; min-width:190px; z-index:300; }
    .stf-sb:not(.open) .role-dd { left:calc(var(--sidebar-w) + 8px); bottom:0; }
    .role-dd-hd { padding:12px 14px 9px; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--slate-500); border-bottom:1px solid var(--slate-100); }
    .role-opt { display:flex; align-items:center; gap:11px; padding:10px 14px; cursor:pointer; transition:background .12s; font-size:13px; font-weight:500; color:var(--slate-700); border:none; background:transparent; width:100%; font-family:'Inter',sans-serif; }
    .role-opt:hover { background:var(--blue-50); color:var(--blue-700); }
    .role-opt.curr  { background:var(--blue-50); color:var(--blue-700); font-weight:600; }
    .role-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .role-check { margin-left:auto; color:var(--blue-600); }

    /* ── TOPBAR / MAIN ── */
    .stf-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
    .stf-topbar { height:var(--topbar-h); background:white; border-bottom:1px solid var(--slate-100); display:flex; align-items:center; justify-content:space-between; padding:0 22px; flex-shrink:0; box-shadow:0 1px 6px rgba(0,0,0,.04); }
    .stf-topbar-left { display:flex; align-items:center; gap:14px; }
    .stf-hamburger { width:34px; height:34px; border-radius:9px; border:none; background:var(--slate-100); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--slate-700); transition:background .15s; flex-shrink:0; }
    .stf-hamburger:hover { background:var(--slate-200); }
    .stf-page-title { font-family:'Sora',sans-serif; font-weight:700; font-size:16px; color:var(--slate-900); }
    .stf-topbar-right { display:flex; align-items:center; gap:12px; }
    .stf-org { font-size:12px; color:var(--slate-500); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:320px; }
    .stf-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#2563eb,#1e40af); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; box-shadow:0 2px 8px rgba(37,99,235,.3); flex-shrink:0; }

    /* ── CONTENT ── */
    .stf-content { flex:1; overflow-y:auto; padding:22px; }
    .stf-content::-webkit-scrollbar { width:5px; }
    .stf-content::-webkit-scrollbar-thumb { background:#c7d2e7; border-radius:5px; }

    /* ── PAGE HEADER ── */
    .pg-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:12px; animation:stfFadeUp .35s ease; }
    .pg-title { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:var(--slate-900); }
    .pg-sub   { font-size:13px; color:var(--slate-500); margin-top:3px; }

    /* ── STAT CARDS ── */
    .stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; margin-bottom:18px; }
    .stat-card { background:white; border-radius:14px; padding:15px 17px; border:1px solid var(--slate-100); animation:stfFadeUp .4s ease both; transition:transform .18s,box-shadow .18s; }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }
    .stat-val { font-family:'Sora',sans-serif; font-weight:800; font-size:26px; color:var(--blue-600); }
    .stat-lbl { font-size:12px; color:var(--slate-500); margin-top:2px; }

    /* ── TABLE CARD ── */
    .tbl-card { background:white; border-radius:16px; border:1px solid var(--slate-100); overflow:hidden; box-shadow:0 2px 14px rgba(0,0,0,.04); animation:stfFadeUp .45s ease both; }
    .tbl-toolbar { padding:12px 16px; background:#fafbfc; border-bottom:1px solid var(--slate-100); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .srch-wrap { position:relative; flex:1; min-width:160px; }
    .srch-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--slate-500); pointer-events:none; }
    .srch-in { width:100%; padding:8px 12px 8px 34px; border-radius:9px; border:1.5px solid var(--slate-200); font-family:'Inter',sans-serif; font-size:13px; color:var(--slate-900); background:white; transition:border .2s,box-shadow .2s; outline:none; }
    .srch-in:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.11); }
    .fil-sel { padding:8px 11px; border-radius:9px; border:1.5px solid var(--slate-200); font-family:'Inter',sans-serif; font-size:13px; color:var(--slate-700); background:white; cursor:pointer; outline:none; transition:border .2s; min-width:120px; }
    .fil-sel:focus { border-color:var(--blue-500); }
    .clr-btn { padding:8px 13px; border-radius:9px; border:1.5px solid var(--slate-200); background:white; font-size:12px; font-weight:600; color:var(--slate-500); cursor:pointer; font-family:'Inter',sans-serif; white-space:nowrap; transition:all .15s; }
    .clr-btn:hover { border-color:#cbd5e1; color:var(--slate-700); }

    /* ── BUTTONS ── */
    .btn-primary { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:10px; border:none; background:linear-gradient(135deg,var(--blue-600),var(--blue-700)); color:white; font-size:13px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .18s; box-shadow:0 4px 12px rgba(37,99,235,.28); white-space:nowrap; flex-shrink:0; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(37,99,235,.38); }
    .btn-primary:active { transform:translateY(0); }
    .btn-primary:disabled { opacity:.65; cursor:not-allowed; transform:none; }
    .btn-cancel { padding:9px 18px; border-radius:10px; border:1.5px solid var(--slate-200); background:white; font-size:13px; font-weight:600; color:#475569; cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s; }
    .btn-cancel:hover { background:var(--slate-50); }
    .btn-edit-sm    { display:inline-flex; align-items:center; gap:5px; padding:6px 11px; border-radius:8px; border:none; background:var(--blue-50); color:#1d4ed8; font-size:12px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s; }
    .btn-edit-sm:hover    { background:var(--blue-600); color:white; }
    .btn-del-sm     { display:inline-flex; align-items:center; gap:5px; padding:6px 11px; border-radius:8px; border:none; background:var(--red-100); color:var(--red-500); font-size:12px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s; }
    .btn-del-sm:hover     { background:var(--red-500); color:white; }
    .btn-action-sm  { display:inline-flex; align-items:center; gap:5px; padding:6px 11px; border-radius:8px; border:none; background:var(--green-100); color:var(--green-600); font-size:12px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s; }
    .btn-action-sm:hover  { background:var(--green-600); color:white; }
    .btn-view-sm    { display:inline-flex; align-items:center; gap:5px; padding:6px 11px; border-radius:8px; border:none; background:var(--purple-100); color:var(--purple-700); font-size:12px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s; }
    .btn-view-sm:hover    { background:var(--purple-700); color:white; }

    /* ── TABLE ── */
    .g-tbl { width:100%; border-collapse:collapse; }
    .g-tbl th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--slate-500); background:var(--slate-50); border-bottom:1px solid var(--slate-100); white-space:nowrap; }
    .g-tbl td { padding:12px 16px; border-bottom:1px solid #f8fafc; font-size:13px; color:var(--slate-700); }
    .g-row { animation:stfRow .3s ease both; transition:background .12s; }
    .g-row:hover td { background:#f4f8ff; }
    .g-row:last-child td { border-bottom:none; }
    .av-cell { display:flex; align-items:center; gap:10px; }
    .av-ring { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--blue-600),var(--blue-500)); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; flex-shrink:0; }
    .av-name { font-weight:600; color:var(--slate-900); font-size:13px; }
    .av-sub  { font-size:11px; color:var(--slate-500); }
    .act-grp { display:flex; gap:5px; flex-wrap:wrap; }
    .tbl-footer { padding:10px 16px; background:#fafbfc; border-top:1px solid var(--slate-100); font-size:12px; color:var(--slate-500); }

    /* ── BADGES ── */
    .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:11.5px; font-weight:600; white-space:nowrap; }
    .badge-blue   { background:var(--blue-100);   color:#1d4ed8; }
    .badge-green  { background:var(--green-100);  color:#15803d; }
    .badge-yellow { background:var(--amber-100);  color:var(--amber-700); }
    .badge-purple { background:var(--purple-100); color:var(--purple-700); }
    .badge-red    { background:var(--red-100);    color:var(--red-500); }
    .badge-gray   { background:var(--slate-100);  color:var(--slate-700); }
    .bdot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }

    /* ── MODAL ── */
    .mod-overlay { position:fixed; inset:0; background:rgba(15,23,42,.55); backdrop-filter:blur(6px); z-index:400; display:flex; align-items:center; justify-content:center; animation:stfFadeIn .18s ease; padding:16px; }
    .mod-box { background:white; border-radius:20px; padding:26px; width:100%; max-width:600px; animation:stfScaleIn .22s cubic-bezier(.34,1.56,.64,1); box-shadow:0 28px 70px rgba(0,0,0,.22); max-height:90dvh; overflow-y:auto; }
    .mod-hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px; }
    .mod-title { font-family:'Sora',sans-serif; font-weight:700; font-size:18px; color:var(--slate-900); }
    .mod-sub   { font-size:12.5px; color:var(--slate-500); margin-top:3px; }
    .mod-close { width:30px; height:30px; border-radius:8px; border:none; background:var(--slate-100); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#475569; transition:background .13s; flex-shrink:0; }
    .mod-close:hover { background:var(--slate-200); }
    .mod-grid  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .mod-field { display:flex; flex-direction:column; gap:5px; }
    .mod-field.full { grid-column:1 / -1; }
    .mod-field label { font-size:11px; font-weight:700; color:#475569; letter-spacing:.4px; text-transform:uppercase; }
    .mod-field input,.mod-field textarea,.mod-field select { padding:10px 13px; border-radius:9px; border:1.5px solid var(--slate-200); font-family:'Inter',sans-serif; font-size:13.5px; color:var(--slate-900); background:var(--slate-50); transition:all .18s; outline:none; resize:none; width:100%; }
    .mod-field input:focus,.mod-field textarea:focus,.mod-field select:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.11); background:white; }
    .mod-acts { display:flex; gap:10px; justify-content:flex-end; margin-top:22px; flex-wrap:wrap; }

    /* ── PROFILE PANEL ── */
    .profile-panel { position:fixed; right:0; top:0; height:100dvh; width:min(420px,100vw); background:white; z-index:500; box-shadow:-20px 0 60px rgba(0,0,0,.15); animation:stfSlideIn .28s ease; display:flex; flex-direction:column; }
    .profile-panel-hd { padding:22px 22px 16px; border-bottom:1px solid var(--slate-100); display:flex; align-items:center; gap:14px; }
    .profile-panel-av { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,var(--blue-600),var(--blue-800)); color:white; font-weight:800; font-size:22px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; flex-shrink:0; box-shadow:0 4px 16px rgba(37,99,235,.3); }
    .profile-panel-body { flex:1; overflow-y:auto; padding:18px 22px; }
    .profile-panel-body::-webkit-scrollbar { width:4px; }
    .profile-panel-body::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
    .profile-section { margin-bottom:20px; }
    .profile-section-title { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--slate-500); margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid var(--slate-100); }
    .profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .profile-item label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; color:var(--slate-500); display:block; margin-bottom:3px; }
    .profile-item span  { font-size:13px; font-weight:600; color:var(--slate-900); word-break:break-all; }
    .profile-item.full  { grid-column:1 / -1; }

    /* ── TOAST ── */
    .stf-toast { position:fixed; bottom:24px; right:24px; padding:13px 20px; border-radius:12px; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 8px 28px rgba(0,0,0,.18); animation:stfFadeUp .25s ease; max-width:360px; }
    .stf-toast.success { background:#15803d; color:white; }
    .stf-toast.error   { background:#dc2626; color:white; }

    /* ── EMPTY STATE ── */
    .empty-st { text-align:center; padding:48px 20px; }
    .empty-ic { font-size:44px; margin-bottom:12px; }
    .empty-title { font-weight:700; font-size:15px; color:#334155; margin-bottom:5px; }
    .empty-sub   { font-size:13px; color:#64748b; }

    /* ── SPINNER ── */
    .spinner    { width:18px; height:18px; border:2px solid rgba(37,99,235,.2); border-top-color:var(--blue-600); border-radius:50%; animation:stfSpin .7s linear infinite; }
    .spinner-sm { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:stfSpin .7s linear infinite; }

    /* ── MOBILE ── */
    .stf-mob-veil { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99; animation:stfFadeIn .18s ease; }
    .stf-mob-veil.show { display:block; }
    @media (max-width:900px) { .stf-org { display:none; } }
    @media (max-width:768px) { .stf-sb { position:fixed; top:0; left:0; height:100dvh; z-index:100; transform:translateX(-100%); transition:transform .28s cubic-bezier(.4,0,.2,1),width .28s; width:var(--sidebar-w) !important; } .stf-sb.open { transform:translateX(0); width:248px !important; } .stf-content { padding:14px; } }
    @media (max-width:500px) { .stat-row { grid-template-columns:1fr 1fr; } .mod-grid { grid-template-columns:1fr; } .mod-field.full { grid-column:1; } .pg-hdr { flex-direction:column; align-items:stretch; } .pg-hdr .btn-primary { width:100%; justify-content:center; } .profile-grid { grid-template-columns:1fr; } }
  `;
  document.head.appendChild(s);
};
injectStyles();

// ─── Icons ───────────────────────────────────────────────────────
const Ic = {
  Menu:       () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Student:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Switch:     () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>,
  Check:      () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
  Training:   () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Attendance: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Performance:() => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Trophy:     () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  Logout:     () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:       () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Edit:       () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:      () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Close:      () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye:        () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Shirt: () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
  </svg>
),

};

// ─── Toast ───────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`stf-toast ${type}`}>{msg}</div>;
}

// ─── NAV ────────────────────────────────────────────────────────
const NAV = [
  { id:"students",    label:"Student Management",    Icon:Ic.Student,     group:"People"     },
  { id:"training",    label:"Training Management",   Icon:Ic.Training,    group:"Operations" },
  { id:"attendance",  label:"Attendance Management", Icon:Ic.Attendance,  group:"Operations" },
  { id:"performance", label:"Performance Management",Icon:Ic.Performance, group:"Operations" },
  { id:"selection",   label:"Selection Report",      Icon:Ic.Trophy,      group:"Operations" },
  { id:"kits", label:"Kit Management", Icon:Ic.Shirt, group:"Operations" },
  { id:"achievement", label:"Achievement Management",Icon:Ic.Trophy,      group:"Records"    },
  { id:"records", label:"Student Records", Icon:Ic.Student, group:"Records" },
];

// ─── Role Switcher ───────────────────────────────────────────────
function RoleSwitcher({ activeRole, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const ROLES = [
    { id:"staff",   label:"Staff Mode",   color:"#d97706" },
    { id:"student", label:"Student Mode", color:"#7c3aed" },
  ];
  return (
    <div className="role-dd-wrap" ref={ref}>
      <button className="sb-role-btn" onClick={() => setOpen(o => !o)} title="Switch Role">
        <Ic.Switch/><span className="sb-role-lbl">Switch Role</span>
      </button>
      {open && (
        <div className="role-dd">
          <div className="role-dd-hd">Switch Role</div>
          {ROLES.map(r => (
            <button key={r.id} className={`role-opt ${activeRole === r.id ? "curr" : ""}`}
              onClick={() => { onSwitch(r.id); setOpen(false); }}>
              <span className="role-dot" style={{ background: r.color }}/>
              {r.label}
              {activeRole === r.id && <span className="role-check"><Ic.Check/></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  STUDENT PROFILE PANEL
// ════════════════════════════════════════════════════════════════
function StudentProfilePanel({ student, onClose, onEdit }) {
  const fmt = v => v || <span style={{ color:"#94a3b8" }}>—</span>;
  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : null;
  const statusColor = { active:"badge-green", passout:"badge-gray", transferred:"badge-yellow", suspended:"badge-red" };

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", zIndex:499 }} onClick={onClose}/>
      <div className="profile-panel">
        <div className="profile-panel-hd">
          <div className="profile-panel-av">{(student.name || student.username)?.charAt(0).toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:16, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{student.name || student.username}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{student.rollno || "No Roll No"} · {student.department || "No Dept"}</div>
            <div style={{ marginTop:5 }}>
              <span className={`badge ${statusColor[student.status] || "badge-gray"}`}>
                <span className="bdot"/>{student.status || "active"}
              </span>
            </div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close/></button>
        </div>

        <div className="profile-panel-body">
          <div className="profile-section">
            <div className="profile-section-title">🎓 Academic Identity</div>
            <div className="profile-grid">
              <div className="profile-item"><label>Roll Number</label><span>{fmt(student.rollno)}</span></div>
              <div className="profile-item"><label>Reg. Number</label><span>{fmt(student.reg_number)}</span></div>
              <div className="profile-item"><label>Username</label><span>{fmt(student.username)}</span></div>
              <div className="profile-item"><label>Department</label><span>{fmt(student.department)}</span></div>
              <div className="profile-item"><label>Batch</label><span>{fmt(student.batch)}</span></div>
              <div className="profile-item"><label>Batch Year</label><span>{fmt(student.batch_year)}</span></div>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">👤 Personal Details</div>
            <div className="profile-grid">
              <div className="profile-item"><label>Full Name</label><span>{fmt(student.name)}</span></div>
              <div className="profile-item"><label>Gender</label><span>{fmt(student.gender)}</span></div>
              <div className="profile-item"><label>Date of Birth</label><span>{student.dob ? fmtDate(student.dob) : <span style={{ color:"#94a3b8" }}>—</span>}</span></div>
              <div className="profile-item"><label>Blood Group</label><span>{fmt(student.blood_group)}</span></div>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">📞 Contact</div>
            <div className="profile-grid">
              <div className="profile-item"><label>Phone</label><span>{fmt(student.phone)}</span></div>
              <div className="profile-item"><label>Email</label><span style={{ fontSize:12 }}>{fmt(student.email)}</span></div>
              <div className="profile-item full"><label>Address</label><span style={{ fontSize:12, lineHeight:1.5 }}>{fmt(student.address)}</span></div>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">ℹ️ Account</div>
            <div className="profile-grid">
              <div className="profile-item"><label>Created</label><span style={{ fontSize:12 }}>{fmtDate(student.created_at)}</span></div>
              <div className="profile-item"><label>Status</label><span><span className={`badge ${statusColor[student.status]||"badge-gray"}`}>{student.status}</span></span></div>
            </div>
          </div>
        </div>

        <div style={{ padding:"14px 22px", borderTop:"1px solid #f1f5f9", display:"flex", gap:8 }}>
          <button className="btn-edit-sm" style={{ flex:1, justifyContent:"center" }} onClick={onEdit}>
            <Ic.Edit/> Edit Student
          </button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  STUDENT MODAL  — create / edit
// ════════════════════════════════════════════════════════════════
function StudentModal({ mode, student, onClose, onSave }) {
  const blank = { username:"", password:"", name:"", rollno:"", reg_number:"", department:"", batch:"", batch_year:"", email:"", phone:"", gender:"", dob:"", blood_group:"", address:"", status:"active" };
  const [form, setForm] = useState(mode === "edit" && student ? {
    ...blank,
    username:   student.username    || "",
    name:       student.name        || "",
    rollno:     student.rollno      || "",
    reg_number: student.reg_number  || "",
    department: student.department  || "",
    batch:      student.batch       || "",
    batch_year: student.batch_year  || "",
    email:      student.email       || "",
    phone:      student.phone       || "",
    gender:     student.gender      || "",
    dob:        student.dob ? student.dob.split("T")[0] : "",
    blood_group:student.blood_group || "",
    address:    student.address     || "",
    status:     student.status      || "active",   // ← ADD THIS
  } : blank);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.rollno || !form.department || !form.batch)
      return setError("Name, Roll Number, Department and Batch are required");
    if (mode === "create" && (!form.username || !form.password))
      return setError("Username and Password are required");

    setLoading(true);
    try {
      const token  = getToken();   // always read fresh
      const url    = mode === "create" ? `${API}/staff/students` : `${API}/staff/students/${student.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type":"application/json", Authorization:"Bearer " + token },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || `Error ${res.status}`);
      onSave();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const DEPTS   = ["CSE","IT","ECE","EEE","Civil","Mechanical","MBA","MCA"];
  const BATCHES = Array.from({ length:8 }, (_, i) => (new Date().getFullYear() - i).toString());
  const BLOOD   = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box" style={{ maxWidth:640, width:"100%" }}>
        <div className="mod-hd">
          <div>
            <div className="mod-title">{mode === "create" ? "Create Student Profile" : "Edit Student Profile"}</div>
            <div className="mod-sub">{mode === "create" ? "Enter full college profile details" : `Editing: ${student?.name || student?.username}`}</div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close/></button>
        </div>

        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#dc2626", fontWeight:500 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>🔐 Account Credentials</div>
        <div className="mod-grid" style={{ marginBottom:18 }}>
          <div className="mod-field">
            <label>Username *</label>
            <input placeholder="e.g. john_doe" value={form.username} onChange={f("username")} disabled={mode === "edit"}/>
          </div>
          <div className="mod-field">
            <label>{mode === "create" ? "Password *" : "New Password (leave blank to keep)"}</label>
            <input type="password" placeholder={mode === "create" ? "Set password" : "Leave blank to keep"} value={form.password} onChange={f("password")}/>
          </div>
        </div>

        <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>🎓 Academic Information</div>
        <div className="mod-grid" style={{ marginBottom:18 }}>
          <div className="mod-field"><label>Roll Number *</label><input placeholder="e.g. 21CSE001" value={form.rollno} onChange={f("rollno")}/></div>
          <div className="mod-field"><label>Registration Number</label><input placeholder="e.g. 952121114001" value={form.reg_number} onChange={f("reg_number")}/></div>
          <div className="mod-field">
            <label>Department *</label>
            <select value={form.department} onChange={f("department")}>
              <option value="">— Select —</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="mod-field">
            <label>Batch (Joining Year) *</label>
            <select value={form.batch} onChange={f("batch")}>
              <option value="">— Select —</option>
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="mod-field full"><label>Batch Year (e.g. 2021–2025)</label><input placeholder="e.g. 2021-2025" value={form.batch_year} onChange={f("batch_year")}/></div>
        </div>

        <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>👤 Personal Details</div>
        <div className="mod-grid" style={{ marginBottom:18 }}>
          <div className="mod-field full"><label>Full Name *</label><input placeholder="e.g. John Doe" value={form.name} onChange={f("name")}/></div>
          <div className="mod-field">
            <label>Gender</label>
            <select value={form.gender} onChange={f("gender")}><option value="">— Select —</option><option>Male</option><option>Female</option><option>Other</option></select>
          </div>
          <div className="mod-field"><label>Date of Birth</label><input type="date" value={form.dob} onChange={f("dob")}/></div>
          <div className="mod-field">
            <label>Blood Group</label>
            <select value={form.blood_group} onChange={f("blood_group")}><option value="">— Select —</option>{BLOOD.map(b => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div className="mod-field"><label>Phone</label><input placeholder="e.g. 9876543210" value={form.phone} onChange={f("phone")}/></div>
          <div className="mod-field full"><label>Email</label><input type="email" placeholder="e.g. john@college.edu" value={form.email} onChange={f("email")}/></div>
          {/* ADD THIS ENTIRE NEW SECTION right after, before mod-acts: */}
        {mode === "edit" && (
          <>
            <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10, marginTop:4 }}>⚙️ Account Status</div>
            <div className="mod-grid" style={{ marginBottom:18 }}>
              <div className="mod-field full">
                <label>Student Status</label>
                <select value={form.status} onChange={f("status")}>
                  <option value="active">✅ Active</option>
                  <option value="passout">🎓 Passout</option>
                  <option value="transferred">🔄 Transferred</option>
                  <option value="suspended">🚫 Suspended</option>
                </select>
              </div>
            </div>
          </>
        )}

          <div className="mod-field full"><label>Address</label><textarea rows={2} placeholder="Full address…" value={form.address} onChange={f("address")}/></div>
        </div>

        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading && <div className="spinner-sm"/>}
            {mode === "create" ? "Create Student" : "Update Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  STUDENT MANAGEMENT PAGE
// ════════════════════════════════════════════════════════════════
function StudentManagement() {
  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);   // id being deleted
  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");
  const [modal,       setModal]       = useState(null);
  const [profile,     setProfile]     = useState(null);
  const [toast,       setToast]       = useState(null);   // {msg, type}

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();   // always fresh
      const res   = await fetch(`${API}/staff/students`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to load students: ${err.message || res.status}`, "error");
        setStudents([]);
        return;
      }
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast("Network error loading students", "error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── DELETE with proper error feedback ──────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"?\nThis cannot be undone.`)) return;

    setDeleting(id);
    try {
      const token = getToken();   // always fresh — never use a stale cached token
      const res   = await fetch(`${API}/staff/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(`✅ "${name}" deleted successfully`);
        fetchStudents();
      } else if (res.status === 403) {
        // 403 = token issue — show the debug info from server
        showToast(
          `Access denied (403). ${data.message || ""}` +
          (data.debug ? ` | role:"${data.debug.role}" activeRole:"${data.debug.activeRole}"` : ""),
          "error"
        );
      } else if (res.status === 401) {
        showToast("Session expired. Please log out and log in again.", "error");
      } else if (res.status === 404) {
        showToast("Student not found — may have already been deleted.", "error");
        fetchStudents();
      } else {
        showToast(`Error ${res.status}: ${data.message || "Unknown error"}`, "error");
      }
    } catch (e) {
      showToast("Network error. Is the server running?", "error");
    } finally {
      setDeleting(null);
    }
  };

  const depts   = [...new Set(students.map(s => s.department).filter(Boolean))].sort();
  const batches = [...new Set(students.map(s => s.batch).filter(Boolean))].sort((a, b) => b - a);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      s.rollno?.toLowerCase().includes(q) ||
      s.reg_number?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q);
    return matchSearch &&
      (deptFilter  === "all" || s.department === deptFilter) &&
      (batchFilter === "all" || s.batch === batchFilter) &&
      (statusFilter === "all" || s.status === statusFilter);
  });

  const statusBadge = s => {
    const map = { active:"badge-green", passout:"badge-gray", transferred:"badge-yellow", suspended:"badge-red" };
    return <span className={`badge ${map[s] || "badge-gray"}`}><span className="bdot"/>{s}</span>;
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}

      {modal?.mode === "create" && (
        <StudentModal mode="create" onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchStudents(); showToast("Student created successfully"); }}/>
      )}
      {modal?.mode === "edit" && (
        <StudentModal mode="edit" student={modal.student} onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchStudents(); showToast("Student updated successfully"); }}/>
      )}
      {profile && (
        <StudentProfilePanel student={profile}
          onClose={() => setProfile(null)}
          onEdit={() => { setModal({ mode:"edit", student:profile }); setProfile(null); }}/>
      )}

      <div className="pg-hdr">
        <div>
          <div className="pg-title">Student Management</div>
          <div className="pg-sub">Create and manage college student profiles</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ mode:"create" })}>
          <Ic.Plus/> Create Student
        </button>
      </div>

      <div className="stat-row">
        {[
          { val:students.length, lbl:"Total" },
          { val:students.filter(s => s.status === "active").length,   lbl:"Active" },
          { val:students.filter(s => s.status === "passout").length,  lbl:"Passout" },
          { val:[...new Set(students.map(s => s.department).filter(Boolean))].length, lbl:"Depts" },
          { val:[...new Set(students.map(s => s.batch).filter(Boolean))].length,      lbl:"Batches" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i * .07}s` }}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tbl-card">
        <div className="tbl-toolbar">
          <div className="srch-wrap" style={{ flex:1, minWidth:180 }}>
            <Ic.Search/>
            <input className="srch-in" placeholder="Search by name, roll no, reg no, department…"
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="fil-sel" value={deptFilter}   onChange={e => setDeptFilter(e.target.value)}>
            <option value="all">All Depts</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="fil-sel" value={batchFilter}  onChange={e => setBatchFilter(e.target.value)}>
            <option value="all">All Batches</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="fil-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="passout">Passout</option>
            <option value="transferred">Transferred</option>
            <option value="suspended">Suspended</option>
          </select>
          {(search || deptFilter !== "all" || batchFilter !== "all" || statusFilter !== "all") && (
            <button className="clr-btn" onClick={() => { setSearch(""); setDeptFilter("all"); setBatchFilter("all"); setStatusFilter("all"); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:52 }}><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-st">
            <div className="empty-ic">🎓</div>
            <div className="empty-title">No students found</div>
            <div className="empty-sub">{students.length === 0 ? "Create the first student to get started" : "Try adjusting your search or filters"}</div>
            {students.length === 0 && (
              <button className="btn-primary" style={{ marginTop:14 }} onClick={() => setModal({ mode:"create" })}>
                <Ic.Plus/> Create Student
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="g-tbl">
              <thead>
                <tr>
                  <th></th><th>Student</th><th>Roll No</th><th>Reg. No</th>
                  <th>Department</th><th>Batch</th><th>Contact</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="g-row" style={{ animationDelay:`${i * .04}s` }}>
                    <td style={{ color:"#94a3b8", width:32, fontSize:12 }}>{i + 1}</td>
                    <td>
                      <div className="av-cell">
                        <div className="av-ring">{(s.name || s.username)?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="av-name">{s.name || "—"}</div>
                          <div className="av-sub">@{s.username}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue" style={{ fontFamily:"monospace", fontSize:12 }}>{s.rollno || "—"}</span></td>
                    <td style={{ fontSize:12, color:"#475569", fontFamily:"monospace" }}>{s.reg_number || "—"}</td>
                    <td><span className="badge badge-purple">{s.department || "—"}</span></td>
                    <td style={{ fontWeight:600, fontSize:13 }}>{s.batch || "—"}</td>
                    <td style={{ fontSize:12, color:"#475569" }}>
                      {s.phone && <div>{s.phone}</div>}
                      {s.email && <div style={{ color:"#64748b" }}>{s.email}</div>}
                      {!s.phone && !s.email && <span style={{ color:"#94a3b8" }}>—</span>}
                    </td>
                    <td>{statusBadge(s.status || "active")}</td>
                    <td>
                      <div className="act-grp">
                        <button className="btn-view-sm" onClick={() => setProfile(s)}>
                          <Ic.Eye/><span>View</span>
                        </button>
                        <button className="btn-edit-sm" onClick={() => setModal({ mode:"edit", student:s })}>
                          <Ic.Edit/><span>Edit</span>
                        </button>
                        <button
                          className="btn-del-sm"
                          disabled={deleting === s.id}
                          onClick={() => handleDelete(s.id, s.name || s.username)}
                          style={{ opacity: deleting === s.id ? 0.6 : 1 }}
                        >
                          {deleting === s.id
                            ? <><div className="spinner-sm" style={{ borderTopColor:"#ef4444" }}/><span>Deleting…</span></>
                            : <><Ic.Trash/><span>Delete</span></>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="tbl-footer">
          Showing <strong>{filtered.length}</strong> of <strong>{students.length}</strong> students
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  STAFF DASHBOARD (root)
// ════════════════════════════════════════════════════════════════
export default function StaffDashboard() {
  const [activeRole,  setActiveRole]  = useState("staff");
  const [page,        setPage]        = useState("students");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const p = JSON.parse(atob(token.split(".")[1]));
      setActiveRole(p.activeRole || p.role || "staff");
    } catch {}
  }, []);

  const handleRoleSwitch = async roleId => {
    try {
      const token = getToken();
      const res   = await fetch(`${API}/staff/switch-role`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:"Bearer " + token },
        body: JSON.stringify({ newRole: roleId })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch { alert("Failed to switch role"); }
  };

  const logout    = () => { localStorage.removeItem("token"); window.location.href = "/"; };
  const handleNav = id => { setPage(id); if (isMobile()) setSidebarOpen(false); };
  const pageLabel = NAV.find(n => n.id === page)?.label || "Dashboard";

  return (
    <div className="stf-root">
      {isMobile() && (
        <div className={`stf-mob-veil ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)}/>
      )}

      <aside className={`stf-sb ${sidebarOpen ? "open" : ""}`}>
        <div className="stf-brand" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
          <div className="stf-brand-icon">🏃</div>
          <div className="stf-brand-text">
            <div className="stf-brand-name">Staff Panel</div>
            <div className="stf-brand-sub">Sports Dept.</div>
          </div>
        </div>

        <nav className="stf-nav">
          {NAV.map(({ id, label, Icon, group }, idx) => {
            const prevGroup = idx > 0 ? NAV[idx - 1].group : null;
            return (
              <div key={id} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
                {group !== prevGroup && (
                  <><div className="stf-divider"/><div className="stf-sb-sec">{group}</div></>
                )}
                <button className={`stf-nav-item ${page === id ? "active" : ""}`}
                  onClick={() => handleNav(id)} title={label}>
                  <Icon/>
                  <span className="stf-item-lbl">{label}</span>
                  <span className="stf-tip">{label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="stf-sb-bottom">
          <RoleSwitcher activeRole={activeRole} onSwitch={handleRoleSwitch}/>
          <button className="stf-logout-btn" onClick={logout} title="Logout">
            <Ic.Logout/><span className="stf-logout-lbl">Logout</span>
          </button>
        </div>
      </aside>

      <div className="stf-main">
        <header className="stf-topbar">
          <div className="stf-topbar-left">
            <button className="stf-hamburger" onClick={() => setSidebarOpen(o => !o)}><Ic.Menu/></button>
            <span className="stf-page-title">{pageLabel}</span>
          </div>
          <div className="stf-topbar-right">
            <span className="stf-org">Dr. Sivanthi Aditanar College of Engineering</span>
            <div className="stf-avatar" title={`Role: ${activeRole}`}>{activeRole.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <main className="stf-content">
          {page === "students"    && <StudentManagement/>}
          {page === "training"    && <TrainingManagement    token={getToken()}/>}
          {page === "attendance"  && <AttendanceManagement  token={getToken()}/>}
          {page === "performance" && <PerformanceManagement token={getToken()}/>}
          {page === "selection"   && <SelectionReport       token={getToken()}/>}
          {page === "kits" && <KitManagement token={getToken()} />}
          {page === "achievement" && <AchievementPage/>}
          {page === "records" && <StudentRecords token={getToken()} />}
        </main>
      </div>
    </div>
  );
}