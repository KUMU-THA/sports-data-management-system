// src/components/AchievementPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";

const API   = "http://127.0.0.1:5000";
const TOKEN = () => localStorage.getItem("token") || "";
const hdrs  = (x={}) => ({ Authorization:`Bearer ${TOKEN()}`, ...x });

const LEVELS    = ["Inter-Department","Inter-College","College","District","Zonal","State","National","International"];
const SPORTS    = ["Athletics","Badminton","Basketball","Chess","Cricket","Football","Hockey","Kabaddi","Karate","Kho Kho","Table Tennis","Tennikoit","Tennis","Volleyball","Weight Lifting","Wrestling","Cycling","Swimming","Throwball","Handball","Archery"];
const POSITIONS = ["Gold","Silver","Bronze","1st Place","2nd Place","3rd Place","Winner","Runner-up","Participant"];
const DEPTS     = ["CSE","IT","ECE","EEE","MECH","CIVIL","AIDS","CSBS","MCT","MCA","MBA"];
const VALID_TYPES    = ["internal","external"];
const VALID_STATUSES = ["pending","approved","rejected"];

const LEVEL_COLOR = {
  "International":"#7C3AED","National":"#1D4ED8","State":"#047857",
  "Zonal":"#B45309","District":"#B91C1C","College":"#374151",
  "Inter-College":"#5B21B6","Inter-Department":"#0E7490",
};
const MEDAL = { Gold:"#D97706", Silver:"#64748B", Bronze:"#92400E" };
const medalEmoji = p =>
  p==="Gold"?"🥇":p==="Silver"?"🥈":p==="Bronze"?"🥉":
  p==="1st Place"||p==="Winner"?"🏆":"🎖️";

function getUserRole() {
  try { const p=JSON.parse(atob(TOKEN().split(".")[1])); return p.activeRole||p.role||"student"; }
  catch { return "student"; }
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#F4F6FB", surface:"#FFFFFF", border:"#E2E8F0",
  primary:"#2C3E8C", accent:"#4361EE", text:"#0F172A",
  muted:"#64748B", light:"#94A3B8",
  success:"#059669", warning:"#D97706", danger:"#DC2626",
  r:"10px", rLg:"16px",
  sh:"0 1px 3px rgba(0,0,0,.05),0 4px 12px rgba(44,62,140,.07)",
  shHov:"0 4px 16px rgba(0,0,0,.09),0 12px 28px rgba(44,62,140,.13)",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:${T.bg};color:${T.text}}
  select,input,textarea,button{font-family:'Inter',sans-serif!important}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{transform:translateX(110%)}to{transform:translateX(0)}}
  @keyframes toastUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .card-hover{transition:transform .18s ease,box-shadow .18s ease}
  .card-hover:hover{transform:translateY(-3px);box-shadow:${T.shHov}!important}
  .btn-pri{transition:transform .12s,box-shadow .12s}
  .btn-pri:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(67,97,238,.45)!important}
`;

// ─── Primitives ───────────────────────────────────────────────────────────────
const F = (focused=false) => ({
  width:"100%", padding:"8px 12px",
  border:`1.5px solid ${focused?T.accent:T.border}`,
  borderRadius:T.r, fontSize:13, color:T.text, background:T.surface,
  transition:"border-color .15s",
  boxShadow:focused?`0 0 0 3px rgba(67,97,238,.1)`:"none",
  outline:"none",
});
const Lbl = ({children}) => (
  <label style={{fontSize:11.5,fontWeight:600,color:T.muted,marginBottom:4,display:"block",letterSpacing:.3,textTransform:"uppercase"}}>
    {children}
  </label>
);

const Badge = ({color=T.accent,bg,children,dot}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,
    background:bg||color+"18",color,border:`1px solid ${color}28`,
    borderRadius:99,padding:"2px 8px",fontSize:10.5,fontWeight:600,letterSpacing:.2,whiteSpace:"nowrap"}}>
    {dot&&<span style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>}
    {children}
  </span>
);

const Sk = ({w="100%",h=14,r=6}) => (
  <div style={{width:w,height:h,borderRadius:r,
    background:"linear-gradient(90deg,#EEF2FF 25%,#E0E7FF 50%,#EEF2FF 75%)",
    backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>
);

const Spin = () => (
  <span style={{width:16,height:16,border:`2px solid rgba(255,255,255,.3)`,
    borderTopColor:"#fff",borderRadius:"50%",
    animation:"spin .7s linear infinite",display:"inline-block"}}/>
);

function Toast({msg,type}) {
  if (!msg) return null;
  const err = type==="error";
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,
      background:err?"#FEF2F2":"#F0FDF4",color:err?T.danger:T.success,
      border:`1px solid ${err?"#FECACA":"#BBF7D0"}`,
      padding:"11px 18px",borderRadius:T.rLg,fontSize:13,fontWeight:500,
      boxShadow:"0 8px 28px rgba(0,0,0,.13)",display:"flex",alignItems:"center",gap:8,
      animation:"toastUp .25s ease",maxWidth:340}}>
      <span style={{fontSize:16}}>{err?"⚠️":"✓"}</span>{msg}
    </div>
  );
}

function Avatar({src,name="?",size=36}) {
  const [err,setErr]=useState(false);
  const ini=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const cols=["#4361EE","#7B2FBE","#059669","#D97706","#DC2626","#0E7490"];
  const c=cols[(name||"").charCodeAt(0)%cols.length];
  if (src&&!err)
    return <img src={src.startsWith("http")?src:`${API}${src}`} alt={name}
      style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${T.border}`}}
      onError={()=>setErr(true)}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:c,color:"#fff",
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*.34,fontWeight:700,flexShrink:0}}>{ini}</div>;
}

