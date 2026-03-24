// src/components/PerformanceManagement.jsx
import { useState, useEffect } from "react";
const API = process.env.REACT_APP_API_URL;

const inject = () => {
  if (document.getElementById("pm-sty")) return;
  const s = document.createElement("style"); s.id = "pm-sty";
  s.textContent = `
    .pm-type-tabs { display:flex; gap:3px; background:#f1f5f9; border-radius:9px; padding:3px; }
    .pm-type-tab { flex:1; padding:7px 10px; border-radius:7px; border:none; cursor:pointer; font-weight:600; font-size:12px; font-family:Inter,sans-serif; text-align:center; transition:all .15s; background:transparent; color:#64748b; }
    .pm-type-tab.active { background:white; color:#1d4ed8; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .pm-rating { display:flex; gap:3px; flex-wrap:wrap; }
    .pm-rb { width:26px; height:26px; border-radius:5px; border:none; cursor:pointer; font-size:11px; font-weight:700; font-family:Inter,sans-serif; transition:all .1s; }
    .pm-rb.on { background:#f59e0b; color:white; }
    .pm-rb:not(.on) { background:#f1f5f9; color:#94a3b8; }
    .pm-rb:hover:not(.on) { background:#e2e8f0; color:#475569; }
    .pm-num-in { width:80px; padding:6px 8px; border-radius:7px; border:1.5px solid #e2e8f0; font-size:13px; font-family:Inter,sans-serif; outline:none; }
    .pm-num-in:focus { border-color:#3b82f6; }
    .pm-unit-sel { padding:6px 8px; border-radius:7px; border:1.5px solid #e2e8f0; font-size:12px; font-family:Inter,sans-serif; outline:none; }
    .pm-unit-sel:focus { border-color:#3b82f6; }
    .pm-txt-in { width:100%; padding:6px 8px; border-radius:7px; border:1.5px solid #e2e8f0; font-size:12px; font-family:Inter,sans-serif; outline:none; resize:none; }
    .pm-txt-in:focus,.pm-unit-sel:focus { border-color:#3b82f6; }
    .pm-mob { display:none; }
    .pm-desk { display:block; overflow-x:auto; }
    .pm-mob-card { background:white; border-radius:14px; border:1px solid #e2e8f0; padding:14px; margin-bottom:10px; box-shadow:0 1px 6px rgba(0,0,0,.04); }
    @media(max-width:640px){ .pm-mob{display:block;} .pm-desk{display:none;} .pm-type-tabs{width:100%;} }
  `;
  document.head.appendChild(s);
};

const UNITS = ["m","kg","sec","min","cm","km","pts"];
const fmt   = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

function RatingRow({ value, onChange }) {
  return (
    <div className="pm-rating">
      {[1,2,3,4,5,6,7,8,9,10].map(n=>(
        <button key={n} className={`pm-rb ${n<=value?"on":""}`} onClick={()=>onChange(n)}>{n}</button>
      ))}
    </div>
  );
}

