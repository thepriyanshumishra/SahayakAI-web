import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:#F7F5F0;color:#1C1C1A}
    button{font-family:'Inter',system-ui,sans-serif}
    textarea,input{font-family:'Inter',system-ui,sans-serif}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:#D8D4CC;border-radius:4px}
    @keyframes wavebar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
    @keyframes ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.5);opacity:0}}
    @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fadeup{animation:fadeup 0.35s ease both}
    .hovcard:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.09)!important;border-color:rgba(27,67,50,0.35)!important}
    .hovcard{transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s}
    .hovrow:hover{background:#F4F2EC!important}
    .hovrow{transition:background 0.15s}
    .btn-primary:hover{background:#154C2E!important}
    .btn-primary{transition:background 0.15s}
  `}</style>
);

/* ─── PALETTE ────────────────────────────────────────────────────────────── */
const C = {
  green:"#1B4332", greenL:"#D8F3DC", greenM:"#40916C",
  saf:"#E8931A", safL:"#FEF3C7", safM:"#D97706",
  terra:"#C0492B", terraL:"#FDECEA",
  sky:"#1967D2", skyL:"#DBEAFE",
  bg:"#F7F5F0", bg2:"#EFEDE6", bg3:"#E5E2D9",
  card:"#FFFFFF", border:"#E2DDD4",
  ink:"#1C1C1A", ink2:"#5C5A54", ink3:"#9C9A94",
  purp:"#7C3AED", purpL:"#EDE9FE",
};

/* ─── REAL DATA ──────────────────────────────────────────────────────────── */
const VOLS = [
  {id:1,name:"Priya Rawat",init:"PR",skills:["First Aid","Health Awareness"],ward:"Ward 5, Gorakhpur",dist:1.2,pts:1890,avail:true,tasks:31,badge:"Community Pillar",streak:28,color:C.green,rank:1},
  {id:2,name:"Suresh Yadav",init:"SY",skills:["Water Testing","Sanitation"],ward:"Bhatpur",dist:2.4,pts:1560,avail:true,tasks:23,badge:"Health Hero",streak:14,color:C.sky,rank:2},
  {id:3,name:"Anjali Mishra",init:"AM",skills:["CHW Trained","Nutrition"],ward:"Ward 12",dist:0.8,pts:1350,avail:false,tasks:22,badge:"Streak Star",streak:21,color:C.saf,rank:3},
  {id:4,name:"Kavita Singh",init:"KS",skills:["Education","Child Welfare"],ward:"Ward 8",dist:1.8,pts:1100,avail:true,tasks:19,badge:"Streak Star",streak:17,color:C.purp,rank:4},
  {id:5,name:"Mohammed Asif",init:"MA",skills:["Food Logistics","Relief Ops"],ward:"Rustampur",dist:2.1,pts:940,avail:false,tasks:15,badge:"Food Champion",streak:9,color:C.terra,rank:5},
  {id:6,name:"Deepa Verma",init:"DV",skills:["Counseling","Mental Health"],ward:"Ward 3",dist:1.4,pts:875,avail:true,tasks:13,badge:"Care Giver",streak:11,color:"#0891B2",rank:6},
  {id:7,name:"Ramesh Gupta",init:"RG",skills:["Lab Testing","Water Quality"],ward:"Civil Lines",dist:3.1,pts:720,avail:true,tasks:11,badge:"First Responder",streak:5,color:"#6B4226",rank:7},
  {id:8,name:"Arun Tiwari",init:"AT",skills:["Shelter","Construction"],ward:"GKP Cantt",dist:4.2,pts:680,avail:true,tasks:9,badge:"Builder",streak:3,color:"#7A5C00",rank:8},
];

const ISSUES = [
  {id:1,title:"Gastro symptom cluster",ward:"Ward 7",cat:"health",urg:87,rpts:14,status:"active",ago:"2h",team:["PR","SY","AM"]},
  {id:2,title:"Contaminated well water",ward:"Bhatpur",cat:"water",urg:72,rpts:9,status:"assigned",ago:"5h",team:["SY","RG"]},
  {id:3,title:"Child malnutrition cases",ward:"Ward 12",cat:"health",urg:79,rpts:8,status:"assigned",ago:"6h",team:["AM","DV"]},
  {id:4,title:"Flooding in low-lying area",ward:"Rustampur",cat:"safety",urg:68,rpts:11,status:"active",ago:"3h",team:[]},
  {id:5,title:"Grain distribution delay",ward:"Ward 3",cat:"food",urg:51,rpts:6,status:"inprogress",ago:"1d",team:["MA"]},
  {id:6,title:"School closed 2 weeks",ward:"Ward 8",cat:"education",urg:43,rpts:4,status:"inprogress",ago:"2d",team:["KS"]},
];

const NGOS = [
  {name:"Sahyogi Foundation",loc:"Gorakhpur",tasks:143,comp:89,vols:48,status:"active"},
  {name:"Jan Seva NGO",loc:"Deoria",tasks:98,comp:76,vols:31,status:"review"},
  {name:"Gram Shakti",loc:"Kushinagar",tasks:61,comp:91,vols:22,status:"active"},
  {name:"Bal Shakti Trust",loc:"Maharajganj",tasks:44,comp:84,vols:17,status:"active"},
  {name:"Nai Disha Foundation",loc:"Gorakhpur",tasks:77,comp:68,vols:29,status:"review"},
];

const PREDS = [
  {zone:"Ward GKP-07",cat:"Health",risk:"high",conf:82,alert:"3× surge in gastro symptoms. Outbreak probability rising.",action:"Deploy health volunteers. Alert PHC Gorakhpur immediately."},
  {zone:"Ward 12",cat:"Food",risk:"medium",conf:74,alert:"Rising ration requests over 14-day trend.",action:"Coordinate with PDS. Pre-position food supply stocks."},
  {zone:"Rustampur",cat:"Safety",risk:"medium",conf:67,alert:"Flood sensor readings above seasonal average.",action:"Prepare evacuation routes. Brief local volunteer team."},
];

const CAT = {
  health:{icon:"🏥",bg:C.terraL,color:C.terra},
  water:{icon:"💧",bg:C.skyL,color:C.sky},
  food:{icon:"🌾",bg:C.safL,color:C.saf},
  education:{icon:"📚",bg:C.purpL,color:C.purp},
  safety:{icon:"⚡",bg:C.greenL,color:C.green},
};

/* ─── TINY COMPONENTS ────────────────────────────────────────────────────── */
const Av = ({init,color=C.green,size=36}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:color+"22",border:`1.5px solid ${color}44`,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    fontFamily:"inherit",fontSize:size*.31,fontWeight:600,color,letterSpacing:"-0.3px"}}>{init}</div>
);

const Pill = ({label,color=C.green}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,
    background:color+"18",color,border:`1px solid ${color}30`,fontSize:11,fontWeight:500}}>{label}</span>
);

const Urg = ({score}) => {
  const color = score>=75?C.terra:score>=50?C.saf:C.green;
  return <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color,
    background:color+"18",borderRadius:8,padding:"2px 10px"}}>{score}</span>;
};

const Stat = ({label,val,color=C.green,sub}) => (
  <div style={{background:C.card,borderRadius:16,padding:"1.1rem 1.25rem",border:`1px solid ${C.border}`,flex:1}}>
    <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,fontWeight:700,color,lineHeight:1,letterSpacing:"-1px"}}>{val}</div>
    <div style={{fontSize:12,color:C.ink3,marginTop:4,fontWeight:500}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:C.ink3,marginTop:2}}>{sub}</div>}
  </div>
);

const CatBadge = ({cat}) => {
  const c = CAT[cat]||CAT.safety;
  return <span style={{background:c.bg,color:c.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:500}}>{c.icon} {cat}</span>;
};

/* ─── SIDEBAR LAYOUT ─────────────────────────────────────────────────────── */
const NAV = [
  {k:"home",icon:"⌂",label:"Home"},
  {k:"admin",icon:"⚙",label:"Admin"},
  {k:"ngo",icon:"🏛",label:"NGO"},
  {k:"volunteer",icon:"🤝",label:"Volunteer"},
  {k:"community",icon:"🎙",label:"Community"},
];

const Layout = ({children,page,nav,title,sub}) => (
  <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
    <aside style={{width:204,background:"#131310",flexShrink:0,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh"}}>
      <div style={{padding:"1.25rem 1.25rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:19,fontWeight:700,color:"#D8F3DC",letterSpacing:"-0.5px"}}>
          Sahayak<span style={{color:C.saf}}>X</span>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginTop:1,letterSpacing:"1px",textTransform:"uppercase"}}>Platform</div>
      </div>
      <nav style={{flex:1,padding:"0.75rem 0.75rem"}}>
        {NAV.map(n=>(
          <button key={n.k} onClick={()=>nav(n.k)} style={{
            width:"100%",padding:"8px 12px",borderRadius:10,border:"none",
            background:page===n.k?"#1B4332":"transparent",
            color:page===n.k?"#D8F3DC":"rgba(255,255,255,0.42)",
            display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,
            fontWeight:page===n.k?600:400,marginBottom:1,transition:"all 0.15s",textAlign:"left"
          }}>
            <span style={{fontSize:15,width:18,textAlign:"center"}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{padding:"1rem 1.25rem",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Av init="AU" color="#D8F3DC" size={28}/>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>Admin User</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.28)"}}>Gorakhpur NGO</div>
          </div>
        </div>
      </div>
    </aside>
    <main style={{flex:1,overflow:"auto",minWidth:0}}>
      <div style={{padding:"1.25rem 2rem",borderBottom:`1px solid ${C.border}`,background:C.card,
        display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:21,fontWeight:700,color:C.ink,letterSpacing:"-0.3px"}}>{title}</div>
          <div style={{fontSize:12,color:C.ink3,marginTop:1}}>{sub}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 0 3px rgba(34,197,94,0.2)"}}></div>
          <span style={{fontSize:11,color:C.ink3}}>Live · Updated just now</span>
        </div>
      </div>
      <div style={{padding:"1.75rem 2rem"}}>{children}</div>
    </main>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════ */
const HomePage = ({nav}) => {
  const [counts,setCounts] = useState({r:0,v:0,n:0,t:0});
  useEffect(()=>{
    const T={r:2341,v:847,n:23,t:184};
    let s=0; const S=60,DUR=1800;
    const id=setInterval(()=>{
      s++; const p=1-Math.pow(1-(s/S),3);
      setCounts({r:Math.round(T.r*p),v:Math.round(T.v*p),n:Math.round(T.n*p),t:Math.round(T.t*p)});
      if(s>=S) clearInterval(id);
    },DUR/S);
    return ()=>clearInterval(id);
  },[]);

  const ROLES=[
    {k:"admin",icon:"⚙",label:"Admin",desc:"Full system overview, NGO monitoring, predictive analytics and global control.",color:C.green,accent:C.greenL},
    {k:"ngo",icon:"🏛",label:"NGO",desc:"Local issue tracking, volunteer management, AI predictions and reports.",color:C.sky,accent:C.skyL},
    {k:"volunteer",icon:"🤝",label:"Volunteer",desc:"Nearby tasks, team assignments, reward badges and impact leaderboard.",color:C.saf,accent:C.safL},
    {k:"community",icon:"🎙",label:"Community",desc:"Report issues in Hindi via voice or text. Track your report status.",color:C.terra,accent:C.terraL},
  ];

  const FLOW=[
    {n:"01",t:"Voice or Form Report",d:"Community reports in Hindi, English or Bhojpuri — voice, text, or OCR photo.",c:C.terra},
    {n:"02",t:"AI Scores & Maps Issue",d:"5-factor urgency engine scores it and pins it live on the district map.",c:C.saf},
    {n:"03",t:"Prediction Engine Fires",d:"Z-score anomaly detection flags rising trends before they become crises.",c:C.sky},
    {n:"04",t:"Volunteers Auto-Matched",d:"Skill × distance × availability algorithm forms the optimal team in seconds.",c:C.green},
    {n:"05",t:"Resolved · Rewards Earned",d:"NGO confirms, volunteer earns points + badge, map pin turns green.",c:C.purp},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif"}}>
      {/* NAV */}
      <nav style={{padding:"0 2.5rem",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",
        borderBottom:`1px solid ${C.border}`,background:C.card,position:"sticky",top:0,zIndex:100}}>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.green,letterSpacing:"-0.5px"}}>
          Sahayak<span style={{color:C.saf}}>X</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["Admin","NGO","Volunteer"].map(r=>(
            <button key={r} onClick={()=>nav(r.toLowerCase())} style={{
              padding:"6px 16px",borderRadius:20,border:`1px solid ${C.border}`,
              background:"transparent",cursor:"pointer",fontSize:13,fontWeight:500,color:C.ink2
            }}>{r}</button>
          ))}
          <button onClick={()=>nav("community")} style={{
            padding:"7px 18px",borderRadius:20,border:"none",background:C.green,
            color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,marginLeft:4
          }}>Report Issue</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{padding:"5.5rem 2.5rem 4rem",maxWidth:880,margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.green+"12",
          border:`1px solid ${C.green}25`,borderRadius:24,padding:"4px 14px",marginBottom:"1.75rem"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.greenM}}></div>
          <span style={{fontSize:12,fontWeight:500,color:C.green}}>Live · Gorakhpur District, Uttar Pradesh</span>
        </div>
        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(2.4rem,5.5vw,4rem)",
          fontWeight:900,color:C.ink,lineHeight:1.1,letterSpacing:"-2px",marginBottom:"1.25rem"}}>
          Turning scattered<br/>community data into{" "}
          <span style={{color:C.green}}>decisive action</span>
        </h1>
        <p style={{fontSize:17,color:C.ink2,maxWidth:520,margin:"0 auto 2.5rem",lineHeight:1.75}}>
          Sahayak X predicts community crises before they escalate, matches volunteers in seconds, and gives rural NGOs a command center that works even offline.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>nav("admin")} className="btn-primary" style={{
            padding:"13px 30px",borderRadius:12,background:C.green,color:"#fff",
            border:"none",fontSize:15,fontWeight:600,cursor:"pointer",letterSpacing:"-0.2px"
          }}>Explore Dashboard →</button>
          <button onClick={()=>nav("community")} style={{
            padding:"13px 30px",borderRadius:12,background:"transparent",color:C.green,
            border:`1.5px solid ${C.green}`,fontSize:15,fontWeight:600,cursor:"pointer"
          }}>Report an Issue</button>
        </div>
      </div>

      {/* STATS BAND */}
      <div style={{background:C.green,padding:"2.5rem"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"2rem"}}>
          {[{l:"Reports (7 days)",v:counts.r},{l:"Active Volunteers",v:counts.v},{l:"NGO Partners",v:counts.n},{l:"Tasks Completed",v:counts.t}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:40,fontWeight:900,color:C.greenL,lineHeight:1,letterSpacing:"-2px"}}>{s.v.toLocaleString()}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",marginTop:6,fontWeight:500}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ROLE CARDS */}
      <div style={{padding:"4.5rem 2.5rem",maxWidth:960,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:32,fontWeight:700,color:C.ink,letterSpacing:"-1px"}}>Choose your workspace</h2>
          <p style={{color:C.ink2,marginTop:8,fontSize:15}}>Each role gets a dedicated dashboard built for their specific workflow.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {ROLES.map(r=>(
            <div key={r.k} onClick={()=>nav(r.k)} className="hovcard" style={{
              background:C.card,border:`1px solid ${C.border}`,borderRadius:20,
              padding:"1.75rem",cursor:"pointer",position:"relative",overflow:"hidden"
            }}>
              <div style={{position:"absolute",top:-24,right:-24,width:88,height:88,borderRadius:"50%",background:r.accent,opacity:0.55}}></div>
              <div style={{fontSize:30,marginBottom:12}}>{r.icon}</div>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,color:C.ink,marginBottom:6,letterSpacing:"-0.3px"}}>{r.label} Dashboard</div>
              <p style={{color:C.ink2,fontSize:14,lineHeight:1.65,marginBottom:14}}>{r.desc}</p>
              <div style={{color:r.color,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6}}>Open dashboard <span>→</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{background:C.bg2,padding:"4rem 2.5rem",borderTop:`1px solid ${C.border}`}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:28,fontWeight:700,color:C.ink,letterSpacing:"-0.5px"}}>From a voice note to resolved</h2>
          </div>
          {FLOW.map((f,i)=>(
            <div key={f.n} style={{display:"flex",gap:18,marginBottom:22,alignItems:"flex-start",
              opacity:1,animation:`fadeup 0.4s ease ${i*0.08}s both`}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,fontWeight:900,
                color:f.c,lineHeight:1,minWidth:54,letterSpacing:"-1px"}}>{f.n}</div>
              <div style={{paddingTop:2}}>
                <div style={{fontWeight:600,fontSize:15,color:C.ink,marginBottom:3}}>{f.t}</div>
                <div style={{fontSize:13,color:C.ink2,lineHeight:1.65}}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{padding:"1.25rem 2.5rem",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card}}>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.green}}>SahayakX</div>
        <div style={{fontSize:12,color:C.ink3}}>Built for GDG Solution Challenge 2026 · Gorakhpur, India</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const AdminPage = ({nav}) => {
  const [filter,setFilter] = useState("all");
  const shown = filter==="all"?ISSUES:ISSUES.filter(i=>i.status===filter);

  const PINS=[
    {x:42,y:38,t:"red",pulse:true,ward:"Ward 7",u:87},
    {x:62,y:25,t:"red",ward:"Ward 2",u:72},
    {x:30,y:55,t:"amber",ward:"Rustampur",u:68},
    {x:72,y:42,t:"amber",ward:"Ward 9",u:51},
    {x:55,y:62,t:"amber",ward:"Ward 12",u:55},
    {x:38,y:74,t:"green",ward:"Ward 5",u:22},
    {x:78,y:30,t:"green",ward:"Civil Lines",u:18},
    {x:68,y:72,t:"green",ward:"Bhatpur",u:30},
  ];

  return (
    <Layout page="admin" nav={nav} title="Admin Dashboard" sub="Global system overview · Gorakhpur District">
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <Stat label="Urgent Issues" val="14" color={C.terra} sub="↑ 3 from yesterday"/>
        <Stat label="Active Volunteers" val="847" color={C.green} sub="124 available now"/>
        <Stat label="Reports (7 days)" val="2,341" color={C.sky} sub="↑ 18% vs last week"/>
        <Stat label="NGO Partners" val="23" color={C.saf} sub="5 pending review"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1.15fr",gap:16,marginBottom:18}}>
        {/* Predictions */}
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink,marginBottom:12}}>AI Predictions</div>
          {PREDS.map((p,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${p.risk==="high"?C.terra+"40":C.saf+"40"}`,
              borderLeft:`3px solid ${p.risk==="high"?C.terra:C.saf}`,
              borderRadius:12,padding:"0.875rem 1rem",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13,color:C.ink}}>{p.zone} · {p.cat}</span>
                <Pill label={`${p.conf}% conf.`} color={p.risk==="high"?C.terra:C.saf}/>
              </div>
              <div style={{fontSize:12,color:C.ink2,marginBottom:4}}>{p.alert}</div>
              <div style={{fontSize:11,color:C.green,fontWeight:500}}>→ {p.action}</div>
            </div>
          ))}
          {/* Category breakdown */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"1rem",marginTop:4}}>
            <div style={{fontWeight:600,fontSize:13,color:C.ink,marginBottom:10}}>Issue Categories · 7 days</div>
            {[["Health","#C0492B",72],["Water","#1967D2",58],["Food","#E8931A",44],["Education","#7C3AED",31],["Safety","#1B4332",18]].map(([l,c,pct])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{fontSize:12,color:C.ink2,width:68}}>{l}</div>
                <div style={{flex:1,height:6,background:C.bg3,borderRadius:3}}>
                  <div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.6s ease"}}></div>
                </div>
                <div style={{fontSize:12,fontWeight:500,width:30,textAlign:"right",color:C.ink}}>{pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink,marginBottom:12}}>Live Need Map · Gorakhpur</div>
          <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:"1rem"}}>
            <svg width="100%" viewBox="0 0 100 92" style={{display:"block",borderRadius:10,overflow:"hidden"}}>
              <defs>
                <pattern id="gr" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M6 0L0 0 0 6" fill="none" stroke={C.bg3} strokeWidth="0.25"/>
                </pattern>
              </defs>
              <rect width="100" height="92" fill={C.bg2}/>
              <rect width="100" height="92" fill="url(#gr)"/>
              <path d="M0 46 Q25 44 50 46 Q75 48 100 46" stroke={C.bg3} strokeWidth="1.5" fill="none"/>
              <path d="M50 0 Q48 30 50 46 Q52 65 50 92" stroke={C.bg3} strokeWidth="1.5" fill="none"/>
              <path d="M12 22 Q38 26 58 23 Q78 20 96 26" stroke={C.bg3} strokeWidth="0.7" fill="none"/>
              <path d="M8 72 Q32 70 52 72 Q75 74 92 70" stroke={C.bg3} strokeWidth="0.7" fill="none"/>
              <text x="50" y="47" textAnchor="middle" fontSize="3.5" fill={C.ink3} fontFamily="inherit">Gorakhpur</text>
              {PINS.map((p,i)=>(
                <g key={i}>
                  {p.pulse&&<circle cx={p.x} cy={p.y} r="3.5" fill="none" stroke={C.terra} strokeWidth="0.6" opacity="0.4">
                    <animate attributeName="r" from="3.5" to="8" dur="1.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite"/>
                  </circle>}
                  <circle cx={p.x} cy={p.y} r="2.2"
                    fill={p.t==="red"?C.terra:p.t==="amber"?C.saf:C.greenM}
                    stroke="#fff" strokeWidth="0.8"/>
                </g>
              ))}
            </svg>
            <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:10}}>
              {[[C.terra,"Urgent (>70)"],[C.saf,"Moderate"],[C.greenM,"Resolved"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.ink2}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:c}}></div>{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issues table */}
      <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,marginBottom:18}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink}}>Active Issues</div>
          <div style={{display:"flex",gap:5}}>
            {["all","active","assigned","inprogress"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:"4px 12px",borderRadius:20,border:`1px solid ${C.border}`,
                background:filter===f?C.green:"transparent",color:filter===f?"#fff":C.ink2,
                fontSize:11,cursor:"pointer",fontWeight:500
              }}>{f==="inprogress"?"In Progress":f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>
        {shown.map((iss,i)=>{
          const c=CAT[iss.cat]||CAT.safety;
          return(
            <div key={iss.id} className="hovrow" style={{padding:"0.8rem 1.5rem",borderBottom:i<shown.length-1?`1px solid ${C.bg2}`:undefined,
              display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:34,height:34,borderRadius:9,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:C.ink}}>{iss.title}</div>
                <div style={{fontSize:11,color:C.ink3,marginTop:2}}>{iss.ward} · {iss.rpts} reports · {iss.ago} ago</div>
              </div>
              <div style={{display:"flex"}}>
                {iss.team.map((init,idx)=>{
                  const v=VOLS.find(x=>x.init===init);
                  return v?<div key={idx} style={{marginLeft:idx>0?-6:0,zIndex:3-idx}}><Av init={v.init} color={v.color} size={22}/></div>:null;
                })}
              </div>
              <Urg score={iss.urg}/>
              <div style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,
                background:iss.status==="active"?C.terraL:iss.status==="assigned"?C.safL:C.greenL,
                color:iss.status==="active"?C.terra:iss.status==="assigned"?C.safM:C.green}}>
                {iss.status==="inprogress"?"In Progress":iss.status.charAt(0).toUpperCase()+iss.status.slice(1)}
              </div>
            </div>
          );
        })}
      </div>

      {/* NGOs */}
      <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink}}>NGO Performance</div>
        </div>
        {NGOS.map((n,i)=>(
          <div key={i} className="hovrow" style={{padding:"0.8rem 1.5rem",borderBottom:i<NGOS.length-1?`1px solid ${C.bg2}`:undefined,
            display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,borderRadius:9,background:C.green+"18",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,fontWeight:700,color:C.green,flexShrink:0}}>{n.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13,color:C.ink}}>{n.name}</div>
              <div style={{fontSize:11,color:C.ink3,marginTop:1}}>{n.loc} · {n.vols} volunteers</div>
            </div>
            <div style={{textAlign:"center",minWidth:56}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.green}}>{n.comp}%</div>
              <div style={{fontSize:10,color:C.ink3}}>completion</div>
            </div>
            <div style={{textAlign:"center",minWidth:44}}>
              <div style={{fontWeight:600,fontSize:14,color:C.ink}}>{n.tasks}</div>
              <div style={{fontSize:10,color:C.ink3}}>tasks</div>
            </div>
            <Pill label={n.status==="active"?"Active":"Review"} color={n.status==="active"?C.green:C.saf}/>
          </div>
        ))}
      </div>
    </Layout>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   NGO DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const NGOPage = ({nav}) => {
  const [sel,setSel] = useState(null);
  return (
    <Layout page="ngo" nav={nav} title="NGO Dashboard" sub="Sahyogi Foundation · Gorakhpur District">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <Stat label="Open Urgent" val="6" color={C.terra}/>
        <Stat label="My Volunteers" val="124" color={C.green} sub="38 available"/>
        <Stat label="Active Tasks" val="18" color={C.saf}/>
        <Stat label="AI Predictions" val="3" color={C.sky} sub="2 need action"/>
      </div>

      {PREDS.map((p,i)=>(
        <div key={i} style={{background:p.risk==="high"?C.terraL:C.safL,
          border:`1px solid ${p.risk==="high"?C.terra+"40":C.saf+"40"}`,
          borderLeft:`3px solid ${p.risk==="high"?C.terra:C.saf}`,
          borderRadius:12,padding:"0.875rem 1rem",marginBottom:9,display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:p.risk==="high"?C.terra:C.saf,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",flexShrink:0}}>⚠</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:13,color:C.ink}}>AI Prediction · {p.zone}</div>
            <div style={{fontSize:12,color:C.ink2,marginTop:2}}>{p.alert}</div>
            <div style={{fontSize:11,color:p.risk==="high"?C.terra:C.safM,marginTop:4,fontWeight:500}}>→ {p.action}</div>
          </div>
          <Pill label={`${p.conf}%`} color={p.risk==="high"?C.terra:C.saf}/>
        </div>
      ))}

      <div style={{display:"grid",gridTemplateColumns:"1.15fr 1fr",gap:16,marginTop:4}}>
        {/* Issues */}
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink,marginBottom:12}}>Active Issues <span style={{fontSize:12,color:C.ink3,fontFamily:"inherit",fontWeight:400}}>— click to expand</span></div>
          <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
            {ISSUES.map((iss,i)=>{
              const c=CAT[iss.cat]||CAT.safety;
              const open=sel===iss.id;
              return(
                <div key={iss.id} onClick={()=>setSel(open?null:iss.id)} className="hovrow" style={{
                  padding:"0.875rem 1.25rem",borderBottom:i<ISSUES.length-1?`1px solid ${C.bg2}`:undefined,
                  cursor:"pointer",background:open?C.greenL+"55":"transparent",transition:"background 0.15s"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{c.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:12,color:C.ink}}>{iss.title}</div>
                      <div style={{fontSize:11,color:C.ink3,marginTop:2}}>{iss.ward} · {iss.rpts} reports · {iss.ago} ago</div>
                    </div>
                    <Urg score={iss.urg}/>
                  </div>
                  {open&&(
                    <div style={{marginTop:10,padding:"10px",background:C.card,borderRadius:10,border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:6}}>Assigned Team</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {iss.team.length>0?iss.team.map(init=>{
                          const v=VOLS.find(x=>x.init===init);
                          return v?<div key={init} style={{display:"flex",alignItems:"center",gap:5,background:C.bg,borderRadius:8,padding:"4px 10px",border:`1px solid ${C.border}`}}>
                            <Av init={v.init} color={v.color} size={20}/><span style={{fontSize:11,fontWeight:500}}>{v.name.split(" ")[0]}</span>
                          </div>:null;
                        }):<span style={{fontSize:11,color:C.ink3}}>No team assigned yet</span>}
                      </div>
                      {iss.team.length===0&&<button style={{marginTop:8,padding:"6px 14px",borderRadius:8,background:C.green,color:"#fff",border:"none",fontSize:12,cursor:"pointer",fontWeight:500}}>Auto-Match Volunteers →</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Volunteers */}
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink,marginBottom:12}}>Volunteer Pool</div>
          {VOLS.map(v=>(
            <div key={v.id} style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,
              padding:"0.75rem",marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
              <Av init={v.init} color={v.color} size={38}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:C.ink}}>{v.name}</div>
                <div style={{fontSize:10,color:C.ink3,marginTop:1}}>{v.skills.join(" · ")}</div>
                <div style={{fontSize:10,color:C.ink2,marginTop:2}}>📍 {v.ward} · {v.dist}km</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:700,color:C.saf}}>{v.pts.toLocaleString()}</div>
                <div style={{fontSize:9,color:C.ink3}}>pts</div>
                <div style={{marginTop:4,padding:"2px 8px",borderRadius:10,fontSize:10,
                  background:v.avail?C.greenL:C.bg3,color:v.avail?C.green:C.ink3,fontWeight:500}}>
                  {v.avail?"Available":"Busy"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   VOLUNTEER DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const VolPage = ({nav}) => {
  const me=VOLS[0]; // Priya Rawat as logged-in volunteer
  const [tab,setTab]=useState("tasks");
  const sorted=[...VOLS].sort((a,b)=>b.pts-a.pts);

  const BADGES=[
    {icon:"🏅",name:"Health Hero",desc:"5+ health tasks completed",earned:true},
    {icon:"⭐",name:"Streak Star",desc:"30-day activity streak",earned:true},
    {icon:"🌧",name:"Rain Warrior",desc:"3+ tasks during monsoon",earned:true},
    {icon:"🏆",name:"Community Pillar",desc:"1000+ points earned",earned:true},
    {icon:"⚡",name:"First Responder",desc:"Accept urgent task < 10min",earned:false},
    {icon:"🎓",name:"Mentor",desc:"Train 3 new volunteers",earned:false},
  ];

  const MYTASKS=[
    {id:1,title:"Health Response · Ward 7",cat:"health",urg:87,dist:1.8,desc:"Gastro symptom cluster. Distribute ORS, report severe cases to PHC.",pts:150,team:["PR","SY"],dl:"Today 4pm"},
    {id:2,title:"Water quality check · Bhatpur",cat:"water",urg:72,dist:2.4,desc:"Test well water for contamination. Test kit provided by NGO office.",pts:100,team:["SY"],dl:"Tomorrow 10am"},
    {id:3,title:"School reopen logistics · Ward 8",cat:"education",urg:43,dist:3.2,desc:"Assist with logistics for school reopening. Liaise with block office.",pts:75,team:[],dl:"This week"},
  ];

  return (
    <Layout page="volunteer" nav={nav} title="Volunteer Dashboard" sub={`Welcome back, ${me.name.split(" ")[0]} 👋`}>
      {/* Profile hero */}
      <div style={{background:"linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)",borderRadius:20,
        padding:"1.5rem 1.75rem",marginBottom:18,display:"flex",alignItems:"center",gap:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}></div>
        <Av init={me.init} color={C.greenL} size={58}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.greenL,letterSpacing:"-0.3px"}}>{me.name}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",marginTop:2}}>{me.skills.join(" · ")} · {me.ward}</div>
          <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}}>
            {BADGES.filter(b=>b.earned).map(b=>(
              <div key={b.name} style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"3px 10px",fontSize:11,color:"rgba(255,255,255,0.8)"}}>
                {b.icon} {b.name}
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:46,fontWeight:900,color:C.saf,lineHeight:1,letterSpacing:"-2px"}}>{me.pts.toLocaleString()}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:2}}>total points</div>
          <div style={{fontSize:12,color:C.greenL,marginTop:5,fontWeight:500}}>🔥 {me.streak}-day streak</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        <Stat label="Tasks Completed" val={me.tasks} color={C.green}/>
        <Stat label="This Week Rank" val="#1" color={C.saf} sub="District leaderboard"/>
        <Stat label="Badges Earned" val="4/6" color={C.purp} sub="2 more to unlock"/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {[["tasks","Nearby Tasks"],["team","My Team"],["badges","Badges"],["leaderboard","Leaderboard"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"7px 18px",borderRadius:20,border:`1px solid ${C.border}`,
            background:tab===k?C.green:"transparent",color:tab===k?"#fff":C.ink2,
            fontSize:13,fontWeight:500,cursor:"pointer"
          }}>{l}</button>
        ))}
      </div>

      {tab==="tasks"&&(
        <div>
          {MYTASKS.map(t=>{
            const c=CAT[t.cat]||CAT.safety;
            return(
              <div key={t.id} className="hovcard" style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,
                padding:"1.25rem",marginBottom:12,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink,letterSpacing:"-0.3px"}}>{t.title}</div>
                  <Urg score={t.urg}/>
                </div>
                <div style={{display:"flex",gap:10,fontSize:12,color:C.ink2,marginBottom:10,flexWrap:"wrap"}}>
                  <CatBadge cat={t.cat}/>
                  <span>📍 {t.dist}km away</span>
                  <span>🕐 {t.dl}</span>
                </div>
                <div style={{fontSize:13,color:C.ink2,marginBottom:14,lineHeight:1.65}}>{t.desc}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",gap:-4}}>
                    {t.team.map((init,idx)=>{
                      const v=VOLS.find(x=>x.init===init);
                      return v?<div key={init} style={{marginLeft:idx>0?-4:0}}><Av init={v.init} color={v.color} size={26}/></div>:null;
                    })}
                    {t.team.length===0&&<span style={{fontSize:12,color:C.ink3}}>No team yet — be first!</span>}
                  </div>
                  <button className="btn-primary" style={{padding:"8px 20px",borderRadius:10,background:C.green,color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    Accept · +{t.pts} pts →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="badges"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {BADGES.map(b=>(
            <div key={b.name} style={{background:b.earned?C.card:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,
              padding:"1.25rem",textAlign:"center",opacity:b.earned?1:0.6}}>
              <div style={{fontSize:34,marginBottom:8,filter:b.earned?"none":"grayscale(1)"}}>{b.icon}</div>
              <div style={{fontWeight:700,fontSize:13,color:C.ink,marginBottom:4}}>{b.name}</div>
              <div style={{fontSize:11,color:C.ink2,lineHeight:1.55}}>{b.desc}</div>
              <div style={{marginTop:8,fontSize:11,color:b.earned?C.green:C.ink3,fontWeight:b.earned?600:400}}>
                {b.earned?"✓ Earned":"Locked"}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="leaderboard"&&(
        <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
          {sorted.map((v,i)=>(
            <div key={v.id} className="hovrow" style={{padding:"0.875rem 1.25rem",
              borderBottom:i<sorted.length-1?`1px solid ${C.bg2}`:undefined,
              display:"flex",alignItems:"center",gap:12,
              background:v.id===me.id?C.greenL+"44":"transparent"}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,width:28,textAlign:"center",
                color:i===0?"#C9A227":i===1?"#8E8E93":i===2?"#A05C34":C.ink3}}>{i+1}</div>
              <Av init={v.init} color={v.color} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:C.ink}}>{v.name}{v.id===me.id&&<span style={{fontSize:10,color:C.green,marginLeft:6}}>(you)</span>}</div>
                <div style={{fontSize:11,color:C.ink3,marginTop:1}}>🏅 {v.badge} · {v.tasks} tasks · 🔥{v.streak}d</div>
              </div>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.saf}}>{v.pts.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="team"&&(
        <div>
          <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:"1.25rem",marginBottom:12}}>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:C.ink,marginBottom:10}}>Current Assignment</div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <CatBadge cat="health"/>
              <span style={{fontSize:12,color:C.ink2}}>Urgency 87 · Ward 7, Gorakhpur · Due: Today 4pm</span>
            </div>
            <div style={{fontSize:13,color:C.ink2,lineHeight:1.65,marginBottom:16}}>
              Gastro symptom cluster. Distribute ORS packets. Refer severe cases to PHC Gorakhpur. Report patient count to NGO coordinator by 5pm.
            </div>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:700,color:C.ink,marginBottom:10}}>Team Members</div>
            {["PR","SY","AM"].map(init=>{
              const v=VOLS.find(x=>x.init===init);
              return v?(
                <div key={init} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <Av init={v.init} color={v.color} size={38}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{v.name}{v.id===me.id&&" (you)"}</div>
                    <div style={{fontSize:11,color:C.ink3}}>{v.skills.join(" · ")} · {v.ward}</div>
                  </div>
                  <Pill label={v.avail?"En Route":"Busy"} color={v.avail?C.green:C.saf}/>
                </div>
              ):null;
            })}
          </div>
        </div>
      )}
    </Layout>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   COMMUNITY PAGE
══════════════════════════════════════════════════════════════════════════ */
const CommPage = ({nav}) => {
  const [recording,setRecording]=useState(false);
  const [done,setDone]=useState(false);
  const [selCat,setSelCat]=useState(null);
  const [recT,setRecT]=useState(0);
  const [text,setText]=useState("");
  const timer=useRef(null);
  const [bars]=useState(()=>Array.from({length:11},(_,i)=>(0.3+Math.random()*0.7)));

  const toggleMic=()=>{
    if(!recording){
      setRecording(true); setRecT(0);
      timer.current=setInterval(()=>setRecT(t=>t+1),1000);
      setTimeout(()=>{setRecording(false);clearInterval(timer.current);setDone(true);},4000);
    } else {
      setRecording(false); clearInterval(timer.current);
    }
  };

  const handleSubmit=()=>{
    if(selCat||(text.trim().length>3)) setDone(true);
  };

  const CATS=[
    {k:"health",icon:"🏥",hi:"स्वास्थ्य",en:"Health",color:C.terra,bg:C.terraL},
    {k:"water",icon:"💧",hi:"पानी",en:"Water",color:C.sky,bg:C.skyL},
    {k:"food",icon:"🌾",hi:"खाना",en:"Food",color:C.saf,bg:C.safL},
    {k:"safety",icon:"⚡",hi:"सुरक्षा",en:"Safety",color:C.purp,bg:C.purpL},
    {k:"education",icon:"📚",hi:"शिक्षा",en:"Education",color:C.green,bg:C.greenL},
    {k:"other",icon:"➕",hi:"अन्य",en:"Other",color:C.ink2,bg:C.bg2},
  ];

  const MYREPORTS=[
    {title:"Dirty water in tap",ward:"Ward 5",ago:"3 days ago",status:"inprogress"},
    {title:"School closed for 2 weeks",ward:"Ward 8",ago:"8 days ago",status:"resolved"},
    {title:"Food ration not received",ward:"Ward 5",ago:"12 days ago",status:"resolved"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <nav style={{padding:"0 1.5rem",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.green}}>
        <button onClick={()=>nav("home")} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.65)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,color:C.greenL}}>Sahayak<span style={{color:C.saf}}>X</span></div>
        <div style={{width:44}}></div>
      </nav>

      <div style={{maxWidth:460,margin:"0 auto",padding:"1.5rem 1rem 3rem"}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem",paddingTop:"0.5rem"}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:28,fontWeight:700,color:C.ink,lineHeight:1.2,letterSpacing:"-0.5px"}}>समस्या बताएं</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,color:C.ink2,marginTop:2}}>Report an Issue</div>
          <div style={{fontSize:12,color:C.ink3,marginTop:6}}>आपकी आवाज़ मायने रखती है · Your voice matters</div>
        </div>

        {/* Category grid */}
        <div style={{marginBottom:"1.25rem"}}>
          <div style={{fontSize:11,fontWeight:600,color:C.ink3,marginBottom:10,textTransform:"uppercase",letterSpacing:"1px"}}>Category · श्रेणी चुनें</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {CATS.map(c=>(
              <div key={c.k} onClick={()=>setSelCat(selCat===c.k?null:c.k)} style={{
                background:selCat===c.k?c.bg:C.card,
                border:`1.5px solid ${selCat===c.k?c.color:C.border}`,
                borderRadius:14,padding:"0.875rem 0.5rem",textAlign:"center",
                cursor:"pointer",transition:"all 0.15s"
              }}>
                <div style={{fontSize:24,marginBottom:5}}>{c.icon}</div>
                <div style={{fontWeight:600,fontSize:12,color:C.ink}}>{c.hi}</div>
                <div style={{fontSize:10,color:C.ink3}}>{c.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice + text report */}
        <div style={{background:C.card,borderRadius:20,border:`1px solid ${C.border}`,padding:"1.5rem",marginBottom:"1.25rem",textAlign:"center"}}>
          {done?(
            <div className="fadeup">
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,color:C.green,marginBottom:4}}>रिपोर्ट दर्ज हो गई!</div>
              <div style={{fontSize:14,color:C.ink2,marginBottom:14}}>Report submitted successfully</div>
              <div style={{background:C.greenL,borderRadius:12,padding:"0.875rem",fontSize:12,color:C.green,lineHeight:1.6,marginBottom:14}}>
                आपकी रिपोर्ट समीक्षा में है।<br/>स्वयंसेवक जल्द ही संपर्क करेंगे।<br/>
                <span style={{color:C.ink2}}>Your report is under review. Volunteers will be deployed soon.</span>
              </div>
              <button onClick={()=>{setDone(false);setSelCat(null);setText("");}} style={{
                padding:"8px 22px",borderRadius:10,background:C.green,color:"#fff",
                border:"none",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:500
              }}>Report Another Issue</button>
            </div>
          ):(
            <>
              <div style={{fontSize:12,fontWeight:600,color:C.ink3,marginBottom:16,textTransform:"uppercase",letterSpacing:"1px"}}>
                {recording?"Recording · रिकॉर्डिंग हो रही है":"Tap mic to speak · बोलने के लिए टैप करें"}
              </div>

              {recording&&(
                <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:12,height:32,alignItems:"center"}}>
                  {bars.map((h,i)=>(
                    <div key={i} style={{width:4,borderRadius:2,background:C.terra,transformOrigin:"center bottom",
                      animation:`wavebar ${0.5+i*0.08}s ease-in-out infinite alternate`,
                      animationDelay:`${i*0.05}s`,height:`${h*28+4}px`}}></div>
                  ))}
                </div>
              )}

              <button onClick={toggleMic} style={{
                width:72,height:72,borderRadius:"50%",
                background:recording?C.terra:C.green,border:"none",
                fontSize:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 10px",
                boxShadow:recording?`0 0 0 10px ${C.terra}22`:`0 0 0 8px ${C.green}15`,
                transition:"all 0.2s",color:"#fff"
              }}>{recording?"⏹":"🎙"}</button>

              {recording&&<div style={{fontSize:12,color:C.terra,fontWeight:500,marginBottom:4}}>{recT}s</div>}
              <div style={{fontSize:11,color:C.ink3,marginTop:6}}>हिंदी, अंग्रेजी और भोजपुरी में बोलें</div>

              <div style={{display:"flex",alignItems:"center",gap:12,margin:"14px 0"}}>
                <div style={{flex:1,height:1,background:C.border}}></div>
                <span style={{fontSize:11,color:C.ink3}}>या टाइप करें · or type</span>
                <div style={{flex:1,height:1,background:C.border}}></div>
              </div>

              <textarea value={text} onChange={e=>setText(e.target.value)}
                placeholder="समस्या यहाँ लिखें · Type your issue here..."
                style={{width:"100%",minHeight:75,borderRadius:12,border:`1px solid ${C.border}`,
                  padding:"10px 12px",fontSize:13,color:C.ink,resize:"none",outline:"none",
                  background:C.bg,lineHeight:1.6}}/>

              <button onClick={handleSubmit} style={{
                marginTop:12,width:"100%",padding:"12px",borderRadius:12,
                background:(selCat||(text.trim().length>3))?C.green:C.bg3,
                color:(selCat||(text.trim().length>3))?"#fff":C.ink3,
                border:"none",fontSize:14,fontWeight:600,
                cursor:(selCat||(text.trim().length>3))?"pointer":"not-allowed",fontFamily:"inherit"
              }}>
                {(selCat||(text.trim().length>3))?"Submit Report · रिपोर्ट भेजें →":"Select a category or write your issue"}
              </button>
            </>
          )}
        </div>

        {/* My Reports */}
        <div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.ink,marginBottom:12}}>मेरी रिपोर्ट · My Reports</div>
          {MYREPORTS.map((r,i)=>(
            <div key={i} style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,
              padding:"0.875rem 1rem",marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:10,
                background:r.status==="resolved"?C.greenL:C.safL,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                {r.status==="resolved"?"✅":"⏳"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:C.ink}}>{r.title}</div>
                <div style={{fontSize:11,color:C.ink3,marginTop:2}}>{r.ward} · {r.ago}</div>
              </div>
              <Pill label={r.status==="resolved"?"Resolved":"In Progress"} color={r.status==="resolved"?C.green:C.saf}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page,setPage]=useState("home");
  const PAGES={home:HomePage,admin:AdminPage,ngo:NGOPage,volunteer:VolPage,community:CommPage};
  const Page=PAGES[page]||HomePage;
  return (
    <>
      <G/>
      <div className="fadeup" key={page}><Page nav={setPage}/></div>
    </>
  );
}