// ─── SportCombobox ─────────────────────────────────────────────────────────────
function SportCombobox({value,onChange}) {
  const [q,setQ]       = useState(value||"");
  const [open,setOpen] = useState(false);
  const [foc,setFoc]   = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const filtered = q.trim() ? SPORTS.filter(s=>s.toLowerCase().includes(q.toLowerCase())) : SPORTS;
  const hasCustom = q.trim() && !SPORTS.some(s=>s.toLowerCase()===q.toLowerCase());

  const pick = s => { setQ(s); onChange(s); setOpen(false); };

  return (
    <div ref={ref} style={{position:"relative"}}>
      <div style={{position:"relative"}}>
        <input value={q}
          onChange={e=>{setQ(e.target.value);onChange(e.target.value);setOpen(true);}}
          onFocus={()=>{setFoc(true);setOpen(true);}}
          onBlur={()=>setFoc(false)}
          placeholder="Type or pick a sport…"
          style={{...F(foc),paddingRight:32}}/>
        <button type="button" onClick={()=>setOpen(o=>!o)}
          style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            background:"none",border:"none",cursor:"pointer",color:T.light,fontSize:10,lineHeight:1,padding:2}}>
          {open?"▲":"▼"}
        </button>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 3px)",left:0,right:0,zIndex:600,
          background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r,
          boxShadow:T.shHov,maxHeight:210,overflowY:"auto"}}>
          {hasCustom&&(
            <div onMouseDown={()=>pick(q)}
              style={{padding:"8px 12px",cursor:"pointer",fontSize:12.5,color:T.accent,fontWeight:600,
                borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>e.currentTarget.style.background="#EEF2FF"}
              onMouseLeave={e=>e.currentTarget.style.background=""}>
              <span>＋</span> Add "{q}"
            </div>
          )}
          {filtered.map(s=>(
            <div key={s} onMouseDown={()=>pick(s)}
              style={{padding:"8px 12px",cursor:"pointer",fontSize:12.5,color:T.text,
                background:value===s?"#EEF2FF":"",borderBottom:`1px solid ${T.border}`,
                display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>e.currentTarget.style.background="#F8FAFF"}
              onMouseLeave={e=>e.currentTarget.style.background=value===s?"#EEF2FF":""}>
              {value===s&&<span style={{color:T.accent,fontSize:12,fontWeight:700}}>✓</span>}
              {s}
            </div>
          ))}
          {filtered.length===0&&!hasCustom&&(
            <div style={{padding:"10px 12px",color:T.light,fontSize:12.5,textAlign:"center"}}>No matches</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FocusInput / FocusTextarea (proper components, no hooks in callbacks) ───
function FocusInput({value,onChange,placeholder,type="text",style={}}) {
  const [foc,setFoc]=useState(false);
  return <input type={type} value={value} placeholder={placeholder}
    onChange={onChange} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
    style={{...F(foc),...style}}/>;
}
function FocusTextarea({value,onChange,placeholder,rows=3}) {
  const [foc,setFoc]=useState(false);
  return <textarea value={value} placeholder={placeholder} rows={rows}
    onChange={onChange} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
    style={{...F(foc),resize:"vertical"}}/>;
}
function FocusSelect({value,onChange,children,style={}}) {
  const [foc,setFoc]=useState(false);
  return <select value={value} onChange={onChange}
    onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
    style={{...F(foc),appearance:"none",cursor:"pointer",
      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 11 11'%3E%3Cpath fill='%2364748B' d='M5.5 7L1 2h9z'/%3E%3C/svg%3E")`,
      backgroundRepeat:"no-repeat",backgroundPosition:"right 11px center",
      paddingRight:30,...style}}>
    {children}
  </select>;
}

// ─── Position Picker (visual button grid, no dropdown) ────────────────────────
const POS_META = {
  "Gold":      {emoji:"🥇",color:"#D97706",bg:"#FFFBEB"},
  "Silver":    {emoji:"🥈",color:"#64748B",bg:"#F8FAFC"},
  "Bronze":    {emoji:"🥉",color:"#92400E",bg:"#FFF7ED"},
  "1st Place": {emoji:"🏆",color:"#1D4ED8",bg:"#EFF6FF"},
  "2nd Place": {emoji:"🥈",color:"#64748B",bg:"#F8FAFC"},
  "3rd Place": {emoji:"🥉",color:"#92400E",bg:"#FFF7ED"},
  "Winner":    {emoji:"🏆",color:"#047857",bg:"#F0FDF4"},
  "Runner-up": {emoji:"🎗️",color:"#7C3AED",bg:"#F5F3FF"},
  "Participant":{emoji:"🎖️",color:"#374151",bg:"#F9FAFB"},
};

function PositionPicker({value,onChange}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
      {POSITIONS.map(p=>{
        const m=POS_META[p]||{emoji:"🎖️",color:T.muted,bg:T.bg};
        const sel=value===p;
        return (
          <button key={p} type="button" onClick={()=>onChange(p)}
            style={{padding:"8px 6px",borderRadius:T.r,cursor:"pointer",
              border:`1.5px solid ${sel?m.color:T.border}`,
              background:sel?m.bg:T.surface,
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              boxShadow:sel?`0 0 0 3px ${m.color}22`:"none",
              transition:"all .14s"}}>
            <span style={{fontSize:18,lineHeight:1}}>{m.emoji}</span>
            <span style={{fontSize:10.5,fontWeight:sel?700:500,color:sel?m.color:T.muted,lineHeight:1.2,textAlign:"center"}}>{p}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Level Picker ─────────────────────────────────────────────────────────────
function LevelPicker({value,onChange}) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {LEVELS.map(l=>{
        const c=LEVEL_COLOR[l]||T.primary;
        const sel=value===l;
        return (
          <button key={l} type="button" onClick={()=>onChange(l)}
            style={{padding:"5px 12px",borderRadius:99,cursor:"pointer",fontSize:12,
              border:`1.5px solid ${sel?c:T.border}`,
              background:sel?c+"15":T.surface,
              color:sel?c:T.muted,fontWeight:sel?700:400,
              transition:"all .13s"}}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ─── MedalBar ─────────────────────────────────────────────────────────────────
function MedalBar({label,gold=0,silver=0,bronze=0,total=0,max=1}) {
  const score=gold*5+silver*3+bronze;
  const pct=max?Math.round(score/max*100):0;
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12.5,fontWeight:600,color:T.text}}>{label}</span>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {gold>0  &&<span style={{fontSize:11.5,color:MEDAL.Gold,fontWeight:600}}>🥇{gold}</span>}
          {silver>0&&<span style={{fontSize:11.5,color:MEDAL.Silver,fontWeight:600}}>🥈{silver}</span>}
          {bronze>0&&<span style={{fontSize:11.5,color:MEDAL.Bronze,fontWeight:600}}>🥉{bronze}</span>}
          <span style={{fontSize:11,color:T.light}}>({total})</span>
        </div>
      </div>
      <div style={{height:5,borderRadius:99,background:"#EEF2FF",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,borderRadius:99,
          background:`linear-gradient(90deg,${T.primary},${T.accent})`,
          transition:"width .9s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
    </div>
  );
}

// ─── AchCard ──────────────────────────────────────────────────────────────────
function AchCard({r,onOpen,onEdit,onDelete,isStaff}) {
  const medal    = MEDAL[r.position];
  const img      = r.media?.find(m=>m.media_type==="image");
  const lvlColor = LEVEL_COLOR[r.level]||T.primary;
  return (
    <div className="card-hover" onClick={()=>onOpen(r)} style={{
      background:T.surface,borderRadius:T.rLg,overflow:"hidden",
      boxShadow:T.sh,cursor:"pointer",
      border:`1px solid ${medal?medal+"28":T.border}`,position:"relative"}}>
      {medal&&<div style={{height:3,background:`linear-gradient(90deg,${medal},${medal}55)`,position:"absolute",top:0,left:0,right:0,zIndex:1}}/>}
      {img
        ? <div style={{height:140,overflow:"hidden",position:"relative"}}>
            <img src={`${API}${img.url}`} alt={r.eventname} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.3),transparent)"}}/>
            <div style={{position:"absolute",bottom:8,left:12,fontSize:24}}>{medalEmoji(r.position)}</div>
          </div>
        : <div style={{height:76,background:`linear-gradient(135deg,${lvlColor}15,${lvlColor}05)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            borderBottom:`1px solid ${T.border}`,fontSize:34}}>{medalEmoji(r.position)}</div>
      }
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>
          <Badge color={lvlColor} dot>{r.level}</Badge>
          <Badge color={r.type==="external"?T.danger:T.success}>{r.type}</Badge>
          {r.status!=="approved"&&<Badge color={r.status==="pending"?T.warning:T.muted}>{r.status}</Badge>}
        </div>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4,lineHeight:1.4,
          display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.eventname}</div>
        {r.sport&&<div style={{fontSize:11,color:T.muted,marginBottom:8}}>⚽ {r.sport}</div>}
        <div style={{height:1,background:T.border,margin:"8px 0"}}/>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Avatar src={r.photo_url} name={r.student_name} size={28}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:T.accent,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.student_name}</div>
            <div style={{fontSize:10.5,color:T.light}}>{r.department} · {r.batch}</div>
          </div>
          <span style={{fontSize:18}}>{medalEmoji(r.position)}</span>
        </div>
        {r.achievementdate&&(
          <div style={{fontSize:10.5,color:T.light,marginTop:7}}>
            📅 {new Date(r.achievementdate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
          </div>
        )}
        {isStaff&&(
          <div style={{display:"flex",gap:5,marginTop:10}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>onEdit(r)} style={aBtn(T.accent)}>✏️ Edit</button>
            <button onClick={()=>onDelete(r.id)} style={aBtn(T.danger)}>🗑 Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
const aBtn=c=>({flex:1,padding:"5px 0",border:`1.5px solid ${c}22`,borderRadius:8,
  background:`${c}08`,color:c,fontSize:11,fontWeight:600,cursor:"pointer"});

// ─── StudentSearch ─────────────────────────────────────────────────────────────
function StudentSearch({value,onChange,onSelect}) {
  const [results,setResults]=useState([]);
  const [open,setOpen]=useState(false);
  const [foc,setFoc]=useState(false);
  const timer=useRef(null);

  const search=q=>{
    clearTimeout(timer.current);
    onChange(q);
    if (!q.trim()){setResults([]);setOpen(false);return;}
    timer.current=setTimeout(async()=>{
      try{
        const r=await fetch(`${API}/api/achievements/students?search=${encodeURIComponent(q)}`,{headers:hdrs()});
        const d=await r.json();
        setResults(Array.isArray(d)?d:[]);
        setOpen(true);
      }catch{setResults([]);}
    },320);
  };
  return (
    <div style={{position:"relative"}}>
      <input value={value} onChange={e=>search(e.target.value)}
        placeholder="Search by name or roll number…"
        style={F(foc)}
        onFocus={()=>{setFoc(true);results.length&&setOpen(true);}}
        onBlur={()=>{setFoc(false);setTimeout(()=>setOpen(false),180);}}/>
      {open&&results.length>0&&(
        <div style={{position:"absolute",top:"calc(100% + 3px)",left:0,right:0,zIndex:500,
          background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r,
          boxShadow:T.shHov,maxHeight:250,overflowY:"auto"}}>
          {results.map(s=>(
            <div key={s.id} onMouseDown={()=>{onSelect(s);setOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                cursor:"pointer",borderBottom:`1px solid ${T.border}`}}
              onMouseEnter={e=>e.currentTarget.style.background="#F8FAFF"}
              onMouseLeave={e=>e.currentTarget.style.background=""}>
              <Avatar src={s.photo_url} name={s.name} size={32}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{s.name}</div>
                <div style={{fontSize:11,color:T.muted}}>{s.rollno||s.reg_number||""} · {s.department} · {s.batch}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Card (Certificate / Merit Card) ────────────────────────────────────
function ToggleCard({checked,onChange,icon,label,desc,activeColor}) {
  return (
    <button type="button" onClick={()=>onChange(!checked)}
      style={{padding:"12px 14px",borderRadius:T.r,cursor:"pointer",
        border:`1.5px solid ${checked?activeColor:T.border}`,
        background:checked?activeColor+"12":T.surface,
        display:"flex",alignItems:"flex-start",gap:10,
        boxShadow:checked?`0 0 0 3px ${activeColor}18`:"none",
        transition:"all .15s",textAlign:"left",width:"100%"}}>
      <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,
        border:`2px solid ${checked?activeColor:T.border}`,
        background:checked?activeColor:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",transition:"all .14s"}}>
        {checked&&<span style={{color:"#fff",fontSize:12,fontWeight:800,lineHeight:1}}>✓</span>}
      </div>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:checked?activeColor:T.text}}>{icon} {label}</div>
        <div style={{fontSize:10.5,color:T.light,marginTop:2}}>{desc}</div>
      </div>
    </button>
  );
}

// ─── AchModal ─────────────────────────────────────────────────────────────────
function AchModal({initial,onClose,onSaved,toast}) {
  const isEdit=!!initial?.id;
  const blank={
    student_id:"",studentLabel:"",
    type:"external",level:"State",sport:"",event_category:"",
    eventname:"",position:"Gold",achievementdate:"",
    venue:"",organizer:"",description:"",cashprize:"0",
    certificate:false,merit_card:false,
    status:"approved",achievement_type:"individual",team_name:"",
    participant_ids:[],participantLabels:[],
  };
  const init = initial ? {
    ...blank,
    student_id:initial.student_id||"",studentLabel:initial.student_name||"",
    type:initial.type,level:initial.level,sport:initial.sport||"",
    event_category:initial.event_category||"",eventname:initial.eventname||"",
    position:initial.position||"Gold",achievementdate:initial.achievementdate?.slice(0,10)||"",
    venue:initial.venue||"",organizer:initial.organizer||"",description:initial.description||"",
    cashprize:String(initial.cashprize||0),certificate:!!initial.certificate,
    merit_card:!!initial.merit_card,status:initial.status||"approved",
    achievement_type:initial.achievement_type||"individual",team_name:initial.team_name||"",
  } : blank;

  const [form,setForm]   = useState(init);
  const [files,setFiles] = useState([]);
  const [saving,setSaving] = useState(false);
  const [stuQ,setStuQ]   = useState(init.studentLabel);
  const [existingMedia,setExistingMedia] = useState(initial?.media||[]);
  const [removeIds,setRemoveIds] = useState([]);
  const [step,setStep]   = useState(1);

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  const submit=async()=>{
    if (!form.student_id)       return toast("Select a student","error");
    if (!form.eventname.trim()) return toast("Event name required","error");
    if (!form.achievementdate)  return toast("Date required","error");
    setSaving(true);
    try{
      const fd=new FormData();
      Object.entries(form).forEach(([k,v])=>{
        if (k==="participant_ids") fd.append(k,v.join(","));
        else if (k!=="studentLabel"&&k!=="participantLabels") fd.append(k,v);
      });
      if (removeIds.length) fd.append("remove_media_ids",removeIds.join(","));
      files.forEach(f=>fd.append("media",f));
      const url=isEdit?`${API}/api/achievements/${initial.id}`:`${API}/api/achievements`;
      const r=await fetch(url,{method:isEdit?"PUT":"POST",headers:hdrs(),body:fd});
      const d=await r.json();
      if (!r.ok) throw new Error(d.message||"Failed");
      toast(isEdit?"Updated!":"Achievement added!","success");
      onSaved();
    }catch(e){toast(e.message,"error");}
    finally{setSaving(false);}
  };

  const STEPS=["Student & Event","Details","Media & Review"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.52)",zIndex:300,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(3px)"}}>
      <div style={{background:T.bg,borderRadius:20,width:"100%",maxWidth:680,
        maxHeight:"92vh",display:"flex",flexDirection:"column",
        boxShadow:"0 24px 60px rgba(0,0,0,.22)",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"18px 24px",background:T.surface,borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,
            background:`linear-gradient(135deg,${T.primary},${T.accent})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🏆</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:T.text}}>{isEdit?"Edit Achievement":"Add Achievement"}</div>
            <div style={{fontSize:11.5,color:T.muted,marginTop:1}}>Step {step} of {STEPS.length} — {STEPS[step-1]}</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,border:`1px solid ${T.border}`,
            borderRadius:8,background:"transparent",cursor:"pointer",color:T.muted,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>✕</button>
        </div>

        {/* Step progress */}
        <div style={{padding:"10px 24px",background:T.surface,borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",gap:0}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
              <button onClick={()=>setStep(i+1)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",
                  borderRadius:99,border:"none",cursor:"pointer",
                  background:step===i+1?T.accent+"15":"transparent",
                  color:step===i+1?T.accent:step>i+1?T.success:T.light,
                  fontSize:12,fontWeight:step===i+1?700:400}}>
                <span style={{width:20,height:20,borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:700,
                  background:step>i+1?T.success:step===i+1?T.accent:T.border,
                  color:step>=i+1?"#fff":T.muted,transition:"all .2s"}}>
                  {step>i+1?"✓":i+1}
                </span>
                <span style={{display:"none"}}>{/* label hidden on small */}</span>
                {s}
              </button>
              {i<STEPS.length-1&&<div style={{flex:1,height:1,background:T.border}}/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>

          {/* ── STEP 1 ── */}
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .2s ease"}}>

              {/* Student */}
              <div>
                <Lbl>Student *</Lbl>
                <StudentSearch value={stuQ} onChange={setStuQ}
                  onSelect={s=>{set("student_id",s.id);set("studentLabel",s.name);setStuQ(s.name);}}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {/* Type */}
                <div>
                  <Lbl>Type *</Lbl>
                  <div style={{display:"flex",gap:6}}>
                    {VALID_TYPES.map(t=>(
                      <button key={t} type="button" onClick={()=>set("type",t)}
                        style={{flex:1,padding:"8px 0",borderRadius:T.r,cursor:"pointer",
                          fontSize:12.5,fontWeight:form.type===t?700:400,
                          border:`1.5px solid ${form.type===t?T.accent:T.border}`,
                          background:form.type===t?T.accent+"12":T.surface,
                          color:form.type===t?T.accent:T.muted,transition:"all .13s"}}>
                        {t==="internal"?"🏫 Internal":"🌐 External"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <Lbl>Date *</Lbl>
                  <FocusInput value={form.achievementdate} type="date"
                    onChange={e=>set("achievementdate",e.target.value)}/>
                </div>
              </div>

              {/* Event Name */}
              <div>
                <Lbl>Event Name *</Lbl>
                <FocusInput value={form.eventname} placeholder="Full official event name"
                  onChange={e=>set("eventname",e.target.value)}/>
              </div>

              {/* Sport */}
              <div>
                <Lbl>Sport</Lbl>
                <SportCombobox value={form.sport} onChange={v=>set("sport",v)}/>
                <div style={{fontSize:10.5,color:T.light,marginTop:3}}>Type to search or add a new sport</div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {/* Category */}
                <div>
                  <Lbl>Category</Lbl>
                  <FocusInput value={form.event_category} placeholder="Men / Women / Open…"
                    onChange={e=>set("event_category",e.target.value)}/>
                </div>
                {/* Achievement type */}
                <div>
                  <Lbl>Participation</Lbl>
                  <div style={{display:"flex",gap:6}}>
                    {["individual","team"].map(tp=>(
                      <button key={tp} type="button" onClick={()=>set("achievement_type",tp)}
                        style={{flex:1,padding:"8px 0",borderRadius:T.r,cursor:"pointer",
                          fontSize:12,fontWeight:form.achievement_type===tp?700:400,
                          border:`1.5px solid ${form.achievement_type===tp?T.accent:T.border}`,
                          background:form.achievement_type===tp?T.accent+"12":T.surface,
                          color:form.achievement_type===tp?T.accent:T.muted,transition:"all .13s"}}>
                        {tp==="individual"?"👤 Solo":"👥 Team"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {form.achievement_type==="team"&&(
                <div>
                  <Lbl>Team Name</Lbl>
                  <FocusInput value={form.team_name} placeholder="e.g. CSE Strikers"
                    onChange={e=>set("team_name",e.target.value)}/>
                </div>
              )}

              {/* Level */}
              <div>
                <Lbl>Level *</Lbl>
                <LevelPicker value={form.level} onChange={v=>set("level",v)}/>
              </div>

              {/* Position */}
              <div>
                <Lbl>Position *</Lbl>
                <PositionPicker value={form.position} onChange={v=>set("position",v)}/>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .2s ease"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <Lbl>Venue</Lbl>
                  <FocusInput value={form.venue} placeholder="Stadium / College…"
                    onChange={e=>set("venue",e.target.value)}/>
                </div>
                <div>
                  <Lbl>Organizer</Lbl>
                  <FocusInput value={form.organizer} placeholder="Anna University…"
                    onChange={e=>set("organizer",e.target.value)}/>
                </div>
                <div>
                  <Lbl>Cash Prize (₹)</Lbl>
                  <FocusInput value={form.cashprize} type="number"
                    onChange={e=>set("cashprize",e.target.value)}/>
                </div>
                <div>
                  <Lbl>Status</Lbl>
                  <FocusSelect value={form.status} onChange={e=>set("status",e.target.value)}>
                    {VALID_STATUSES.map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
                  </FocusSelect>
                </div>
              </div>

              <div>
                <Lbl>Description</Lbl>
                <FocusTextarea value={form.description}
                  placeholder="Achievement highlights, context…"
                  onChange={e=>set("description",e.target.value)}/>
              </div>

              {/* Recognition */}
              <div>
                <Lbl>Recognition Received</Lbl>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <ToggleCard checked={form.certificate} onChange={v=>set("certificate",v)}
                    icon="📄" label="Certificate" desc="Achievement certificate issued"
                    activeColor={T.success}/>
                  <ToggleCard checked={form.merit_card} onChange={v=>set("merit_card",v)}
                    icon="🎖️" label="Merit Card" desc="Merit card / commendation awarded"
                    activeColor={T.warning}/>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step===3&&(
            <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .2s ease"}}>
              {/* existing media */}
              {existingMedia.length>0&&(
                <div>
                  <Lbl>Existing Media</Lbl>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {existingMedia.map(m=>(
                      <div key={m.id} style={{position:"relative",width:76,height:76}}>
                        {m.media_type==="image"
                          ?<img src={`${API}${m.url}`} alt="" style={{width:76,height:76,objectFit:"cover",borderRadius:8,border:`1px solid ${T.border}`}}/>
                          :<div style={{width:76,height:76,background:"#EEF2FF",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🎬</div>
                        }
                        {removeIds.includes(m.id)
                          ?<button onMouseDown={()=>setRemoveIds(p=>p.filter(x=>x!==m.id))}
                              style={{position:"absolute",inset:0,background:"rgba(220,38,38,.7)",borderRadius:8,border:"none",color:"#fff",cursor:"pointer",fontSize:10.5,fontWeight:600}}>Undo</button>
                          :<button onMouseDown={()=>setRemoveIds(p=>[...p,m.id])}
                              style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",
                                background:T.danger,border:`2px solid #fff`,color:"#fff",cursor:"pointer",
                                fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>×</button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* upload */}
              <div>
                <Lbl>Upload Files</Lbl>
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",
                  gap:6,padding:"28px 20px",border:`2px dashed ${T.border}`,
                  borderRadius:T.rLg,cursor:"pointer",background:T.surface,transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.background="#EEF2FF";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
                  <span style={{fontSize:28}}>☁️</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>
                    {files.length>0?`${files.length} file(s) selected`:"Click to upload photos, videos or PDF"}
                  </span>
                  <span style={{fontSize:11,color:T.light}}>JPG · PNG · MP4 · PDF</span>
                  <input type="file" multiple accept="image/*,video/*,.pdf"
                    onChange={e=>setFiles(Array.from(e.target.files))} style={{display:"none"}}/>
                </label>
              </div>

              {/* Review */}
              <div style={{borderRadius:T.r,background:T.surface,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,
                  fontSize:12,fontWeight:700,color:T.text,background:"#F8FAFF"}}>
                  📋 Review Summary
                </div>
                {[
                  ["Student",form.studentLabel||"—"],
                  ["Event",form.eventname||"—"],
                  ["Sport",form.sport||"—"],
                  ["Level",form.level],
                  ["Position",`${medalEmoji(form.position)} ${form.position}`],
                  ["Date",form.achievementdate||"—"],
                  ["Type",form.type],
                  ["Certificate",form.certificate?"Yes":"No"],
                  ["Merit Card",form.merit_card?"Yes":"No"],
                ].map(([k,v],i,arr)=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",
                    padding:"8px 14px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",fontSize:12.5}}>
                    <span style={{color:T.muted,fontWeight:500}}>{k}</span>
                    <span style={{fontWeight:600,color:T.text}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 24px",background:T.surface,borderTop:`1px solid ${T.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={step===1?onClose:()=>setStep(s=>s-1)}
            style={{padding:"8px 18px",border:`1.5px solid ${T.border}`,borderRadius:T.r,
              background:"transparent",cursor:"pointer",fontSize:13,fontWeight:500,color:T.muted}}>
            {step===1?"Cancel":"← Back"}
          </button>
          {step<3
            ?<button onClick={()=>setStep(s=>s+1)}
                style={{padding:"8px 22px",border:"none",borderRadius:T.r,
                  background:`linear-gradient(135deg,${T.primary},${T.accent})`,
                  color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,
                  boxShadow:`0 4px 14px ${T.accent}40`}}>
                Continue →
              </button>
            :<button onClick={submit} disabled={saving}
                style={{padding:"8px 22px",border:"none",borderRadius:T.r,
                  background:saving?"#CBD5E1":`linear-gradient(135deg,${T.primary},${T.accent})`,
                  color:"#fff",cursor:saving?"not-allowed":"pointer",
                  fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:7,
                  boxShadow:saving?"none":`0 4px 14px ${T.accent}40`}}>
                {saving&&<Spin/>}
                {saving?"Saving…":isEdit?"Save Changes":"Add Achievement"}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────
function DetailPanel({r,onClose,onEdit,onDelete,isStaff}) {
  if (!r) return null;
  const medal    = MEDAL[r.position];
  const lvlColor = LEVEL_COLOR[r.level]||T.primary;

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex"}} onClick={onClose}>
      <div style={{flex:1,background:"rgba(15,23,42,.38)",backdropFilter:"blur(2px)"}}/>
      <div style={{width:440,maxWidth:"100vw",background:T.bg,overflowY:"auto",
        animation:"slideIn .28s cubic-bezier(.4,0,.2,1)",
        boxShadow:"-6px 0 40px rgba(0,0,0,.13)"}}
        onClick={e=>e.stopPropagation()}>

        {/* Hero */}
        <div style={{background:`linear-gradient(140deg,${lvlColor},${lvlColor}bb)`,
          padding:"24px 22px 20px",color:"#fff",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,
            width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.2)",
            border:"none",cursor:"pointer",color:"#fff",fontSize:15,
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{fontSize:36,marginBottom:8}}>{medalEmoji(r.position)}</div>
          <h2 style={{fontSize:16,fontWeight:700,lineHeight:1.4,marginBottom:10}}>{r.eventname}</h2>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <Badge color="#fff" bg="rgba(255,255,255,.2)">{r.level}</Badge>
            <Badge color="#fff" bg="rgba(255,255,255,.2)">{r.type}</Badge>
            {medal&&<Badge color="#fff" bg="rgba(255,255,255,.18)">🏅 {r.position}</Badge>}
            {r.status!=="approved"&&<Badge color="#fff" bg="rgba(255,255,255,.15)">{r.status}</Badge>}
          </div>
        </div>

        <div style={{padding:"18px 22px"}}>
          {/* Student */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
            background:T.surface,borderRadius:T.rLg,marginBottom:16,
            border:`1px solid ${T.border}`,boxShadow:T.sh}}>
            <Avatar src={r.photo_url} name={r.student_name} size={44}/>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:T.text}}>{r.student_name}</div>
              <div style={{fontSize:11.5,color:T.muted,marginTop:2}}>{r.department} · {r.batch}</div>
              {r.rollno&&<div style={{fontSize:11,color:T.light,marginTop:1}}>{r.rollno}</div>}
            </div>
          </div>

          {/* Details table */}
          <div style={{background:T.surface,borderRadius:T.rLg,border:`1px solid ${T.border}`,
            overflow:"hidden",marginBottom:14}}>
            {[
              ["📅 Date",r.achievementdate?new Date(r.achievementdate).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}):"—"],
              ["🏟 Venue",r.venue||"—"],
              ["🏢 Organizer",r.organizer||"—"],
              ["⚽ Sport",r.sport||"—"],
              ["🎯 Category",r.event_category||"—"],
              ["👥 Type",r.achievement_type==="team"?`Team — ${r.team_name||""}`:"Individual"],
              ["💰 Cash Prize",r.cashprize>0?`₹${Number(r.cashprize).toLocaleString("en-IN")}`:"—"],
              ["📄 Certificate",r.certificate?"Yes":"No"],
              ["🎖️ Merit Card",r.merit_card?"Yes":"No"],
              ["📚 Academic Year",r.academic_year||"—"],
            ].map(([k,v],i,arr)=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 14px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",fontSize:12.5}}>
                <span style={{color:T.muted,fontWeight:500}}>{k}</span>
                <span style={{fontWeight:600,color:T.text,textAlign:"right",maxWidth:"58%"}}>{v}</span>
              </div>
            ))}
          </div>

          {r.description&&(
            <div style={{padding:12,background:"#F8FAFF",borderRadius:T.r,
              border:`1px solid ${T.border}`,fontSize:12.5,color:T.muted,lineHeight:1.7,marginBottom:14}}>
              {r.description}
            </div>
          )}

          {r.participants?.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12.5,fontWeight:700,color:T.text,marginBottom:8}}>
                👥 Team Members ({r.participants.length})
              </div>
              {r.participants.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:9,
                  padding:"9px 12px",background:T.surface,borderRadius:T.r,
                  border:`1px solid ${T.border}`,marginBottom:5}}>
                  <Avatar src={p.photo_url} name={p.name} size={30}/>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:600,color:T.text}}>{p.name}</div>
                    <div style={{fontSize:10.5,color:T.light}}>{p.department} · {p.participant_role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {r.media?.filter(m=>m.media_type==="image").length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12.5,fontWeight:700,color:T.text,marginBottom:8}}>📸 Photos</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {r.media.filter(m=>m.media_type==="image").map(m=>(
                  <a key={m.id} href={`${API}${m.url}`} target="_blank" rel="noreferrer"
                    style={{borderRadius:T.r,overflow:"hidden",display:"block"}}>
                    <img src={`${API}${m.url}`} alt={m.caption||""}
                      style={{width:"100%",height:120,objectFit:"cover",display:"block",transition:"transform .2s"}}
                      onMouseEnter={e=>e.target.style.transform="scale(1.04)"}
                      onMouseLeave={e=>e.target.style.transform=""}/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {r.media?.filter(m=>m.media_type==="video").length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12.5,fontWeight:700,color:T.text,marginBottom:8}}>🎬 Videos</div>
              {r.media.filter(m=>m.media_type==="video").map(m=>(
                <video key={m.id} src={`${API}${m.url}`} controls
                  style={{width:"100%",borderRadius:T.r,marginBottom:7}}/>
              ))}
            </div>
          )}

          {isStaff&&(
            <div style={{display:"flex",gap:9,marginTop:6}}>
              <button onClick={()=>onEdit(r)} style={{flex:1,padding:"10px 0",
                border:`1.5px solid ${T.accent}28`,borderRadius:T.r,
                background:`${T.accent}08`,color:T.accent,fontWeight:700,cursor:"pointer",fontSize:12.5,
                display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                ✏️ Edit
              </button>
              <button onClick={()=>onDelete(r.id)} style={{flex:1,padding:"10px 0",
                border:`1.5px solid ${T.danger}28`,borderRadius:T.r,
                background:`${T.danger}08`,color:T.danger,fontWeight:700,cursor:"pointer",fontSize:12.5,
                display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function AchievementPage() {
  const role      = getUserRole();
  const isStaff   = ["admin","director","staff"].includes(role);
  const isStudent = role==="student";

  const [tab,setTab]          = useState("overview");
  const [summary,setSummary]  = useState(null);
  const [records,setRecords]  = useState([]);
  const [total,setTotal]      = useState(0);
  const [page,setPage]        = useState(1);
  const [loading,setLoading]  = useState(false);
  const [filters,setFilters]  = useState({type:"",level:"",sport:"",position:"",department:"",status:"approved",search:"",academic_year:""});
  const [detail,setDetail]    = useState(null);
  const [modal,setModal]      = useState(null);
  const [toast,setToast]      = useState({msg:"",type:""});
  const [myData,setMyData]    = useState(null);
  const [viewMode,setViewMode]= useState("cards");
  const LIMIT=24;

  const showToast=(msg,type="success")=>{
    setToast({msg,type});
    setTimeout(()=>setToast({msg:"",type:""}),3500);
  };

  useEffect(()=>{
    fetch(`${API}/api/achievements/portal-summary`).then(r=>r.json()).then(setSummary).catch(()=>{});
  },[]);

  const loadRecords=useCallback(async(p=1)=>{
    setLoading(true);
    try{
      const q=new URLSearchParams({page:p,limit:LIMIT,
        ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v))});
      const r=await fetch(`${API}/api/achievements?${q}`,{headers:isStaff?hdrs():{}});
      const d=await r.json();
      setRecords(d.records||[]);
      setTotal(d.total||0);
    }catch{setRecords([]);}
    finally{setLoading(false);}
  },[filters,isStaff]);

  useEffect(()=>{if(tab==="records"){setPage(1);loadRecords(1);}},[tab,filters]);
  useEffect(()=>{if(tab==="records")loadRecords(page);},[page]);

  const loadMy=useCallback(()=>{
    if (!isStudent) return;
    fetch(`${API}/api/achievements/my`,{headers:hdrs()}).then(r=>r.json()).then(setMyData).catch(()=>{});
  },[isStudent]);
  useEffect(()=>{if(tab==="my")loadMy();},[tab]);

  const openDetail=async r=>{
    try{
      const res=await fetch(`${API}/api/achievements/${r.id}`,{headers:isStaff?hdrs():{}});
      const d=await res.json();
      setDetail(d.id?d:r);
    }catch{setDetail(r);}
  };

  const handleDelete=async id=>{
    if (!window.confirm("Delete this achievement permanently?")) return;
    try{
      const r=await fetch(`${API}/api/achievements/${id}`,{method:"DELETE",headers:hdrs()});
      if (!r.ok) throw new Error((await r.json()).message);
      showToast("Achievement deleted");
      setDetail(null);
      loadRecords(page);
    }catch(e){showToast(e.message,"error");}
  };

  const setF=(k,v)=>setFilters(p=>({...p,[k]:v}));

  // ── Overview ──────────────────────────────────────────────────────────────────
  const OverviewTab=()=>{
    const s=summary, t=s?.totals;
    return (
      <div style={{animation:"fadeUp .3s ease"}}>
        {/* Hero */}
        <div style={{borderRadius:T.rLg,padding:"32px 36px",marginBottom:24,position:"relative",overflow:"hidden",
          background:`linear-gradient(135deg,${T.primary} 0%,${T.accent} 55%,#6366F1 100%)`,color:"#fff"}}>
          <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
          <div style={{position:"absolute",bottom:-30,right:160,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:10.5,letterSpacing:2.5,textTransform:"uppercase",opacity:.6,marginBottom:5,fontWeight:600}}>
              🏆 Sports Achievement Portal
            </div>
            <h1 style={{fontSize:28,fontWeight:800,lineHeight:1.2,marginBottom:5}}>Hall of Champions</h1>
            <p style={{fontSize:13.5,opacity:.75,marginBottom:24}}>Celebrating excellence in sports across all departments</p>
            {t?(
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[["🏅",t.total,"Total"],["🥇",t.gold,"Gold"],["🥈",t.silver,"Silver"],
                  ["🥉",t.bronze,"Bronze"],["👤",t.unique_students,"Champions"],
                  ["⚽",t.unique_sports,"Sports"],
                  ["💰",`₹${Number(t.total_prize||0).toLocaleString("en-IN")}`,"Prize Won"],
                ].map(([ico,val,lbl])=>(
                  <div key={lbl} style={{background:"rgba(255,255,255,.14)",borderRadius:12,
                    padding:"10px 16px",textAlign:"center",minWidth:74,
                    border:"1px solid rgba(255,255,255,.12)"}}>
                    <div style={{fontSize:18,marginBottom:3}}>{ico}</div>
                    <div style={{fontSize:18,fontWeight:800,lineHeight:1}}>{val}</div>
                    <div style={{fontSize:10,opacity:.75,marginTop:2}}>{lbl}</div>
                  </div>
                ))}
              </div>
            ):(
              <div style={{display:"flex",gap:10}}>{[1,2,3,4,5].map(i=><Sk key={i} w={74} h={68} r={12}/>)}</div>
            )}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          {/* Dept leaderboard */}
          <div style={{background:T.surface,borderRadius:T.rLg,padding:20,boxShadow:T.sh,border:`1px solid ${T.border}`}}>
            <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>🏫 Department Leaderboard</h3>
            {s?.byDepts?.length
              ?(()=>{const max=Math.max(...s.byDepts.map(d=>d.gold*5+d.silver*3+d.bronze),1);
                return s.byDepts.map(d=><MedalBar key={d.department} label={d.department}
                  gold={+d.gold} silver={+d.silver} bronze={+d.bronze} total={+d.total} max={max}/>);})()
              :[1,2,3,4].map(i=><div key={i} style={{marginBottom:14}}><Sk h={20} r={5}/></div>)
            }
          </div>

          {/* Top Sports */}
          <div style={{background:T.surface,borderRadius:T.rLg,padding:20,boxShadow:T.sh,border:`1px solid ${T.border}`}}>
            <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>⚽ Top Sports</h3>
            {s?.bySports?.slice(0,8).map(sp=>(
              <div key={sp.sport} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:12.5}}>
                <span style={{fontWeight:600,color:T.text}}>{sp.sport}</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {+sp.gold>0  &&<span style={{fontSize:11.5,color:MEDAL.Gold,fontWeight:600}}>🥇{sp.gold}</span>}
                  {+sp.silver>0&&<span style={{fontSize:11.5,color:MEDAL.Silver,fontWeight:600}}>🥈{sp.silver}</span>}
                  {+sp.bronze>0&&<span style={{fontSize:11.5,color:MEDAL.Bronze,fontWeight:600}}>🥉{sp.bronze}</span>}
                  <span style={{fontSize:11,color:T.light}}>({sp.total})</span>
                </div>
              </div>
            ))||[1,2,3,4].map(i=><div key={i} style={{marginBottom:10}}><Sk h={16} r={5}/></div>)}
          </div>

          {/* Recent */}
          <div style={{background:T.surface,borderRadius:T.rLg,padding:20,boxShadow:T.sh,border:`1px solid ${T.border}`,gridColumn:"1/-1"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>🔥 Recent Achievements</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:9}}>
              {s?.recentWins?.map(r=>(
                <div key={r.id} onClick={()=>openDetail(r)}
                  style={{display:"flex",gap:10,padding:"11px 13px",borderRadius:T.r,
                    background:T.bg,border:`1px solid ${T.border}`,cursor:"pointer",
                    alignItems:"center",transition:"all .14s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#EEF2FF";e.currentTarget.style.borderColor=T.accent+"44";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=T.bg;e.currentTarget.style.borderColor=T.border;}}>
                  <span style={{fontSize:22,flexShrink:0}}>{medalEmoji(r.position)}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.eventname}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:1}}>{r.student_name} · {r.department}</div>
                    <div style={{fontSize:10.5,color:T.light,marginTop:1}}>
                      {r.achievementdate?new Date(r.achievementdate).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}):""}
                      {" · "}{r.level}
                    </div>
                  </div>
                </div>
              ))||[1,2,3,4,5,6].map(i=><Sk key={i} h={68} r={T.r}/>)}
            </div>
          </div>

          {/*{s?.yearTrend?.length>0&&(
            <div style={{background:T.surface,borderRadius:T.rLg,padding:20,boxShadow:T.sh,border:`1px solid ${T.border}`,gridColumn:"1/-1"}}>
              <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14}}>📈 Year-wise Trend</h3>
              <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                {s.yearTrend.map(y=>(
                  <div key={y.yr} style={{flex:1,minWidth:80,padding:"14px 10px",background:T.bg,
                    borderRadius:T.r,textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:11.5,color:T.muted,marginBottom:5,fontWeight:500}}>{y.yr}</div>
                    <div style={{fontSize:20,fontWeight:800,color:T.accent}}>{y.total}</div>
                    <div style={{fontSize:11,marginTop:4,display:"flex",justifyContent:"center",gap:5}}>
                      <span style={{color:MEDAL.Gold}}>🥇{y.gold}</span>
                      <span style={{color:MEDAL.Silver}}>🥈{y.silver}</span>
                      <span style={{color:MEDAL.Bronze}}>🥉{y.bronze}</span>
                    </div>
                  </div>
                ))}*}
              </div>
            </div>
          )}*/}

          {s?.topStudents?.length>0&&(
            <div style={{background:T.surface,borderRadius:T.rLg,padding:20,boxShadow:T.sh,border:`1px solid ${T.border}`,gridColumn:"1/-1"}}>
              <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14}}>🌟 Top Champions</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                {s.topStudents.slice(0,8).map((st,i)=>(
                  <div key={st.id} style={{display:"flex",gap:10,padding:"12px",borderRadius:T.rLg,
                    background:i===0?"linear-gradient(135deg,#FFFBEB,#FEF3C7)":i===1?"#F8FAFC":i===2?"#FFF7ED":T.bg,
                    border:`1px solid ${i===0?"#D97706":i===1?"#94A3B8":i===2?"#92400E":T.border}22`,
                    alignItems:"center"}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <Avatar src={st.photo_url} name={st.student_name} size={38}/>
                      {i<3&&<div style={{position:"absolute",top:-8,right:-8,fontSize:14}}>{["🥇","🥈","🥉"][i]}</div>}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.student_name}</div>
                      <div style={{fontSize:11,color:T.muted}}>{st.department}</div>
                      <div style={{fontSize:11,marginTop:3,display:"flex",gap:5}}>
                        {+st.gold>0  &&<span style={{color:MEDAL.Gold,fontWeight:600}}>🥇{st.gold}</span>}
                        {+st.silver>0&&<span style={{color:MEDAL.Silver,fontWeight:600}}>🥈{st.silver}</span>}
                        {+st.bronze>0&&<span style={{color:MEDAL.Bronze,fontWeight:600}}>🥉{st.bronze}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Records ───────────────────────────────────────────────────────────────────
  const RecordsTab=()=>{
    const totalPages=Math.ceil(total/LIMIT);
    const pb=()=>({padding:"6px 13px",borderRadius:8,cursor:"pointer",fontSize:12.5,
      border:`1px solid ${T.border}`,background:"transparent",color:T.muted,transition:"all .13s"});
    return (
      <div style={{animation:"fadeUp .22s ease"}}>
        {/* Filters */}
        <div style={{background:T.surface,borderRadius:T.rLg,padding:"12px 16px",
          boxShadow:T.sh,border:`1px solid ${T.border}`,marginBottom:16,
          display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 190px"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.light,fontSize:13}}>🔍</span>
            <input value={filters.search} onChange={e=>setF("search",e.target.value)}
              placeholder="Search…" style={{...F(),paddingLeft:30,fontSize:12.5}}/>
          </div>
          {[["type","Type",VALID_TYPES],["level","Level",LEVELS],
            ["position","Position",POSITIONS],["department","Dept",DEPTS]].map(([k,ph,opts])=>(
            <FocusSelect key={k} value={filters[k]} onChange={e=>setF(k,e.target.value)}
              style={{padding:"7px 28px 7px 10px",fontSize:12,minWidth:100}}>
              <option value="">All {ph}s</option>
              {opts.map(v=><option key={v} value={v}>{v}</option>)}
            </FocusSelect>
          ))}
          {isStaff&&(
            <FocusSelect value={filters.status} onChange={e=>setF("status",e.target.value)}
              style={{padding:"7px 28px 7px 10px",fontSize:12,minWidth:100}}>
              <option value="">All Status</option>
              {VALID_STATUSES.map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </FocusSelect>
          )}
          <div style={{display:"flex",gap:3,background:T.bg,borderRadius:T.r,padding:3,border:`1px solid ${T.border}`}}>
            {[["cards","⊞"],["table","☰"]].map(([m,l])=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{padding:"4px 11px",border:"none",
                borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:600,
                background:viewMode===m?T.surface:"transparent",
                color:viewMode===m?T.accent:T.muted,
                boxShadow:viewMode===m?T.sh:"none",transition:"all .13s"}}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{fontSize:12,color:T.muted,marginBottom:12,fontWeight:500}}>
          {loading?"Loading…":`${total.toLocaleString()} achievement${total!==1?"s":""} found`}
        </div>

        {loading?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
            {[1,2,3,4,5,6].map(i=><Sk key={i} h={260} r={16}/>)}
          </div>
        ):viewMode==="cards"?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
            {records.map(r=><AchCard key={r.id} r={r} onOpen={openDetail}
              onEdit={rec=>{setModal(rec);setDetail(null);}} onDelete={handleDelete} isStaff={isStaff}/>)}
            {records.length===0&&(
              <div style={{gridColumn:"1/-1",textAlign:"center",padding:"50px 0",color:T.light}}>
                <div style={{fontSize:44,marginBottom:10}}>🏆</div>
                <div style={{fontSize:15,fontWeight:600,color:T.muted}}>No achievements found</div>
                <div style={{fontSize:12.5,marginTop:4}}>Try adjusting your filters</div>
              </div>
            )}
          </div>
        ):(
          <div style={{background:T.surface,borderRadius:T.rLg,overflow:"hidden",boxShadow:T.sh,border:`1px solid ${T.border}`}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
              <thead>
                <tr style={{background:"#F8FAFF"}}>
                  {["#","Student","Dept","Event","Level","Sport","Position","Date","Type","Status"].map(h=>(
                    <th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,
                      color:T.muted,fontSize:10.5,letterSpacing:.4,textTransform:"uppercase",
                      borderBottom:`1px solid ${T.border}`}}>{h}</th>
                  ))}
                  {isStaff&&<th style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`}}/>}
                </tr>
              </thead>
              <tbody>
                {records.map((r,i)=>(
                  <tr key={r.id} onClick={()=>openDetail(r)}
                    style={{cursor:"pointer",borderBottom:`1px solid ${T.border}`,transition:"background .1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F8FAFF"}
                    onMouseLeave={e=>e.currentTarget.style.background=""}>
                    <td style={{padding:"10px 12px",color:T.light,fontSize:11.5}}>{(page-1)*LIMIT+i+1}</td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Avatar src={r.photo_url} name={r.student_name} size={27}/>
                        <div>
                          <div style={{fontWeight:600,color:T.text,fontSize:12.5}}>{r.student_name}</div>
                          <div style={{fontSize:10.5,color:T.light}}>{r.rollno}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"10px 12px",color:T.muted}}>{r.department}</td>
                    <td style={{padding:"10px 12px",maxWidth:170,overflow:"hidden",textOverflow:"ellipsis",
                      whiteSpace:"nowrap",color:T.text,fontWeight:500}}>{r.eventname}</td>
                    <td style={{padding:"10px 12px"}}><Badge color={LEVEL_COLOR[r.level]||T.primary} dot>{r.level}</Badge></td>
                    <td style={{padding:"10px 12px",color:T.muted}}>{r.sport||"—"}</td>
                    <td style={{padding:"10px 12px",fontWeight:600,color:MEDAL[r.position]||T.text}}>
                      {medalEmoji(r.position)} {r.position}
                    </td>
                    <td style={{padding:"10px 12px",color:T.muted,fontSize:12}}>
                      {r.achievementdate?new Date(r.achievementdate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}
                    </td>
                    <td style={{padding:"10px 12px"}}><Badge color={r.type==="external"?T.danger:T.success}>{r.type}</Badge></td>
                    <td style={{padding:"10px 12px"}}><Badge color={r.status==="approved"?T.success:r.status==="pending"?T.warning:T.muted} dot>{r.status}</Badge></td>
                    {isStaff&&(
                      <td style={{padding:"10px 12px"}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>setModal(r)} style={{...aBtn(T.accent),flex:"none",padding:"5px 9px"}}>✏️</button>
                          <button onClick={()=>handleDelete(r.id)} style={{...aBtn(T.danger),flex:"none",padding:"5px 9px"}}>🗑</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length===0&&<div style={{padding:"40px 0",textAlign:"center",color:T.light,fontSize:13}}>No achievements found</div>}
          </div>
        )}

        {totalPages>1&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:5,marginTop:20,flexWrap:"wrap"}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{...pb(),opacity:page===1?.4:1}}>← Prev</button>
            {Array.from({length:Math.min(7,totalPages)},(_,i)=>{
              const p=Math.max(1,Math.min(totalPages-6,page-3))+i;
              return <button key={p} onClick={()=>setPage(p)} style={{...pb(),
                background:page===p?T.accent:"transparent",color:page===p?"#fff":T.muted,
                border:`1px solid ${page===p?T.accent:T.border}`,fontWeight:page===p?700:400}}>{p}</button>;
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{...pb(),opacity:page===totalPages?.4:1}}>Next →</button>
          </div>
        )}
      </div>
    );
  };

  // ── My ────────────────────────────────────────────────────────────────────────
  const MyTab=()=>{
    if (!myData) return (
      <div style={{display:"flex",justifyContent:"center",padding:60}}>
        <span style={{width:22,height:22,border:`2px solid ${T.border}`,borderTopColor:T.accent,
          borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>
      </div>
    );
    const{stats,achievements,team_participations}=myData;
    return (
      <div style={{animation:"fadeUp .22s ease"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
          {[["🏅",stats.total,"Total"],["🥇",stats.gold,"Gold"],["🥈",stats.silver,"Silver"],
            ["🥉",stats.bronze,"Bronze"],["⏳",stats.pending,"Pending"],
            ["💰",`₹${stats.cash_earned.toLocaleString("en-IN")}`,"Prize"],
          ].map(([ico,v,l])=>(
            <div key={l} style={{background:T.surface,borderRadius:T.r,padding:"13px 18px",
              boxShadow:T.sh,border:`1px solid ${T.border}`,textAlign:"center",minWidth:85,flex:1}}>
              <div style={{fontSize:20}}>{ico}</div>
              <div style={{fontSize:19,fontWeight:800,color:T.accent,lineHeight:1.1}}>{v}</div>
              <div style={{fontSize:11,color:T.light,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>

        {achievements.length===0&&(
          <div style={{textAlign:"center",padding:"50px 36px",background:T.surface,
            borderRadius:T.rLg,border:`1px solid ${T.border}`,boxShadow:T.sh}}>
            <div style={{fontSize:46,marginBottom:12}}>🏆</div>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>No achievements yet</div>
            <div style={{fontSize:12.5,color:T.muted,marginTop:5,maxWidth:280,margin:"6px auto 0"}}>
              Your sports achievements will appear here once recorded by staff
            </div>
          </div>
        )}

        {achievements.length>0&&(
          <div style={{marginBottom:24}}>
            <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>My Achievements</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
              {achievements.map(r=><AchCard key={r.id} r={r} onOpen={openDetail} onEdit={()=>{}} onDelete={()=>{}} isStaff={false}/>)}
            </div>
          </div>
        )}

        {team_participations?.length>0&&(
          <div>
            <h3 style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Team Participations</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
              {team_participations.map(r=><AchCard key={r.id} r={r} onOpen={openDetail} onEdit={()=>{}} onDelete={()=>{}} isStaff={false}/>)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const TABS=[
    {id:"overview",label:"Overview",icon:"📊"},
    {id:"records",label:"All Records",icon:"🏅"},
    ...(isStudent?[{id:"my",label:"My Achievements",icon:"⭐"}]:[]),
  ];

  return (
    <div style={{fontFamily:"'Inter',sans-serif",minHeight:"100vh",background:T.bg,padding:"22px 26px"}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-.4,lineHeight:1.2}}>
            Sports Achievements
          </h1>
          <p style={{fontSize:12.5,color:T.muted,marginTop:3}}>College Sports Department · Achievement Tracker</p>
        </div>
        {isStaff&&(
          <button className="btn-pri" onClick={()=>setModal("add")} style={{
            padding:"9px 20px",border:"none",borderRadius:T.rLg,
            background:`linear-gradient(135deg,${T.primary},${T.accent})`,
            color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,
            boxShadow:`0 4px 16px ${T.accent}40`,
            display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:15}}>＋</span> Add Achievement
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,marginBottom:22,background:T.surface,borderRadius:T.rLg,
        padding:4,boxShadow:T.sh,border:`1px solid ${T.border}`,width:"fit-content"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"7px 18px",border:"none",borderRadius:9,cursor:"pointer",
            background:tab===t.id?`linear-gradient(135deg,${T.primary},${T.accent})`:"transparent",
            color:tab===t.id?"#fff":T.muted,fontWeight:tab===t.id?700:400,fontSize:13,
            boxShadow:tab===t.id?`0 2px 8px ${T.accent}28`:"none",transition:"all .18s"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==="overview"&&<OverviewTab/>}
      {tab==="records" &&<RecordsTab/>}
      {tab==="my"      &&<MyTab/>}

      {detail&&<DetailPanel r={detail} onClose={()=>setDetail(null)}
        onEdit={rec=>{setModal(rec);setDetail(null);}} onDelete={handleDelete} isStaff={isStaff}/>}
      {modal&&<AchModal initial={modal==="add"?null:modal}
        onClose={()=>setModal(null)} onSaved={()=>{setModal(null);loadRecords(page);}} toast={showToast}/>}
      <Toast msg={toast.msg} type={toast.type}/>
    </div>
  );
}