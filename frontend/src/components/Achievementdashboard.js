import { useState, useRef } from "react";

// ── Google Fonts ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

// ── MOCK STUDENTS (linked by student_id, rollno, reg_number) ─────────────────
const STUDENTS = [
  { id: 1, rollno: "21CSE001", reg_number: "211CE001", name: "Arun Kumar",         department: "CSE", batch: "2021-2025", gender: "Male",   blood_group: "O+",  phone: "9876543210", email: "arun@college.edu",   photo: "https://api.dicebear.com/7.x/initials/svg?seed=AK&backgroundColor=0f4c81&fontFamily=Arial&fontSize=38" },
  { id: 2, rollno: "21ECE015", reg_number: "211EC015", name: "Priya Sharma",        department: "ECE", batch: "2021-2025", gender: "Female", blood_group: "B+",  phone: "9876543211", email: "priya@college.edu",  photo: "https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=b5179e&fontFamily=Arial&fontSize=38" },
  { id: 3, rollno: "20IT009",  reg_number: "201IT009", name: "L. Sivabalan",        department: "IT",  batch: "2020-2024", gender: "Male",   blood_group: "A+",  phone: "9876543212", email: "siva@college.edu",   photo: "https://api.dicebear.com/7.x/initials/svg?seed=LS&backgroundColor=1a936f&fontFamily=Arial&fontSize=38" },
  { id: 4, rollno: "22ECE013", reg_number: "221EC013", name: "I. Sudalai Rajamani", department: "ECE", batch: "2022-2026", gender: "Male",   blood_group: "AB+", phone: "9876543213", email: "sudalai@college.edu",photo: "https://api.dicebear.com/7.x/initials/svg?seed=SR&backgroundColor=c77dff&fontFamily=Arial&fontSize=38" },
  { id: 5, rollno: "22IT012",  reg_number: "221IT012", name: "J.G. Libisha",        department: "IT",  batch: "2022-2026", gender: "Female", blood_group: "O-",  phone: "9876543214", email: "libisha@college.edu", photo: "https://api.dicebear.com/7.x/initials/svg?seed=JL&backgroundColor=e63946&fontFamily=Arial&fontSize=38" },
  { id: 6, rollno: "21ECE011", reg_number: "211EC011", name: "J. Iswarya",          department: "ECE", batch: "2021-2025", gender: "Female", blood_group: "A-",  phone: "9876543215", email: "iswarya@college.edu", photo: "https://api.dicebear.com/7.x/initials/svg?seed=JI&backgroundColor=f4a261&fontFamily=Arial&fontSize=38" },
  { id: 7, rollno: "19ECE021", reg_number: "191EC021", name: "J. Anisha Brightline",department: "ECE", batch: "2019-2023", gender: "Female", blood_group: "B-",  phone: "9876543216", email: "anisha@college.edu",  photo: "https://api.dicebear.com/7.x/initials/svg?seed=AB&backgroundColor=457b9d&fontFamily=Arial&fontSize=38" },
  { id: 8, rollno: "21EEE010", reg_number: "211EE010", name: "Giftson Dharmaraj",   department: "EEE", batch: "2021-2025", gender: "Male",   blood_group: "O+",  phone: "9876543217", email: "giftson@college.edu", photo: "https://api.dicebear.com/7.x/initials/svg?seed=GD&backgroundColor=2d6a4f&fontFamily=Arial&fontSize=38" },
  { id: 9, rollno: "21CSE031", reg_number: "211CE031", name: "Harini A",            department: "CSE", batch: "2021-2025", gender: "Female", blood_group: "A+",  phone: "9876543218", email: "harini@college.edu",  photo: "https://api.dicebear.com/7.x/initials/svg?seed=HA&backgroundColor=f3722c&fontFamily=Arial&fontSize=38" },
  { id:10, rollno: "23IT045",  reg_number: "231IT045", name: "N. Varshini",          department: "IT",  batch: "2023-2027", gender: "Female", blood_group: "B+",  phone: "9876543219", email: "varshini@college.edu",photo: "https://api.dicebear.com/7.x/initials/svg?seed=NV&backgroundColor=560bad&fontFamily=Arial&fontSize=38" },
  { id:11, rollno: "23MBA002", reg_number: "231MB002", name: "R. Muthu Eswari",      department: "MBA", batch: "2023-2025", gender: "Female", blood_group: "O+",  phone: "9876543220", email: "muthu@college.edu",   photo: "https://api.dicebear.com/7.x/initials/svg?seed=ME&backgroundColor=06d6a0&fontFamily=Arial&fontSize=38" },
  { id:12, rollno: "21CSE055", reg_number: "211CE055", name: "K. Dharani",           department: "CSE", batch: "2021-2025", gender: "Female", blood_group: "AB-", phone: "9876543221", email: "dharani@college.edu", photo: "https://api.dicebear.com/7.x/initials/svg?seed=KD&backgroundColor=7209b7&fontFamily=Arial&fontSize=38" },
];

