import { useEffect, useState, useCallback, useRef } from "react";
import AchievementPage from "../components/AchievementPage";
import AuditLogs from "./AuditLogs";

/* ─── Global Styles ─────────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("admin-dash-styles")) return;
  const s = document.createElement("style");
  s.id = "admin-dash-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
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
      --white: #ffffff;
      --red-500: #ef4444;
      --red-100: #fee2e2;
      --green-500: #22c55e;
      --green-100: #dcfce7;
      --sidebar-w: 68px;
      --topbar-h: 60px;
    }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes scaleIn  { from{opacity:0;transform:scale(.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes rowSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes tipIn    { from{opacity:0;transform:translateY(-50%) translateX(-6px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }

    /* ─── Layout ─── */
    .ad-root { display:flex; height:100dvh; background:#edf0f7; font-family:'Inter',sans-serif; overflow:hidden; }

    /* ─── Sidebar ─── */
    .ad-sidebar {
      width: var(--sidebar-w); flex-shrink:0;
      background: linear-gradient(175deg, var(--blue-900) 0%, var(--blue-800) 55%, var(--blue-700) 100%);
      display:flex; flex-direction:column; align-items:center;
      position:relative; z-index:100;
      box-shadow: 4px 0 28px rgba(12,31,94,.4);
      transition: width .28s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
    }
    .ad-sidebar.expanded { width: 230px; }

    /* logo */
    .sb-brand {
      width:100%; padding:16px 0 14px;
      display:flex; align-items:center;
      border-bottom:1px solid rgba(255,255,255,.08);
      cursor:pointer; overflow:hidden; flex-shrink:0;
      justify-content: center;
      transition: padding .28s;
    }
    .ad-sidebar.expanded .sb-brand { justify-content:flex-start; padding-left:16px; }
    .sb-brand-icon {
      width:38px; height:38px; flex-shrink:0; border-radius:10px;
      background:white; display:flex; align-items:center; justify-content:center;
      font-size:19px; box-shadow:0 3px 10px rgba(0,0,0,.3);
      transition:transform .2s; min-width:38px;
    }
    .sb-brand:hover .sb-brand-icon { transform:scale(1.06); }
    .sb-brand-text { overflow:hidden; max-width:0; opacity:0; margin-left:0; transition:max-width .28s, opacity .22s, margin .28s; white-space:nowrap; }
    .ad-sidebar.expanded .sb-brand-text { max-width:160px; opacity:1; margin-left:10px; }
    .sb-brand-name { font-family:'Sora',sans-serif; font-size:12.5px; font-weight:700; color:white; line-height:1.3; }
    .sb-brand-sub  { font-size:9.5px; color:rgba(255,255,255,.42); letter-spacing:1.1px; text-transform:uppercase; }

    /* nav */
    .sb-nav { flex:1; width:100%; padding:10px 0; display:flex; flex-direction:column; align-items:center; gap:2px; overflow:hidden; }
    .sb-nav-item {
      position:relative; width:calc(100% - 14px); margin:0 7px;
      border:none; background:transparent; cursor:pointer;
      display:flex; align-items:center;
      height:44px; border-radius:11px;
      color:rgba(255,255,255,.5); transition:all .18s;
      padding:0 13px; gap:12px; overflow:hidden;
    }
    .sb-nav-item:hover { background:rgba(255,255,255,.1); color:white; }
    .sb-nav-item.active {
      background:rgba(255,255,255,.14); color:white;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);
    }
    .sb-nav-item.active::before {
      content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
      width:3px; height:22px; background:white; border-radius:0 3px 3px 0;
    }
    .sb-nav-item svg { flex-shrink:0; min-width:18px; }
    .sb-item-lbl {
      font-size:13px; font-weight:500; white-space:nowrap;
      overflow:hidden; max-width:0; opacity:0;
      transition:max-width .28s, opacity .22s;
    }
    .ad-sidebar.expanded .sb-item-lbl { max-width:160px; opacity:1; }

    /* tooltip */
    .sb-tip {
      position:absolute; left:calc(var(--sidebar-w) + 6px); top:50%;
      transform:translateY(-50%) translateX(-6px);
      background:var(--slate-900); color:white; font-size:12px; font-weight:600;
      padding:5px 11px; border-radius:8px; white-space:nowrap; pointer-events:none;
      opacity:0; font-family:'Inter',sans-serif; z-index:200;
      transition:none;
    }
    .ad-sidebar:not(.expanded) .sb-nav-item:hover .sb-tip { opacity:1; animation:tipIn .15s ease forwards; }
    .ad-sidebar.expanded .sb-tip { display:none; }

    /* bottom */
    .sb-bottom { width:100%; padding:10px 7px; border-top:1px solid rgba(255,255,255,.08); display:flex; flex-direction:column; gap:6px; flex-shrink:0; }

    /* role switcher btn */
    .sb-role-btn {
      width:100%; height:44px; border-radius:11px; border:none;
      background:rgba(255,255,255,.09); color:rgba(255,255,255,.75);
      display:flex; align-items:center; justify-content:center; gap:11px;
      cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
      transition:all .18s; overflow:hidden; padding:0 13px;
    }
    .sb-role-btn:hover { background:rgba(255,255,255,.17); color:white; }
    .sb-role-btn svg { flex-shrink:0; min-width:18px; }
    .sb-role-lbl { white-space:nowrap; overflow:hidden; max-width:0; opacity:0; transition:max-width .28s, opacity .22s; }
    .ad-sidebar.expanded .sb-role-lbl { max-width:120px; opacity:1; }

    /* role dropdown */
    .role-dd-wrap { position:relative; width:100%; }
    .role-dd {
      position:absolute; bottom:calc(100% + 8px); left:0;
      background:white; border-radius:14px; overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.1);
      animation:scaleIn .18s ease; transform-origin:bottom left;
      min-width:190px; z-index:300;
    }
    .ad-sidebar:not(.expanded) .role-dd { left:calc(var(--sidebar-w) + 8px); bottom:0; }
    .role-dd-hd { padding:12px 14px 9px; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--slate-500); border-bottom:1px solid var(--slate-100); }
    .role-opt {
      display:flex; align-items:center; gap:11px;
      padding:10px 14px; cursor:pointer; transition:background .12s;
      font-size:13px; font-weight:500; color:var(--slate-700);
      border:none; background:transparent; width:100%; font-family:'Inter',sans-serif;
    }
    .role-opt:hover { background:var(--blue-50); color:var(--blue-700); }
    .role-opt.curr  { background:var(--blue-50); color:var(--blue-700); font-weight:600; }
    .role-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .role-check { margin-left:auto; color:var(--blue-600); }

    /* logout */
    .sb-logout-btn {
      width:100%; height:44px; border-radius:11px; border:none;
      background:rgba(239,68,68,.12); color:#fca5a5;
      display:flex; align-items:center; justify-content:center; gap:11px;
      cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
      transition:all .18s; overflow:hidden; padding:0 13px;
    }
    .sb-logout-btn:hover { background:rgba(239,68,68,.25); color:#fecaca; }
    .sb-logout-btn svg { flex-shrink:0; min-width:18px; }
    .sb-logout-lbl { white-space:nowrap; overflow:hidden; max-width:0; opacity:0; transition:max-width .28s, opacity .22s; }
    .ad-sidebar.expanded .sb-logout-lbl { max-width:80px; opacity:1; }

    /* ─── Main ─── */
    .ad-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

    /* topbar */
    .ad-topbar {
      height:var(--topbar-h); background:white; border-bottom:1px solid var(--slate-100);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 22px; flex-shrink:0; box-shadow:0 1px 6px rgba(0,0,0,.04);
    }
    .ad-topbar-left { display:flex; align-items:center; gap:14px; }
    .hamburger-btn {
      width:34px; height:34px; border-radius:9px; border:none;
      background:var(--slate-100); cursor:pointer; display:flex;
      align-items:center; justify-content:center; color:var(--slate-700);
      transition:background .15s; flex-shrink:0;
    }
    .hamburger-btn:hover { background:var(--slate-200); }
    .ad-page-title { font-family:'Sora',sans-serif; font-weight:700; font-size:16px; color:var(--slate-900); }
    .ad-topbar-right { display:flex; align-items:center; gap:12px; }
    .ad-org { font-size:12px; color:var(--slate-500); white-space:nowrap; }
    .ad-avatar {
      width:34px; height:34px; border-radius:50%;
      background:linear-gradient(135deg,var(--blue-600),var(--blue-700));
      color:white; font-weight:700; font-size:13px;
      display:flex; align-items:center; justify-content:center;
      font-family:'Sora',sans-serif; box-shadow:0 2px 8px rgba(37,99,235,.3); flex-shrink:0;
    }

    /* page */
    .ad-content { flex:1; overflow-y:auto; padding:22px; }

    /* ─── Director Page ─── */
    .pg-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:12px; animation:fadeUp .35s ease; }
    .pg-title   { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:var(--slate-900); }
    .pg-sub     { font-size:13px; color:var(--slate-500); margin-top:3px; }

    .stat-row   { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; margin-bottom:18px; }
    .stat-card  {
      background:white; border-radius:14px; padding:16px 18px;
      border:1px solid var(--slate-100); animation:fadeUp .4s ease both;
      transition:transform .18s, box-shadow .18s;
    }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }
    .stat-val   { font-family:'Sora',sans-serif; font-weight:800; font-size:26px; color:var(--blue-600); }
    .stat-lbl   { font-size:12px; color:var(--slate-500); margin-top:2px; }

    .table-card { background:white; border-radius:16px; border:1px solid var(--slate-100); overflow:hidden; box-shadow:0 2px 14px rgba(0,0,0,.04); animation:fadeUp .45s ease both; }
    .tb-toolbar {
      padding:12px 16px; background:#fafbfc; border-bottom:1px solid var(--slate-100);
      display:flex; gap:8px; align-items:center; flex-wrap:wrap;
    }
    .srch-wrap { position:relative; flex:1; min-width:160px; }
    .srch-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--slate-500); pointer-events:none; }
    .srch-input {
      width:100%; padding:8px 12px 8px 34px; border-radius:9px;
      border:1.5px solid var(--slate-200); font-family:'Inter',sans-serif;
      font-size:13px; color:var(--slate-900); background:white;
      transition:border .2s, box-shadow .2s; outline:none;
    }
    .srch-input:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.11); }
    .filter-sel {
      padding:8px 11px; border-radius:9px; border:1.5px solid var(--slate-200);
      font-family:'Inter',sans-serif; font-size:13px; color:var(--slate-700);
      background:white; cursor:pointer; outline:none; transition:border .2s; min-width:120px;
    }
    .filter-sel:focus { border-color:var(--blue-500); }
    .clear-filters-btn {
      padding:8px 13px; border-radius:9px; border:1.5px solid var(--slate-200);
      background:white; font-size:12px; font-weight:600; color:var(--slate-500);
      cursor:pointer; font-family:'Inter',sans-serif; white-space:nowrap; transition:all .15s;
    }
    .clear-filters-btn:hover { border-color:var(--slate-300); color:var(--slate-700); }

    /* table */
    .dir-tbl { width:100%; border-collapse:collapse; }
    .dir-tbl th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--slate-500); background:var(--slate-50); border-bottom:1px solid var(--slate-100); }
    .dir-tbl td { padding:12px 16px; border-bottom:1px solid #f8fafc; font-size:13px; color:var(--slate-700); }
    .dir-row { animation:rowSlide .3s ease both; transition:background .12s; }
    .dir-row:hover td { background:#f4f8ff; }
    .dir-row:last-child td { border-bottom:none; }

    .av-cell { display:flex; align-items:center; gap:10px; }
    .av-ring { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--blue-600),var(--blue-500)); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; flex-shrink:0; }
    .av-name { font-weight:600; color:var(--slate-900); }

    .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:11.5px; font-weight:600; }
    .badge-blue  { background:var(--blue-100); color:var(--blue-700); }
    .badge-green { background:var(--green-100); color:#15803d; }
    .bdot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }

    .act-grp { display:flex; gap:6px; }
    .btn-edit {
      display:inline-flex; align-items:center; gap:5px;
      padding:6px 11px; border-radius:8px; border:none;
      background:var(--blue-50); color:var(--blue-700);
      font-size:12px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .15s;
    }
    .btn-edit:hover { background:var(--blue-600); color:white; }
    .btn-del {
      display:inline-flex; align-items:center; gap:5px;
      padding:6px 11px; border-radius:8px; border:none;
      background:var(--red-100); color:var(--red-500);
      font-size:12px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .15s;
    }
    .btn-del:hover { background:var(--red-500); color:white; }

    .btn-primary {
      display:inline-flex; align-items:center; gap:7px;
      padding:9px 18px; border-radius:10px; border:none;
      background:linear-gradient(135deg,var(--blue-600),var(--blue-700));
      color:white; font-size:13px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .18s;
      box-shadow:0 4px 12px rgba(37,99,235,.28); white-space:nowrap; flex-shrink:0;
    }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(37,99,235,.38); }
    .btn-primary:active { transform:translateY(0); }
    .btn-primary:disabled { opacity:.65; cursor:not-allowed; transform:none; }

    .tb-footer { padding:10px 16px; background:#fafbfc; border-top:1px solid var(--slate-100); font-size:12px; color:var(--slate-500); }

    .empty-st { text-align:center; padding:40px 20px; }
    .empty-ic { font-size:40px; margin-bottom:10px; }

    /* ─── Modal ─── */
    .mod-overlay {
      position:fixed; inset:0; background:rgba(15,23,42,.52);
      backdrop-filter:blur(6px); z-index:400;
      display:flex; align-items:center; justify-content:center;
      animation:fadeIn .18s ease; padding:16px;
    }
    .mod-box {
      background:white; border-radius:20px; padding:26px;
      width:100%; max-width:420px;
      animation:scaleIn .22s cubic-bezier(.34,1.56,.64,1);
      box-shadow:0 28px 70px rgba(0,0,0,.22);
    }
    .mod-hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
    .mod-title { font-family:'Sora',sans-serif; font-weight:700; font-size:19px; color:var(--slate-900); }
    .mod-sub   { font-size:12.5px; color:var(--slate-500); margin-top:3px; }
    .mod-close { width:30px; height:30px; border-radius:8px; border:none; background:var(--slate-100); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--slate-600); transition:background .13s; }
    .mod-close:hover { background:var(--slate-200); }
    .mod-field { margin-bottom:14px; }
    .mod-field label { display:block; font-size:11.5px; font-weight:700; color:var(--slate-600); margin-bottom:5px; letter-spacing:.4px; text-transform:uppercase; }
    .mod-field input {
      width:100%; padding:10px 13px; border-radius:9px;
      border:1.5px solid var(--slate-200); font-family:'Inter',sans-serif;
      font-size:13.5px; color:var(--slate-900); background:var(--slate-50);
      transition:all .18s; outline:none;
    }
    .mod-field input:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.11); background:white; }
    .mod-acts { display:flex; gap:10px; justify-content:flex-end; margin-top:22px; }
    .btn-cancel {
      padding:9px 18px; border-radius:10px; border:1.5px solid var(--slate-200);
      background:white; font-size:13px; font-weight:600; color:var(--slate-600);
      cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s;
    }
    .btn-cancel:hover { background:var(--slate-50); }

    .spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; flex-shrink:0; }

    /* mobile overlay */
    .mob-overlay {
      display:none; position:fixed; inset:0; background:rgba(0,0,0,.4);
      z-index:99; animation:fadeIn .18s ease;
    }
    .mob-overlay.vis { display:block; }

    /* ─── Responsive ─── */
    @media (max-width:900px) {
      .ad-org { display:none; }
    }
    @media (max-width:768px) {
      .ad-sidebar {
        position:fixed; top:0; left:0; height:100dvh; z-index:100;
        transform:translateX(-100%);
        transition:transform .28s cubic-bezier(.4,0,.2,1), width .28s;
        width: var(--sidebar-w) !important;
      }
      .ad-sidebar.expanded { transform:translateX(0); width:230px !important; }
      .ad-content { padding:14px; }
      .tb-toolbar { padding:10px 12px; }
      .dir-tbl th:nth-child(3), .dir-tbl td:nth-child(3),
      .dir-tbl th:nth-child(4), .dir-tbl td:nth-child(4) { display:none; }
    }
    @media (max-width:500px) {
      .stat-row { grid-template-columns:1fr 1fr; }
      .mod-box { padding:18px; }
      .btn-edit span, .btn-del span { display:none; }
      .pg-title { font-size:18px; }
    }
    @media (max-width:380px) {
      .filter-sel { min-width:100px; font-size:12px; }
    }
  `;
  document.head.appendChild(s);
};
injectStyles();

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const Ic = {
  Menu:      () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Directors: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Trophy:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  Audit:     () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Switch:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>,
  Logout:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:      () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Edit:      () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:     () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Close:     () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
  
};

const ROLES = [
  { id: "admin",    label: "Admin Mode",    color: "#2563eb" },
  { id: "director", label: "Director Mode", color: "#059669" },
  { id: "staff",    label: "Staff Mode",    color: "#d97706" },
  { id: "student",  label: "Student Mode",  color: "#7c3aed"},
];

const NAV = [
  { id: "directors",   label: "Director Management", Icon: Ic.Directors },
  { id: "achievement", label: "Achievement Records",  Icon: Ic.Trophy    },
  { id: "audit",       label: "Audit Logs",           Icon: Ic.Audit     },
];

/* ─── Director Modal ─────────────────────────────────────────────────────────── */
function DirectorModal({ mode, director, onClose, onSave }) {
  const [username, setUsername] = useState(director?.username || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const token = localStorage.getItem("token");

  const handleSave = async () => {
    if (mode === "create" && !username.trim()) { alert("Please enter a username"); return; }
    if (!password.trim()) { alert("Please enter a password"); return; }
    setLoading(true);
    try {
      if (mode === "create") {
        const res  = await fetch("http://127.0.0.1:5000/admin/create-director", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        alert(data.message);
      } else {
        const res  = await fetch("http://127.0.0.1:5000/admin/update-director-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ username: director.username, newPassword: password }),
        });
        const data = await res.json();
        alert(data.message);
      }
      onSave(); onClose();
    } catch { alert("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box">
        <div className="mod-hd">
          <div>
            <div className="mod-title">{mode === "create" ? "Create Director" : "Edit Director"}</div>
            <div className="mod-sub">{mode === "create" ? "Add a new director account to the system" : `Update password for ${director?.username}`}</div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close /></button>
        </div>
        {mode === "create" && (
          <div className="mod-field">
            <label>Username</label>
            <input placeholder="e.g. dir_john" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
        )}
        <div className="mod-field">
          <label>{mode === "create" ? "Password" : "New Password"}</label>
          <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} autoFocus={mode !== "create"} onKeyDown={e => e.key === "Enter" && handleSave()} />
        </div>
        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading && <div className="spinner" />}
            {mode === "create" ? "Create Director" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Role Switcher Dropdown ─────────────────────────────────────────────────── */
function RoleSwitcher({ activeRole, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="role-dd-wrap" ref={ref}>
      <button className="sb-role-btn" onClick={() => setOpen(o => !o)} title="Switch Role">
        <Ic.Switch />
        <span className="sb-role-lbl">Switch Role</span>
      </button>
      {open && (
        <div className="role-dd">
          <div className="role-dd-hd">Switch Role</div>
          {ROLES.map(r => (
            <button
              key={r.id}
              className={`role-opt ${activeRole === r.id ? "curr" : ""}`}
              onClick={() => { onSwitch(r.id); setOpen(false); }}
            >
              <span className="role-dot" style={{ background: r.color }} />
              {r.label}
              {activeRole === r.id && <span className="role-check"><Ic.Check /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Director Management ────────────────────────────────────────────────────── */
function DirectorManagement() {
  const token = localStorage.getItem("token");
  const [directors, setDirectors]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [sortBy, setSort]           = useState("az");
  const [modal, setModal]           = useState(null);

  const fetchDirectors = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://127.0.0.1:5000/admin/users", { headers: { Authorization: "Bearer " + token } });
      const data = await res.json();
      setDirectors(data.filter(u => u.role === "director"));
    } catch { setDirectors([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchDirectors(); }, [fetchDirectors]);

  const deleteDirector = async (id, uname) => {
    if (!window.confirm(`Delete director "${uname}"? This cannot be undone.`)) return;
    const res  = await fetch(`http://127.0.0.1:5000/admin/delete-director/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    const data = await res.json();
    alert(data.message);
    fetchDirectors();
  };

  const clearFilters = () => { setSearch(""); setStatus("all"); setSort("az"); };
  const hasFilters   = search || statusFilter !== "all" || sortBy !== "az";

  const filtered = directors
    .filter(d => d.username.toLowerCase().includes(search.toLowerCase()))
    .filter(d => statusFilter === "all" ? true : (d.status || "active") === statusFilter)
    .sort((a, b) => {
      if (sortBy === "az") return a.username.localeCompare(b.username);
      if (sortBy === "za") return b.username.localeCompare(a.username);
      return 0;
    });

  return (
    <div>
      {modal && <DirectorModal mode={modal.mode} director={modal.director} onClose={() => setModal(null)} onSave={fetchDirectors} />}

      <div className="pg-header">
        <div>
          <div className="pg-title">Director Management</div>
          <div className="pg-sub">Manage and monitor all director accounts</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ mode: "create" })}>
          <Ic.Plus /> Create Director
        </button>
      </div>

      <div className="stat-row">
        <div className="stat-card" style={{ animationDelay: "0s" }}>
          <div className="stat-val">{directors.length}</div>
          <div className="stat-lbl">Total Directors</div>
        </div>
      </div>

      <div className="table-card">
        {/* Toolbar */}
        <div className="tb-toolbar">
          <div className="srch-wrap">
            <Ic.Search />
            <input
              className="srch-input"
              placeholder="Search directors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-sel" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="filter-sel" value={sortBy} onChange={e => setSort(e.target.value)}>
            <option value="az">Name A → Z</option>
            <option value="za">Name Z → A</option>
          </select>
          {hasFilters && <button className="clear-filters-btn" onClick={clearFilters}>✕ Clear</button>}
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"48px" }}>
            <div className="spinner" style={{ width:26, height:26, borderColor:"rgba(37,99,235,.2)", borderTopColor:"var(--blue-600)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-st">
            <div className="empty-ic">👤</div>
            <div style={{ fontWeight:600, color:"var(--slate-700)", marginBottom:4 }}>No directors found</div>
            <div style={{ fontSize:13, color:"var(--slate-500)" }}>Adjust your filters or create a new director</div>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="dir-tbl">
              <thead>
                <tr>
                  <th style={{ width:40 }}></th>
                  <th>Director</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} className="dir-row" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td style={{ color:"var(--slate-400)" }}>{i + 1}</td>
                    <td>
                      <div className="av-cell">
                        <div className="av-ring">{d.username.charAt(0).toUpperCase()}</div>
                        <span className="av-name">{d.username}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">Director</span></td>
                    <td>
                      <span className="badge badge-green">
                        <span className="bdot" />
                        Active
                      </span>
                    </td>
                    <td>
                      <div className="act-grp">
                        <button className="btn-edit" onClick={() => setModal({ mode:"edit", director:d })}>
                          <Ic.Edit /><span>Edit</span>
                        </button>
                        <button className="btn-del" onClick={() => deleteDirector(d.id, d.username)}>
                          <Ic.Trash /><span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="tb-footer">
          Showing <strong>{filtered.length}</strong> of <strong>{directors.length}</strong> directors
          {hasFilters && " · filtered"}
        </div>
      </div>
    </div>
  );
}



