
import { useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL;
// ── Helpers ───────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const daysLeft = d => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000*60*60*24));
};

// ── Toast ─────────────────────────────────────────────────────────
function KitToast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      padding:"13px 20px", borderRadius:12,
      background: type === "success" ? "#15803d" : "#dc2626",
      color:"white", fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:600,
      boxShadow:"0 8px 28px rgba(0,0,0,.18)",
      animation:"stuFadeUp .25s ease", maxWidth:360
    }}>{msg}</div>
  );
}

// ── Return Request Modal ──────────────────────────────────────────
function ReturnRequestModal({ assignment, token, onClose, onSave, showToast }) {
  const [form, setForm] = useState({ condition_report:"good", student_notes:"" });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/student/kits/return/${assignment.id}`, {
        method:"POST",
        headers: { "Content-Type":"application/json", Authorization:"Bearer "+token },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.message || "Error", "error");
      onSave();
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const days = daysLeft(assignment.return_deadline);
  const isOverdue = days !== null && days < 0;

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,23,42,.55)", backdropFilter:"blur(6px)",
      zIndex:400, display:"flex", alignItems:"center", justifyContent:"center",
      animation:"stuFadeIn .18s ease", padding:16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"white", borderRadius:20, padding:26, width:"100%", maxWidth:460,
        animation:"stuCardIn .22s cubic-bezier(.34,1.56,.64,1)",
        boxShadow:"0 28px 70px rgba(0,0,0,.22)", maxHeight:"90dvh", overflowY:"auto"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:17, color:"#0f172a" }}>
              🔁 Request Kit Return
            </div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{assignment.kit_name}</div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:"none", background:"#f1f5f9", cursor:"pointer", fontSize:16, color:"#475569" }}>✕</button>
        </div>

        {/* Kit info summary */}
        <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:13 }}>
            <div><span style={{ color:"#64748b", fontSize:11 }}>KIT</span><div style={{ fontWeight:600 }}>{assignment.kit_name}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>SIZE</span><div style={{ fontWeight:600 }}>{assignment.size || "—"}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>ISSUED ON</span><div style={{ fontWeight:600 }}>{fmtDate(assignment.issued_date)}</div></div>
            <div>
              <span style={{ color:"#64748b", fontSize:11 }}>RETURN BY</span>
              <div style={{ fontWeight:700, color: isOverdue ? "#dc2626" : days <= 3 ? "#d97706" : "#0f172a" }}>
                {fmtDate(assignment.return_deadline)}
                {isOverdue && <span style={{ marginLeft:4, fontSize:11 }}>⚠️ OVERDUE</span>}
                {!isOverdue && days !== null && days <= 7 && <span style={{ marginLeft:4, fontSize:11 }}>({days}d left)</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.4, textTransform:"uppercase", display:"block", marginBottom:5 }}>
              Kit Condition
            </label>
            <select value={form.condition_report} onChange={f("condition_report")} style={{
              padding:"10px 13px", borderRadius:9, border:"1.5px solid #e2e8f0",
              fontFamily:"Inter,sans-serif", fontSize:13.5, color:"#0f172a",
              background:"#f8fafc", outline:"none", width:"100%"
            }}>
              <option value="good">✅ Good — no damage</option>
              <option value="fair">🟡 Fair — minor wear</option>
              <option value="poor">🟠 Poor — visible wear</option>
              <option value="damaged">❌ Damaged</option>
              <option value="lost">⛔ Lost</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.4, textTransform:"uppercase", display:"block", marginBottom:5 }}>
              Notes (optional)
            </label>
            <textarea rows={3}
              placeholder="Any notes about the kit condition, reason for return, etc."
              value={form.student_notes} onChange={f("student_notes")}
              style={{
                padding:"10px 13px", borderRadius:9, border:"1.5px solid #e2e8f0",
                fontFamily:"Inter,sans-serif", fontSize:13.5, color:"#0f172a",
                background:"#f8fafc", outline:"none", resize:"none", width:"100%"
              }}
            />
          </div>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
          <button onClick={onClose} style={{
            padding:"9px 18px", borderRadius:10, border:"1.5px solid #e2e8f0",
            background:"white", fontSize:13, fontWeight:600, color:"#475569", cursor:"pointer"
          }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"9px 18px", borderRadius:10, border:"none",
            background:"linear-gradient(135deg,#2563eb,#1e40af)",
            color:"white", fontSize:13, fontWeight:600, cursor:"pointer",
            opacity: loading ? .65 : 1
          }}>
            {loading && <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"white", borderRadius:"50%", animation:"stuSpin .7s linear infinite" }}/>}
            Submit Return Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN MyKits COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function MyKits({ token }) {
  const [kits,    setKits]    = useState([]);
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null);   
  const [filter,  setFilter]  = useState("all");

  const showToast = useCallback((msg, type="success") => setToast({ msg, type }), []);

  const fetchKits = useCallback(async () => {
    setLoading(true);
    try {
      const [kitsRes, statsRes] = await Promise.all([
        fetch(`${API}/student/kits/my`,    { headers:{ Authorization:"Bearer "+token } }),
        fetch(`${API}/student/kits/stats`, { headers:{ Authorization:"Bearer "+token } }),
      ]);
      const [kitsData, statsData] = await Promise.all([kitsRes.json(), statsRes.json()]);
      setKits(Array.isArray(kitsData) ? kitsData : []);
      setStats(statsData || {});
    } catch { showToast("Failed to load kit data", "error"); }
    finally { setLoading(false); }
  }, [token, showToast]);

  useEffect(() => { fetchKits(); }, [fetchKits]);

  const filtered = filter === "all" ? kits : kits.filter(k => k.status === filter);

  const getStatusBadge = (kit) => {
    const days = daysLeft(kit.return_deadline);
    const statusMap = {
      issued:   { label:"Issued",   bg:"#dbeafe",   color:"#1d4ed8" },
      returned: { label:"Returned", bg:"#dcfce7",   color:"#15803d" },
      overdue:  { label:"Overdue",  bg:"#fee2e2",   color:"#dc2626" },
      lost:     { label:"Lost",     bg:"#f1f5f9",   color:"#475569" },
    };
    const s = statusMap[kit.status] || { label:kit.status, bg:"#f1f5f9", color:"#475569" };
    const urgentStyle = kit.status === "issued" && days !== null && days <= 3 && days >= 0
      ? { bg:"#fef3c7", color:"#b45309" } : {};
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:700, background:urgentStyle.bg || s.bg, color:urgentStyle.color || s.color }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", opacity:.7 }}/>
        {s.label}
        {kit.status === "issued" && days !== null && days > 0 && <span>({days}d left)</span>}
        {kit.status === "issued" && days === 0 && <span style={{ fontWeight:800 }}>DUE TODAY!</span>}
      </span>
    );
  };

  const canRequestReturn = (kit) =>
    (kit.status === "issued" || kit.status === "overdue") &&
    kit.return_request_status !== "pending";

  return (
    <div>
      {toast && <KitToast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}

      {modal?.type === "return" && (
        <ReturnRequestModal
          assignment={modal.assignment}
          token={token}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchKits(); showToast("Return request submitted! Staff will confirm soon."); }}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <div className="pg-hdr">
        <div>
          <div className="pg-title">👕 My Sports Kits</div>
          <div className="pg-sub">Track your issued kits and request returns before the deadline</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        {[
          { val: stats.active_kits  || 0, lbl:"Active Kits",  color:"#2563eb", delay:"0s"   },
          { val: stats.overdue_kits || 0, lbl:"Overdue",      color:"#dc2626", delay:".07s" },
          { val: stats.returned_kits|| 0, lbl:"Returned",     color:"#15803d", delay:".14s" },
          { val: stats.total_kits   || 0, lbl:"Total Issued", color:"#7c3aed", delay:".21s" },
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:s.delay }}>
            <div className="stat-val" style={{ color:s.color }}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { id:"all",      label:"All" },
          { id:"issued",   label:"Active" },
          { id:"overdue",  label:"⚠️ Overdue" },
          { id:"returned", label:"Returned" },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding:"7px 16px", borderRadius:9, border:"1.5px solid",
            borderColor: filter === f.id ? "#2563eb" : "#e2e8f0",
            background: filter === f.id ? "#eff6ff" : "white",
            color: filter === f.id ? "#1d4ed8" : "#64748b",
            fontFamily:"Inter,sans-serif", fontSize:12.5, fontWeight:600, cursor:"pointer",
            transition:"all .15s"
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Kit Cards */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:60 }}>
          <div className="spinner"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tbl-card">
          <div className="empty-st">
            <div className="empty-ic">👕</div>
            <div className="empty-title">
              {kits.length === 0 ? "No kits issued yet" : "No kits"}
            </div>
            <div className="empty-sub">
              {kits.length === 0
                ? "Kits will appear here once staff issues them to you for your registered events."
                : ""}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map((kit, i) => {
            const days       = daysLeft(kit.return_deadline);
            const isOverdue  = kit.status === "overdue" || (days !== null && days < 0 && kit.status !== "returned");
            const isUrgent   = !isOverdue && days !== null && days <= 3 && kit.status === "issued";
            const borderColor = isOverdue ? "#fecaca" : isUrgent ? "#fde68a" : "#e2e8f0";

            return (
              <div key={kit.id} style={{
                background:"white", borderRadius:16,
                border:`2px solid ${borderColor}`,
                overflow:"hidden", animation:"stuCardIn .4s ease both",
                animationDelay:`${i*.06}s`,
                boxShadow: isOverdue ? "0 4px 14px rgba(239,68,68,.12)" : "0 2px 12px rgba(0,0,0,.04)"
              }}>
                {/* Top urgent banner */}
                {isOverdue && (
                  <div style={{ background:"#fee2e2", padding:"7px 16px", fontSize:12, fontWeight:700, color:"#dc2626", display:"flex", alignItems:"center", gap:6 }}>
                    ⚠️ This kit is OVERDUE for return — please return immediately!
                  </div>
                )}
                {isUrgent && (
                  <div style={{ background:"#fef3c7", padding:"7px 16px", fontSize:12, fontWeight:700, color:"#b45309", display:"flex", alignItems:"center", gap:6 }}>
                    ⏰ Return deadline in {days} day{days === 1 ? "" : "s"} — don't forget!
                  </div>
                )}

                <div style={{ padding:"16px 18px", display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                  {/* Kit icon */}
                  <div style={{
                    width:50, height:50, borderRadius:12, flexShrink:0,
                    background:"linear-gradient(135deg,#2563eb,#1e40af)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:24, boxShadow:"0 4px 12px rgba(37,99,235,.25)"
                  }}>
                    {kit.kit_category === "Top" ? "👕" : kit.kit_category === "Bottom" ? "👖" : kit.kit_category === "Full Set" ? "🥋" : "🏃"}
                  </div>

                  {/* Kit info */}
                  <div style={{ flex:1, minWidth:180 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                      <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:15, color:"#0f172a" }}>{kit.kit_name}</span>
                      {getStatusBadge(kit)}
                    </div>
                    {kit.kit_category && (
                      <span style={{ fontSize:11, background:"#f1f5f9", color:"#475569", padding:"2px 8px", borderRadius:6, fontWeight:600 }}>
                        {kit.kit_category}
                      </span>
                    )}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:8, marginTop:12 }}>
                      {[
                        { label:"Size",         val:kit.size || "—"           },
                        { label:"Qty",          val:kit.quantity              },
                        { label:"Issued On",    val:fmtDate(kit.issued_date)  },
                        { label:"Return By",    val:fmtDate(kit.return_deadline), urgent:isOverdue || isUrgent },
                        { label:"Issued By",    val:kit.issued_by_name || "Staff" },
                        { label:"Event",        val:kit.event_title || "—"   },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:.4, textTransform:"uppercase" }}>{item.label}</div>
                          <div style={{ fontSize:13, fontWeight:600, color: item.urgent ? "#dc2626" : "#334155", marginTop:1 }}>{item.val}</div>
                        </div>
                      ))}
                    </div>
                    {kit.notes && (
                      <div style={{ marginTop:8, fontSize:12, color:"#64748b", fontStyle:"italic" }}>
                        📝 {kit.notes}
                      </div>
                    )}
                  </div>

                  {/* Action area */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
                    {kit.status === "returned" ? (
                      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"#dcfce7", borderRadius:10, fontSize:13, fontWeight:700, color:"#15803d" }}>
                        ✅ Returned
                        {kit.returned_date && <span style={{ fontSize:11, fontWeight:500, marginLeft:4 }}>{fmtDate(kit.returned_date)}</span>}
                      </div>
                    ) : kit.return_request_status === "pending" ? (
                      <div style={{ padding:"8px 14px", background:"#fef3c7", borderRadius:10, fontSize:12, fontWeight:700, color:"#b45309" }}>
                        🕐 Return pending staff confirmation
                      </div>
                    ) : canRequestReturn(kit) ? (
                      <button
                        onClick={() => setModal({ type:"return", assignment:kit })}
                        style={{
                          padding:"9px 18px", borderRadius:10, border:"none",
                          background: isOverdue ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#2563eb,#1e40af)",
                          color:"white", fontSize:13, fontWeight:700, cursor:"pointer",
                          fontFamily:"Inter,sans-serif", boxShadow:"0 4px 12px rgba(37,99,235,.25)",
                          transition:"all .18s", display:"flex", alignItems:"center", gap:6
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                        onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
                      >
                        🔁 Request Return
                      </button>
                    ) : null}

                    {/* Condition indicator */}
                    {kit.condition_issued && (
                      <div style={{ fontSize:11, color:"#94a3b8" }}>
                        Issued in: <strong style={{ color:"#475569" }}>{kit.condition_issued}</strong> condition
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info notice */}
      {kits.length > 0 && (
        <div style={{
          marginTop:16, padding:"12px 16px", background:"#eff6ff",
          borderRadius:12, border:"1px solid #bfdbfe",
          fontSize:12.5, color:"#1d4ed8", display:"flex", alignItems:"flex-start", gap:8
        }}>
          <span style={{ fontSize:16 }}>ℹ️</span>
          <span>
            Click <strong>"Request Return"</strong> when you're ready to return a kit. Staff will confirm receipt.
            Always return kits before the deadline to avoid penalty.
          </span>
        </div>
      )}
    </div>
  );
}
