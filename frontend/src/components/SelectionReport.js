// src/components/SelectionReport.jsx
import { useState, useEffect } from "react";
const API = "http://127.0.0.1:5000";

const inject = () => {
  if (document.getElementById("sr-sty")) return;
  const s = document.createElement("style"); s.id = "sr-sty";
  s.textContent = `
    .sr-card { background:white; border-radius:16px; border:1px solid #e2e8f0; border-left:4px solid #e2e8f0; padding:16px 18px; display:flex; align-items:center; gap:14px; box-shadow:0 2px 12px rgba(0,0,0,.04); animation:stfFadeUp .4s ease both; transition:transform .18s,box-shadow .18s; }
    .sr-card.rec  { border-left-color:#22c55e; }
    .sr-card.nrec { border-left-color:#f1f5f9; opacity:.85; }
    .sr-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.09); }
    .sr-rank { width:36px; text-align:center; flex-shrink:0; }
    .sr-ring { position:relative; flex-shrink:0; }
    .sr-ring-lbl { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; font-family:Sora,sans-serif; }
    .sr-info { flex:1; min-width:0; }
    .sr-name { font-family:Sora,sans-serif; font-weight:700; font-size:14px; color:#0f172a; }
    .sr-sub  { font-size:11px; color:#64748b; margin:2px 0 6px; }
    .sr-chips { display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
    .sr-right { display:flex; flex-direction:column; align-items:flex-end; gap:7px; flex-shrink:0; }
    .sr-pct-bar { flex:1; height:5px; background:#f1f5f9; border-radius:3px; overflow:hidden; min-width:40px; }
    .sr-pct-fill { height:100%; border-radius:3px; transition:width .5s; }
    .sr-tabs { display:flex; gap:3px; background:#f1f5f9; border-radius:9px; padding:3px; flex-wrap:wrap; }
    .sr-tab { padding:7px 12px; border-radius:7px; border:none; cursor:pointer; font-weight:600; font-size:12px; font-family:Inter,sans-serif; white-space:nowrap; transition:all .15s; background:transparent; color:#64748b; }
    .sr-tab.active { background:white; color:#1d4ed8; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .sr-thresh-in { width:56px; padding:7px 8px; border-radius:7px; border:1.5px solid #e2e8f0; font-size:13px; font-family:Inter,sans-serif; outline:none; text-align:center; }
    .sr-thresh-in:focus { border-color:#3b82f6; }
    .sr-detail-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px; }
    .sr-detail-row { max-height:280px; overflow-y:auto; border-radius:10px; border:1px solid #e2e8f0; }
    @media(max-width:640px){ .sr-card{flex-wrap:wrap;} .sr-ring{display:none;} .sr-right{flex-direction:row;align-items:center;width:100%;justify-content:space-between;} .sr-tabs{width:100%;} .sr-tab{flex:1;text-align:center;} .sr-detail-grid{grid-template-columns:repeat(2,1fr);} }
  `;
  document.head.appendChild(s);
};

const MEDALS = ["🥇","🥈","🥉"];

function ScoreRing({ score, size=52 }) {
  const r=Math.round((size-8)/2), circ=2*Math.PI*r, pct=Math.min(100,Math.max(0,score));
  const dash=(pct/100)*circ;
  const col=pct>=70?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
  return (
    <div className="sr-ring" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={7}
          strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray .6s ease"}}/>
      </svg>
      <div className="sr-ring-lbl" style={{color:col}}>{Math.round(pct)}</div>
    </div>
  );
}

