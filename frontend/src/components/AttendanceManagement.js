import { useState, useEffect, useCallback } from "react";
const API = process.env.REACT_APP_API_URL;

const injectStyles = () => {
  if (document.getElementById("am-resp")) return;
  const s = document.createElement("style");
  s.id = "am-resp";
  s.textContent = `
    .am-toggle-wrap { display:flex; gap:4px; }
    .am-toggle { padding:6px 12px; border-radius:8px; border:none; cursor:pointer;
      font-weight:600; font-size:12px; font-family:Inter,sans-serif;
      transition:all .15s; }
    .am-toggle.present { background:#dcfce7; color:#15803d; }
    .am-toggle.present.active { background:#22c55e; color:white; }
    .am-toggle.absent  { background:#fee2e2; color:#ef4444; }
    .am-toggle.absent.active  { background:#ef4444; color:white; }
    .am-remark-in { padding:6px 9px; border-radius:8px; border:1.5px solid #e2e8f0;
      font-size:12px; font-family:Inter,sans-serif; outline:none; width:100%; min-width:100px; }
    .am-remark-in:focus { border-color:#3b82f6; }
    .am-pct-bar { flex:1; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden; min-width:50px; }
    .am-pct-fill { height:100%; border-radius:3px; transition:width .5s; }

    /* Mobile card view for attendance marking */
    .am-mobile-card { display:none; }
    .am-desktop-table { display:block; overflow-x:auto; }

    .am-view-tabs { display:flex; gap:4px; background:#f1f5f9; border-radius:10px; padding:4px; width:fit-content; flex-wrap:wrap; }
    .am-view-tab { padding:7px 14px; border-radius:8px; border:none; cursor:pointer;
      font-weight:600; font-size:12px; font-family:Inter,sans-serif; white-space:nowrap;
      transition:all .15s; }
    .am-view-tab.active { background:white; color:#1d4ed8; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .am-view-tab:not(.active) { background:transparent; color:#64748b; }

    @media (max-width:640px) {
      .am-mobile-card { display:block; }
      .am-desktop-table { display:none; }
      .am-view-tabs { width:100%; }
      .am-view-tab { flex:1; text-align:center; }
    }
  `;
  document.head.appendChild(s);
};

const Ic = {
  Check: ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
  X:     ()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Save:  ()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>,
};

const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const getUID = () => { try { return JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id; } catch { return 1; } };