// ── MOCK ACHIEVEMENTS ─────────────────────────────────────────────────────────
const INIT_RECORDS = [
  { id:1,  student_id:1,  type:"external", level:"Zonal",    sport:"Athletics",      eventname:"Anna University Zone 18 Athletic Meet",              position:"Gold",   achievementdate:"2023-10-27", venue:"Mepco Schlenk Engg College, Sivakasi", description:"Won gold in 100m sprint with a college-record time of 10.8 seconds.", cashprize:4000, certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2023-11-01" },
  { id:2,  student_id:2,  type:"external", level:"State",    sport:"Badminton",      eventname:"Anna University Women Singles Championship",          position:"Gold",   achievementdate:"2023-08-25", venue:"Chennai Sports Complex",               description:"State champion defeating top-seeded player in the finals 21-15, 21-18.", cashprize:8000, certificate:true,  status:"approved", media:[], createdby:"Prof. Kavitha", createdat:"2023-09-01" },
  { id:3,  student_id:3,  type:"external", level:"State",    sport:"Body Building",  eventname:"State Level Body Building Competition",               position:"Gold",   achievementdate:"2023-02-26", venue:"Tenkasi Indoor Stadium",               description:"Gold in open category body building at state level.", cashprize:10000,certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2023-03-02" },
  { id:4,  student_id:4,  type:"external", level:"State",    sport:"Karate",         eventname:"State Level Karate Tournament",                       position:"Silver", achievementdate:"2023-02-27", venue:"Chennai",                              description:"Silver in kumite category, reached finals defeating multiple opponents.", cashprize:3000, certificate:true,  status:"approved", media:[], createdby:"Prof. Kavitha", createdat:"2023-03-05" },
  { id:5,  student_id:5,  type:"external", level:"Zonal",    sport:"Athletics",      eventname:"Anna University Zone 18 Athletic Meet - Shot Put",    position:"Gold",   achievementdate:"2023-10-27", venue:"Mepco Schlenk Engg College, Sivakasi", description:"Gold in shot-put with a throw of 14.2 meters.", cashprize:4000, certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2023-11-03" },
  { id:6,  student_id:6,  type:"external", level:"Zonal",    sport:"Athletics",      eventname:"Anna University Zone 18 Athletic Meet - Pole Vault",  position:"Gold",   achievementdate:"2023-10-27", venue:"Mepco Schlenk Engg College, Sivakasi", description:"Women's pole vault gold with a height of 3.2 meters.", cashprize:4000, certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2023-11-03" },
  { id:7,  student_id:7,  type:"external", level:"State",    sport:"Power Lifting",  eventname:"State Level Power Lifting Competition",               position:"Gold",   achievementdate:"2023-04-19", venue:"Tirunelveli",                          description:"State champion in 59kg category. Total lift: 280kg.", cashprize:7500, certificate:true,  status:"approved", media:[], createdby:"Prof. Kavitha", createdat:"2023-04-25" },
  { id:8,  student_id:8,  type:"external", level:"Zonal",    sport:"Athletics",      eventname:"Anna University Zone 18 Athletic Meet - Hammer Throw",position:"Silver", achievementdate:"2023-10-27", venue:"Mepco Schlenk Engg College, Sivakasi", description:"Silver in hammer throw with 52.4 meters.", cashprize:2500, certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2023-11-03" },
  { id:9,  student_id:9,  type:"external", level:"Zonal",    sport:"Cricket",        eventname:"Anna University Inter Zone Cricket (Women) Tournament",position:"Bronze", achievementdate:"2023-01-22", venue:"Dr Sivanthi Aditanar College",         description:"Team bronze. Scored 45 runs in semi-final.", cashprize:0,    certificate:false, status:"approved", media:[], createdby:"Prof. Kavitha", createdat:"2023-01-30" },
  { id:10, student_id:10, type:"external", level:"District", sport:"Silambam",       eventname:"District Level Silambam (C.M Trophy)",                position:"Gold",   achievementdate:"2024-09-15", venue:"Thoothukudi",                          description:"Gold in senior women Silambam at CM Trophy district level.", cashprize:6000, certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2024-09-20" },
  { id:11, student_id:11, type:"external", level:"Zonal",    sport:"Athletics",      eventname:"Anna University Zone 18 Athletics - 800m Run",        position:"Gold",   achievementdate:"2024-08-10", venue:"Anna University, Chennai",             description:"Gold in 800m women's. Time: 2 min 18 sec — new college record.", cashprize:4500, certificate:true,  status:"approved", media:[], createdby:"Prof. Kavitha", createdat:"2024-08-15" },
  { id:12, student_id:12, type:"internal", level:"Inter-Department", sport:"Chess",  eventname:"Inter-Department Chess Championship",                 position:"Gold",   achievementdate:"2023-12-10", venue:"College Seminar Hall",                 description:"Won annual chess championship undefeated across all 7 rounds.", cashprize:500,  certificate:true,  status:"approved", media:[], createdby:"Dr. Ramesh",   createdat:"2023-12-15" },
];

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg: "#F4F6F9", surface: "#FFFFFF", border: "#E4E8EF",
  accent: "#1A3C6E", accentLight: "#E8EFF9",
  gold: "#B8860B", goldBg: "#FFF8E1", goldBorder: "#FFD54F",
  silver: "#546E7A", silverBg: "#ECEFF1", silverBorder: "#B0BEC5",
  bronze: "#8D4E0F", bronzeBg: "#FBE9E7", bronzeBorder: "#FFAB91",
  ext: "#1B5E20", extBg: "#E8F5E9", extBorder: "#A5D6A7",
  int: "#1565C0", intBg: "#E3F2FD", intBorder: "#90CAF9",
  text: "#1A2332", textSub: "#5A6A7A", textMuted: "#8A9AB0",
  danger: "#C62828", success: "#2E7D32",
};

const font = "'IBM Plex Sans', sans-serif";
const mono = "'IBM Plex Mono', monospace";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const getStudent = (id) => STUDENTS.find(s => s.id === id) || {};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtINR = (n) => n > 0 ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const MEDAL_META = {
  Gold:   { color: C.gold,   bg: C.goldBg,   border: C.goldBorder,   icon: "🥇" },
  Silver: { color: C.silver, bg: C.silverBg, border: C.silverBorder, icon: "🥈" },
  Bronze: { color: C.bronze, bg: C.bronzeBg, border: C.bronzeBorder, icon: "🥉" },
};

const LEVEL_COLOR = {
  International:"#6A0DAD", National:"#1565C0", State:"#1B5E20",
  Zonal:"#01579B", District:"#BF360C", "Inter-Department":"#4527A0",
  "Inter-College":"#880E4F",
};

// ── BADGE COMPONENTS ──────────────────────────────────────────────────────────
const MedalPill = ({ pos, size = 13 }) => {
  const m = MEDAL_META[pos];
  if (!m) return <span style={{ fontSize:size, color:C.textSub, background:C.bg, border:`1px solid ${C.border}`, borderRadius:4, padding:"2px 8px", fontFamily:font, fontWeight:600 }}>{pos}</span>;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:size, fontWeight:700, fontFamily:font, background:m.bg, color:m.color, border:`1.5px solid ${m.border}`, borderRadius:4, padding:"2px 9px" }}>
      {m.icon} {pos}
    </span>
  );
};

const TypePill = ({ type }) => (
  <span style={{ fontSize:11, fontWeight:600, fontFamily:font, letterSpacing:"0.06em", textTransform:"uppercase",
    background: type==="external" ? C.extBg : C.intBg,
    color: type==="external" ? C.ext : C.int,
    border:`1px solid ${type==="external" ? C.extBorder : C.intBorder}`,
    borderRadius:3, padding:"2px 7px" }}>
    {type==="external" ? "External" : "Internal"}
  </span>
);

const LevelPill = ({ level }) => (
  <span style={{ fontSize:11, fontWeight:600, fontFamily:font, letterSpacing:"0.05em", textTransform:"uppercase",
    background: (LEVEL_COLOR[level]||"#555") + "18",
    color: LEVEL_COLOR[level]||"#555",
    border:`1px solid ${(LEVEL_COLOR[level]||"#555")}44`,
    borderRadius:3, padding:"2px 7px" }}>
    {level}
  </span>
);

const StatusPill = ({ status }) => (
  <span style={{ fontSize:11, fontWeight:600, fontFamily:font, letterSpacing:"0.05em",
    background: status==="approved" ? "#E8F5E9" : "#FFF8E1",
    color: status==="approved" ? "#2E7D32" : "#F57F17",
    border:`1px solid ${status==="approved" ? "#A5D6A7" : "#FFD54F"}`,
    borderRadius:3, padding:"2px 8px" }}>
    {status==="approved" ? "✓ Approved" : "⏳ Pending"}
  </span>
);

// ── STAT BOX ──────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, sub, accent }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:`3px solid ${accent||C.accent}`, borderRadius:6, padding:"14px 18px", minWidth:110 }}>
    <div style={{ fontSize:24, fontWeight:700, fontFamily:mono, color: accent||C.text, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, fontWeight:600, color:C.textSub, fontFamily:font, marginTop:4 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:C.textMuted, fontFamily:font, marginTop:2 }}>{sub}</div>}
  </div>
);

