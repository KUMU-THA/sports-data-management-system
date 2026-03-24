import { useEffect, useState, useCallback } from "react";

const API = process.env.REACT_APP_API_URL;;

/* ── tiny helpers ── */
const fmt = d =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = t => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

/* ── Rating stars ── */
function Stars({ rating }) {
  if (!rating) return <span style={{ color: "#94a3b8", fontSize: 12 }}>Not rated</span>;
  const r = parseFloat(rating);
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {[2, 4, 6, 8, 10].map(v => (
        <svg key={v} width="13" height="13" viewBox="0 0 24 24" fill={r >= v - 1 ? "#f59e0b" : "#e2e8f0"} stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span style={{ fontSize: 12, color: "#64748b", marginLeft: 3 }}>{r}/10</span>
    </span>
  );
}

/* ── Attendance pill ── */
function AttPill({ present }) {
  if (present === true)  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:"#dcfce7", color:"#16a34a", fontSize:12, fontWeight:700 }}>✓ Present</span>;
  if (present === false) return <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#dc2626", fontSize:12, fontWeight:700 }}>✗ Absent</span>;
  return <span style={{ padding:"3px 10px", borderRadius:20, background:"#f1f5f9", color:"#94a3b8", fontSize:12, fontWeight:600 }}>Not marked</span>;
}