/* ── Mini stats ── */
function AttendStats({ records }) {
  const total=records.length, present=records.filter(r=>r.present===true).length, absent=records.filter(r=>r.present===false).length;
  const pct = total ? Math.round((present/total)*100) : 0;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[
        {val:total,   lbl:"Total",   col:"#2563eb"},
        {val:present, lbl:"Present", col:"#22c55e"},
        {val:absent,  lbl:"Absent",  col:"#ef4444"},
        {val:`${pct}%`,lbl:"Rate",  col:"#7c3aed"},
      ].map((s,i)=>(
        <div key={i} style={{background:"white",borderRadius:12,padding:"11px 14px",border:"1px solid #e2e8f0",textAlign:"center",borderTop:`3px solid ${s.col}`}}>
          <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:"clamp(18px,4vw,22px)",color:s.col}}>{s.val}</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Mobile card for one student ── */
function MobileAttendCard({ record, onChange }) {
  return (
    <div style={{background:"white",borderRadius:14,border:"1px solid #e2e8f0",padding:"14px 15px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div className="av-ring">{record.username?.charAt(0).toUpperCase()}</div>
        <div>
          <div className="av-name">{record.username}</div>
          <div className="av-sub">{record.department} · {record.batch}</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          {record.attendance_id
            ? <span className="badge badge-green" style={{fontSize:10}}>Saved</span>
            : <span className="badge badge-yellow" style={{fontSize:10}}>Pending</span>
          }
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <button className={`am-toggle present ${record.present===true?"active":""}`}
          onClick={()=>onChange(record.student_id,"present",true)} style={{flex:1}}>
          <span style={{marginRight:4}}>✓</span> Present
        </button>
        <button className={`am-toggle absent ${record.present===false?"active":""}`}
          onClick={()=>onChange(record.student_id,"present",false)} style={{flex:1}}>
          <span style={{marginRight:4}}>✗</span> Absent
        </button>
      </div>
      <input className="am-remark-in" placeholder="Remarks (optional)…"
        value={record.remarks||""}
        onChange={e=>onChange(record.student_id,"remarks",e.target.value)}/>
    </div>
  );
}

export default function AttendanceManagement({ token }) {
  injectStyles();
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selProg,  setSelProg]  = useState("");
  const [selSess,  setSelSess]  = useState("");
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [view,     setView]     = useState("mark");
  const [summary,  setSummary]  = useState([]);

  useEffect(()=>{
    fetch(`${API}/training-programs`,{headers:{Authorization:"Bearer "+token}})
      .then(r=>r.json()).then(d=>setPrograms(Array.isArray(d)?d:[])).catch(()=>{});
  },[token]);

  const handleProgChange = async id => {
    setSelProg(id); setSelSess(""); setRecords([]); setSummary([]);
    if (!id){setSessions([]);return;}
    const d = await fetch(`${API}/training-programs/${id}`,{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).catch(()=>({}));
    setSessions(d?.sessions||[]);
  };

  const handleSessChange = async id => {
    setSelSess(id); setRecords([]);
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetch(`${API}/attendance/session/${id}`,{headers:{Authorization:"Bearer "+token}}).then(r=>r.json());
      setRecords((data.attendance||[]).map(r=>({
        student_id:r.student_id, username:r.username, department:r.department,
        batch:r.batch, attendance_id:r.attendance_id, present:r.present??null, remarks:r.remarks||"",
      })));
    }catch{}finally{setLoading(false);}
  };

  const loadSummary = useCallback(async () => {
  if (!selProg) return;

  setLoading(true);
  try {
    const d = await fetch(
      `${API}/attendance/program/${selProg}/summary`,
      { headers: { Authorization: "Bearer " + token } }
    ).then(r => r.json());

    setSummary(Array.isArray(d) ? d : []);
  } catch {
  } finally {
    setLoading(false);
  }
}, [selProg, token]);

  useEffect(() => {
  if (view === "summary" && selProg) {
    loadSummary();
  }
}, [view, selProg, loadSummary]);

  const change = (sid,key,val) => setRecords(p=>p.map(r=>r.student_id===sid?{...r,[key]:val}:r));
  const markAll = v => setRecords(p=>p.map(r=>({...r,present:v})));

  const save = async () => {
    if (!selSess) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API}/attendance/session/${selSess}/bulk`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
        body:JSON.stringify({marked_by:getUID(),records:records.map(r=>({student_id:r.student_id,present:r.present??true,remarks:r.remarks}))})
      });
      const data = await res.json();
      alert(data.message||"Saved!");
      handleSessChange(selSess);
    }catch{alert("Error");}finally{setSaving(false);}
  };

  const selSession = sessions.find(s=>String(s.id)===String(selSess));

  return (
    <div>
      <div className="pg-hdr">
        <div><div className="pg-title">Attendance Management</div><div className="pg-sub">Mark daily attendance and track student presence</div></div>
        <div className="am-view-tabs">
          <button className={`am-view-tab ${view==="mark"?"active":""}`} onClick={()=>setView("mark")}>📝 Mark</button>
          <button className={`am-view-tab ${view==="summary"?"active":""}`} onClick={()=>setView("summary")}>📊 Summary</button>
        </div>
      </div>

      {/* Selectors */}
      <div className="tbl-card" style={{marginBottom:18}}>
        <div className="tbl-toolbar" style={{flexWrap:"wrap"}}>
          <select className="fil-sel" style={{flex:1,minWidth:180}} value={selProg} onChange={e=>handleProgChange(e.target.value)}>
            <option value="">— Select Training Program —</option>
            {programs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          {view==="mark" && (
            <select className="fil-sel" style={{flex:1,minWidth:160}} value={selSess} onChange={e=>handleSessChange(e.target.value)} disabled={!selProg}>
              <option value="">— Select Date —</option>
              {sessions.map(s=><option key={s.id} value={s.id}>{fmt(s.session_date)} · {s.start_time?.slice(0,5)}</option>)}
            </select>
          )}
          {selSession && <span style={{fontSize:12,color:"#64748b",display:"flex",alignItems:"center",gap:5}}>📍 {selSession.location||"No location"}</span>}
        </div>
      </div>

      {/* ── MARK VIEW ── */}
      {view==="mark" && (
        !selSess
          ? <div className="tbl-card"><div className="empty-st"><div className="empty-ic">✅</div><div className="empty-title">Select program & session</div><div className="empty-sub">Choose a training session to mark attendance</div></div></div>
          : loading
            ? <div className="tbl-card"><div style={{display:"flex",justifyContent:"center",padding:48}}><div className="spinner"/></div></div>
            : <>
                <AttendStats records={records}/>

                {/* Action bar */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button className="btn-action-sm" onClick={()=>markAll(true)}>✓ All Present</button>
                    <button className="btn-del-sm"    onClick={()=>markAll(false)}>✗ All Absent</button>
                  </div>
                  <button className="btn-primary" onClick={save} disabled={saving}>
                    {saving?<div className="spinner-sm"/>:<Ic.Save/>} Save Attendance
                  </button>
                </div>

                {/* Mobile cards */}
                <div className="am-mobile-card">
                  {records.map(r=><MobileAttendCard key={r.student_id} record={r} onChange={change}/>)}
                  {!records.length && <div className="tbl-card"><div className="empty-st"><div className="empty-ic">👥</div><div className="empty-title">No participants</div></div></div>}
                </div>

                {/* Desktop table */}
                <div className="am-desktop-table">
                  <div className="tbl-card">
                    <table className="g-tbl">
                      <thead><tr><th></th><th>Student</th><th>Status</th><th>Remarks</th><th>Record</th></tr></thead>
                      <tbody>
                        {!records.length
                          ? <tr><td colSpan="5"><div className="empty-st"><div className="empty-ic">👥</div><div className="empty-title">No participants</div></div></td></tr>
                          : records.map((r,i)=>(
                            <tr key={r.student_id} className="g-row" style={{animationDelay:`${i*.03}s`}}>
                              <td style={{color:"#94a3b8",width:32,fontSize:12}}>{i+1}</td>
                              <td><div className="av-cell"><div className="av-ring">{r.username?.charAt(0).toUpperCase()}</div><div><div className="av-name">{r.username}</div><div className="av-sub">{r.department} · {r.batch}</div></div></div></td>
                              <td>
                                <div className="am-toggle-wrap">
                                  <button className={`am-toggle present ${r.present===true?"active":""}`} onClick={()=>change(r.student_id,"present",true)}><Ic.Check/> Present</button>
                                  <button className={`am-toggle absent  ${r.present===false?"active":""}`} onClick={()=>change(r.student_id,"present",false)}><Ic.X/> Absent</button>
                                </div>
                              </td>
                              <td><input className="am-remark-in" placeholder="Remarks…" value={r.remarks||""} onChange={e=>change(r.student_id,"remarks",e.target.value)}/></td>
                              <td>{r.attendance_id?<span className="badge badge-green" style={{fontSize:11}}><span className="bdot"/>Saved</span>:<span className="badge badge-yellow" style={{fontSize:11}}><span className="bdot"/>Pending</span>}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    <div className="tbl-footer"><strong>{records.length}</strong> students · <strong>{records.filter(r=>r.present===true).length}</strong> present</div>
                  </div>
                </div>
              </>
      )}

      {/* ── SUMMARY VIEW ── */}
      {view==="summary" && (
        !selProg
          ? <div className="tbl-card"><div className="empty-st"><div className="empty-ic">📊</div><div className="empty-title">Select a program</div><div className="empty-sub">Choose a training program to view the summary</div></div></div>
          : loading
            ? <div className="tbl-card"><div style={{display:"flex",justifyContent:"center",padding:48}}><div className="spinner"/></div></div>
            : <div className="tbl-card">
                <div className="tbl-toolbar"><span style={{fontWeight:700,fontSize:13,color:"#334155"}}>📊 Attendance Summary — All Sessions</span></div>
                <div style={{overflowX:"auto"}}>
                  <table className="g-tbl">
                    <thead><tr><th>#</th><th>Student</th><th>Sessions</th><th>Present</th><th>Absent</th><th>Rate</th><th>Status</th></tr></thead>
                    <tbody>
                      {!summary.length
                        ? <tr><td colSpan="7"><div className="empty-st"><div className="empty-ic">📋</div><div className="empty-title">No data yet</div></div></td></tr>
                        : summary.map((s,i)=>{
                            const pct=parseFloat(s.attendance_percentage||0);
                            const col=pct>=75?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
                            return (
                              <tr key={s.student_id} className="g-row" style={{animationDelay:`${i*.04}s`}}>
                                <td style={{color:"#94a3b8",width:32,fontSize:12}}>{i+1}</td>
                                <td><div className="av-cell"><div className="av-ring">{s.username?.charAt(0).toUpperCase()}</div><div><div className="av-name">{s.username}</div><div className="av-sub">{s.department} · {s.batch}</div></div></div></td>
                                <td style={{fontWeight:600,textAlign:"center"}}>{s.total_sessions}</td>
                                <td style={{fontWeight:700,color:"#22c55e",textAlign:"center"}}>{s.present_count}</td>
                                <td style={{fontWeight:700,color:"#ef4444",textAlign:"center"}}>{s.absent_count}</td>
                                <td>
                                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:100}}>
                                    <div className="am-pct-bar"><div className="am-pct-fill" style={{width:`${pct}%`,background:col}}/></div>
                                    <span style={{fontWeight:700,fontSize:13,color:col,minWidth:36}}>{pct}%</span>
                                  </div>
                                </td>
                                <td><span className={`badge ${pct>=75?"badge-green":pct>=50?"badge-yellow":"badge-red"}`}><span className="bdot"/>{pct>=75?"Good":pct>=50?"Average":"Poor"}</span></td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
                <div className="tbl-footer"><strong>{summary.length}</strong> students tracked</div>
              </div>
      )}
    </div>
  );
}