function StudentDetailModal({ studentId, programId, token, onClose }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
  useEffect(()=>{
    fetch(`${API}/staff/selection/program/${programId}/student/${studentId}`,{headers:{Authorization:"Bearer "+token}})
      .then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));
  },[studentId,programId,token]);

  return (
    <div className="mod-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mod-box" style={{maxWidth:580,width:"100%"}}>
        <div className="mod-hd">
          <div style={{flex:1,minWidth:0}}>
            <div className="mod-title">{data?.student?.name||data?.student?.username||"Student"}</div>
            <div className="mod-sub">{data?.student?.rollno} · {data?.student?.department} · {data?.student?.batch}</div>
          </div>
          <button className="mod-close" onClick={onClose}><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        {loading
          ? <div style={{display:"flex",justifyContent:"center",padding:40}}><div className="spinner"/></div>
          : <>
              <div className="sr-detail-grid">
                {[{v:data?.total_sessions,l:"Sessions",c:"#2563eb"},{v:data?.present_count,l:"Present",c:"#22c55e"},{v:data?.absent_count,l:"Absent",c:"#ef4444"},{v:`${data?.attendance_percentage}%`,l:"Attend.",c:"#7c3aed"}].map((s,i)=>(
                  <div key={i} style={{background:"#f8fafc",borderRadius:10,padding:10,textAlign:"center",border:"1px solid #e2e8f0"}}>
                    <div style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="sr-detail-row">
                <table className="g-tbl">
                  <thead><tr><th>Date</th><th>Present</th><th>Metric</th><th>Notes</th><th>Rating</th></tr></thead>
                  <tbody>
                    {data?.session_details?.map((s,i)=>(
                      <tr key={i} className="g-row">
                        <td style={{fontWeight:600,fontSize:12,whiteSpace:"nowrap"}}>{fmt(s.session_date)}</td>
                        <td>{s.present===true?<span className="badge badge-green" style={{fontSize:10}}>✓</span>:s.present===false?<span className="badge badge-red" style={{fontSize:10}}>✗</span>:<span style={{color:"#94a3b8",fontSize:12}}>—</span>}</td>
                        <td>{s.metric_value?<span className="badge badge-blue" style={{fontSize:10}}>{s.metric_value} {s.metric_unit}</span>:<span style={{color:"#94a3b8",fontSize:12}}>—</span>}</td>
                        <td style={{fontSize:11,color:"#475569",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.performance_text||"—"}</td>
                        <td style={{fontWeight:700,fontSize:13,color:s.rating>=7?"#22c55e":s.rating>=5?"#f59e0b":"#94a3b8"}}>{s.rating?`${s.rating}/10`:"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
        }
        <div className="mod-acts"><button className="btn-cancel" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

function CandidateCard({ student, rank, programId, token }) {
  const [detail, setDetail] = useState(false);
  const pct = parseFloat(student.attendance_percentage||0);
  const attCol = pct>=75?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
  return (
    <>
      {detail&&<StudentDetailModal studentId={student.student_id} programId={programId} token={token} onClose={()=>setDetail(false)}/>}
      <div className={`sr-card ${student.recommended?"rec":"nrec"}`} style={{animationDelay:`${rank*.04}s`}}>
        <div className="sr-rank">
          {rank<=3?<span style={{fontSize:22}}>{MEDALS[rank-1]}</span>:<span style={{fontWeight:700,color:"#94a3b8",fontSize:13}}>#{rank}</span>}
        </div>
        <ScoreRing score={student.selection_score}/>
        <div className="sr-info">
          <div className="sr-name">{student.name||student.username}</div>
          <div className="sr-sub">{student.rollno} · {student.department} · {student.batch}</div>
          <div className="sr-chips">
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
              <span style={{fontWeight:700,color:attCol}}>{pct}%</span>
              <div className="sr-pct-bar"><div className="sr-pct-fill" style={{width:`${pct}%`,background:attCol}}/></div>
            </div>
            {student.avg_rating&&<span style={{fontSize:11,color:"#7c3aed",fontWeight:600}}>★ {student.avg_rating}/10</span>}
            {student.avg_metric&&<span className="badge badge-blue" style={{fontSize:10}}>{parseFloat(student.avg_metric).toFixed(2)} {student.metric_unit}</span>}
            {student.zero_absence&&<span className="badge badge-green" style={{fontSize:10}}>🏆 Zero Absence</span>}
          </div>
        </div>
        <div className="sr-right">
          {student.recommended
            ?<span className="badge badge-green"><span className="bdot"/>Selected</span>
            :<span className="badge badge-red"><span className="bdot"/>Not Selected</span>
          }
          <button className="btn-view-sm" style={{fontSize:11}} onClick={()=>setDetail(true)}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Details
          </button>
        </div>
      </div>
    </>
  );
}

export default function SelectionReport({ token }) {
  inject();
  const [programs,  setPrograms]  = useState([]);
  const [selProg,   setSelProg]   = useState("");
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [minAtt,    setMinAtt]    = useState(75);
  const [minRating, setMinRating] = useState(0);
  const [tab,       setTab]       = useState("rec");

  useEffect(()=>{
    fetch(`${API}/staff/training-programs`,{headers:{Authorization:"Bearer "+token}})
      .then(r=>r.json()).then(d=>setPrograms(Array.isArray(d)?d:[])).catch(()=>{});
  },[token]);

  const load = async (id,att,rat) => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await fetch(`${API}/staff/selection/program/${id}?min_attendance=${att}&min_rating=${rat}`,{headers:{Authorization:"Bearer "+token}}).then(r=>r.json());
      setReport(d);
    }catch{alert("Error loading report");}finally{setLoading(false);}
  };

  const tabData = {
    rec:  report?.recommended     || [],
    all:  [...(report?.recommended||[]), ...(report?.not_recommended||[])],
    perf: report?.perfect_attendance || [],
  };

  return (
    <div>
      <div className="pg-hdr">
        <div><div className="pg-title">Selection Report</div><div className="pg-sub">Ranked performance report for competition selection</div></div>
      </div>

      <div className="tbl-card" style={{marginBottom:16}}>
        <div className="tbl-toolbar" style={{flexWrap:"wrap",gap:10}}>
          <select className="fil-sel" style={{flex:1,minWidth:200}} value={selProg}
            onChange={e=>{setSelProg(e.target.value);setReport(null);if(e.target.value)load(e.target.value,minAtt,minRating);}}>
            <option value="">— Select Training Program —</option>
            {programs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <label style={{fontSize:12,fontWeight:600,color:"#475569",whiteSpace:"nowrap"}}>Min Attend %</label>
            <input className="sr-thresh-in" type="number" min="0" max="100" value={minAtt} onChange={e=>setMinAtt(e.target.value)}/>
            <label style={{fontSize:12,fontWeight:600,color:"#475569",whiteSpace:"nowrap"}}>Min Rating</label>
            <input className="sr-thresh-in" type="number" min="0" max="10" value={minRating} onChange={e=>setMinRating(e.target.value)}/>
            {selProg&&<button className="btn-primary" style={{padding:"7px 14px"}} onClick={()=>load(selProg,minAtt,minRating)}>Apply</button>}
          </div>
        </div>
      </div>

      {!selProg
        ? <div className="tbl-card"><div className="empty-st"><div className="empty-ic">🏆</div><div className="empty-title">Select a training program</div><div className="empty-sub">Generate a ranked selection report for competition</div></div></div>
        : loading
          ? <div style={{display:"flex",justifyContent:"center",padding:64}}><div className="spinner"/></div>
          : report&&(
            <>
              <div className="stat-row" style={{marginBottom:14}}>
                {[
                  {v:report.summary?.total_students,         l:"Total",         c:"#2563eb"},
                  {v:report.summary?.recommended_count,      l:"Selected",      c:"#22c55e"},
                  {v:(report.summary?.total_students||0)-(report.summary?.recommended_count||0),l:"Not Selected",c:"#ef4444"},
                  {v:report.summary?.perfect_attendance_count,l:"Zero Absence", c:"#7c3aed"},
                ].map((s,i)=>(
                  <div key={i} className="stat-card" style={{borderTop:`3px solid ${s.c}`}}>
                    <div className="stat-val" style={{color:s.c}}>{s.v}</div><div className="stat-lbl">{s.l}</div>
                  </div>
                ))}
              </div>
            
              {/*<div className="sr-thresh" style={{background:"#eff6ff",borderRadius:10,padding:"9px 14px",marginBottom:14,fontSize:12,color:"#1d4ed8",fontWeight:600,border:"1px solid #bfdbfe"}}>
                📊 Threshold: ≥{minAtt}% attendance{minRating>0?` and ≥${minRating} avg rating`:""} · Score = 60% attendance + 40% rating
              </div>*/}

              <div className="sr-tabs" style={{marginBottom:14}}>
                {[
                  {id:"rec", l:`✅ Selected (${report.recommended?.length||0})`},
                  {id:"perf",l:`🏆 Zero Absence (${report.perfect_attendance?.length||0})`},
                  {id:"all", l:`👥 All (${report.summary?.total_students||0})`},
                ].map(t=>(
                  <button key={t.id} className={`sr-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
                ))}
              </div>

              {tabData[tab]?.length===0
                ? <div className="tbl-card"><div className="empty-st"><div className="empty-ic">📋</div><div className="empty-title">No students in this category</div></div></div>
                : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {tabData[tab].map((s,i)=>(
                      <CandidateCard key={s.student_id} student={s} rank={i+1} programId={selProg} token={token}/>
                    ))}
                  </div>
              }

              {tab==="rec"&&report.not_recommended?.length>0&&(
                <div style={{marginTop:24}}>
                  <div style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:14,color:"#ef4444",marginBottom:10,paddingLeft:4}}>
                    ❌ Did Not Meet Criteria ({report.not_recommended.length})
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {report.not_recommended.map((s,i)=>(
                      <CandidateCard key={s.student_id} student={s} rank={(report.recommended?.length||0)+i+1} programId={selProg} token={token}/>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
      }
    </div>
  );
}