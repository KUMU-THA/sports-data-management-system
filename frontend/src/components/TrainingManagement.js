// src/components/TrainingManagement.jsx
import { useState, useEffect, useCallback } from "react";
const API = process.env.REACT_APP_API_URL;

const inject = () => {
  if (document.getElementById("tm-sty")) return;
  const s = document.createElement("style"); s.id = "tm-sty";
  s.textContent = `
    .tm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
    .tm-card { background:white; border-radius:16px; border:1px solid #e2e8f0; border-left:4px solid #e2e8f0; padding:18px 20px; display:flex; flex-direction:column; gap:12px; box-shadow:0 2px 14px rgba(0,0,0,.04); animation:stfFadeUp .4s ease both; transition:transform .18s,box-shadow .18s; }
    .tm-card:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,.10); }
    .tm-card.active    { border-left-color:#22c55e; }
    .tm-card.completed { border-left-color:#94a3b8; }
    .tm-meta { display:grid; grid-template-columns:1fr 1fr; gap:6px 10px; }
    .tm-meta-row { display:flex; align-items:center; gap:5px; font-size:12px; color:#475569; overflow:hidden; }
    .tm-meta-row svg { color:#94a3b8; flex-shrink:0; }
    .tm-meta-txt { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .tm-actions { display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid #f1f5f9; padding-top:12px; }
    .tm-pills { display:flex; flex-wrap:wrap; gap:6px; }
    .tm-pill { display:flex; align-items:center; gap:5px; background:#f8fafc; border-radius:20px; padding:4px 10px 4px 4px; border:1px solid #e2e8f0; }
    .tm-pill-av { width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#2563eb,#1e40af); color:white; font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .tm-subtabs { display:flex; gap:3px; background:#f1f5f9; border-radius:9px; padding:3px; margin-bottom:14px; }
    .tm-subtab { flex:1; padding:6px; border-radius:7px; border:none; cursor:pointer; font-weight:600; font-size:12px; font-family:Inter,sans-serif; text-align:center; transition:all .15s; background:transparent; color:#64748b; }
    .tm-subtab.active { background:white; color:#1d4ed8; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .tm-sess-list { display:flex; flex-direction:column; gap:8px; max-height:340px; overflow-y:auto; padding-right:2px; }
    .tm-sess-item { display:flex; align-items:center; gap:10px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; padding:10px 12px; transition:background .12s; }
    .tm-sess-item:hover { background:#f1f5f9; }
    .tm-sess-num { width:22px; height:22px; border-radius:50%; background:#e2e8f0; color:#64748b; font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .tm-sess-info { flex:1; min-width:0; }
    .tm-add-form { border:2px dashed #cbd5e1; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px; background:#fafbfc; margin-top:8px; }
    .tm-form-in { width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #e2e8f0; font-size:13px; font-family:Inter,sans-serif; outline:none; }
    .tm-form-in:focus { border-color:#3b82f6; }
    .tm-form-lbl { font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.4px; display:block; margin-bottom:4px; }

    /* ── Event Registration View ── */
    .ev-reg-card { background:white; border-radius:16px; border:1px solid #e2e8f0; padding:18px 20px; display:flex; flex-direction:column; gap:10px; box-shadow:0 2px 14px rgba(0,0,0,.04); animation:stfFadeUp .4s ease both; transition:transform .18s,box-shadow .18s; cursor:pointer; }
    .ev-reg-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.09); }
    .ev-reg-header { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
    .student-row { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; border:1px solid #e2e8f0; background:#fafbfc; transition:background .12s; }
    .student-row:hover { background:#f1f5f9; }
    .student-row.selected { background:#eff6ff; border-color:#bfdbfe; }
    .student-av { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#2563eb,#1e40af); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:Sora,sans-serif; flex-shrink:0; }
    .assign-modal { background:white; border-radius:20px; padding:24px; width:100%; max-width:520px; animation:stfScaleIn .22s cubic-bezier(.34,1.56,.64,1); box-shadow:0 28px 70px rgba(0,0,0,.22); max-height:88dvh; overflow-y:auto; }
    .chk-row { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:9px; border:1px solid #e2e8f0; background:#fafbfc; cursor:pointer; transition:background .12s; }
    .chk-row:hover { background:#f1f5f9; }
    .chk-row.sel { background:#eff6ff; border-color:#bfdbfe; }
    @media(max-width:600px){ .tm-grid{grid-template-columns:1fr;} .tm-meta{grid-template-columns:1fr;} }
  `;
  document.head.appendChild(s);
};

