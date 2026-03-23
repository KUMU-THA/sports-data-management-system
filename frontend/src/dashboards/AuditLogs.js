import { useEffect, useState, useCallback } from "react";

/* ─── Inject Styles ──────────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("audit-styles")) return;
  const s = document.createElement("style");
  s.id = "audit-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

    @keyframes auFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes auFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes auRow     { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes auSpin    { to{transform:rotate(360deg)} }
    @keyframes auMsg     { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes auPulse   { 0%,100%{opacity:1} 50%{opacity:.5} }

    .au-root { font-family:'Inter',sans-serif; }

    /* header */
    .au-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:12px; animation:auFadeUp .35s ease; }
    .au-title  { font-family:'Sora',sans-serif; font-weight:800; font-size:21px; color:#0f172a; }
    .au-sub    { font-size:13px; color:#64748b; margin-top:3px; }

    /* stats */
    .au-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:12px; margin-bottom:18px; }
    .au-stat  {
      background:white; border-radius:14px; padding:15px 17px;
      border:1px solid #f1f5f9; animation:auFadeUp .4s ease both;
      transition:transform .18s, box-shadow .18s;
    }
    .au-stat:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }
    .au-stat-val { font-family:'Sora',sans-serif; font-weight:800; font-size:26px; color:#2563eb; }
    .au-stat-lbl { font-size:12px; color:#64748b; margin-top:2px; }

    /* main card */
    .au-card {
      background:white; border-radius:16px; border:1px solid #f1f5f9;
      overflow:hidden; box-shadow:0 2px 14px rgba(0,0,0,.04);
      animation:auFadeUp .42s ease both;
    }

    /* toolbar */
    .au-toolbar {
      padding:13px 16px; background:#fafbfc; border-bottom:1px solid #f1f5f9;
      display:flex; gap:8px; align-items:center; flex-wrap:wrap;
    }
    .au-sel {
      padding:8px 11px; border-radius:9px; border:1.5px solid #e2e8f0;
      font-family:'Inter',sans-serif; font-size:13px; color:#334155;
      background:white; cursor:pointer; outline:none; transition:border .2s;
      min-width:120px;
    }
    .au-sel:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.11); }
    .au-date-input {
      padding:8px 11px; border-radius:9px; border:1.5px solid #e2e8f0;
      font-family:'Inter',sans-serif; font-size:13px; color:#334155;
      background:white; outline:none; transition:border .2s; min-width:130px;
    }
    .au-date-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.11); }
    .au-date-label { font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; white-space:nowrap; }
    .au-date-grp { display:flex; align-items:center; gap:6px; }

    .au-spacer { flex:1; }

    .au-clear-btn {
      padding:8px 13px; border-radius:9px; border:1.5px solid #e2e8f0;
      background:white; font-size:12px; font-weight:600; color:#64748b;
      cursor:pointer; font-family:'Inter',sans-serif; white-space:nowrap;
      transition:all .15s;
    }
    .au-clear-btn:hover { border-color:#cbd5e1; color:#334155; }

    .au-apply-btn {
      display:inline-flex; align-items:center; gap:7px;
      padding:8px 16px; border-radius:9px; border:none;
      background:linear-gradient(135deg,#2563eb,#1e40af);
      color:white; font-size:13px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .18s;
      box-shadow:0 3px 10px rgba(37,99,235,.28); white-space:nowrap;
    }
    .au-apply-btn:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(37,99,235,.38); }

    .au-export-btn {
      display:inline-flex; align-items:center; gap:7px;
      padding:8px 16px; border-radius:9px; border:none;
      background:linear-gradient(135deg,#059669,#047857);
      color:white; font-size:13px; font-weight:600; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all .18s;
      box-shadow:0 3px 10px rgba(5,150,105,.25); white-space:nowrap;
    }
    .au-export-btn:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(5,150,105,.35); }
    .au-export-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

    /* live indicator */
    .au-live {
      display:inline-flex; align-items:center; gap:6px;
      font-size:12px; font-weight:600; color:#059669;
      background:#f0fdf4; padding:5px 11px; border-radius:20px;
      border:1px solid #bbf7d0;
    }
    .au-live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; animation:auPulse 1.8s ease infinite; }

    /* table */
    .au-table-wrap { overflow-x:auto; }
    .au-tbl { width:100%; border-collapse:collapse; min-width:600px; }
    .au-tbl th {
      padding:10px 16px; text-align:left; font-size:11px; font-weight:700;
      text-transform:uppercase; letter-spacing:.6px; color:#64748b;
      background:#f8fafc; border-bottom:1px solid #f1f5f9; white-space:nowrap;
    }
    .au-tbl td { padding:13px 16px; border-bottom:1px solid #f8fafc; font-size:13px; color:#334155; vertical-align:top; }
    .au-row { animation:auRow .3s ease both; transition:background .12s; }
    .au-row:hover td { background:#f4f8ff; }
    .au-row:last-child td { border-bottom:none; }

    /* role badge */
    .au-role-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:11.5px; font-weight:700; text-transform:capitalize; }
    .au-role-admin    { background:#eff6ff; color:#1d4ed8; }
    .au-role-director { background:#f0fdf4; color:#15803d; }
    .au-role-staff    { background:#fef9c3; color:#a16207; }
    .au-role-default  { background:#f1f5f9; color:#475569; }

    /* action badge */
    .au-action-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:7px; font-size:11.5px; font-weight:600; background:#f1f5f9; color:#334155; }
    .au-action-create { background:#dcfce7; color:#15803d; }
    .au-action-delete { background:#fee2e2; color:#dc2626; }
    .au-action-update { background:#dbeafe; color:#2563eb; }
    .au-action-login  { background:#fef9c3; color:#a16207; }
    .au-action-logout { background:#f5f3ff; color:#7c3aed; }

    /* desc */
    .au-desc { color:#475569; max-width:280px; line-height:1.45; }

    /* time */
    .au-time-cell { white-space:nowrap; }
    .au-time-main { font-size:12.5px; font-weight:500; color:#334155; }
    .au-time-rel  { font-size:11px; color:#94a3b8; margin-top:2px; }

    .au-empty { text-align:center; padding:48px 20px; }
    .au-empty-ic { font-size:44px; margin-bottom:12px; }

    .au-footer { padding:10px 16px; background:#fafbfc; border-top:1px solid #f1f5f9; font-size:12px; color:#64748b; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }

    .au-spinner { width:18px; height:18px; border:2px solid rgba(37,99,235,.2); border-top-color:#2563eb; border-radius:50%; animation:auSpin .7s linear infinite; }
    .au-spinner-sm { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:auSpin .7s linear infinite; }

    /* loading skeleton */
    .au-skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:auSpin 1.2s linear infinite; border-radius:6px; height:14px; }

    @media (max-width:768px) {
      .au-toolbar { padding:10px 12px; }
      .au-date-label { display:none; }
      .au-tbl th:nth-child(3), .au-tbl td:nth-child(3) { display:none; }
      .au-live { display:none; }
    }
    @media (max-width:500px) {
      .au-stats { grid-template-columns:1fr 1fr; }
      .au-export-btn span { display:none; }
      .au-apply-btn span  { display:none; }
      .au-date-input { min-width:110px; }
    }
  `;
  document.head.appendChild(s);
};
injectStyles();

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const Ic = {
  Filter:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>,
  Download: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Refresh:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Log:      () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const getRoleBadgeClass = (role) => {
  if (!role) return "au-role-default";
  const r = role.toLowerCase();
  if (r === "admin") return "au-role-admin";
  if (r === "director") return "au-role-director";
  if (r === "staff") return "au-role-staff";
  return "au-role-default";
};

const getRoleEmoji = (role) => {
  if (!role) return "👤";
  const r = role.toLowerCase();
  if (r === "admin") return "🛡️";
  if (r === "director") return "🎯";
  if (r === "staff") return "👥";
  return "👤";
};

const getActionBadgeClass = (action) => {
  if (!action) return "au-action-badge";
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add")) return "au-action-badge au-action-create";
  if (a.includes("delete") || a.includes("remove")) return "au-action-badge au-action-delete";
  if (a.includes("update") || a.includes("edit") || a.includes("change")) return "au-action-badge au-action-update";
  if (a.includes("login") || a.includes("signin")) return "au-action-badge au-action-login";
  if (a.includes("logout") || a.includes("signout")) return "au-action-badge au-action-logout";
  return "au-action-badge";
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

/* ─── Main Component ─────────────────────────────────────────────────────────── */
function AuditLogs() {
  const token = localStorage.getItem("token");

  const [logs, setLogs]         = useState([]);
  const [role, setRole]         = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  /* fetch */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = "http://127.0.0.1:5000/admin/audit-logs?";
      if (role)     url += `role=${role}&`;
      if (fromDate) url += `from=${fromDate}&`;
      if (toDate)   url += `to=${toDate}&`;

      const res  = await fetch(url, { headers: { Authorization: "Bearer " + token } });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
      alert("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [role, fromDate, toDate, token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /* clear */
  const clearFilters = () => { setRole(""); setFromDate(""); setToDate(""); };
  const hasFilters   = role || fromDate || toDate;

  /* export CSV */
  const exportCSV = () => {
    if (logs.length === 0) { alert("No logs to export"); return; }
    setExporting(true);
    setTimeout(() => {
      const headers = ["Role", "Action", "Description", "Date & Time"];
      const rows    = logs.map(log => [
        log.actor_role,
        log.action,
        `"${(log.description || "").replace(/"/g, '""')}"`,
        new Date(log.created_at).toLocaleString(),
      ]);
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 400);
  };

  /* stats */
  const adminCount    = logs.filter(l => l.actor_role?.toLowerCase() === "admin").length;
  const directorCount = logs.filter(l => l.actor_role?.toLowerCase() === "director").length;
  const staffCount    = logs.filter(l => l.actor_role?.toLowerCase() === "staff").length;

  return (
    <div className="au-root">

      {/* Header */}
      <div className="au-header">
        <div>
          <div className="au-title">Audit Logs</div>
          <div className="au-sub">Track all system activity and user actions</div>
        </div>
        <div className="au-live">
          <span className="au-live-dot" />
          Live Tracking
        </div>
      </div>

      {/* Stats */}
      <div className="au-stats">
        {[
          { val: logs.length,    lbl: "Total Logs",   delay: "0s"   },
          { val: adminCount,     lbl: "Admin",         delay: ".07s" },
          { val: directorCount,  lbl: "Director",      delay: ".14s" },
          { val: staffCount,     lbl: "Staff",         delay: ".21s" },
        ].map((s, i) => (
          <div key={i} className="au-stat" style={{ animationDelay: s.delay }}>
            <div className="au-stat-val">{s.val}</div>
            <div className="au-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="au-card">

        {/* Toolbar */}
        <div className="au-toolbar">
          {/* Role filter */}
          <select className="au-sel" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">🛡️ Admin</option>
            <option value="director">🎯 Director</option>
            <option value="staff">👥 Staff</option>
          </select>

          {/* Date range */}
          <div className="au-date-grp">
            <span className="au-date-label">From</span>
            <input className="au-date-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="au-date-grp">
            <span className="au-date-label">To</span>
            <input className="au-date-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>

          {hasFilters && (
            <button className="au-clear-btn" onClick={clearFilters}>✕ Clear</button>
          )}

          <div className="au-spacer" />

          {/* Apply + Export */}
          <button className="au-apply-btn" onClick={fetchLogs}>
            <Ic.Filter /><span>Apply Filter</span>
          </button>
          <button className="au-export-btn" onClick={exportCSV} disabled={exporting || logs.length === 0}>
            {exporting ? <div className="au-spinner-sm" /> : <Ic.Download />}
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table body */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "56px", gap: 12 }}>
            <div className="au-spinner" />
            <span style={{ fontSize: 13, color: "#64748b" }}>Loading logs…</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="au-empty">
            <div className="au-empty-ic">📋</div>
            <div style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>No audit logs found</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              {hasFilters ? "Try adjusting your filters" : "No system activity recorded yet"}
            </div>
          </div>
        ) : (
          <div className="au-table-wrap">
            <table className="au-tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="au-row" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td style={{ color: "#94a3b8", width: 36 }}>{i + 1}</td>
                    <td>
                      <span className={`au-role-badge ${getRoleBadgeClass(log.actor_role)}`}>
                        {getRoleEmoji(log.actor_role)} {log.actor_role || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <span className={getActionBadgeClass(log.action)}>
                        {log.action || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="au-desc">{log.description || "—"}</div>
                    </td>
                    <td className="au-time-cell">
                      <div className="au-time-main">
                        {new Date(log.created_at).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                      <div className="au-time-rel">{timeAgo(log.created_at)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="au-footer">
          <span>
            Showing <strong>{logs.length}</strong> log{logs.length !== 1 ? "s" : ""}
            {hasFilters && " · filtered"}
          </span>
          {lastRefresh && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 11 }}>
              <Ic.Refresh />
              Last updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