/* ─── Admin Dashboard ────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const [activeRole, setActiveRole]   = useState("admin");
  const [page, setPage]               = useState("directors");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect mobile for overlay behavior
  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setActiveRole(payload.activeRole || "admin");
    } catch {}
  }, [token]);

  const switchRole = async (role) => {
    try {
      const res  = await fetch("http://127.0.0.1:5000/admin/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ newRole: role }),
      });
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch { alert("Failed to switch role"); }
  };

  const logout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

  const handleNav = (id) => {
    setPage(id);
    if (isMobile()) setSidebarOpen(false);
  };

  const currentLabel = NAV.find(n => n.id === page)?.label || "Dashboard";

  return (
    <div className="ad-root">
      {/* Mobile overlay */}
      {isMobile() && <div className={`mob-overlay ${sidebarOpen ? "vis" : ""}`} onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? "expanded" : ""}`}>

        {/* Brand / toggle */}
        <div className="sb-brand" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
          <div className="sb-brand-icon">🏆</div>
          <div className="sb-brand-text">
            <div className="sb-brand-name">Sports Dept.</div>
            <div className="sb-brand-sub">Data Management</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`sb-nav-item ${page === id ? "active" : ""}`}
              onClick={() => handleNav(id)}
              title={label}
            >
              <Icon />
              <span className="sb-item-lbl">{label}</span>
              <span className="sb-tip">{label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="sb-bottom">
          <RoleSwitcher activeRole={activeRole} onSwitch={switchRole} />
          <button className="sb-logout-btn" onClick={logout} title="Logout">
            <Ic.Logout />
            <span className="sb-logout-lbl">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ad-main">
        {/* Topbar */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              <Ic.Menu />
            </button>
            <span className="ad-page-title">{currentLabel}</span>
          </div>
          <div className="ad-topbar-right">
            <span className="ad-org">Dr. Sivanthi Aditanar College of Engineering</span>
            <div className="ad-avatar" title={`Role: ${activeRole}`}>
              {activeRole.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="ad-content">
          {page === "directors"   && <DirectorManagement />}
          {page === "achievement" && <AchievementPage/>}
          {page==="audit"&&(
              <div className="card page-enter">
                <div className="card-topbar">
                  <div className="card-title"><span className="ct-icon">📊</span>Audit Logs</div>
                </div>
                <div style={{padding:"20px 24px 24px"}}><AuditLogs/></div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}