// ── FORM MODAL ────────────────────────────────────────────────────────────────
const RecordModal = ({ record, onClose, onSave }) => {
  const isEdit = !!record?.id;
  const [form, setForm] = useState(record || {
    student_id:"", type:"external", level:"Zonal", sport:"", eventname:"", position:"Gold",
    achievementdate:"", venue:"", description:"", cashprize:0, certificate:false,
    status:"approved", media:[], createdby:"Staff"
  });
  const [mediaPreview, setMediaPreview] = useState(form.media || []);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const item = { name: file.name, url: ev.target.result, type: file.type.startsWith("video") ? "video" : "image" };
        setMediaPreview(prev => [...prev, item]);
        setForm(f => ({ ...f, media: [...(f.media||[]), item] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (i) => {
    setMediaPreview(prev => prev.filter((_,idx) => idx !== i));
    setForm(f => ({ ...f, media: (f.media||[]).filter((_,idx) => idx !== i) }));
  };

  const stu = STUDENTS.find(s => s.id === Number(form.student_id));

  const handleSubmit = () => {
    if (!form.student_id || !form.eventname || !form.achievementdate) {
      alert("Student, Event Name and Date are required.");
      return;
    }
    onSave({ ...form, id: isEdit ? form.id : Date.now(), createdat: isEdit ? form.createdat : new Date().toISOString().slice(0,10) });
  };

  const inputStyle = { width:"100%", border:`1px solid ${C.border}`, borderRadius:4, padding:"8px 11px", fontFamily:font, fontSize:13, color:C.text, background:"#FAFBFC", outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:12, fontWeight:600, color:C.textSub, fontFamily:font, display:"block", marginBottom:4 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,40,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.surface, borderRadius:8, width:"100%", maxWidth:780, maxHeight:"92vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", border:`1px solid ${C.border}` }}>
        {/* Header */}
        <div style={{ background:C.accent, color:"#fff", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", borderRadius:"8px 8px 0 0" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, fontFamily:font }}>{isEdit ? "Edit Achievement Record" : "Add New Achievement Record"}</div>
            <div style={{ fontSize:11, opacity:0.7, fontFamily:mono, marginTop:2 }}>ACHIEVEMENT MANAGEMENT SYSTEM</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:4, padding:"5px 12px", cursor:"pointer", fontSize:14, fontFamily:font }}>✕ Close</button>
        </div>

        <div style={{ padding:24 }}>
          {/* Student Selection */}
          <div style={{ background:C.accentLight, border:`1px solid ${C.intBorder}`, borderRadius:6, padding:16, marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.accent, fontFamily:font, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>🎓 Student Information</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <label style={labelStyle}>Student ID / Name *</label>
                <select value={form.student_id} onChange={e => set("student_id", Number(e.target.value))} style={inputStyle}>
                  <option value="">— Select Student —</option>
                  {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.rollno} – {s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Roll No</label>
                <input value={stu?.rollno||""} readOnly style={{ ...inputStyle, background:"#F0F4F8", color:C.textSub }} />
              </div>
              <div>
                <label style={labelStyle}>Reg. Number</label>
                <input value={stu?.reg_number||""} readOnly style={{ ...inputStyle, background:"#F0F4F8", color:C.textSub }} />
              </div>
            </div>
            {stu && (
              <div style={{ display:"flex", alignItems:"center", gap:12, background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 14px" }}>
                <img src={stu.photo} alt="" style={{ width:40, height:40, borderRadius:"50%", border:`2px solid ${C.border}` }} />
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:font }}>{stu.name}</div>
                  <div style={{ fontSize:11, color:C.textSub, fontFamily:mono }}>{stu.department} • {stu.batch} • {stu.gender} • {stu.blood_group}</div>
                </div>
                <div style={{ marginLeft:"auto", fontSize:11, color:C.textSub, fontFamily:mono }}>{stu.phone}<br/>{stu.email}</div>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:font, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em", borderBottom:`1px solid ${C.border}`, paddingBottom:8 }}>📋 Event Details</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Event Name *</label>
                <input value={form.eventname} onChange={e => set("eventname", e.target.value)} placeholder="e.g. Anna University Zone 18 Athletic Meet" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Sport / Category</label>
                <input value={form.sport} onChange={e => set("sport", e.target.value)} list="sport-list" placeholder="e.g. Athletics, Kabaddi" style={inputStyle} />
                <datalist id="sport-list">
                  {["Athletics","Tennis","Badminton","Cricket","Kabaddi","Silambam","Karate","Weight Lifting","Power Lifting","Body Building","Hammer Throw","Pole Vault","Shot-put","Swimming","Chess","Football","Basketball"].map(s=><option key={s} value={s}/>)}
                </datalist>
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["external","internal"].map(t => (
                    <button key={t} onClick={() => set("type",t)} style={{ flex:1, border:`1.5px solid ${form.type===t ? (t==="external" ? C.ext : C.int) : C.border}`, background: form.type===t ? (t==="external" ? C.extBg : C.intBg) : "#fff", color: form.type===t ? (t==="external" ? C.ext : C.int) : C.textSub, borderRadius:4, padding:"7px", fontFamily:font, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      {t==="external" ? "🌍 External" : "🏫 Internal"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Level</label>
                <select value={form.level} onChange={e => set("level", e.target.value)} style={inputStyle}>
                  {["Inter-Department","Inter-College","District","Zonal","State","National","International"].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Position / Achievement *</label>
                <select value={form.position} onChange={e => set("position", e.target.value)} style={inputStyle}>
                  {["Gold","Silver","Bronze","1st Place","2nd Place","3rd Place","Winner","Runner-up","Participant"].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Achievement Date *</label>
                <input type="date" value={form.achievementdate} onChange={e => set("achievementdate", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Venue / Location</label>
                <input value={form.venue} onChange={e => set("venue", e.target.value)} placeholder="Venue / City" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cash Prize (₹)</label>
                <input type="number" value={form.cashprize} onChange={e => set("cashprize", Number(e.target.value))} placeholder="0" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description / Remarks</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Add details about this achievement..." style={{ ...inputStyle, resize:"vertical" }} />
            </div>
          </div>

          {/* Media Upload */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:font, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em", borderBottom:`1px solid ${C.border}`, paddingBottom:8 }}>📎 Media (Photos / Videos)</div>
            <div style={{ border:`2px dashed ${C.border}`, borderRadius:6, padding:20, textAlign:"center", cursor:"pointer", background:"#FAFBFC" }} onClick={() => fileRef.current.click()}>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display:"none" }} onChange={handleFile} />
              <div style={{ fontSize:28, marginBottom:6 }}>📁</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.textSub, fontFamily:font }}>Click to upload photos or videos</div>
              <div style={{ fontSize:11, color:C.textMuted, fontFamily:font, marginTop:2 }}>Supports JPG, PNG, MP4, MOV</div>
            </div>
            {mediaPreview.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:12 }}>
                {mediaPreview.map((m,i) => (
                  <div key={i} style={{ position:"relative", width:90, height:80, borderRadius:6, overflow:"hidden", border:`1px solid ${C.border}` }}>
                    {m.type==="video"
                      ? <div style={{ width:"100%", height:"100%", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:24 }}>▶</div>
                      : <img src={m.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    }
                    <button onClick={() => removeMedia(i)} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", borderRadius:"50%", width:18, height:18, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:9, padding:"2px 4px", fontFamily:mono, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status + Certificate */}
          <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:20, padding:"12px 16px", background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
            <div>
              <label style={labelStyle}>Approval Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyle, width:"auto" }}>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontFamily:font, fontSize:13, color:C.text, fontWeight:500 }}>
              <input type="checkbox" checked={form.certificate} onChange={e => set("certificate", e.target.checked)} style={{ width:15, height:15 }} />
              Certificate Received
            </label>
          </div>

          {/* Footer */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:12, borderTop:`1px solid ${C.border}` }}>
            <button onClick={onClose} style={{ border:`1px solid ${C.border}`, background:"#fff", color:C.textSub, borderRadius:4, padding:"9px 22px", fontFamily:font, fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
            <button onClick={handleSubmit} style={{ background:C.accent, color:"#fff", border:"none", borderRadius:4, padding:"9px 24px", fontFamily:font, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {isEdit ? "💾 Save Changes" : "✅ Add Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── STUDENT DETAIL MODAL ──────────────────────────────────────────────────────
const StudentDetailModal = ({ student, allRecords, onClose }) => {
  const records = allRecords.filter(r => r.student_id === student.id);
  const gold = records.filter(r => r.position==="Gold").length;
  const silver = records.filter(r => r.position==="Silver").length;
  const bronze = records.filter(r => r.position==="Bronze").length;
  const totalPrize = records.reduce((s,r) => s + (Number(r.cashprize)||0), 0);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,40,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.surface, borderRadius:8, width:"100%", maxWidth:820, maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg, ${C.accent}, #2563AB)`, padding:"20px 28px", borderRadius:"8px 8px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <img src={student.photo} alt="" style={{ width:64, height:64, borderRadius:"50%", border:"3px solid rgba(255,255,255,0.4)" }} />
            <div style={{ color:"#fff" }}>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:font }}>{student.name}</div>
              <div style={{ fontSize:12, opacity:0.8, fontFamily:mono, marginTop:3 }}>
                {student.rollno} &nbsp;|&nbsp; Reg: {student.reg_number} &nbsp;|&nbsp; {student.department} &nbsp;|&nbsp; {student.batch}
              </div>
              <div style={{ fontSize:11, opacity:0.7, fontFamily:mono, marginTop:2 }}>
                {student.gender} &nbsp;•&nbsp; {student.blood_group} &nbsp;•&nbsp; {student.phone} &nbsp;•&nbsp; {student.email}
              </div>
            </div>
            <button onClick={onClose} style={{ marginLeft:"auto", background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:4, padding:"6px 14px", cursor:"pointer", fontFamily:font, fontSize:13 }}>✕ Close</button>
          </div>
        </div>

        <div style={{ padding:24 }}>
          {/* Summary */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
            <StatBox label="Total Records" value={records.length} accent={C.accent} />
            <StatBox label="Gold" value={gold}   accent={C.gold}   />
            <StatBox label="Silver" value={silver} accent={C.silver} />
            <StatBox label="Bronze" value={bronze} accent={C.bronze} />
            <StatBox label="Cash Prize" value={fmtINR(totalPrize)} accent="#2E7D32" sub="Total awarded" />
          </div>

          {/* Records Table */}
          <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:font, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>
            Complete Achievement History — {records.length} record(s)
          </div>
          {records.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:C.textMuted, fontFamily:font }}>No achievements recorded for this student.</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {records.map(r => (
                <div key={r.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderLeft:`4px solid ${MEDAL_META[r.position]?.color || C.border}`, borderRadius:6, padding:"14px 18px" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:8 }}>
                    <MedalPill pos={r.position} />
                    <TypePill type={r.type} />
                    <LevelPill level={r.level} />
                    <StatusPill status={r.status} />
                    {r.certificate && <span style={{ fontSize:11, fontFamily:font, color:"#1565C0", background:"#E3F2FD", border:"1px solid #90CAF9", borderRadius:3, padding:"2px 7px", fontWeight:600 }}>📜 Certificate</span>}
                    <span style={{ marginLeft:"auto", fontSize:11, fontFamily:mono, color:C.textMuted }}>{fmtDate(r.achievementdate)}</span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text, fontFamily:font, marginBottom:3 }}>{r.eventname}</div>
                  <div style={{ fontSize:12, color:C.textSub, fontFamily:font, marginBottom:6 }}>
                    🏟 {r.venue || "—"} &nbsp;•&nbsp; 🎯 {r.sport || "—"} {r.cashprize > 0 && <>&nbsp;•&nbsp; 💰 {fmtINR(r.cashprize)}</>}
                  </div>
                  {r.description && <div style={{ fontSize:12, color:C.textMuted, fontFamily:font, lineHeight:1.6 }}>{r.description}</div>}
                  {r.media?.length > 0 && (
                    <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                      {r.media.map((m,i) => (
                        <div key={i} style={{ width:70, height:60, borderRadius:5, overflow:"hidden", border:`1px solid ${C.border}` }}>
                          {m.type==="video"
                            ? <div style={{ width:"100%", height:"100%", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18 }}>▶</div>
                            : <img src={m.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── RECORD DETAIL MODAL ───────────────────────────────────────────────────────
const RecordDetailModal = ({ record, onClose, onEdit, onDelete }) => {
  const stu = getStudent(record.student_id);
  const [mediaIdx, setMediaIdx] = useState(0);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,40,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.surface, borderRadius:8, width:"100%", maxWidth:720, maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Top bar */}
        <div style={{ background:C.accent, padding:"14px 22px", borderRadius:"8px 8px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:"#fff", fontSize:13, fontWeight:700, fontFamily:font }}>Achievement Record — #{String(record.id).padStart(5,"0")}</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onEdit} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontFamily:font, fontSize:12, fontWeight:600 }}>✏️ Edit</button>
            <button onClick={onDelete} style={{ background:"rgba(220,50,50,0.5)", border:"none", color:"#fff", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontFamily:font, fontSize:12, fontWeight:600 }}>🗑 Delete</button>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:4, padding:"5px 12px", cursor:"pointer", fontFamily:font, fontSize:13 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:24 }}>
          {/* Student card */}
          <div style={{ display:"flex", alignItems:"center", gap:14, background:C.accentLight, border:`1px solid ${C.intBorder}`, borderRadius:8, padding:"14px 18px", marginBottom:20 }}>
            <img src={stu.photo} alt="" style={{ width:52, height:52, borderRadius:"50%", border:`2px solid ${C.intBorder}` }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, fontFamily:font }}>{stu.name}</div>
              <div style={{ fontSize:12, color:C.textSub, fontFamily:mono, marginTop:2 }}>
                Roll: {stu.rollno} &nbsp;|&nbsp; Reg: {stu.reg_number} &nbsp;|&nbsp; {stu.department} · {stu.batch}
              </div>
            </div>
            <div style={{ textAlign:"right", fontSize:11, color:C.textMuted, fontFamily:mono }}>
              <div>{stu.phone}</div>
              <div>{stu.email}</div>
            </div>
          </div>

          {/* Badges row */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            <MedalPill pos={record.position} size={14} />
            <TypePill type={record.type} />
            <LevelPill level={record.level} />
            <StatusPill status={record.status} />
            {record.certificate && <span style={{ fontSize:12, fontFamily:font, color:"#1565C0", background:"#E3F2FD", border:"1px solid #90CAF9", borderRadius:3, padding:"2px 8px", fontWeight:600 }}>📜 Certificate Received</span>}
          </div>

          {/* Event info grid */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:18, fontWeight:700, color:C.text, fontFamily:font, marginBottom:8 }}>{record.eventname}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
              {[
                ["Sport / Category", record.sport || "—"],
                ["Date", fmtDate(record.achievementdate)],
                ["Venue", record.venue || "—"],
                ["Cash Prize", fmtINR(record.cashprize)],
                ["Recorded By", record.createdby || "—"],
                ["Entry Date", fmtDate(record.createdat)],
              ].map(([k,v]) => (
                <div key={k} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, padding:"10px 14px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, fontFamily:font, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:font }}>{v}</div>
                </div>
              ))}
            </div>
            {record.description && (
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, padding:"12px 16px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, fontFamily:font, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Description</div>
                <div style={{ fontSize:13, color:C.text, fontFamily:font, lineHeight:1.7 }}>{record.description}</div>
              </div>
            )}
          </div>

          {/* Media Viewer */}
          {record.media?.length > 0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:C.textSub, fontFamily:font, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>📎 Attached Media ({record.media.length})</div>
              <div style={{ background:"#111", borderRadius:8, overflow:"hidden", marginBottom:8, minHeight:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {record.media[mediaIdx]?.type === "video"
                  ? <video src={record.media[mediaIdx].url} controls style={{ width:"100%", maxHeight:300 }} />
                  : <img src={record.media[mediaIdx]?.url} alt="" style={{ maxWidth:"100%", maxHeight:300, objectFit:"contain" }} />
                }
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {record.media.map((m,i) => (
                  <div key={i} onClick={() => setMediaIdx(i)} style={{ width:60, height:50, borderRadius:4, overflow:"hidden", cursor:"pointer", border:`2px solid ${i===mediaIdx ? C.accent : C.border}`, opacity: i===mediaIdx ? 1 : 0.7 }}>
                    {m.type==="video"
                      ? <div style={{ width:"100%", height:"100%", background:"#222", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14 }}>▶</div>
                      : <img src={m.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function AchievementERP() {
  const [records, setRecords] = useState(INIT_RECORDS);
  const [activeTab, setActiveTab] = useState("all"); // all | external | internal
  const [filterDept, setFilterDept] = useState("All");
  const [filterPos, setFilterPos] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);

  // Filtered records
  const filtered = records.filter(r => {
    const stu = getStudent(r.student_id);
    const q = search.toLowerCase();
    const matchSearch = !q ||
      stu.name?.toLowerCase().includes(q) ||
      stu.rollno?.toLowerCase().includes(q) ||
      stu.reg_number?.toLowerCase().includes(q) ||
      r.eventname?.toLowerCase().includes(q) ||
      r.sport?.toLowerCase().includes(q);
    const matchTab = activeTab === "all" || r.type === activeTab;
    const matchDept = filterDept === "All" || stu.department === filterDept;
    const matchPos = filterPos === "All" || r.position === filterPos;
    const matchLevel = filterLevel === "All" || r.level === filterLevel;
    return matchSearch && matchTab && matchDept && matchPos && matchLevel;
  });

  // Stats
  const total = records.length, gold = records.filter(r=>r.position==="Gold").length;
  const silver = records.filter(r=>r.position==="Silver").length, bronze = records.filter(r=>r.position==="Bronze").length;
  const external = records.filter(r=>r.type==="external").length, internal = records.filter(r=>r.type==="internal").length;
  const totalPrize = records.reduce((s,r)=>s+(Number(r.cashprize)||0),0);

  const handleSave = (data) => {
    if (editRecord?.id && records.find(r => r.id === editRecord.id)) {
      setRecords(prev => prev.map(r => r.id === data.id ? data : r));
    } else {
      setRecords(prev => [...prev, data]);
    }
    setShowForm(false); setEditRecord(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this achievement record?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setViewRecord(null);
    }
  };

  const DEPTS = ["All","CSE","ECE","IT","EEE","Civil","MBA"];
  const LEVELS = ["All","Inter-Department","District","Zonal","State","National","International"];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:font }}>
      {/* Modals */}
      {(showForm || editRecord) && (
        <RecordModal record={editRecord} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={handleSave} />
      )}
      {viewRecord && !editRecord && (
        <RecordDetailModal
          record={viewRecord}
          onClose={() => setViewRecord(null)}
          onEdit={() => { setEditRecord(viewRecord); setViewRecord(null); }}
          onDelete={() => handleDelete(viewRecord.id)}
        />
      )}
      {viewStudent && (
        <StudentDetailModal student={viewStudent} allRecords={records} onClose={() => setViewStudent(null)} />
      )}

      {/* Top Bar */}
      <div style={{ background:C.accent, color:"#fff", padding:"0 28px", display:"flex", alignItems:"center", gap:16, height:54, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:11, fontFamily:mono, opacity:0.5, letterSpacing:"0.1em" }}>SCMS</div>
        <div style={{ width:1, height:24, background:"rgba(255,255,255,0.2)" }} />
        <div style={{ fontSize:14, fontWeight:700 }}>Sports Achievement Management</div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }} style={{ background:"#fff", color:C.accent, border:"none", borderRadius:4, padding:"7px 18px", fontFamily:font, fontSize:12, fontWeight:700, cursor:"pointer" }}>
            + Add Record
          </button>
        </div>
      </div>

      <div style={{ padding:"20px 28px", maxWidth:1400, margin:"0 auto" }}>

        {/* Stats Row */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
          <StatBox label="Total Records" value={total}          accent={C.accent} />
          <StatBox label="Gold"          value={gold}           accent={C.gold}   />
          <StatBox label="Silver"        value={silver}         accent={C.silver} />
          <StatBox label="Bronze"        value={bronze}         accent={C.bronze} />
          <StatBox label="External"      value={external}       accent={C.ext}    />
          <StatBox label="Internal"      value={internal}       accent={C.int}    />
          <StatBox label="Total Prize"   value={fmtINR(totalPrize)} accent="#2E7D32" sub="Cash awarded" />
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:16, background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, width:"fit-content", overflow:"hidden" }}>
          {[["all","All Records"],["external","🌍 External"],["internal","🏫 Internal"]].map(([key,lbl]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding:"9px 22px", border:"none", fontFamily:font, fontSize:13, fontWeight:600, cursor:"pointer",
              background: activeTab===key ? C.accent : "transparent",
              color: activeTab===key ? "#fff" : C.textSub,
              borderRight: key !== "internal" ? `1px solid ${C.border}` : "none",
            }}>{lbl}</button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 16px", marginBottom:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, roll no, reg no, event…"
            style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:"7px 12px", fontFamily:font, fontSize:13, color:C.text, outline:"none", minWidth:260 }} />
          {[
            ["Department", DEPTS, filterDept, setFilterDept],
            ["Position", ["All","Gold","Silver","Bronze"], filterPos, setFilterPos],
            ["Level", LEVELS, filterLevel, setFilterLevel],
          ].map(([lbl, opts, val, fn]) => (
            <select key={lbl} value={val} onChange={e => fn(e.target.value)}
              style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:"7px 10px", fontFamily:font, fontSize:13, color:C.text, background:"#FAFBFC", outline:"none" }}>
              {opts.map(o => <option key={o}>{o === "All" ? `All ${lbl}s` : o}</option>)}
            </select>
          ))}
          <span style={{ marginLeft:"auto", fontSize:12, color:C.textMuted, fontFamily:mono }}>{filtered.length} record(s)</span>
        </div>

        {/* Table */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F0F4F8", borderBottom:`2px solid ${C.border}` }}>
                {["#","Student","Roll No / Reg No","Event","Sport","Position","Type","Level","Date","Prize","Media","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSub, fontFamily:font, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={12} style={{ textAlign:"center", padding:40, color:C.textMuted, fontFamily:font, fontSize:13 }}>No records found.</td></tr>
              )}
              {filtered.map((r, idx) => {
                const stu = getStudent(r.student_id);
                return (
                  <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background: idx%2===0 ? "#fff" : "#FAFBFC" }}
                    onMouseEnter={e => e.currentTarget.style.background="#EEF3FA"}
                    onMouseLeave={e => e.currentTarget.style.background = idx%2===0 ? "#fff" : "#FAFBFC"}>
                    <td style={{ padding:"10px 12px", fontSize:11, fontFamily:mono, color:C.textMuted }}>{String(r.id).padStart(4,"0")}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <img src={stu.photo} alt="" style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${C.border}`, flexShrink:0 }} />
                        <div>
                          <button onClick={() => setViewStudent(stu)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontWeight:600, fontSize:13, color:C.accent, fontFamily:font, textAlign:"left" }}>{stu.name}</button>
                          <div style={{ fontSize:10, color:C.textMuted, fontFamily:font }}>{stu.department} · {stu.batch}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ fontSize:11, fontFamily:mono, color:C.text, fontWeight:600 }}>{stu.rollno}</div>
                      <div style={{ fontSize:10, fontFamily:mono, color:C.textMuted }}>{stu.reg_number}</div>
                    </td>
                    <td style={{ padding:"10px 12px", maxWidth:200 }}>
                      <button onClick={() => setViewRecord(r)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", fontFamily:font, fontSize:12, color:C.text, fontWeight:600, lineHeight:1.4 }}>
                        {r.eventname.length > 40 ? r.eventname.slice(0,40)+"…" : r.eventname}
                      </button>
                    </td>
                    <td style={{ padding:"10px 12px", fontSize:12, color:C.textSub, fontFamily:font, whiteSpace:"nowrap" }}>{r.sport||"—"}</td>
                    <td style={{ padding:"10px 12px" }}><MedalPill pos={r.position} /></td>
                    <td style={{ padding:"10px 12px" }}><TypePill type={r.type} /></td>
                    <td style={{ padding:"10px 12px" }}><LevelPill level={r.level} /></td>
                    <td style={{ padding:"10px 12px", fontSize:11, fontFamily:mono, color:C.textSub, whiteSpace:"nowrap" }}>{fmtDate(r.achievementdate)}</td>
                    <td style={{ padding:"10px 12px", fontSize:12, fontFamily:mono, color: r.cashprize>0 ? C.success : C.textMuted, fontWeight:600 }}>{fmtINR(r.cashprize)}</td>
                    <td style={{ padding:"10px 12px" }}>
                      {r.media?.length > 0
                        ? <span style={{ fontSize:11, fontFamily:font, color:C.int, background:C.intBg, border:`1px solid ${C.intBorder}`, borderRadius:3, padding:"2px 7px", fontWeight:600 }}>📎 {r.media.length}</span>
                        : <span style={{ fontSize:11, color:C.textMuted }}>—</span>
                      }
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={() => setViewRecord(r)} style={{ border:`1px solid ${C.border}`, background:"#fff", color:C.textSub, borderRadius:3, padding:"4px 9px", fontFamily:font, fontSize:11, cursor:"pointer", fontWeight:600 }}>View</button>
                        <button onClick={() => setEditRecord(r)} style={{ border:`1px solid ${C.accent}44`, background:C.accentLight, color:C.accent, borderRadius:3, padding:"4px 9px", fontFamily:font, fontSize:11, cursor:"pointer", fontWeight:600 }}>Edit</button>
                        <button onClick={() => handleDelete(r.id)} style={{ border:`1px solid #fca5a5`, background:"#FEF2F2", color:C.danger, borderRadius:3, padding:"4px 9px", fontFamily:font, fontSize:11, cursor:"pointer", fontWeight:600 }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop:12, fontSize:11, color:C.textMuted, fontFamily:mono, textAlign:"right" }}>
          Sports Achievement Management System &nbsp;|&nbsp; Total: {records.length} records &nbsp;|&nbsp; {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
        </div>
      </div>
    </div>
  );
}