function PerfRow({ record, type, index, onSave }) {
  const [edit, setEdit]  = useState(false);
  const [form, setForm]  = useState({ metric_value:record.metric_value||"", metric_unit:record.metric_unit||"sec", performance_text:record.performance_text||"", rating:record.rating||0 });
  const [busy, setBusy]  = useState(false);
  const rCol = form.rating>=8?"#22c55e":form.rating>=5?"#f59e0b":"#ef4444";

  const save = async () => { setBusy(true); await onSave(record.student_id,form); setBusy(false); setEdit(false); };

  return (
    <tr className="g-row" style={{animationDelay:`${index*.04}s`}}>
      <td style={{color:"#94a3b8",width:32,fontSize:11}}>{index+1}</td>
      <td>
        <div className="av-cell">
          <div className="av-ring">{(record.name||record.username)?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="av-name">{record.name||record.username}</div>
            <div className="av-sub">{record.rollno} · {record.department}</div>
          </div>
        </div>
      </td>
      {edit ? (
        <>
          {type==="athletic"
            ? <td><div style={{display:"flex",gap:5}}><input className="pm-num-in" type="number" step="0.01" placeholder="Value" value={form.metric_value} onChange={e=>setForm(p=>({...p,metric_value:e.target.value}))}/><select className="pm-unit-sel" value={form.metric_unit} onChange={e=>setForm(p=>({...p,metric_unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div></td>
            : <td><textarea className="pm-txt-in" rows={2} placeholder="Performance notes…" value={form.performance_text} onChange={e=>setForm(p=>({...p,performance_text:e.target.value}))} style={{width:160}}/></td>
          }
          <td><RatingRow value={form.rating} onChange={v=>setForm(p=>({...p,rating:v}))}/></td>
          <td><div style={{display:"flex",gap:5}}><button className="btn-action-sm" onClick={save} disabled={busy}>{busy&&<div className="spinner-sm"/>}Save</button><button className="btn-cancel" style={{padding:"5px 10px",fontSize:12}} onClick={()=>setEdit(false)}>✕</button></div></td>
        </>
      ) : (
        <>
          {type==="athletic"
            ? <td>{record.metric_value?<span className="badge badge-blue">{record.metric_value} {record.metric_unit}</span>:<span style={{fontSize:12,color:"#94a3b8"}}>—</span>}</td>
            : <td style={{fontSize:12,color:"#475569",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{record.performance_text||"—"}</td>
          }
          <td>{record.rating?<span style={{fontWeight:700,fontSize:14,color:rCol}}>{record.rating}<span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>/10</span></span>:<span style={{fontSize:12,color:"#94a3b8"}}>—</span>}</td>
          <td><button className="btn-edit-sm" onClick={()=>setEdit(true)}>✏️ <span>Enter</span></button></td>
        </>
      )}
    </tr>
  );
}

export default function PerformanceManagement({ token }) {
  inject();
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selProg,  setSelProg]  = useState("");
  const [selSess,  setSelSess]  = useState("");
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [type,     setType]     = useState("athletic");

  useEffect(()=>{
    fetch(`${API}/staff/training-programs`,{headers:{Authorization:"Bearer "+token}})
      .then(r=>r.json()).then(d=>setPrograms(Array.isArray(d)?d:[])).catch(()=>{});
  },[token]);

  const onProgChange = async id => {
    setSelProg(id); setSelSess(""); setRecords([]);
    if (!id){ setSessions([]); return; }
    const d = await fetch(`${API}/staff/training-programs/${id}`,{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()).catch(()=>({}));
    setSessions(d?.sessions||[]);
  };

  const loadSession = async id => {
    setSelSess(id); setRecords([]);
    if (!id) return;
    setLoading(true);
    try {
      const [progData, perfData] = await Promise.all([
        fetch(`${API}/staff/training-programs/${selProg}`,{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()),
        fetch(`${API}/staff/performance/session/${id}`,{headers:{Authorization:"Bearer "+token}}).then(r=>r.json()),
      ]);
      const perfMap = {};
      (Array.isArray(perfData)?perfData:[]).forEach(p=>{ perfMap[p.student_id]=p; });
      const merged = (progData?.participants||[]).map(p=>({
        ...p, session_id:parseInt(id), program_id:parseInt(selProg),
        ...(perfMap[p.student_id]||{}),
      }));
      setRecords(merged);
    }catch{}finally{setLoading(false);}
  };

  const savePerfRecord = async (studentId, form) => {
    await fetch(`${API}/staff/performance`,{
      method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
      body:JSON.stringify({
        session_id:parseInt(selSess), program_id:parseInt(selProg), student_id:studentId,
        metric_value:form.metric_value||null, metric_unit:form.metric_unit||null,
        performance_text:form.performance_text||null, rating:form.rating||null,
      })
    });
    loadSession(selSess);
  };

  const recorded = records.filter(r=>r.id).length;
  const avgRating = records.filter(r=>r.rating).length
    ? (records.filter(r=>r.rating).reduce((a,r)=>a+r.rating,0)/records.filter(r=>r.rating).length).toFixed(1) : "—";

  return (
    <div>
      <div className="pg-hdr">
        <div><div className="pg-title">Performance Management</div><div className="pg-sub">Record and review student performance per session</div></div>
        <div className="pm-type-tabs">
          <button className={`pm-type-tab ${type==="athletic"?"active":""}`} onClick={()=>setType("athletic")}>🏃 Athletic</button>
          <button className={`pm-type-tab ${type==="team"?"active":""}`}     onClick={()=>setType("team")}>🤝 Team Game</button>
        </div>
      </div>

      <div className="tbl-card" style={{marginBottom:16}}>
        <div className="tbl-toolbar" style={{flexWrap:"wrap"}}>
          <select className="fil-sel" style={{flex:1,minWidth:200}} value={selProg} onChange={e=>onProgChange(e.target.value)}>
            <option value="">— Select Training Program —</option>
            {programs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select className="fil-sel" style={{flex:1,minWidth:170}} value={selSess} onChange={e=>loadSession(e.target.value)} disabled={!selProg}>
            <option value="">— Select Session Date —</option>
            {sessions.map(s=><option key={s.id} value={s.id}>{fmt(s.session_date)} · {s.start_time?.slice(0,5)||""}</option>)}
          </select>
        </div>
      </div>

      {!selSess
        ? <div className="tbl-card"><div className="empty-st"><div className="empty-ic">📈</div><div className="empty-title">Select a session</div><div className="empty-sub">Choose a program and session date to enter performance data</div></div></div>
        : loading
          ? <div className="tbl-card"><div style={{display:"flex",justifyContent:"center",padding:48}}><div className="spinner"/></div></div>
          : <>
              <div className="stat-row" style={{marginBottom:14}}>
                {[{v:records.length,l:"Students"},{v:recorded,l:"Recorded"},{v:records.length-recorded,l:"Pending"},{v:avgRating,l:"Avg Rating"}].map((s,i)=>(
                  <div key={i} className="stat-card"><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>
                ))}
              </div>
              <div style={{background:type==="athletic"?"#eff6ff":"#f5f3ff",borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:12,color:type==="athletic"?"#1d4ed8":"#7c3aed",fontWeight:600,border:`1px solid ${type==="athletic"?"#bfdbfe":"#ddd6fe"}`}}>
                {type==="athletic" ? "Enter numeric metric+ rating 1–10" : "🤝 Team Game — Enter performance notes + rating 1–10"}
              </div>

              {/* Mobile */}
              <div className="pm-mob">
                {records.map(r=>(
                  <div key={r.student_id} className="pm-mob-card">
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <div className="av-ring">{(r.name||r.username)?.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div className="av-name">{r.name||r.username}</div>
                        <div className="av-sub">{r.rollno} · {r.department}</div>
                      </div>
                      {r.id&&<span className="badge badge-green" style={{fontSize:10}}>✓ Saved</span>}
                    </div>
                    <MobilePerfForm record={r} type={type} onSave={savePerfRecord}/>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="pm-desk">
                <div className="tbl-card">
                  <table className="g-tbl">
                    <thead><tr><th></th><th>Student</th>{type==="athletic"?<th>Metric</th>:<th>Notes</th>}<th>Rating (1–10)</th><th>Action</th></tr></thead>
                    <tbody>
                      {!records.length
                        ? <tr><td colSpan="5"><div className="empty-st"><div className="empty-ic">📊</div><div className="empty-title">No participants</div></div></td></tr>
                        : records.map((r,i)=><PerfRow key={r.student_id} record={r} type={type} index={i} onSave={savePerfRecord}/>)
                      }
                    </tbody>
                  </table>
                  <div className="tbl-footer"><strong>{recorded}</strong> of <strong>{records.length}</strong> recorded · Avg rating: <strong>{avgRating}</strong></div>
                </div>
              </div>
            </>
      }
    </div>
  );
}

function MobilePerfForm({ record, type, onSave }) {
  const [form, setForm] = useState({ metric_value:record.metric_value||"", metric_unit:record.metric_unit||"sec", performance_text:record.performance_text||"", rating:record.rating||0 });
  const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); await onSave(record.student_id,form); setBusy(false); };
  return (
    <div>
      {type==="athletic"
        ? <div style={{display:"flex",gap:7,marginBottom:10}}><input className="pm-num-in" style={{flex:1}} type="number" step="0.01" placeholder="Value" value={form.metric_value} onChange={e=>setForm(p=>({...p,metric_value:e.target.value}))}/><select className="pm-unit-sel" value={form.metric_unit} onChange={e=>setForm(p=>({...p,metric_unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
        : <textarea className="pm-txt-in" rows={2} placeholder="Notes…" style={{marginBottom:10}} value={form.performance_text} onChange={e=>setForm(p=>({...p,performance_text:e.target.value}))}/>
      }
      <div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>Rating</div><RatingRow value={form.rating} onChange={v=>setForm(p=>({...p,rating:v}))}/></div>
      <button className="btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={save} disabled={busy}>{busy&&<div className="spinner-sm"/>} Save</button>
    </div>
  );
}