/* ════════════════════════════════════════════
   DETAIL VIEW — single program
════════════════════════════════════════════ */
function ProgramDetail({ programId, token, onBack }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/student/training/${programId}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then(r => r.json())
      .then(d => { if (d.message && !d.program) setError(d.message); else setData(d); })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [programId, token]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div className="spinner" />
    </div>
  );
  if (error) return (
    <div style={{ textAlign:"center", padding:48 }}>
      <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
      <div style={{ fontWeight:700, color:"#334155" }}>{error}</div>
      <button className="btn-register" style={{ marginTop:14 }} onClick={onBack}>← Back</button>
    </div>
  );

  const { program: p, summary: s, sessions, is_participant } = data;

  const attColor = pct => {
    if (!pct) return "#64748b";
    const v = parseFloat(pct);
    return v >= 75 ? "#16a34a" : v >= 50 ? "#d97706" : "#dc2626";
  };

  return (
    <div style={{ animation: "stuFadeUp .35s ease" }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, border:"1.5px solid var(--slate-200)", background:"white", fontSize:13, fontWeight:600, color:"var(--slate-700)", cursor:"pointer", marginBottom:18, transition:"all .15s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
        onMouseLeave={e => e.currentTarget.style.background = "white"}
      >
        ← Back to Training Programs
      </button>

      {/* Header card */}
      <div style={{ background:"linear-gradient(135deg,#1e40af,#2563eb)", borderRadius:18, padding:"22px 26px", marginBottom:18, color:"white", animation:"stuFadeUp .3s ease" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", opacity:.7, marginBottom:6 }}>
          🏟️ {p.event_title} · {p.event_type === "internal" ? "Internal" : "External"}
        </div>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22, marginBottom:10, lineHeight:1.3 }}>{p.program_title}</div>
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", fontSize:13, opacity:.85 }}>
          <span>📅 {fmt(p.from_date)} – {fmt(p.to_date)}</span>
          <span>🕐 {fmtTime(p.start_time)} – {fmtTime(p.end_time)}</span>
          {p.location && <span>📍 {p.location}</span>}
        </div>
        {!is_participant && (
          <div style={{ marginTop:12, padding:"8px 14px", borderRadius:9, background:"rgba(255,255,255,.15)", fontSize:13, fontWeight:600 }}>
            ℹ️ You are registered for this event but not yet added as a training participant by staff.
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="stat-row" style={{ marginBottom:18 }}>
        {[
          { val: s.total_sessions,        lbl: "Total Sessions",  color: "#2563eb" },
          { val: s.marked_sessions,       lbl: "Marked Sessions", color: "#7c3aed" },
          { val: s.present_count,         lbl: "Present",         color: "#16a34a" },
          { val: s.absent_count,          lbl: "Absent",          color: "#dc2626" },
          { val: s.attendance_percentage ? `${s.attendance_percentage}%` : "N/A", lbl: "Attendance", color: attColor(s.attendance_percentage) },
          { val: s.avg_rating ? `${s.avg_rating}/10` : "N/A",    lbl: "Avg Rating",  color: "#d97706" },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * .06}s` }}>
            <div className="stat-val" style={{ color: c.color, fontSize: 22 }}>{c.val}</div>
            <div className="stat-lbl">{c.lbl}</div>
          </div>
        ))}
      </div>

      {/* Sessions table */}
      <div className="tbl-card">
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--slate-100)", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:15, color:"var(--slate-900)" }}>
          📋 Session-wise Details
        </div>
        {sessions.length === 0 ? (
          <div className="empty-st">
            <div className="empty-ic">📆</div>
            <div className="empty-title">No sessions yet</div>
            <div className="empty-sub">Sessions will appear once staff schedules them</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="g-tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Attendance</th>
                  <th>Performance</th>
                  <th>Rating</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((ses, i) => (
                  <tr key={ses.session_id} className="g-row" style={{ animationDelay: `${i * .04}s` }}>
                    <td style={{ color: "#94a3b8", width: 32 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--slate-900)", whiteSpace:"nowrap" }}>{fmt(ses.session_date)}</td>
                    <td style={{ fontSize: 12, color: "#475569", whiteSpace:"nowrap" }}>
                      {fmtTime(ses.start_time)} – {fmtTime(ses.end_time)}
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{ses.location || "—"}</td>
                    <td>
                      <AttPill present={ses.present} />
                      {ses.att_remarks && (
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{ses.att_remarks}</div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "#334155", maxWidth: 180 }}>
                      {ses.performance_text || (ses.metric_value ? `${ses.metric_value} ${ses.metric_unit || ""}` : "—")}
                    </td>
                    <td><Stars rating={ses.rating} /></td>
                    <td style={{ fontSize: 12, color: "#64748b", maxWidth: 160 }}>{ses.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="tbl-footer">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} total
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   LIST VIEW — all programs
════════════════════════════════════════════ */
export default function MyTraining({ token }) {
  const [programs,  setPrograms]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null); // programId for detail
  const [search,    setSearch]    = useState("");

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/student/training`, { headers: { Authorization: "Bearer " + token } });
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch { setPrograms([]); }
    finally   { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  if (selected !== null)
    return <ProgramDetail programId={selected} token={token} onBack={() => setSelected(null)} />;

  const filtered = programs.filter(p =>
    p.program_title?.toLowerCase().includes(search.toLowerCase()) ||
    p.event_title?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = p => {
    const now  = new Date();
    const from = new Date(p.from_date);
    const to   = new Date(p.to_date);
    if (now < from) return { label: "Upcoming",   cls: "badge-blue"   };
    if (now > to)   return { label: "Completed",  cls: "badge-gray"   };
    return               { label: "Ongoing",    cls: "badge-green"  };
  };

  return (
    <div>
      <div className="pg-hdr">
        <div>
          <div className="pg-title">My Training Programs</div>
          <div className="pg-sub">Training sessions for events you have registered for</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        {[
          { val: programs.length,                                                                  lbl: "Total Programs" },
          { val: programs.filter(p => new Date() >= new Date(p.from_date) && new Date() <= new Date(p.to_date)).length, lbl: "Ongoing"  },
          { val: programs.filter(p => new Date() < new Date(p.from_date)).length,                 lbl: "Upcoming"       },
          { val: programs.filter(p => new Date() > new Date(p.to_date)).length,                   lbl: "Completed"      },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * .07}s` }}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="tbl-card" style={{ marginBottom: 18 }}>
        <div className="tbl-toolbar">
          <div className="srch-wrap">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--slate-500)", pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="srch-in" placeholder="Search programs or events…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {search && (
            <button className="clr-btn" onClick={() => setSearch("")}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="tbl-card">
          <div className="empty-st">
            <div className="empty-ic">🏋️</div>
            <div className="empty-title">{search ? "No programs match your search" : "No training programs yet"}</div>
            <div className="empty-sub">{search ? "Try a different search term" : "Training programs will appear once staff creates them for your registered events"}</div>
          </div>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map((p, i) => {
            const badge  = statusBadge(p);
            const sessCount = parseInt(p.session_count) || 0;
            return (
              <div key={p.program_id} className="event-card" style={{ animationDelay: `${i * .06}s`, cursor:"pointer" }}
                onClick={() => setSelected(p.program_id)}>
                <div className="event-card-top">
                  {/* Event tag */}
                  <span className={`event-card-type ${p.event_type === "internal" ? "type-internal" : "type-external"}`}>
                    {p.event_type === "internal" ? "🏫" : "🌐"} {p.event_title}
                  </span>

                  {/* Status */}
                  <span className={`badge ${badge.cls}`} style={{ float:"right", marginTop:2 }}>
                    <span className="bdot" />{badge.label}
                  </span>

                  <div className="event-card-title" style={{ marginTop:8 }}>{p.program_title}</div>

                  {p.description && (
                    <div className="event-card-desc">{p.description}</div>
                  )}

                  <div className="event-card-meta">
                    <div className="event-meta-item">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {fmt(p.from_date)} – {fmt(p.to_date)}
                    </div>
                    {p.location && (
                      <div className="event-meta-item">📍 {p.location}</div>
                    )}
                    <div className="event-meta-item">
                      🗓️ {sessCount} session{sessCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="event-card-footer">
                  <span style={{ fontSize: 12, color: "var(--slate-500)" }}>
                    {p.is_participant ? "✅ You are a participant" : "⏳ Participant list pending"}
                  </span>
                  <button className="btn-register" style={{ padding:"7px 14px" }}>
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
