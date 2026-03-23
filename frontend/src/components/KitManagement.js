// src/components/KitManagement.jsx
// Add to StaffDashboard.jsx:
//   import KitManagement from "../components/KitManagement";
//   NAV: { id:"kits", label:"Kit Management", Icon:Ic.Kit, group:"Operations" }
//   {page === "kits" && <KitManagement token={getToken()} />}

import { useState, useEffect, useCallback } from "react";

const API = "http://127.0.0.1:5000";

// ── Tiny toast hook ───────────────────────────────────────────────
function KitToast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      padding:"13px 20px", borderRadius:12,
      background: type === "success" ? "#15803d" : "#dc2626",
      color:"white", fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:600,
      boxShadow:"0 8px 28px rgba(0,0,0,.18)",
      animation:"stfFadeUp .25s ease", maxWidth:360
    }}>{msg}</div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="mod-box" style={{ maxWidth:400 }}>
        <div className="mod-title" style={{ marginBottom:10 }}>Confirm Action</div>
        <p style={{ fontSize:14, color:"#475569", lineHeight:1.6 }}>{msg}</p>
        <div className="mod-acts" style={{ marginTop:18 }}>
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Date badge helper ─────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const daysLeft = d => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / (1000*60*60*24));
  return diff;
};

// ── Status badge ──────────────────────────────────────────────────
const statusBadge = (status, deadline) => {
  const days = daysLeft(deadline);
  const map = {
    issued:   { cls:"badge-blue",   label:"Issued" },
    returned: { cls:"badge-green",  label:"Returned" },
    overdue:  { cls:"badge-red",    label:"Overdue" },
    lost:     { cls:"badge-gray",   label:"Lost" },
  };
  const b = map[status] || { cls:"badge-gray", label:status };
  const urgentColor = status === "issued" && days !== null && days <= 3 && days >= 0
    ? { background:"#fef3c7", color:"#b45309" } : {};
  return (
    <span className={`badge ${b.cls}`} style={urgentColor}>
      <span className="bdot"/>{b.label}
      {status === "issued" && days !== null && days > 0 && <span style={{ marginLeft:4, fontWeight:700 }}>({days}d left)</span>}
      {status === "issued" && days === 0 && <span style={{ marginLeft:4 }}>(Today!)</span>}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════
//  KIT ITEM MODAL
// ══════════════════════════════════════════════════════════════════
function KitItemModal({ mode, item, token, onClose, onSave, showToast }) {
  const blank = { name:"", description:"", category:"Top", total_stock:"", available_stock:"", is_active:true };
  const [form, setForm] = useState(mode === "edit" && item ? {
    name:            item.name || "",
    description:     item.description || "",
    category:        item.category || "Top",
    total_stock:     item.total_stock || "",
    available_stock: item.available_stock || "",
    is_active:       item.is_active !== false,
  } : blank);
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.total_stock)
      return showToast("Name and total stock are required", "error");
    setLoading(true);
    try {
      const url    = mode === "create" ? `${API}/staff/kits/items` : `${API}/staff/kits/items/${item.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res    = await fetch(url, {
        method, headers: { "Content-Type":"application/json", Authorization:"Bearer " + token },
        body: JSON.stringify({
          ...form,
          total_stock:     parseInt(form.total_stock),
          available_stock: mode === "edit" ? parseInt(form.available_stock) : parseInt(form.total_stock),
        })
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.message || "Error", "error");
      onSave();
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box" style={{ maxWidth:500 }}>
        <div className="mod-hd">
          <div>
            <div className="mod-title">{mode === "create" ? "➕ Add Kit Item" : "✏️ Edit Kit Item"}</div>
            <div className="mod-sub">Manage sports kit inventory</div>
          </div>
          <button className="mod-close" onClick={onClose}>✕</button>
        </div>
        <div className="mod-grid">
          <div className="mod-field full">
            <label>Kit Name *</label>
            <input placeholder="e.g. Jersey, Track Suit, T-Shirt" value={form.name} onChange={f("name")} />
          </div>
          <div className="mod-field">
            <label>Category</label>
            <select value={form.category} onChange={f("category")}>
              <option value="Top">Top</option>
              <option value="Bottom">Bottom</option>
              <option value="Full Set">Full Set</option>
              <option value="Accessory">Accessory</option>
              <option value="Footwear">Footwear</option>
            </select>
          </div>
          <div className="mod-field">
            <label>Total Stock *</label>
            <input type="number" min="0" placeholder="e.g. 30" value={form.total_stock} onChange={f("total_stock")} />
          </div>
          {mode === "edit" && (
            <div className="mod-field">
              <label>Available Stock</label>
              <input type="number" min="0" placeholder="Current available" value={form.available_stock} onChange={f("available_stock")} />
            </div>
          )}
          <div className="mod-field full">
            <label>Description</label>
            <textarea rows={2} placeholder="Short description…" value={form.description} onChange={f("description")} />
          </div>
          {mode === "edit" && (
            <div className="mod-field full" style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
              <input type="checkbox" id="kit-active" checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ width:16, height:16 }} />
              <label htmlFor="kit-active" style={{ textTransform:"none", fontSize:13, fontWeight:500, color:"#334155" }}>
                Item is active (uncheck to hide from issuance)
              </label>
            </div>
          )}
        </div>
        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading && <div className="spinner-sm" />}
            {mode === "create" ? "Add Kit Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ISSUE KIT MODAL
// ══════════════════════════════════════════════════════════════════
function IssueKitModal({ token, kitItems, onClose, onSave, showToast }) {
  const [students,  setStudents]  = useState([]);
  const [events,    setEvents]    = useState([]);
  const [stuSearch, setStuSearch] = useState("");
  const [stuResults,setStuResults]= useState([]);
  const [form, setForm] = useState({
    kit_item_id:"", student_id:"", student_name:"", event_id:"",
    size:"M", quantity:"1", return_deadline:"", condition_issued:"good", notes:""
  });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // fetch events for dropdown
  useEffect(() => {
    fetch(`${API}/staff/events`, { headers:{ Authorization:"Bearer "+token } })
      .then(r => r.json()).then(d => setEvents(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  // student search
  useEffect(() => {
    if (!stuSearch || stuSearch.length < 2) { setStuResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`${API}/staff/students?search=${encodeURIComponent(stuSearch)}`, { headers:{ Authorization:"Bearer "+token } });
        const data = await res.json();
        setStuResults(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [stuSearch, token]);

  const selectStudent = s => {
    setForm(p => ({ ...p, student_id: s.id, student_name: `${s.name || s.username} (${s.rollno || s.username})` }));
    setStuSearch(s.name || s.username);
    setStuResults([]);
  };

  const selectedKit = kitItems.find(k => k.id === parseInt(form.kit_item_id));

  // default deadline: 30 days from now
  useEffect(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    setForm(p => ({ ...p, return_deadline: d.toISOString().split("T")[0] }));
  }, []);

  const handleIssue = async () => {
    if (!form.kit_item_id || !form.student_id || !form.return_deadline)
      return showToast("Kit, student and return deadline are required", "error");
    setLoading(true);
    try {
      const res  = await fetch(`${API}/staff/kits/assignments`, {
        method:"POST",
        headers: { "Content-Type":"application/json", Authorization:"Bearer "+token },
        body: JSON.stringify({ ...form, kit_item_id: parseInt(form.kit_item_id), event_id: form.event_id || undefined })
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.message || "Error", "error");
      onSave();
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const SIZES = ["XS","S","M","L","XL","XXL","XXXL"];

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box" style={{ maxWidth:580 }}>
        <div className="mod-hd">
          <div>
            <div className="mod-title">👕 Issue Kit to Student</div>
            <div className="mod-sub">Select kit, student and set return deadline</div>
          </div>
          <button className="mod-close" onClick={onClose}>✕</button>
        </div>

        {/* Kit Selection */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>
            📦 Kit Details
          </div>
          <div className="mod-grid">
            <div className="mod-field">
              <label>Kit Item *</label>
              <select value={form.kit_item_id} onChange={f("kit_item_id")}>
                <option value="">— Select Kit —</option>
                {kitItems.map(k => (
                  <option key={k.id} value={k.id} disabled={k.available_stock < 1}>
                    {k.name} ({k.available_stock} available) {k.available_stock < 1 ? "— OUT OF STOCK" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="mod-field">
              <label>Size</label>
              <select value={form.size} onChange={f("size")}>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mod-field">
              <label>Quantity</label>
              <input type="number" min="1" max={selectedKit?.available_stock || 1} value={form.quantity} onChange={f("quantity")} />
            </div>
            <div className="mod-field">
              <label>Condition (on issue)</label>
              <select value={form.condition_issued} onChange={f("condition_issued")}>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Search */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>
            🎓 Student
          </div>
          <div style={{ position:"relative" }}>
            <input className="srch-in" style={{ paddingLeft:12 }}
              placeholder="Search student by name, roll no, username…"
              value={stuSearch}
              onChange={e => { setStuSearch(e.target.value); if (!e.target.value) setForm(p => ({ ...p, student_id:"", student_name:"" })); }}
            />
            {stuResults.length > 0 && (
              <div style={{
                position:"absolute", top:"100%", left:0, right:0, background:"white",
                border:"1.5px solid #e2e8f0", borderRadius:9, boxShadow:"0 8px 24px rgba(0,0,0,.1)",
                zIndex:100, maxHeight:200, overflowY:"auto"
              }}>
                {stuResults.map(s => (
                  <div key={s.id}
                    style={{ padding:"9px 13px", cursor:"pointer", fontSize:13, color:"#334155", borderBottom:"1px solid #f1f5f9" }}
                    onMouseDown={() => selectStudent(s)}
                    onMouseEnter={e => e.currentTarget.style.background="#eff6ff"}
                    onMouseLeave={e => e.currentTarget.style.background="white"}
                  >
                    <span style={{ fontWeight:600 }}>{s.name || s.username}</span>
                    <span style={{ color:"#64748b", marginLeft:8, fontSize:12 }}>{s.rollno} · {s.department}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {form.student_id && (
            <div style={{ marginTop:6, fontSize:12, color:"#15803d", fontWeight:600 }}>
              ✅ Selected: {form.student_name}
            </div>
          )}
        </div>

        {/* Event + Deadline */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>
            📅 Schedule
          </div>
          <div className="mod-grid">
            <div className="mod-field">
              <label>Linked Event (optional)</label>
              <select value={form.event_id} onChange={f("event_id")}>
                <option value="">— None —</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div className="mod-field">
              <label>Return Deadline *</label>
              <input type="date" value={form.return_deadline} onChange={f("return_deadline")}
                min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="mod-field full">
              <label>Notes</label>
              <textarea rows={2} placeholder="Any special instructions…" value={form.notes} onChange={f("notes")} />
            </div>
          </div>
        </div>

        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleIssue} disabled={loading}>
            {loading && <div className="spinner-sm"/>}
            Issue Kit
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  RETURN CONFIRM MODAL
// ══════════════════════════════════════════════════════════════════
function ReturnConfirmModal({ request, token, onClose, onSave, showToast }) {
  const [form, setForm] = useState({ condition_returned: request.condition_report || "good", staff_notes:"" });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const confirm = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/staff/kits/returns/${request.id}/confirm`, {
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

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box" style={{ maxWidth:440 }}>
        <div className="mod-hd">
          <div>
            <div className="mod-title">✅ Confirm Kit Return</div>
            <div className="mod-sub">{request.student_name} · {request.kit_name}</div>
          </div>
          <button className="mod-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:13 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div><span style={{ color:"#64748b", fontSize:11 }}>STUDENT</span><div style={{ fontWeight:600 }}>{request.student_name}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>ROLL NO</span><div style={{ fontWeight:600 }}>{request.student_rollno || "—"}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>KIT</span><div style={{ fontWeight:600 }}>{request.kit_name}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>SIZE</span><div style={{ fontWeight:600 }}>{request.size || "—"}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>ISSUED</span><div style={{ fontWeight:600 }}>{fmtDate(request.issued_date)}</div></div>
            <div><span style={{ color:"#64748b", fontSize:11 }}>DEADLINE</span><div style={{ fontWeight:600 }}>{fmtDate(request.return_deadline)}</div></div>
          </div>
          {request.student_notes && (
            <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid #e2e8f0" }}>
              <span style={{ color:"#64748b", fontSize:11 }}>STUDENT NOTE: </span>
              <span style={{ fontSize:13 }}>{request.student_notes}</span>
            </div>
          )}
        </div>
        <div className="mod-grid">
          <div className="mod-field">
            <label>Returned Condition</label>
            <select value={form.condition_returned} onChange={f("condition_returned")}>
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div className="mod-field">
            <label>Staff Notes</label>
            <input placeholder="Optional remarks…" value={form.staff_notes} onChange={f("staff_notes")} />
          </div>
        </div>
        <div className="mod-acts" style={{ marginTop:18 }}>
          <button className="btn-cancel" onClick={() => {
            fetch(`${API}/staff/kits/returns/${request.id}/reject`, {
              method:"POST",
              headers: { "Content-Type":"application/json", Authorization:"Bearer "+token },
              body: JSON.stringify({ staff_notes: form.staff_notes || "Rejected by staff" })
            }).then(() => onSave());
          }}>Reject Request</button>
          <button className="btn-primary" onClick={confirm} disabled={loading}>
            {loading && <div className="spinner-sm"/>} Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN KitManagement COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function KitManagement({ token }) {
  const [tab,          setTab]          = useState("overview");   // overview | assign | returns
  const [kitItems,     setKitItems]     = useState([]);
  const [assignments,  setAssignments]  = useState([]);
  const [returns,      setReturns]      = useState([]);
  const [stats,        setStats]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);
  const [modal,        setModal]        = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search,       setSearch]       = useState("");

  const showToast = useCallback((msg, type="success") => setToast({ msg, type }), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, assignRes, returnsRes, statsRes] = await Promise.all([
        fetch(`${API}/staff/kits/items`,       { headers:{ Authorization:"Bearer "+token } }),
        fetch(`${API}/staff/kits/assignments`, { headers:{ Authorization:"Bearer "+token } }),
        fetch(`${API}/staff/kits/returns`,     { headers:{ Authorization:"Bearer "+token } }),
        fetch(`${API}/staff/kits/stats`,       { headers:{ Authorization:"Bearer "+token } }),
      ]);
      const [items, assigns, rets, st] = await Promise.all([
        itemsRes.json(), assignRes.json(), returnsRes.json(), statsRes.json()
      ]);
      setKitItems(Array.isArray(items)   ? items   : []);
      setAssignments(Array.isArray(assigns) ? assigns : []);
      setReturns(Array.isArray(rets)    ? rets    : []);
      setStats(st || {});
    } catch { showToast("Failed to load kit data", "error"); }
    finally { setLoading(false); }
  }, [token, showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredAssignments = assignments.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      a.student_name?.toLowerCase().includes(q) ||
      a.student_rollno?.toLowerCase().includes(q) ||
      a.kit_name?.toLowerCase().includes(q) ||
      a.student_dept?.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || a.status === statusFilter);
  });

  // ── Tab styles ─────────────────────────────────────────────────
  const tabStyle = active => ({
    padding:"8px 18px", borderRadius:"9px", border:"none", cursor:"pointer",
    fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:600,
    background: active ? "#2563eb" : "transparent",
    color: active ? "white" : "#64748b",
    transition:"all .18s",
  });

  return (
    <div>
      {toast && <KitToast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}

      {/* Modals */}
      {modal?.type === "add-item"   && <KitItemModal mode="create" token={token} kitItems={kitItems} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchAll(); showToast("Kit item added"); }} showToast={showToast}/>}
      {modal?.type === "edit-item"  && <KitItemModal mode="edit"   token={token} item={modal.item} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchAll(); showToast("Kit item updated"); }} showToast={showToast}/>}
      {modal?.type === "issue"      && <IssueKitModal token={token} kitItems={kitItems.filter(k => k.available_stock > 0)} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchAll(); showToast("Kit issued successfully"); }} showToast={showToast}/>}
      {modal?.type === "return"     && <ReturnConfirmModal request={modal.request} token={token} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchAll(); showToast("Return processed"); }} showToast={showToast}/>}

      {/* Page Header */}
      <div className="pg-hdr">
        <div>
          <div className="pg-title">👕 Kit Management</div>
          <div className="pg-sub">Issue, track and manage sports kits — jerseys, T-shirts, track suits</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button className="btn-primary" style={{ background:"linear-gradient(135deg,#059669,#047857)" }}
            onClick={() => setModal({ type:"issue" })}>
            + Issue Kit
          </button>
          <button className="btn-primary" onClick={() => setModal({ type:"add-item" })}>
            + Add Kit Type
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        {[
          { val:stats.total_kit_types   || 0, lbl:"Kit Types",      color:"#2563eb" },
          { val:stats.currently_issued  || 0, lbl:"Currently Issued",color:"#d97706" },
          { val:stats.pending_returns   || 0, lbl:"Pending Returns", color:"#7c3aed" },
          { val:stats.overdue_count     || 0, lbl:"Overdue",         color:"#dc2626" },
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i*.07}s` }}>
            <div className="stat-val" style={{ color:s.color }}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:"white", borderRadius:12, padding:5, marginBottom:16, border:"1px solid #e2e8f0", width:"fit-content" }}>
        {[
          { id:"overview",    label:"📦 Kit Inventory" },
          { id:"assign",      label:"📋 Assignments" },
          { id:"returns",     label:`🔁 Return Requests${returns.length > 0 ? ` (${returns.length})` : ""}` },
        ].map(t => (
          <button key={t.id} style={tabStyle(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: KIT INVENTORY ── */}
      {tab === "overview" && (
        <div className="tbl-card">
          <div style={{ padding:"14px 16px", background:"#fafbfc", borderBottom:"1px solid #f1f5f9", fontSize:13, fontWeight:600, color:"#475569" }}>
            Kit Item Inventory
          </div>
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:40 }}><div className="spinner"/></div>
          ) : kitItems.length === 0 ? (
            <div className="empty-st">
              <div className="empty-ic">👕</div>
              <div className="empty-title">No kit items yet</div>
              <div className="empty-sub">Click "Add Kit Type" to create your first kit item</div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16, padding:16 }}>
              {kitItems.map(kit => {
                const pct = kit.total_stock ? Math.round((kit.available_stock / kit.total_stock) * 100) : 0;
                const barColor = pct > 50 ? "#22c55e" : pct > 20 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={kit.id} style={{
                    background:"white", border:"1.5px solid #e2e8f0", borderRadius:14,
                    padding:16, transition:"transform .18s, box-shadow .18s",
                    boxShadow:"0 2px 8px rgba(0,0,0,.04)"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.04)"; }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:15, color:"#0f172a" }}>{kit.name}</div>
                        <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{kit.category}</div>
                      </div>
                      <span className={`badge ${kit.issued_count > 0 ? "badge-blue" : "badge-gray"}`}>
                        {kit.issued_count || 0} issued
                      </span>
                    </div>
                    {kit.description && <div style={{ fontSize:12, color:"#64748b", marginBottom:10, lineHeight:1.5 }}>{kit.description}</div>}

                    {/* Stock bar */}
                    <div style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                        <span style={{ color:"#475569", fontWeight:500 }}>Stock</span>
                        <span style={{ fontWeight:700, color:barColor }}>{kit.available_stock} / {kit.total_stock}</span>
                      </div>
                      <div style={{ height:6, background:"#f1f5f9", borderRadius:4 }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:4, transition:"width .4s" }}/>
                      </div>
                    </div>

                    {kit.overdue_count > 0 && (
                      <div style={{ background:"#fee2e2", borderRadius:8, padding:"6px 10px", marginBottom:10, fontSize:12, fontWeight:600, color:"#dc2626" }}>
                        ⚠️ {kit.overdue_count} overdue — follow up needed
                      </div>
                    )}

                    <div style={{ display:"flex", gap:6, marginTop:10 }}>
                      <button className="btn-edit-sm" onClick={() => setModal({ type:"edit-item", item:kit })}>
                        ✏️ Edit
                      </button>
                      <button className="btn-primary" style={{ fontSize:12, padding:"6px 12px" }}
                        onClick={() => { setModal({ type:"issue" }); }}>
                        + Issue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ASSIGNMENTS ── */}
      {tab === "assign" && (
        <div className="tbl-card">
          <div className="tbl-toolbar">
            <div className="srch-wrap" style={{ flex:1, minWidth:180 }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="srch-in" placeholder="Search by student, kit, roll no…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="fil-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
              <option value="lost">Lost</option>
            </select>
            {(search || statusFilter !== "all") && (
              <button className="clr-btn" onClick={() => { setSearch(""); setStatusFilter("all"); }}>✕ Clear</button>
            )}
          </div>

          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:48 }}><div className="spinner"/></div>
          ) : filteredAssignments.length === 0 ? (
            <div className="empty-st">
              <div className="empty-ic">📋</div>
              <div className="empty-title">No assignments found</div>
              <div className="empty-sub">Issue a kit to get started</div>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="g-tbl">
                <thead>
                  <tr>
                    <th>#</th><th>Student</th><th>Kit</th><th>Size</th>
                    <th>Issued</th><th>Deadline</th><th>Status</th><th>Event</th><th>Return Req.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, i) => (
                    <tr key={a.id} className="g-row" style={{ animationDelay:`${i*.04}s` }}>
                      <td style={{ color:"#94a3b8", fontSize:12 }}>{i+1}</td>
                      <td>
                        <div style={{ fontWeight:600, color:"#0f172a", fontSize:13 }}>{a.student_name || "—"}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{a.student_rollno} · {a.student_dept}</div>
                      </td>
                      <td>
                        <span className="badge badge-purple">{a.kit_name}</span>
                      </td>
                      <td style={{ fontSize:13, fontWeight:600 }}>{a.size || "—"}</td>
                      <td style={{ fontSize:12, color:"#475569" }}>{fmtDate(a.issued_date)}</td>
                      <td style={{ fontSize:12 }}>
                        <span style={{ fontWeight:600, color: daysLeft(a.return_deadline) < 0 ? "#dc2626" : daysLeft(a.return_deadline) <= 3 ? "#d97706" : "#334155" }}>
                          {fmtDate(a.return_deadline)}
                        </span>
                      </td>
                      <td>{statusBadge(a.status, a.return_deadline)}</td>
                      <td style={{ fontSize:12, color:"#64748b" }}>{a.event_title || "—"}</td>
                      <td>
                        {a.pending_returns > 0 ? (
                          <span className="badge badge-yellow"><span className="bdot"/>Pending</span>
                        ) : (
                          <span style={{ color:"#94a3b8", fontSize:12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="tbl-footer">
            Showing <strong>{filteredAssignments.length}</strong> of <strong>{assignments.length}</strong> assignments
          </div>
        </div>
      )}

      {/* ── TAB: RETURN REQUESTS ── */}
      {tab === "returns" && (
        <div className="tbl-card">
          <div style={{ padding:"14px 16px", background:"#fafbfc", borderBottom:"1px solid #f1f5f9", fontSize:13, fontWeight:600, color:"#475569" }}>
            Pending Return Requests ({returns.length})
          </div>
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:48 }}><div className="spinner"/></div>
          ) : returns.length === 0 ? (
            <div className="empty-st">
              <div className="empty-ic">✅</div>
              <div className="empty-title">No pending return requests</div>
              <div className="empty-sub">All caught up! Students haven't requested returns yet.</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {returns.map((r, i) => {
                const days = daysLeft(r.return_deadline);
                const isOverdue = days !== null && days < 0;
                return (
                  <div key={r.id} style={{
                    padding:"14px 16px", borderBottom:"1px solid #f8fafc",
                    display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
                    background: isOverdue ? "#fff5f5" : "white",
                    transition:"background .12s"
                  }}>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ fontWeight:700, color:"#0f172a", fontSize:13 }}>{r.student_name}</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{r.student_rollno} · {r.student_dept}</div>
                      <div style={{ fontSize:12, color:"#475569", marginTop:3 }}>
                        📦 <strong>{r.kit_name}</strong> · Size: {r.size || "—"} · Qty: {r.quantity}
                      </div>
                    </div>
                    <div style={{ fontSize:12 }}>
                      <div style={{ color:"#64748b" }}>Issued: {fmtDate(r.issued_date)}</div>
                      <div style={{ color: isOverdue ? "#dc2626" : "#475569", fontWeight: isOverdue ? 700 : 400 }}>
                        Deadline: {fmtDate(r.return_deadline)} {isOverdue && "⚠️ OVERDUE"}
                      </div>
                      {r.condition_report && (
                        <div style={{ marginTop:4 }}>
                          Reported condition: <strong>{r.condition_report}</strong>
                        </div>
                      )}
                      {r.student_notes && (
                        <div style={{ marginTop:3, color:"#475569", fontStyle:"italic" }}>"{r.student_notes}"</div>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:"#64748b" }}>
                      Requested: {fmtDate(r.requested_at)}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn-action-sm" onClick={() => setModal({ type:"return", request:r })}>
                        ✅ Confirm
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}