/* ── Icons ── */
const Ic = {
  Plus:    ()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:    ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:   ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Close:   ()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye:     ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Search:  ()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Cal:     ()=><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock:   ()=><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Users:   ()=><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Pin:     ()=><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Assign:  ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Back:    ()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>,
  Check:   ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
};

const fmt    = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtDay = d => d ? new Date(d).toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}) : "—";
const getToken = () => localStorage.getItem("token") || "";

/* ════════════════════════════════════════════════════════
   ASSIGN TO TRAINING MODAL
   Shows programs for this event, staff picks one (or creates new)
   then selects students to assign
════════════════════════════════════════════════════════ */
function AssignModal({ event, students, programs, onClose, onDone }) {
  const [selectedStudents, setSelectedStudents] = useState(new Set(students.map(s => s.student_id)));
  const [selectedProgram,  setSelectedProgram]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const [msg,   setMsg]   = useState("");
  const [error, setError] = useState("");

  const eventPrograms = programs.filter(p => String(p.event_id) === String(event.id));

  const toggleStudent = id => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedStudents.size === students.length)
      setSelectedStudents(new Set());
    else
      setSelectedStudents(new Set(students.map(s => s.student_id)));
  };

  const assign = async () => {
    setError("");
    if (!selectedProgram) return setError("Please select a training program");
    if (selectedStudents.size === 0) return setError("Select at least one student");
    setBusy(true);
    try {
      const token = getToken();
      let successCount = 0;
      for (const studentId of selectedStudents) {
        const res = await fetch(`${API}/staff/training-programs/${selectedProgram}/participants`, {
          method: "POST",
          headers: { "Content-Type":"application/json", Authorization:"Bearer "+token },
          body: JSON.stringify({ student_id: studentId }),
        });
        if (res.ok) successCount++;
      }
      setMsg(`✅ ${successCount} student(s) assigned successfully!`);
      setTimeout(() => { onDone(); }, 1600);
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="assign-modal">
        {/* Header */}
        <div className="mod-hd">
          <div>
            <div className="mod-title">Assign to Training</div>
            <div className="mod-sub">
              {event.title} · {students.length} registered student{students.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close/></button>
        </div>

        {msg && (
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#15803d", fontWeight:600 }}>
            {msg}
          </div>
        )}
        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#dc2626" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Pick program */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>
            Step 1 — Select Training Program
          </div>
          {eventPrograms.length === 0 ? (
            <div style={{ background:"#fef9c3", border:"1px solid #fde68a", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#92400e" }}>
              ⚠️ No training programs created for this event yet. Create one first from the <strong>Training Programs</strong> tab.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {eventPrograms.map(p => (
                <label key={p.id}
                  className={`chk-row ${String(selectedProgram) === String(p.id) ? "sel" : ""}`}
                  style={{ cursor:"pointer" }}
                  onClick={() => setSelectedProgram(p.id)}
                >
                  <div style={{
                    width:16, height:16, borderRadius:"50%", border:"2px solid",
                    borderColor: String(selectedProgram) === String(p.id) ? "#2563eb" : "#cbd5e1",
                    background:  String(selectedProgram) === String(p.id) ? "#2563eb" : "white",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s"
                  }}>
                    {String(selectedProgram) === String(p.id) && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="white"><circle cx="4" cy="4" r="3"/></svg>
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"#0f172a" }}>{p.title}</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>
                      {fmt(p.from_date)} – {fmt(p.to_date)} · {p.participant_count || 0} already enrolled · {p.session_count || 0} sessions
                    </div>
                  </div>
                  <span className={`badge ${new Date(p.to_date) >= new Date() ? "badge-green" : "badge-gray"}`} style={{ fontSize:10 }}>
                    {new Date(p.to_date) >= new Date() ? "Active" : "Done"}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select students */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:.5 }}>
              Step 2 — Select Students ({selectedStudents.size}/{students.length})
            </div>
            <button
              onClick={toggleAll}
              style={{ fontSize:11, fontWeight:700, color:"#2563eb", background:"none", border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:5, transition:"background .12s" }}
              onMouseEnter={e => e.currentTarget.style.background="#eff6ff"}
              onMouseLeave={e => e.currentTarget.style.background="none"}
            >
              {selectedStudents.size === students.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:240, overflowY:"auto", paddingRight:2 }}>
            {students.map(s => {
              const isSelected = selectedStudents.has(s.student_id);
              return (
                <div key={s.student_id}
                  className={`student-row ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleStudent(s.student_id)}
                  style={{ cursor:"pointer" }}
                >
                  <div style={{
                    width:16, height:16, borderRadius:4, border:"2px solid",
                    borderColor: isSelected ? "#2563eb" : "#cbd5e1",
                    background:  isSelected ? "#2563eb" : "white",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s"
                  }}>
                    {isSelected && <Ic.Check/>}
                  </div>
                  <div className="student-av">{(s.name || s.username)?.charAt(0).toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {s.name || s.username}
                    </div>
                    <div style={{ fontSize:11, color:"#64748b" }}>
                      {s.rollno || "No Roll"} · {s.department || "—"} · {s.batch || "—"}
                    </div>
                  </div>
                  {s.phone && <div style={{ fontSize:11, color:"#94a3b8", flexShrink:0 }}>{s.phone}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mod-acts" style={{ marginTop:18 }}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={assign}
            disabled={busy || eventPrograms.length === 0}
          >
            {busy && <div className="spinner-sm"/>}
            <Ic.Assign/> Assign {selectedStudents.size} Student{selectedStudents.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   EVENT REGISTRATIONS VIEW
   Shows all approved events as cards, click to see students
════════════════════════════════════════════════════════ */
function EventRegistrationsView({ programs, onBack }) {
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedEvent,setSelectedEvent]= useState(null);  // full event obj
  const [students,     setStudents]     = useState([]);
  const [stuLoading,   setStuLoading]   = useState(false);
  const [assignModal,  setAssignModal]  = useState(false);
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    fetch(`${API}/staff/events`, { headers: { Authorization:"Bearer "+getToken() } })
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const viewStudents = async (evt) => {
    setSelectedEvent(evt);
    setStuLoading(true);
    setStudents([]);
    try {
      const res  = await fetch(`${API}/staff/events/${evt.id}/registrations`, {
        headers: { Authorization:"Bearer "+getToken() }
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch { setStudents([]); }
    finally { setStuLoading(false); }
  };

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Student list panel ── */
  if (selectedEvent) {
    const filteredStudents = students.filter(s =>
      (s.name || s.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.rollno || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.department || "").toLowerCase().includes(search.toLowerCase())
    );

    const eventPrograms = programs.filter(p => String(p.event_id) === String(selectedEvent.id));

    return (
      <div>
        {assignModal && (
          <div className="mod-overlay" onClick={e => e.target === e.currentTarget && setAssignModal(false)}>
            <AssignModal
              event={selectedEvent}
              students={students}
              programs={programs}
              onClose={() => setAssignModal(false)}
              onDone={() => setAssignModal(false)}
            />
          </div>
        )}

        {/* Back + header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
          <button
            onClick={() => { setSelectedEvent(null); setSearch(""); }}
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, color:"#334155", cursor:"pointer", transition:"background .15s", flexShrink:0 }}
            onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background="white"}
          >
            <Ic.Back/> All Events
          </button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {selectedEvent.title}
            </div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:1 }}>
              {selectedEvent.event_type === "internal" ? "🏫 Internal" : "🌐 External"} · {fmt(selectedEvent.event_date)}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => setAssignModal(true)}
            disabled={students.length === 0}
            style={{ flexShrink:0 }}
          >
            <Ic.Assign/> Assign to Training
          </button>
        </div>

        {/* Stats */}
        <div className="stat-row" style={{ marginBottom:16 }}>
          {[
            { val: students.length,          lbl:"Total Registered" },
            { val: eventPrograms.length,      lbl:"Training Programs" },
            { val: [...new Set(students.map(s=>s.department).filter(Boolean))].length, lbl:"Departments" },
            { val: [...new Set(students.map(s=>s.batch).filter(Boolean))].length,      lbl:"Batches"     },
          ].map((c,i) => (
            <div key={i} className="stat-card" style={{ animationDelay:`${i*.06}s` }}>
              <div className="stat-val">{c.val}</div>
              <div className="stat-lbl">{c.lbl}</div>
            </div>
          ))}
        </div>

        {/* Training programs for this event (quick summary) */}
        {eventPrograms.length > 0 && (
          <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"12px 16px", marginBottom:16, fontSize:13 }}>
            <div style={{ fontWeight:700, color:"#1d4ed8", marginBottom:6 }}>🏋️ Training Programs for this Event</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {eventPrograms.map(p => (
                <span key={p.id} style={{ background:"white", border:"1px solid #bfdbfe", borderRadius:8, padding:"4px 10px", fontSize:12, fontWeight:600, color:"#1e40af" }}>
                  {p.title} · {p.participant_count||0} enrolled
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="tbl-card" style={{ marginBottom:14 }}>
          <div className="tbl-toolbar">
            <div className="srch-wrap">
              <Ic.Search/>
              <input className="srch-in" placeholder="Search students…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            {search && <button className="clr-btn" onClick={() => setSearch("")}>✕ Clear</button>}
          </div>
        </div>

        {/* Students table */}
        <div className="tbl-card">
          {stuLoading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:48 }}><div className="spinner"/></div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-st">
              <div className="empty-ic">👤</div>
              <div className="empty-title">{search ? "No students match search" : "No registrations yet"}</div>
              <div className="empty-sub">{search ? "Try a different search" : "Students who register for this event will appear here"}</div>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="g-tbl">
                <thead>
                  <tr>
                    <th></th>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Reg. No</th>
                    <th>Department</th>
                    <th>Batch</th>
                    <th>Contact</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={s.student_id} className="g-row" style={{ animationDelay:`${i*.03}s` }}>
                      <td style={{ color:"#94a3b8", width:32, fontSize:12 }}>{i+1}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div className="student-av" style={{ width:30, height:30, fontSize:12 }}>
                            {(s.name || s.username)?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:13, color:"#0f172a" }}>{s.name || "—"}</div>
                            <div style={{ fontSize:11, color:"#64748b" }}>@{s.username}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue" style={{ fontFamily:"monospace", fontSize:11 }}>{s.rollno||"—"}</span></td>
                      <td style={{ fontSize:12, color:"#475569", fontFamily:"monospace" }}>{s.reg_number||"—"}</td>
                      <td><span className="badge badge-purple">{s.department||"—"}</span></td>
                      <td style={{ fontWeight:600 }}>{s.batch||"—"}</td>
                      <td style={{ fontSize:12, color:"#475569" }}>
                        {s.phone && <div>{s.phone}</div>}
                        {s.email && <div style={{ color:"#64748b", fontSize:11 }}>{s.email}</div>}
                        {!s.phone && !s.email && <span style={{ color:"#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ fontSize:12, color:"#64748b" }}>
                        {s.registered_at ? new Date(s.registered_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="tbl-footer">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
          </div>
        </div>
      </div>
    );
  }

  /* ── Events grid ── */
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
        <button
          onClick={onBack}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, color:"#334155", cursor:"pointer", transition:"background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.background="white"}
        >
          <Ic.Back/> Back to Programs
        </button>
        <div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:18, color:"#0f172a" }}>Event Registrations</div>
          <div style={{ fontSize:12, color:"#64748b", marginTop:1 }}>Click an event to view registered students and assign to training</div>
        </div>
      </div>

      {/* Search */}
      <div className="tbl-card" style={{ marginBottom:16 }}>
        <div className="tbl-toolbar">
          <div className="srch-wrap">
            <Ic.Search/>
            <input className="srch-in" placeholder="Search events…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {search && <button className="clr-btn" onClick={() => setSearch("")}>✕ Clear</button>}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:64 }}><div className="spinner"/></div>
      ) : filteredEvents.length === 0 ? (
        <div className="tbl-card">
          <div className="empty-st">
            <div className="empty-ic">📅</div>
            <div className="empty-title">No approved events found</div>
            <div className="empty-sub">Events approved by the director will appear here</div>
          </div>
        </div>
      ) : (
        <div className="tm-grid">
          {filteredEvents.map((evt, i) => {
            const eventPrograms = programs.filter(p => String(p.event_id) === String(evt.id));
            return (
              <div key={evt.id} className="ev-reg-card" style={{ animationDelay:`${i*.06}s` }}
                onClick={() => viewStudents(evt)}>
                <div className="ev-reg-header">
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{
                      display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700, marginBottom:6,
                      background: evt.event_type==="internal" ? "#dbeafe" : "#fef3c7",
                      color:      evt.event_type==="internal" ? "#1d4ed8" : "#b45309"
                    }}>
                      {evt.event_type==="internal" ? "🏫 Internal" : "🌐 External"}
                    </span>
                    <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", lineHeight:1.35, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {evt.title}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:22, color:"#2563eb", lineHeight:1 }}>
                      {evt.registered_count || 0}
                    </div>
                    <div style={{ fontSize:10, color:"#64748b", fontWeight:600 }}>registered</div>
                  </div>
                </div>

                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {evt.event_date && (
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#475569" }}>
                      <Ic.Cal/> {fmt(evt.event_date)}
                    </div>
                  )}
                  {evt.last_registration_date && (
                    <div style={{ fontSize:12, color:"#64748b" }}>
                      Reg. closes: {fmt(evt.last_registration_date)}
                    </div>
                  )}
                </div>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #f1f5f9", paddingTop:10 }}>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {eventPrograms.length > 0 ? (
                      <span className="badge badge-green" style={{ fontSize:11 }}>
                        <span className="bdot"/> {eventPrograms.length} training program{eventPrograms.length!==1?"s":""}
                      </span>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize:11 }}>No training yet</span>
                    )}
                  </div>
                  <span style={{ fontSize:12, color:"#2563eb", fontWeight:600 }}>
                    View Students →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SESSION FORM (inline add/edit)
════════════════════════════════════════════════════════ */
function SessionForm({ programId, session, token, onDone, onCancel }) {
  const blank = { session_date:"", start_time:"", end_time:"", location:"", notes:"" };
  const [form, setForm] = useState(session ? {
    session_date: session.session_date?.split("T")[0] || "",
    start_time:   session.start_time?.slice(0,5)      || "",
    end_time:     session.end_time?.slice(0,5)        || "",
    location:     session.location                    || "",
    notes:        session.notes                       || "",
  } : blank);
  const [busy, setBusy] = useState(false);
  const [err,  setErr ] = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setErr("");
    if (!form.session_date || !form.start_time || !form.end_time)
      return setErr("Date, start time and end time are required");
    setBusy(true);
    try {
      const url = session
        ? `${API}/staff/training-programs/${programId}/sessions/${session.id}`
        : `${API}/staff/training-programs/${programId}/sessions`;
      const res = await fetch(url, {
        method: session ? "PUT" : "POST",
        headers: { "Content-Type":"application/json", Authorization:"Bearer "+getToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Error");
      onDone();
    } catch { setErr("Network error"); }
    finally { setBusy(false); }
  };

  return (
    <div className="tm-add-form">
      <div style={{ fontWeight:700, fontSize:13, color:"#334155" }}>
        {session ? "✏️ Edit Session" : "➕ Add New Session"}
      </div>
      {err && <div style={{ fontSize:12, color:"#dc2626", background:"#fef2f2", borderRadius:7, padding:"6px 10px" }}>⚠️ {err}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label className="tm-form-lbl">Date *</label>
          <input type="date" className="tm-form-in" value={form.session_date} onChange={f("session_date")}/>
        </div>
        <div>
          <label className="tm-form-lbl">Start Time *</label>
          <input type="time" className="tm-form-in" value={form.start_time} onChange={f("start_time")}/>
        </div>
        <div>
          <label className="tm-form-lbl">End Time *</label>
          <input type="time" className="tm-form-in" value={form.end_time} onChange={f("end_time")}/>
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label className="tm-form-lbl">Location</label>
          <input className="tm-form-in" placeholder="e.g. Ground A" value={form.location} onChange={f("location")}/>
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label className="tm-form-lbl">Notes</label>
          <input className="tm-form-in" placeholder="Optional notes…" value={form.notes} onChange={f("notes")}/>
        </div>
      </div>
      <div style={{ display:"flex", gap:7, justifyContent:"flex-end" }}>
        <button className="btn-cancel" style={{ padding:"7px 14px", fontSize:12 }} onClick={onCancel}>Cancel</button>
        <button className="btn-primary" style={{ padding:"7px 14px", fontSize:12 }} onClick={save} disabled={busy}>
          {busy && <div className="spinner-sm"/>}
          {session ? "Update" : "Add Session"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DETAIL MODAL (sessions + participants)
════════════════════════════════════════════════════════ */
function DetailModal({ prog, token, onClose }) {
  const [detail,   setDetail]   = useState(null);
  const [tab,      setTab]      = useState("sessions");
  const [addForm,  setAddForm]  = useState(false);
  const [editSess, setEditSess] = useState(null);
  const [delBusy,  setDelBusy]  = useState(null);

  const load = useCallback(() => {
    fetch(`${API}/staff/training-programs/${prog.id}`, {
      headers: { Authorization:"Bearer "+getToken() },
    }).then(r => r.json()).then(setDetail);
  }, [prog.id]);

  useEffect(() => { load(); }, [load]);

  const deleteSession = async sessId => {
    if (!window.confirm("Delete this session?")) return;
    setDelBusy(sessId);
    await fetch(`${API}/staff/training-programs/${prog.id}/sessions/${sessId}`, {
      method:"DELETE", headers:{ Authorization:"Bearer "+getToken() },
    });
    setDelBusy(null);
    load();
  };

  const removeParticipant = async studentId => {
    if (!window.confirm("Remove this participant from training?")) return;
    await fetch(`${API}/staff/training-programs/${prog.id}/participants/${studentId}`, {
      method:"DELETE", headers:{ Authorization:"Bearer "+getToken() },
    });
    load();
  };

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box" style={{ maxWidth:600, width:"100%", maxHeight:"88dvh" }}>
        <div className="mod-hd">
          <div style={{ flex:1, minWidth:0 }}>
            <div className="mod-title" style={{ fontSize:"clamp(14px,4vw,17px)" }}>{prog.title}</div>
            <div className="mod-sub">{prog.event_title} · by {prog.created_by_name}</div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close/></button>
        </div>

        <div className="tm-subtabs">
          <button className={`tm-subtab ${tab==="sessions"?"active":""}`}
            onClick={() => { setTab("sessions"); setAddForm(false); setEditSess(null); }}>
            📅 Sessions ({detail?.sessions?.length || 0})
          </button>
          <button className={`tm-subtab ${tab==="participants"?"active":""}`}
            onClick={() => setTab("participants")}>
            👥 Participants ({detail?.participants?.length || 0})
          </button>
        </div>

        {!detail
          ? <div style={{ display:"flex", justifyContent:"center", padding:40 }}><div className="spinner"/></div>

          : tab === "sessions"
            ? <>
                <div className="tm-sess-list">
                  {!detail.sessions?.length && !addForm && (
                    <div style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13 }}>
                      No sessions yet — add the first one below.
                    </div>
                  )}
                  {detail.sessions?.map((s, i) =>
                    editSess?.id === s.id
                      ? <SessionForm key={s.id} programId={prog.id} session={editSess} token={token}
                          onDone={() => { setEditSess(null); load(); }}
                          onCancel={() => setEditSess(null)}/>
                      : <div key={s.id} className="tm-sess-item">
                          <div className="tm-sess-num">{i + 1}</div>
                          <div className="tm-sess-info">
                            <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{fmtDay(s.session_date)}</div>
                            <div style={{ fontSize:11, color:"#64748b", marginTop:2, display:"flex", gap:10, flexWrap:"wrap" }}>
                              <span>🕐 {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</span>
                              {s.location && <span>📍 {s.location}</span>}
                              {s.notes    && <span>📝 {s.notes}</span>}
                            </div>
                          </div>
                          <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                            <button className="btn-edit-sm" style={{ padding:"5px 8px" }}
                              onClick={() => { setEditSess(s); setAddForm(false); }}>
                              <Ic.Edit/>
                            </button>
                            <button className="btn-del-sm" style={{ padding:"5px 8px" }}
                              disabled={delBusy === s.id}
                              onClick={() => deleteSession(s.id)}>
                              {delBusy === s.id
                                ? <div className="spinner-sm" style={{ borderTopColor:"#ef4444" }}/>
                                : <Ic.Trash/>}
                            </button>
                          </div>
                        </div>
                  )}
                </div>
                {addForm
                  ? <SessionForm programId={prog.id} token={token}
                      onDone={() => { setAddForm(false); load(); }}
                      onCancel={() => setAddForm(false)}/>
                  : <button className="btn-action-sm"
                      style={{ marginTop:10, width:"100%", justifyContent:"center", padding:"9px" }}
                      onClick={() => { setAddForm(true); setEditSess(null); }}>
                      <Ic.Plus/> Add Session
                    </button>
                }
              </>

            : <div className="tm-pills" style={{ maxHeight:300, overflowY:"auto" }}>
                {detail.participants?.map(p => (
                  <div key={p.student_id} className="tm-pill" style={{ paddingRight:6 }}>
                    <div className="tm-pill-av">{(p.name || p.username)?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#334155", lineHeight:1.2 }}>{p.name || p.username}</div>
                      <div style={{ fontSize:10, color:"#94a3b8" }}>{p.rollno} · {p.department}</div>
                    </div>
                    <button
                      onClick={() => removeParticipant(p.student_id)}
                      style={{ marginLeft:4, width:18, height:18, borderRadius:4, border:"none", background:"#fee2e2", color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
                      title="Remove participant"
                    >
                      <Ic.Close/>
                    </button>
                  </div>
                ))}
                {!detail.participants?.length && (
                  <div style={{ fontSize:13, color:"#94a3b8", padding:16 }}>No participants yet</div>
                )}
              </div>
        }

        <div className="mod-acts" style={{ marginTop:16 }}>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CREATE / EDIT PROGRAM MODAL
════════════════════════════════════════════════════════ */
function ProgramModal({ mode, prog, events, token, onClose, onSave }) {
  const [form, setForm] = useState({
    event_id:    prog?.event_id                || "",
    title:       prog?.title                   || "",
    from_date:   prog?.from_date?.split("T")[0]|| "",
    to_date:     prog?.to_date?.split("T")[0]  || "",
    start_time:  prog?.start_time?.slice(0,5)  || "",
    end_time:    prog?.end_time?.slice(0,5)    || "",
    location:    prog?.location                || "",
    description: prog?.description             || "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const selEvent = events.find(e => String(e.id) === String(form.event_id));

  const save = async () => {
    setError("");
    if (!form.event_id || !form.title || !form.from_date || !form.to_date || !form.start_time || !form.end_time)
      return setError("Event, title, date range and times are required");
    setLoading(true);
    try {
      const url    = mode === "create"
        ? `${API}/staff/training-programs`
        : `${API}/staff/training-programs/${prog.id}`;
      const res    = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type":"application/json", Authorization:"Bearer "+getToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Error");
      if (mode === "create")
        alert(`✅ Program created!\n${data.participants_added} registered students auto-enrolled.\n\nClick "View / Sessions" to add sessions.`);
      onSave();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mod-box" style={{ width:"100%", maxWidth:540 }}>
        <div className="mod-hd">
          <div>
            <div className="mod-title">{mode === "create" ? "New Training Program" : "Edit Program"}</div>
            <div className="mod-sub">
              {mode === "create"
                ? "Registered students auto-enrolled · Add sessions after creating"
                : "Update program details"}
            </div>
          </div>
          <button className="mod-close" onClick={onClose}><Ic.Close/></button>
        </div>

        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:9, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#dc2626" }}>
            ⚠️ {error}
          </div>
        )}

        <div className="mod-grid">
          <div className="mod-field full">
            <label>Event *</label>
            <select value={form.event_id} onChange={f("event_id")} disabled={mode==="edit"}>
              <option value="">— Select Event —</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title} ({e.registered_count||0} registered)</option>
              ))}
            </select>
            {selEvent && (
              <span style={{ fontSize:11, color:"#64748b", marginTop:3 }}>
                📅 {fmt(selEvent.event_date)} · {selEvent.registered_count||0} students will be auto-enrolled
              </span>
            )}
          </div>
          <div className="mod-field full">
            <label>Program Title *</label>
            <input placeholder="e.g. Kabaddi Pre-Competition Training" value={form.title} onChange={f("title")}/>
          </div>
          <div className="mod-field"><label>Start Date *</label><input type="date" value={form.from_date} onChange={f("from_date")}/></div>
          <div className="mod-field"><label>End Date *</label><input type="date" value={form.to_date} onChange={f("to_date")}/></div>
          <div className="mod-field"><label>Default Start Time *</label><input type="time" value={form.start_time} onChange={f("start_time")}/></div>
          <div className="mod-field"><label>Default End Time *</label><input type="time" value={form.end_time} onChange={f("end_time")}/></div>
          <div className="mod-field full"><label>Default Location</label><input placeholder="e.g. Indoor Hall" value={form.location} onChange={f("location")}/></div>
          <div className="mod-field full"><label>Description</label><textarea rows={2} value={form.description} onChange={f("description")}/></div>
        </div>

        <div className="mod-acts">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={loading}>
            {loading && <div className="spinner-sm"/>}
            {mode === "create" ? "Create Program" : "Update Program"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function TrainingManagement({ token }) {
  inject();
  const [view,     setView]     = useState("programs"); // "programs" | "registrations"
  const [events,   setEvents]   = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [evFilter, setEvFilter] = useState("all");
  const [modal,    setModal]    = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const url = evFilter !== "all"
        ? `${API}/staff/training-programs?event_id=${evFilter}`
        : `${API}/staff/training-programs`;
      const [pr, ev] = await Promise.all([
        fetch(url,                 { headers:{ Authorization:"Bearer "+getToken() } }).then(r=>r.json()),
        fetch(`${API}/staff/events`,{ headers:{ Authorization:"Bearer "+getToken() } }).then(r=>r.json()),
      ]);
      setPrograms(Array.isArray(pr) ? pr : []);
      setEvents(Array.isArray(ev) ? ev : []);
    } catch { setPrograms([]); }
    finally { setLoading(false); }
  }, [evFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const del = async id => {
    if (!window.confirm("Delete this program and all its sessions?")) return;
    await fetch(`${API}/staff/training-programs/${id}`, {
      method:"DELETE", headers:{ Authorization:"Bearer "+getToken() }
    });
    loadAll();
  };

  const filtered = programs.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.event_title?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Event Registrations view ── */
  if (view === "registrations") {
    return (
      <EventRegistrationsView
        programs={programs}
        onBack={() => setView("programs")}
      />
    );
  }

  /* ── Programs view ── */
  return (
    <div>
      {modal?.t === "create" && (
        <ProgramModal mode="create" events={events} token={token}
          onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll(); }}/>
      )}
      {modal?.t === "edit" && (
        <ProgramModal mode="edit" prog={modal.d} events={events} token={token}
          onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll(); }}/>
      )}
      {modal?.t === "view" && (
        <DetailModal prog={modal.d} token={token}
          onClose={() => { setModal(null); loadAll(); }}/>
      )}

      <div className="pg-hdr">
        <div>
          <div className="pg-title">Training Management</div>
          <div className="pg-sub">Create programs · add sessions · assign students from event registrations</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {/* ── KEY BUTTON ── */}
          <button
            className="btn-action-sm"
            style={{ padding:"9px 16px", fontSize:13 }}
            onClick={() => setView("registrations")}
          >
            <Ic.Users/> View Event Registrations
          </button>
          <button className="btn-primary" onClick={() => setModal({ t:"create" })}>
            <Ic.Plus/> New Program
          </button>
        </div>
      </div>

      <div className="stat-row">
        {[
          { val:programs.length, lbl:"Programs" },
          { val:programs.filter(p => new Date(p.to_date) >= new Date()).length, lbl:"Active" },
          { val:programs.filter(p => new Date(p.to_date) < new Date()).length,  lbl:"Completed" },
          { val:programs.reduce((a,p) => a + parseInt(p.participant_count||0), 0), lbl:"Students" },
          { val:programs.reduce((a,p) => a + parseInt(p.session_count||0), 0),     lbl:"Sessions" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i*.07}s` }}>
            <div className="stat-val">{s.val}</div><div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tbl-card" style={{ marginBottom:16 }}>
        <div className="tbl-toolbar">
          <div className="srch-wrap" style={{ flex:1, minWidth:160 }}>
            <Ic.Search/>
            <input className="srch-in" placeholder="Search programs…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="fil-sel" value={evFilter} onChange={e=>setEvFilter(e.target.value)}>
            <option value="all">All Events</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          {(search || evFilter !== "all") && (
            <button className="clr-btn" onClick={() => { setSearch(""); setEvFilter("all"); }}>✕ Clear</button>
          )}
        </div>
      </div>

      {loading
        ? <div style={{ display:"flex", justifyContent:"center", padding:64 }}><div className="spinner"/></div>
        : filtered.length === 0
          ? <div className="tbl-card">
              <div className="empty-st">
                <div className="empty-ic">🏋️</div>
                <div className="empty-title">No training programs yet</div>
                <div className="empty-sub">Create a program, or view event registrations to assign students</div>
                <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:14, flexWrap:"wrap" }}>
                  <button className="btn-action-sm" onClick={() => setView("registrations")}><Ic.Users/> View Registrations</button>
                  <button className="btn-primary" onClick={() => setModal({ t:"create" })}><Ic.Plus/> New Program</button>
                </div>
              </div>
            </div>
          : <div className="tm-grid">
              {filtered.map((p, i) => {
                const active = new Date(p.to_date) >= new Date();
                return (
                  <div key={p.id} className={`tm-card ${active?"active":"completed"}`} style={{ animationDelay:`${i*.06}s` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{p.event_title}</div>
                      </div>
                      <span className={`badge ${active?"badge-green":"badge-yellow"}`} style={{ flexShrink:0 }}>
                        <span className="bdot"/>{active?"Active":"Done"}
                      </span>
                    </div>

                    <div className="tm-meta">
                      {[
                        { I:Ic.Cal,   t:`${fmt(p.from_date)} → ${fmt(p.to_date)}` },
                        { I:Ic.Clock, t:`${p.start_time?.slice(0,5)||"—"} – ${p.end_time?.slice(0,5)||"—"}` },
                        { I:Ic.Users, t:`${p.participant_count||0} students enrolled` },
                        { I:Ic.Pin,   t:p.location || "No default location" },
                      ].map(({ I, t }, j) => (
                        <div key={j} className="tm-meta-row"><I/><span className="tm-meta-txt">{t}</span></div>
                      ))}
                    </div>

                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span className="badge badge-purple" style={{ fontSize:11 }}>{p.session_count||0} sessions</span>
                      {parseInt(p.session_count) === 0 && (
                        <span style={{ fontSize:11, color:"#f59e0b", fontWeight:600 }}>⚠️ No sessions yet</span>
                      )}
                    </div>

                    <div className="tm-actions">
                      <button className="btn-view-sm" onClick={() => setModal({ t:"view", d:p })}>
                        <Ic.Eye/><span>View / Sessions</span>
                      </button>
                      <button className="btn-edit-sm" onClick={() => setModal({ t:"edit", d:p })}>
                        <Ic.Edit/><span>Edit</span>
                      </button>
                      <button className="btn-del-sm" onClick={() => del(p.id)}>
                        <Ic.Trash/><span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
      }
    </div>
  );
}
