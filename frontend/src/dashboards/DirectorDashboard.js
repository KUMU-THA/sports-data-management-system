import { useEffect, useState, useCallback, useRef } from "react";
import AchievementPage from "../components/AchievementPage";

/* ─── Inject Styles ──────────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("dir-dash-styles")) return;
  const s = document.createElement("style");
  s.id = "dir-dash-styles";
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
      --red-500: #ef4444;
      --red-100: #fee2e2;
      --green-500: #22c55e;
      --green-100: #dcfce7;
      --sidebar-w: 68px;
      --topbar-h: 60px;
    }

    @keyframes dirFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes dirFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes dirScaleIn { from{opacity:0;transform:scale(.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes dirRow     { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes dirSpin    { to{transform:rotate(360deg)} }
    @keyframes dirTipIn   { from{opacity:0;transform:translateY(-50%) translateX(-6px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }
    @keyframes dirSlideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:1000px} }

    .dir-root { display:flex; height:100dvh; background:#edf0f7; font-family:'Inter',sans-serif; overflow:hidden; }

    /* ── Sidebar ── */
    .dir-sb {
      width:var(--sidebar-w); flex-shrink:0;
      background:linear-gradient(175deg, var(--blue-900) 0%, var(--blue-800) 55%, var(--blue-700) 100%);
      display:flex; flex-direction:column; align-items:center;
      position:relative; z-index:100;
      box-shadow:4px 0 28px rgba(12,31,94,.4);
      transition:width .28s cubic-bezier(.4,0,.2,1);
      overflow:hidden;
    }
    .dir-sb.open { width:240px; }

    .dir-brand {
      width:100%; padding:16px 0 14px;
      display:flex; align-items:center; justify-content:center;
      border-bottom:1px solid rgba(255,255,255,.08);
      cursor:pointer; overflow:hidden; flex-shrink:0;
      transition:padding .28s;
    }
    .dir-sb.open .dir-brand { justify-content:flex-start; padding-left:16px; }
    .dir-brand-icon {
      width:38px; height:38px; flex-shrink:0; border-radius:10px;
      background:white; display:flex; align-items:center; justify-content:center;
      font-size:19px; box-shadow:0 3px 10px rgba(0,0,0,.3); min-width:38px;
      transition:transform .2s;
    }
    .dir-brand:hover .dir-brand-icon { transform:scale(1.06); }
    .dir-brand-text { overflow:hidden; max-width:0; opacity:0; margin-left:0; white-space:nowrap; transition:max-width .28s, opacity .22s, margin .28s; }
    .dir-sb.open .dir-brand-text { max-width:160px; opacity:1; margin-left:10px; }
    .dir-brand-name { font-family:'Sora',sans-serif; font-size:12.5px; font-weight:700; color:white; line-height:1.3; }
    .dir-brand-sub  { font-size:9.5px; color:rgba(255,255,255,.42); letter-spacing:1.1px; text-transform:uppercase; }

    /* nav section header */
    .dir-sb-sec {
      width:100%; padding:10px 10px 4px;
      font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
      color:rgba(255,255,255,.3); overflow:hidden;
      white-space:nowrap; opacity:0; max-height:0;
      transition:opacity .2s, max-height .28s;
    }
    .dir-sb.open .dir-sb-sec { opacity:1; max-height:30px; }

    .dir-nav { flex:1; width:100%; padding:10px 0; display:flex; flex-direction:column; align-items:center; overflow-y:auto; overflow-x:hidden; gap:2px; }
    .dir-nav-item {
      position:relative; width:calc(100% - 14px); margin:0 7px;
      border:none; background:transparent; cursor:pointer;
      display:flex; align-items:center;
      height:44px; border-radius:11px;
      color:rgba(255,255,255,.5); transition:all .18s;
      padding:0 13px; gap:12px; overflow:hidden;
    }
    .dir-nav-item:hover { background:rgba(255,255,255,.1); color:white; }
    .dir-nav-item.active {
      background:rgba(255,255,255,.14); color:white;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);
    }
    .dir-nav-item.active::before {
      content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
      width:3px; height:22px; background:white; border-radius:0 3px 3px 0;
    }
    .dir-nav-item svg { flex-shrink:0; min-width:18px; }
    .dir-item-lbl {
      font-size:13px; font-weight:500; white-space:nowrap;
      overflow:hidden; max-width:0; opacity:0;
      transition:max-width .28s, opacity .22s;
    }
    .dir-sb.open .dir-item-lbl { max-width:160px; opacity:1; }
    .dir-tip {
      position:absolute; left:calc(var(--sidebar-w) + 6px); top:50%;
      transform:translateY(-50%) translateX(-6px);
      background:var(--slate-900); color:white; font-size:12px; font-weight:600;
      padding:5px 11px; border-radius:8px; white-space:nowrap; pointer-events:none;
      opacity:0; font-family:'Inter',sans-serif; z-index:200;
    }
    .dir-sb:not(.open) .dir-nav-item:hover .dir-tip { opacity:1; animation:dirTipIn .15s ease forwards; }
    .dir-sb.open .dir-tip { display:none; }

    .dir-divider { width:calc(100% - 24px); height:1px; background:rgba(255,255,255,.08); margin:6px 12px; flex-shrink:0; }

    .dir-sb-bottom { width:100%; padding:10px 7px; border-top:1px solid rgba(255,255,255,.08); display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
    .dir-logout-btn {
      width:100%; height:44px; border-radius:11px; border:none;
      background:rgba(239,68,68,.12); color:#fca5a5;
      display:flex; align-items:center; justify-content:center; gap:11px;
      cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
      transition:all .18s; overflow:hidden; padding:0 13px;
    }
    .dir-logout-btn:hover { background:rgba(239,68,68,.25); color:#fecaca; }
    .dir-logout-btn svg { flex-shrink:0; min-width:18px; }
    .dir-logout-lbl { white-space:nowrap; overflow:hidden; max-width:0; opacity:0; transition:max-width .28s, opacity .22s; }
    .dir-sb.open .dir-logout-lbl { max-width:80px; opacity:1; }

    /* ── Main ── */
    .dir-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
    .dir-topbar {
      height:var(--topbar-h); background:white; border-bottom:1px solid var(--slate-100);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 22px; flex-shrink:0; box-shadow:0 1px 6px rgba(0,0,0,.04);
    }
    .dir-topbar-left  { display:flex; align-items:center; gap:14px; }
    .dir-hamburger {
      width:34px; height:34px; border-radius:9px; border:none;
      background:var(--slate-100); cursor:pointer; display:flex;
      align-items:center; justify-content:center; color:var(--slate-700);
      transition:background .15s; flex-shrink:0;
    }
    .dir-hamburger:hover { background:var(--slate-200); }
    .dir-page-title { font-family:'Sora',sans-serif; font-weight:700; font-size:16px; color:var(--slate-900); }
    .dir-topbar-right { display:flex; align-items:center; gap:12px; }
    .dir-org { font-size:12px; color:var(--slate-500); white-space:nowrap; }
    .dir-avatar {
      width:34px; height:34px; border-radius:50%;
      background:linear-gradient(135deg,#059669,#047857);
      color:white; font-weight:700; font-size:13px;
      display:flex; align-items:center; justify-content:center;
      font-family:'Sora',sans-serif; box-shadow:0 2px 8px rgba(5,150,105,.3); flex-shrink:0;
    }

    /* ── Content ── */
    .dir-content { flex:1; overflow-y:auto; padding:22px; }

    /* ── Page sections ── */
    .pg-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:12px; animation:dirFadeUp .35s ease; }
    .pg-title { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:var(--slate-900); }
    .pg-sub   { font-size:13px; color:var(--slate-500); margin-top:3px; }

    .stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:12px; margin-bottom:18px; }
    .stat-card {
      background:white; border-radius:14px; padding:15px 17px;
      border:1px solid var(--slate-100); animation:dirFadeUp .4s ease both;
      transition:transform .18s, box-shadow .18s;
    }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }
    .stat-val { font-family:'Sora',sans-serif; font-weight:800; font-size:26px; color:var(--blue-600); }
    .stat-lbl { font-size:12px; color:var(--slate-500); margin-top:2px; }

    /* ── Table card ── */
    .tbl-card { background:white; border-radius:16px; border:1px solid var(--slate-100); overflow:hidden; box-shadow:0 2px 14px rgba(0,0,0,.04); animation:dirFadeUp .45s ease both; }
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
    .fil-sel {
      padding:8px 11px; border-radius:9px; border:1.5px solid var(--slate-200);
      font-family:'Inter',sans-serif; font-size:13px; color:var(--slate-700);
      background:white; cursor:pointer; outline:none; transition:border .2s; min-width:120px;
    }
    .fil-sel:focus { border-color:var(--blue-500); }
    .clr-btn {
      padding:8px 13px; border-radius:9px; border:1.5px solid var(--slate-200);
      background:white; font-size:12px; font-weight:600; color:var(--slate-500);
      cursor:pointer; font-family:'Inter',sans-serif; white-space:nowrap; transition:all .15s;
    }
    .clr-btn:hover { border-color:#cbd5e1; color:var(--slate-700); }

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
    /* Role switcher */
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
.dir-sb.open .sb-role-lbl { max-width:120px; opacity:1; }

.role-dd-wrap { position:relative; width:100%; }
.role-dd {
  position:absolute; bottom:calc(100% + 8px); left:0;
  background:white; border-radius:14px; overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.1);
  animation:dirScaleIn .18s ease; transform-origin:bottom left;
  min-width:190px; z-index:300;
}
.dir-sb:not(.open) .role-dd { left:calc(var(--sidebar-w) + 8px); bottom:0; }
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
    /* ── Generic table ── */
    .g-tbl { width:100%; border-collapse:collapse; }
    .g-tbl th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--slate-500); background:var(--slate-50); border-bottom:1px solid var(--slate-100); white-space:nowrap; }
    .g-tbl td { padding:12px 16px; border-bottom:1px solid #f8fafc; font-size:13px; color:var(--slate-700); }
    .g-row { animation:dirRow .3s ease both; transition:background .12s; }
    .g-row:hover td { background:#f4f8ff; }
    .g-row:last-child td { border-bottom:none; }

    .av-cell { display:flex; align-items:center; gap:10px; }
    .av-ring { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--blue-600),var(--blue-500)); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; flex-shrink:0; }
    .av-name { font-weight:600; color:var(--slate-900); }

    .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:11.5px; font-weight:600; }
    .badge-blue   { background:var(--blue-100); color:#1d4ed8; }
    .badge-green  { background:var(--green-100); color:#15803d; }
    .badge-yellow { background:#fef9c3; color:#a16207; }
    .badge-purple { background:#f5f3ff; color:#7c3aed; }
    .bdot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }

    .act-grp { display:flex; gap:6px; }
    .btn-edit-sm {
      display:inline-flex; align-items:center; gap:5px;
      padding:6px 11px; border-radius:8px; border:none;
      background:var(--blue-50); color:#1d4ed8;
      font-size:12px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .15s;
    }
    .btn-edit-sm:hover { background:var(--blue-600); color:white; }
    .btn-del-sm {
      display:inline-flex; align-items:center; gap:5px;
      padding:6px 11px; border-radius:8px; border:none;
      background:var(--red-100); color:var(--red-500);
      font-size:12px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .15s;
    }
    .btn-del-sm:hover { background:var(--red-500); color:white; }

    .tbl-footer { padding:10px 16px; background:#fafbfc; border-top:1px solid var(--slate-100); font-size:12px; color:var(--slate-500); }
    .empty-st { text-align:center; padding:40px 20px; }
    .empty-ic { font-size:40px; margin-bottom:10px; }

    /* ── Modal ── */
    .mod-overlay {
      position:fixed; inset:0; background:rgba(15,23,42,.52);
      backdrop-filter:blur(6px); z-index:400;
      display:flex; align-items:center; justify-content:center;
      animation:dirFadeIn .18s ease; padding:16px;
    }
    .mod-box {
      background:white; border-radius:20px; padding:26px;
      width:100%; max-width:460px;
      animation:dirScaleIn .22s cubic-bezier(.34,1.56,.64,1);
      box-shadow:0 28px 70px rgba(0,0,0,.22); max-height:90dvh; overflow-y:auto;
    }
    .mod-hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
    .mod-title { font-family:'Sora',sans-serif; font-weight:700; font-size:19px; color:var(--slate-900); }
    .mod-sub   { font-size:12.5px; color:var(--slate-500); margin-top:3px; }
    .mod-close { width:30px; height:30px; border-radius:8px; border:none; background:var(--slate-100); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#475569; transition:background .13s; }
    .mod-close:hover { background:var(--slate-200); }
    .mod-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .mod-field { display:flex; flex-direction:column; gap:5px; }
    .mod-field.full { grid-column:1 / -1; }
    .mod-field label { font-size:11px; font-weight:700; color:#475569; letter-spacing:.4px; text-transform:uppercase; }
    .mod-field input, .mod-field textarea, .mod-field select {
      padding:10px 13px; border-radius:9px; border:1.5px solid var(--slate-200);
      font-family:'Inter',sans-serif; font-size:13.5px; color:var(--slate-900);
      background:var(--slate-50); transition:all .18s; outline:none; resize:none;
    }
    .mod-field input:focus, .mod-field textarea:focus, .mod-field select:focus {
      border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.11); background:white;
    }
    .mod-acts { display:flex; gap:10px; justify-content:flex-end; margin-top:22px; flex-wrap:wrap; }
    .btn-cancel { padding:9px 18px; border-radius:10px; border:1.5px solid var(--slate-200); background:white; font-size:13px; font-weight:600; color:#475569; cursor:pointer; font-family:'Inter',sans-serif; transition:all .15s; }
    .btn-cancel:hover { background:var(--slate-50); }

    .spinner    { width:18px; height:18px; border:2px solid rgba(37,99,235,.2); border-top-color:var(--blue-600); border-radius:50%; animation:dirSpin .7s linear infinite; }
    .spinner-sm { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:dirSpin .7s linear infinite; }

    /* mobile overlay */
    .mob-veil { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99; animation:dirFadeIn .18s ease; }
    .mob-veil.show { display:block; }

    @media (max-width:900px) { .dir-org { display:none; } }
    @media (max-width:768px) {
      .dir-sb { position:fixed; top:0; left:0; height:100dvh; z-index:100; transform:translateX(-100%); transition:transform .28s cubic-bezier(.4,0,.2,1), width .28s; width:var(--sidebar-w) !important; }
      .dir-sb.open { transform:translateX(0); width:240px !important; }
      .dir-content { padding:14px; }
      .g-tbl th:nth-child(4), .g-tbl td:nth-child(4) { display:none; }
    }
    @media (max-width:500px) {
      .stat-row { grid-template-columns:1fr 1fr; }
      .mod-grid { grid-template-columns:1fr; }
      .mod-field.full { grid-column:1; }
      .btn-edit-sm span, .btn-del-sm span { display:none; }
    }
      
  `;
  document.head.appendChild(s);
};
injectStyles();

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const Ic = {
  Menu:    () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Staff:   () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Switch: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>,
  Check:  () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
  Event:   () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Trophy:  () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  Logout:  () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Edit:    () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:   () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Close:   () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Save:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>,
};

const NAV = [
  { id: "staff",       label: "Staff Management",  Icon: Ic.Staff,  group: "People"  },
  { id: "events",      label: "Event Management",  Icon: Ic.Event,  group: "Events"  },
  { id: "achievement", label: "Achievement Records",Icon: Ic.Trophy, group: "Records" },
];
const ROLES = [
  { id: "director", label: "Director Mode", color: "#059669" },
  { id: "staff",    label: "Staff Mode",    color: "#d97706" },
  { id: "student",  label: "Student Mode",  color: "#7c3aed" },
];
// role switch 
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
/* ─── Staff Modal ────────────────────────────────────────────────────────────── */
function StaffModal({ mode, staff, onClose, onSave }) {
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState(staff?.username || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSave = async () => {
    if (mode === "create" && !username.trim()) { alert("Enter a username"); return; }
    if (!password.trim()) { alert("Enter a password"); return; }
    setLoading(true);
    try {
      if (mode === "create") {
        const res  = await fetch("http://127.0.0.1:5000/director/create-staff", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json(); alert(data.message);
      } else {
        const res  = await fetch("http://127.0.0.1:5000/director/update-staff-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ username: staff.username, newPassword: password }),
        });
        const data = await res.json(); alert(data.message);
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
            <div className="mod-title">{mode === "create" ? "Create Staff" : "Edit Staff"}</div>
            <div className="mod-sub">{mode === "create" ? "Add a new staff account" : `Update password for ${staff?.username}`}</div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close /></button>
        </div>
        <div className="mod-grid">
          {mode === "create" && (
            <div className="mod-field full">
              <label>Username</label>
              <input placeholder="e.g. staff_john" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </div>
          )}
          <div className="mod-field full">
            <label>{mode === "create" ? "Password" : "New Password"}</label>
            <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} />
          </div>
        </div>
        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading && <div className="spinner-sm" />}
            {mode === "create" ? "Create Staff" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Event Modal ────────────────────────────────────────────────────────────── */
function EventModal({ mode, event, onClose, onSave }) {
  const token = localStorage.getItem("token");
  const emptyEv = { title:"", description:"", event_type:"internal", event_date:"", last_registration_date:"" };
  const [form, setForm]     = useState(event ? {
    title: event.title || "",
    description: event.description || "",
    event_type: event.event_type || "internal",
    event_date: event.event_date ? event.event_date.split("T")[0] : "",
    last_registration_date: event.last_registration_date ? event.last_registration_date.split("T")[0] : "",
  } : emptyEv);
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.event_date || !form.last_registration_date) {
      alert("Title, Event Date and Last Registration Date are required"); return;
    }
    setLoading(true);
    try {
      if (mode === "create") {
        const res  = await fetch("http://127.0.0.1:5000/director/events", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify(form),
        });
        const data = await res.json(); alert(data.message);
      } else {
        const res  = await fetch(`http://127.0.0.1:5000/director/events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify(form),
        });
        const data = await res.json(); alert(data.message);
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
            <div className="mod-title">{mode === "create" ? "Create Event" : "Edit Event"}</div>
            <div className="mod-sub">{mode === "create" ? "Schedule a new event" : `Editing: ${event?.title}`}</div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close /></button>
        </div>
        <div className="mod-grid">
          <div className="mod-field full">
            <label>Event Title </label>
            <input placeholder="e.g. Inter-College Basketball Tournament" value={form.title} onChange={f("title")} autoFocus />
          </div>
          <div className="mod-field full">
            <label>Description</label>
            <textarea rows={3} placeholder="Details about the event…" value={form.description} onChange={f("description")} />
          </div>
          <div className="mod-field">
            <label>Event Type</label>
            <select value={form.event_type} onChange={f("event_type")}>
              <option value="internal">🏫 Internal</option>
              <option value="external">🌐 External</option>
            </select>
          </div>
          <div className="mod-field">
            <label>Event Date *</label>
            <input type="date" value={form.event_date} onChange={f("event_date")} />
          </div>
          <div className="mod-field full">
            <label>Last Registration Date *</label>
            <input type="date" value={form.last_registration_date} onChange={f("last_registration_date")} />
          </div>
        </div>
        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading && <div className="spinner-sm" />}
            {mode === "create" ? "Create Event" : "Update Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Staff Management ───────────────────────────────────────────────────────── */
function StaffManagement() {
  const token = localStorage.getItem("token");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [sortBy, setSortBy]       = useState("az");
  const [modal, setModal]         = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://127.0.0.1:5000/director/staff", { headers: { Authorization: "Bearer " + token } });
      const data = await res.json();
      setStaffList(Array.isArray(data) ? data : []);
    } catch { setStaffList([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const deleteStaff = async (id, uname) => {
    if (!window.confirm(`Delete staff "${uname}"?`)) return;
    const res  = await fetch(`http://127.0.0.1:5000/director/delete-staff/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    const data = await res.json(); alert(data.message); fetchStaff();
  };

  const hasFilters = search || sortBy !== "az";
  const filtered = staffList
    .filter(s => s.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "az" ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username));

  return (
    <div>
      {modal && <StaffModal mode={modal.mode} staff={modal.staff} onClose={() => setModal(null)} onSave={fetchStaff} />}
      <div className="pg-hdr">
        <div>
          <div className="pg-title">Staff Management</div>
          <div className="pg-sub">Manage and monitor all staff accounts</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ mode:"create" })}><Ic.Plus /> Create Staff</button>
      </div>
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-val">{staffList.length}</div>
          <div className="stat-lbl">Total Staff</div>
        </div>
      </div>
      <div className="tbl-card">
        <div className="tbl-toolbar">
          <div className="srch-wrap">
            <Ic.Search />
            <input className="srch-in" placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="fil-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="az">Name A → Z</option>
            <option value="za">Name Z → A</option>
          </select>
          {hasFilters && <button className="clr-btn" onClick={() => { setSearch(""); setSortBy("az"); }}>✕ Clear</button>}
        </div>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"48px" }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-st"><div className="empty-ic">👥</div>
            <div style={{ fontWeight:600, color:"#334155", marginBottom:4 }}>No staff found</div>
            <div style={{ fontSize:13, color:"#64748b" }}>Adjust filters or create a new staff member</div>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="g-tbl">
              <thead><tr><th></th><th>Staff</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="g-row" style={{ animationDelay:`${i*.04}s` }}>
                    <td style={{ color:"#94a3b8", width:36 }}>{i+1}</td>
                    <td><div className="av-cell"><div className="av-ring">{s.username.charAt(0).toUpperCase()}</div><span className="av-name">{s.username}</span></div></td>
                    <td><span className="badge badge-yellow">Staff</span></td>
                    <td><span className="badge badge-green"><span className="bdot" />Active</span></td>
                    <td>
                      <div className="act-grp">
                        <button className="btn-edit-sm" onClick={() => setModal({ mode:"edit", staff:s })}><Ic.Edit /><span>Edit</span></button>
                        <button className="btn-del-sm" onClick={() => deleteStaff(s.id, s.username)}><Ic.Trash /><span>Delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="tbl-footer">Showing <strong>{filtered.length}</strong> of <strong>{staffList.length}</strong> staff{hasFilters && " · filtered"}</div>
      </div>
    </div>
  );
}

/* ─── Event Management ───────────────────────────────────────────────────────── */
function EventManagement() {
  const token = localStorage.getItem("token");
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [typeFilter, setType] = useState("all");
  const [modal, setModal]     = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://127.0.0.1:5000/director/events", { headers: { Authorization: "Bearer " + token } });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const deleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    const res  = await fetch(`http://127.0.0.1:5000/director/events/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    const data = await res.json(); alert(data.message); fetchEvents();
  };

  const hasFilters = search || typeFilter !== "all";
  const filtered   = events
    .filter(e => e.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(e => typeFilter === "all" ? true : e.event_type === typeFilter);

  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  const isUpcoming = d => d && new Date(d) >= new Date();

  return (
    <div>
      {modal && <EventModal mode={modal.mode} event={modal.event} onClose={() => setModal(null)} onSave={fetchEvents} />}
      <div className="pg-hdr">
        <div>
          <div className="pg-title">Event Management</div>
          <div className="pg-sub">Schedule and manage sports events</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ mode:"create" })}><Ic.Plus /> Create Event</button>
      </div>
      <div className="stat-row">
        {[
          { val: events.length, lbl:"Total Events", delay:"0s" },
          { val: events.filter(e => e.event_type === "internal").length, lbl:"Internal", delay:".07s" },
          { val: events.filter(e => e.event_type === "external").length, lbl:"External", delay:".14s" },
          { val: events.filter(e => isUpcoming(e.event_date)).length,   lbl:"Upcoming", delay:".21s" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay:s.delay }}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="tbl-card">
        <div className="tbl-toolbar">
          <div className="srch-wrap">
            <Ic.Search />
            <input className="srch-in" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="fil-sel" value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="internal">🏫 Internal</option>
            <option value="external">🌐 External</option>
          </select>
          {hasFilters && <button className="clr-btn" onClick={() => { setSearch(""); setType("all"); }}>✕ Clear</button>}
        </div>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"48px" }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-st"><div className="empty-ic">📅</div>
            <div style={{ fontWeight:600, color:"#334155", marginBottom:4 }}>No events found</div>
            <div style={{ fontSize:13, color:"#64748b" }}>Adjust filters or create a new event</div>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="g-tbl">
              <thead>
                <tr><th></th><th>Title</th><th>Type</th><th>Created By</th><th>Event Date</th><th>Last Reg.</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr key={ev.id} className="g-row" style={{ animationDelay:`${i*.04}s` }}>
                    <td style={{ color:"#94a3b8", width:36 }}>{i+1}</td>
                    <td style={{ fontWeight:600, color:"#0f172a", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.title}</td>
                    <td>
                      <span className={`badge ${ev.event_type === "internal" ? "badge-blue" : "badge-purple"}`}>
                        {ev.event_type === "internal" ? "🏫 Internal" : "🌐 External"}
                      </span>
                    </td>
                    <td style={{ fontSize:12, color:"#64748b", textTransform:"capitalize" }}>{ev.creator_role || "—"}</td>
                    <td>
                      <div style={{ fontSize:12.5, fontWeight:500, color:"#334155" }}>{fmt(ev.event_date)}</div>
                      {isUpcoming(ev.event_date) && <div style={{ fontSize:11, color:"#059669", marginTop:2 }}>● Upcoming</div>}
                    </td>
                    <td style={{ fontSize:12, color:"#64748b" }}>{fmt(ev.last_registration_date)}</td>
                    <td>
                      <div className="act-grp">
                        <button className="btn-edit-sm" onClick={() => setModal({ mode:"edit", event:ev })}><Ic.Edit /><span>Edit</span></button>
                        <button className="btn-del-sm" onClick={() => deleteEvent(ev.id, ev.title)}><Ic.Trash /><span>Delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="tbl-footer">Showing <strong>{filtered.length}</strong> of <strong>{events.length}</strong> events{hasFilters && " · filtered"}</div>
      </div>
    </div>
  );
}


/* ─── Director Dashboard ─────────────────────────────────────────────────────── */
export default function DirectorDashboard() {
  const token = localStorage.getItem("token");
  const [activeRole, setActiveRole] = useState("director");
  const [page, setPage]             = useState("staff");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setActiveRole(payload.activeRole || "director");
    } catch {}
  }, [token]);
const handleRoleSwitch = async (roleId) => {
  try {
    const res = await fetch("http://127.0.0.1:5000/director/switch-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ newRole: roleId }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    localStorage.setItem("token", data.token);
    window.location.href = "/dashboard"; // redirects to role-based dashboard
  } catch {
    alert("Failed to switch role");
  }
};
  const logout = () => { localStorage.removeItem("token"); window.location.href = "/"; };
  const handleNav = id => { setPage(id); if (isMobile()) setSidebarOpen(false); };
  const currentLabel = NAV.find(n => n.id === page)?.label || "Dashboard";

  return (
    <div className="dir-root">
      {/* Mobile overlay */}
      <div className={`mob-veil ${sidebarOpen && isMobile() ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <aside className={`dir-sb ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="dir-brand" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
          <div className="dir-brand-icon">🎯</div>
          <div className="dir-brand-text">
            <div className="dir-brand-name">Director Panel</div>
            <div className="dir-brand-sub">Sports Dept.</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="dir-nav">
          {NAV.map(({ id, label, Icon, group }, idx) => {
            const prevGroup = idx > 0 ? NAV[idx - 1].group : null;
            return (
              <div key={id} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
                {group !== prevGroup && (
                  <>
                    {idx > 0 && <div className="dir-divider" />}
                    <div className="dir-sb-sec">{group}</div>
                  </>
                )}
                <button
                  className={`dir-nav-item ${page === id ? "active" : ""}`}
                  onClick={() => handleNav(id)}
                  title={label}
                >
                  <Icon />
                  <span className="dir-item-lbl">{label}</span>
                  <span className="dir-tip">{label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="dir-sb-bottom">
          <RoleSwitcher activeRole={activeRole} onSwitch={handleRoleSwitch} />
          <button className="dir-logout-btn" onClick={logout} title="Logout">
            <Ic.Logout />
            <span className="dir-logout-lbl">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dir-main">
        {/* Topbar */}
        <header className="dir-topbar">
          <div className="dir-topbar-left">
            <button className="dir-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              <Ic.Menu />
            </button>
            <span className="dir-page-title">{currentLabel}</span>
          </div>
          <div className="dir-topbar-right">
            <span className="dir-org">Dr. Sivanthi Aditanar College of Engineering</span>
            <div className="dir-avatar" title="Director">D</div>
          </div>
        </header>

        {/* Content */}
        <main className="dir-content">
          {page === "staff"       && <StaffManagement />}
          {page === "events"      && <EventManagement />}
          {page === "achievement" && <AchievementPage />}
        </main>
      </div>
    </div>
  );
}
