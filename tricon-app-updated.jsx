import { useState, useEffect, useRef } from "react";

const KEYS = { sessions:"tricon_sessions", lastWeights:"tricon_last_weights", unit:"tricon_unit", weekIdx:"tricon_week_idx", pushupMax:"tricon_pushup_max", kbWeight:"tricon_kb_weight" };
function load(key,fallback){try{const v=localStorage.getItem(key);return v!==null?JSON.parse(v):fallback;}catch{return fallback;}}
function save(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}

let _actx=null;
function getCtx(){if(!_actx)_actx=new(window.AudioContext||window.webkitAudioContext)();return _actx;}
function beep(freq,dur,vol=0.32,type="sine"){const ctx=getCtx();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);o.start();o.stop(ctx.currentTime+dur);}
const beepAt30=()=>beep(900,0.18,0.34);
const beepTick=()=>{beep(1300,0.07,0.38,"square");setTimeout(()=>beep(1300,0.07,0.28,"square"),110);};
const beepDone=()=>{beep(660,0.13);setTimeout(()=>beep(880,0.13),170);setTimeout(()=>beep(1100,0.22),340);};
const beepRound=()=>{beep(440,0.1);setTimeout(()=>beep(550,0.1),130);setTimeout(()=>beep(660,0.1),260);setTimeout(()=>beep(880,0.28),390);};

const C={bg:"#0a0c0f",surface:"#111318",card:"#161b22",border:"#1e2530",accent:"#c8a96e",dim:"#8a6f3e",red:"#e05252",green:"#4caf7d",blue:"#4a90d9",orange:"#e8883a",purple:"#9b6fd4",muted:"#6b7280",text:"#e8e2d6",sub:"#9ca3af"};

const WORKOUT_DEFS={
  upper:{id:"upper",name:"Upper Body",label:"UPPER BODY",dayName:"Monday",dayIndex:1,calIndex:0,color:C.accent,method:"TRICON 3·3·3",duration:"60 min",useTricon:true,exercises:[
    {id:"chest_press",name:"Chest Press",muscle:"Chest",equipment:"Machine/DB",injury:"Reduce ROM if shoulder discomfort"},
    {id:"seated_row",name:"Seated Cable Row",muscle:"Back",equipment:"Cable",injury:null},
    {id:"shoulder_press",name:"Shoulder Press",muscle:"Shoulders",equipment:"Machine",injury:"Use machine — reduces shoulder load"},
    {id:"lat_pulldown",name:"Lat Pulldown",muscle:"Back",equipment:"Cable",injury:null},
    {id:"bicep_curl",name:"Bicep Curl",muscle:"Biceps",equipment:"Cable/DB",injury:null},
    {id:"tricep_pushdown",name:"Tricep Pushdown",muscle:"Triceps",equipment:"Cable",injury:null},
  ]},
  lower:{id:"lower",name:"Lower Body",label:"LOWER BODY",dayName:"Wednesday",dayIndex:3,calIndex:2,color:C.blue,method:"TRICON 3·3·3",duration:"60 min",useTricon:true,exercises:[
    {id:"leg_press",name:"Leg Press",muscle:"Quads/Glutes",equipment:"Machine",injury:"Avoid full lockout if knee issues"},
    {id:"rdl",name:"Romanian Deadlift",muscle:"Hamstrings",equipment:"Dumbbells",injury:"Monitor achilles — light calf load"},
    {id:"leg_curl",name:"Leg Curl",muscle:"Hamstrings",equipment:"Machine",injury:null},
    {id:"leg_extension",name:"Leg Extension",muscle:"Quads",equipment:"Machine",injury:"Reduce ROM if knee discomfort"},
    {id:"calf_raise",name:"Standing Calf Raise",muscle:"Calves",equipment:"Machine",injury:"Reduce range if lower leg injury"},
    {id:"plank",name:"Plank Hold",muscle:"Core",equipment:"Bodyweight",injury:null},
  ]},
  circuit:{
    id:"circuit",name:"Kettlebell Flow",label:"KETTLEBELL FLOW",dayName:"Friday",color:C.green,
    method:"Trevor's Instinct · 3 Rounds For Time",duration:"~20–30 min",
    useTricon:false,isForTime:true,rounds:3,equipment:"One Kettlebell",
    sourceVideo:"https://www.youtube.com/shorts/LP17xxZ1iRs",
    exercises:[
      {id:"helicopter_ccw",name:"Helicopters (CCW)",muscle:"Shoulders / Rotator Cuff / Core",equipment:"Kettlebell",injury:"Keep core braced — avoid if acute shoulder impingement",reps:10,note:"Wide arc overhead counter-clockwise · hips drive the rotation · stay tall"},
      {id:"helicopter_cw",name:"Helicopters (CW)",muscle:"Shoulders / Rotator Cuff / Core",equipment:"Kettlebell",injury:"Keep core braced — avoid if acute shoulder impingement",reps:10,note:"Reverse direction · equal reps each side · control the descent"},
      {id:"halo_ccw",name:"Halos (CCW)",muscle:"Shoulders / Upper Back / Core",equipment:"Kettlebell",injury:"Reduce weight if neck or shoulder tension present",reps:10,note:"Hold by horns · circle around head CCW · keep elbows in · slow orbit"},
      {id:"halo_cw",name:"Halos (CW)",muscle:"Shoulders / Upper Back / Core",equipment:"Kettlebell",injury:"Reduce weight if neck or shoulder tension present",reps:10,note:"Reverse direction · shoulders packed down throughout"},
      {id:"pullover",name:"Pullovers",muscle:"Lats / Chest / Core",equipment:"Kettlebell",injury:"Do not hyperextend lower back — brace throughout",reps:10,note:"Lie on back · hold by horns · lower behind head · pull back over chest · ribs down"},
    ],
  },
  amrap:{
    id:"amrap",name:"KB Benchmark",label:"KB BENCHMARK",dayName:"Friday",
    color:C.purple,method:"Trevor's Instinct · AMRAP 30 min",duration:"30 min",
    useTricon:false,isAMRAP:true,amrapMinutes:30,equipment:"One Kettlebell",
    sourceVideo:"https://www.youtube.com/shorts/LP17xxZ1iRs",
    exercises:[
      {id:"amrap_swing",name:"KB Swings",muscle:"Posterior Chain / Hips",equipment:"Kettlebell",injury:"Hip hinge — not a squat. Protect lower back.",reps:10,note:"Hike bell back · explosive hip snap · bell to shoulder height · absorb on the way down"},
      {id:"amrap_press_l",name:"Shoulder Press (Left)",muscle:"Shoulder / Tricep / Core",equipment:"Kettlebell",injury:"Avoid if shoulder pain present",reps:5,note:"Clean to rack · press overhead · lock elbow · lower under control · brace core"},
      {id:"amrap_press_r",name:"Shoulder Press (Right)",muscle:"Shoulder / Tricep / Core",equipment:"Kettlebell",injury:"Avoid if shoulder pain present",reps:5,note:"Same as left · equal reps each side · packed shoulder · press tall"},
      {id:"amrap_squat_r",name:"Single-Arm Squat (Right)",muscle:"Quads / Glutes / Core",equipment:"Kettlebell",injury:"Reduce depth if knee discomfort",reps:5,note:"Bell in rack · sit between heels · chest tall · drive through heel · knee over toe"},
      {id:"amrap_squat_l",name:"Single-Arm Squat (Left)",muscle:"Quads / Glutes / Core",equipment:"Kettlebell",injury:"Reduce depth if knee discomfort",reps:5,note:"Same as right · equal depth both sides · bell locks stability through the squat"},
      {id:"amrap_pushup",name:"Push-Ups (½ Max)",muscle:"Chest / Triceps / Core",equipment:"Bodyweight",injury:null,reps:null,note:"Strict form · chest to floor · full lockout · stop at half max — never grind to failure in AMRAP"},
    ],
  },
};

const FRIDAY_WORKOUTS=["amrap","circuit"];
const SCHEDULE={0:"upper",2:"lower",4:"friday"};
const ALL_EX=[
  ...WORKOUT_DEFS.upper.exercises.map(e=>({...e,cat:"upper"})),
  ...WORKOUT_DEFS.lower.exercises.map(e=>({...e,cat:"lower"})),
  ...WORKOUT_DEFS.circuit.exercises.map(e=>({...e,cat:"circuit"})),
  ...WORKOUT_DEFS.amrap.exercises.map(e=>({...e,cat:"amrap"})),
];
const CAT_COLOR={upper:C.accent,lower:C.blue,circuit:C.green,amrap:C.purple};
const CAT_LABEL={upper:"UPPER BODY",lower:"LOWER BODY",circuit:"KETTLEBELL FLOW",amrap:"KB BENCHMARK"};

const PROG=[
  {week:1,label:"Foundation",sets:3,intensity:"60% max",hold:5,deload:false},
  {week:2,label:"Build",sets:3,intensity:"65% max",hold:5,deload:false},
  {week:3,label:"Strength",sets:3,intensity:"70% max",hold:5,deload:false},
  {week:4,label:"Peak",sets:3,intensity:"75% max",hold:5,deload:false},
  {week:5,label:"Deload",sets:2,intensity:"50% max",hold:5,deload:true},
  {week:6,label:"Build+",sets:4,intensity:"65% max",hold:10,deload:false},
];

const TRICON_PHASES=(hold=5)=>[
  {repRange:"1 TO 3 REPS",name:"EXPLOSIVE REPS",color:C.orange,bg:"rgba(232,136,58,0.1)",steps:[{time:"EXP↑",desc:"Drive up as fast as possible — maximum intent, full control"},{time:"3s↓",desc:"3 second controlled eccentric descent"}],why:"Recruits fast-twitch motor units. Fires the nervous system without joint stress."},
  {repRange:"3 TO 6 REPS",name:"ISOMETRIC HOLDS",color:C.accent,bg:"rgba(200,169,110,0.1)",steps:[{time:"3s↓",desc:"3 second controlled eccentric descent"},{time:`${hold}s⏸`,desc:`${hold}s isometric hold at bottom — squeeze hard, no bounce${hold===10?" (advanced)":""}`}],why:"Builds tendon strength and joint stability. Critical for over-50s injury prevention."},
  {repRange:"6 TO 9 REPS",name:"FULL RANGE OF MOTION",color:C.green,bg:"rgba(76,175,125,0.1)",steps:[{time:"3s↓",desc:"3 second controlled eccentric descent"},{time:"3s↑",desc:"3 second controlled concentric lift — full range of motion"}],why:"Maximises time under tension for hypertrophy through complete ROM."},
];

function getWeekStart(offsetWeeks=0){const n=new Date(),d=n.getDay(),mon=new Date(n);mon.setDate(n.getDate()-(d===0?6:d-1)+offsetWeeks*7);mon.setHours(0,0,0,0);return mon;}
function weekLabel(offsetWeeks=0){const s=getWeekStart(offsetWeeks),e=new Date(s);e.setDate(s.getDate()+6);const f=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});return `${f(s)} – ${f(e)}`;}
function getWeekDates(){const mon=getWeekStart(0);return Array.from({length:7},(_,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);return x;});}
function fmt(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
function getList(type){return WORKOUT_DEFS[type]?.exercises||[];}
function buildExHistory(sessions){
  const map={};
  sessions.forEach(sess=>{
    const list=getList(sess.type);if(!sess.exData)return;
    sess.exData.forEach((ex,i)=>{const exId=list[i]?.id;if(!exId||!ex.weight)return;if(!map[exId])map[exId]=[];map[exId].push({date:sess.date,weight:parseFloat(ex.weight),sets:ex.sets?.length||3});});
  });return map;
}
function weekWeightFromHistory(history,exId,offsetWeeks=0){
  const entries=history[exId];if(!entries?.length)return null;
  const start=getWeekStart(offsetWeeks),end=new Date(start);end.setDate(start.getDate()+7);
  const inWeek=entries.filter(e=>new Date(e.date)>=start&&new Date(e.date)<end);
  if(!inWeek.length)return null;return Math.max(...inWeek.map(e=>e.weight));
}
function weekChangeFromHistory(history,exId){
  const tw=weekWeightFromHistory(history,exId,0),lw=weekWeightFromHistory(history,exId,-1);
  if(tw===null||lw===null||lw===0)return null;return((tw-lw)/lw)*100;
}

const REST_TOTAL=90,BEEP_AT_REMAINING=30;
const DN=["MON","TUE","WED","THU","FRI","SAT","SUN"];
const AMRAP_TOTAL=30*60;

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({title,onBack,right}){
  return(<div style={{display:"flex",alignItems:"center",padding:"14px 18px 10px",borderBottom:`1px solid ${C.border}`,background:C.bg,flexShrink:0}}>
    {onBack&&<button onClick={onBack} style={{background:"none",border:"none",color:C.accent,fontSize:22,cursor:"pointer",padding:"0 12px 0 0",fontFamily:"'Oswald',sans-serif"}}>←</button>}
    <span style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:600,color:C.text,letterSpacing:"0.05em",flex:1}}>{title}</span>
    {right}
  </div>);
}

// ── RestTimer ─────────────────────────────────────────────────────────────────
function RestTimer({exName,setIdx,onDone,onSkip}){
  const[rem,setRem]=useState(REST_TOTAL);const fired=useRef({mid:false});
  useEffect(()=>{
    const iv=setInterval(()=>{
      setRem(r=>{const next=r-1;
        if(next===BEEP_AT_REMAINING&&!fired.current.mid){fired.current.mid=true;beepAt30();}
        if(next<=5&&next>0)beepTick();
        if(next<=0){clearInterval(iv);beepDone();setTimeout(onDone,400);return 0;}
        return next;
      });
    },1000);return()=>clearInterval(iv);
  },[]);
  const R=52,cx=62,cy=62,circ=2*Math.PI*R,isCD=rem<=5,mid30Fired=rem<=BEEP_AT_REMAINING;
  return(<div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:"#0d1117",borderTop:`2px solid ${C.border}`,borderRadius:"20px 20px 0 0",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 22px 20px",boxShadow:"0 -20px 60px rgba(0,0,0,0.8)"}}>
    <div style={{width:38,height:4,background:"#2a3040",borderRadius:2,marginBottom:12,flexShrink:0}}/>
    <div style={{fontSize:10,color:C.muted,letterSpacing:"0.14em",flexShrink:0}}>REST · SET {setIdx+1} COMPLETE</div>
    <div style={{fontSize:12,color:C.accent,margin:"4px 0 10px",flexShrink:0,textAlign:"center"}}>{exName}</div>
    <div style={{position:"relative",flexShrink:0}}>
      <svg width={124} height={124} viewBox="0 0 124 124">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={6}/>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={isCD?C.red:C.accent} strokeWidth={6}
          strokeDasharray={circ.toFixed(1)} strokeDashoffset={(circ*(1-rem/REST_TOTAL)).toFixed(1)}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}}/>
      </svg>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:42,fontWeight:700,color:isCD?C.red:C.text,lineHeight:1}}>{rem}</div>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginTop:1}}>SECONDS</div>
      </div>
    </div>
    <button onClick={onSkip} style={{width:"100%",marginTop:14,background:"rgba(138,111,62,0.18)",border:`1px solid rgba(138,111,62,0.38)`,color:C.accent,borderRadius:10,padding:10,fontSize:13,fontWeight:700,fontFamily:"'Oswald',sans-serif",cursor:"pointer",letterSpacing:"0.08em"}}>SKIP REST →</button>
  </div>);
}

// ── Friday Picker ─────────────────────────────────────────────────────────────
function FridayPicker({onSelect}){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 14px",gap:12,overflowY:"auto"}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Choose your session for today</div>

      {/* AMRAP card */}
      <div onClick={()=>onSelect("amrap")}
        style={{background:`linear-gradient(135deg,${C.purple}18 0%,${C.purple}06 100%)`,border:`1px solid ${C.purple}50`,borderRadius:14,padding:18,cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:C.purple,letterSpacing:"0.16em",fontWeight:700,marginBottom:5}}>TREVOR'S INSTINCT</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:C.text,lineHeight:1}}>KB BENCHMARK</div>
            <div style={{fontSize:11,color:C.muted,marginTop:5}}>AMRAP · 30 minutes · 1 kettlebell</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:32,fontWeight:700,color:C.purple,lineHeight:1}}>30</div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>MINUTES</div>
          </div>
        </div>
        <div style={{fontSize:11,color:C.sub,lineHeight:1.9,marginBottom:12}}>
          <div>· 10× KB Swings</div>
          <div>· 5× Shoulder Press L + 5× R</div>
          <div>· 5× Squat R + 5× L</div>
          <div>· ½ max Push-Ups</div>
        </div>
        <div style={{background:C.purple,borderRadius:8,padding:"10px 0",textAlign:"center",fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:13,color:"#fff",letterSpacing:"0.12em"}}>SELECT →</div>
      </div>

      {/* Flow card */}
      <div onClick={()=>onSelect("circuit")}
        style={{background:`linear-gradient(135deg,${C.green}18 0%,${C.green}06 100%)`,border:`1px solid ${C.green}50`,borderRadius:14,padding:18,cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:C.green,letterSpacing:"0.16em",fontWeight:700,marginBottom:5}}>TREVOR'S INSTINCT</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:C.text,lineHeight:1}}>KETTLEBELL FLOW</div>
            <div style={{fontSize:11,color:C.muted,marginTop:5}}>3 Rounds For Time · 1 kettlebell</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:32,fontWeight:700,color:C.green,lineHeight:1}}>3</div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>ROUNDS</div>
          </div>
        </div>
        <div style={{fontSize:11,color:C.sub,lineHeight:1.9,marginBottom:12}}>
          <div>· 10× Helicopters CCW + CW</div>
          <div>· 10× Halos CCW + CW</div>
          <div>· 10× Pullovers</div>
        </div>
        <div style={{background:C.green,borderRadius:8,padding:"10px 0",textAlign:"center",fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:13,color:"#0a0c0f",letterSpacing:"0.12em"}}>SELECT →</div>
      </div>
    </div>
  );
}

// ── AMRAP Tracker ─────────────────────────────────────────────────────────────
function AmrapTracker({exercises,elapsed,pushupMax,kbWeight,unit,onRoundComplete,roundCount}){
  const halfPushups=Math.max(1,Math.floor(pushupMax/2));
  const resolvedExercises=exercises.map(ex=>({...ex,resolvedReps:ex.id==="amrap_pushup"?halfPushups:ex.reps}));
  const[checkedEx,setCheckedEx]=useState(Array(exercises.length).fill(false));
  const allChecked=checkedEx.every(Boolean);
  const remaining=AMRAP_TOTAL-elapsed;
  const pct=Math.max(0,remaining/AMRAP_TOTAL);
  const isWarning=remaining<=300;
  const isEnd=remaining<=0;
  const R=54,cx=64,cy=64,circ=2*Math.PI*R;

  const toggleEx=(i)=>setCheckedEx(prev=>prev.map((v,idx)=>idx===i?!v:v));
  const handleRoundDone=()=>{if(!allChecked)return;beepRound();setCheckedEx(Array(exercises.length).fill(false));onRoundComplete();};

  return(
    <div style={{margin:"0 14px 12px"}}>
      {/* Countdown ring + stats */}
      <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"stretch"}}>
        <div style={{position:"relative",flexShrink:0}}>
          <svg width={128} height={128} viewBox="0 0 128 128">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={7}/>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={isEnd?C.red:isWarning?C.orange:C.purple} strokeWidth={7}
              strokeDasharray={circ.toFixed(1)} strokeDashoffset={(circ*(1-pct)).toFixed(1)}
              strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
              style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}/>
          </svg>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:isEnd?13:22,fontWeight:700,color:isEnd?C.red:isWarning?C.orange:C.text,lineHeight:1}}>
              {isEnd?"TIME!":fmt(remaining)}
            </div>
            <div style={{fontSize:8,color:C.muted,letterSpacing:"0.08em",marginTop:2}}>LEFT</div>
          </div>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{background:`${C.purple}18`,border:`1px solid ${C.purple}30`,borderRadius:10,padding:"10px 12px",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:36,fontWeight:700,color:C.purple,lineHeight:1}}>{roundCount}</div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginTop:2}}>ROUNDS DONE</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:10,color:C.muted}}>KB</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:C.text}}>{kbWeight||"—"} <span style={{fontSize:10,color:C.muted}}>{unit}</span></div>
          </div>
        </div>
      </div>

      {!isEnd&&(
        <>
          <div style={{background:C.card,border:`1px solid ${C.purple}30`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
            <div style={{padding:"9px 14px",background:`${C.purple}12`,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:C.purple,letterSpacing:"0.1em",fontWeight:700}}>ROUND {roundCount+1}</span>
              <span style={{fontSize:10,color:C.muted}}>{checkedEx.filter(Boolean).length}/{exercises.length} done</span>
            </div>
            {resolvedExercises.map((ex,i)=>{
              const checked=checkedEx[i];
              return(
                <div key={ex.id} onClick={()=>toggleEx(i)}
                  style={{padding:"10px 14px",borderBottom:i<exercises.length-1?`1px solid ${C.border}`:"none",
                    display:"flex",alignItems:"center",gap:10,cursor:"pointer",
                    background:checked?`${C.purple}08`:"transparent",transition:"background 0.15s"}}>
                  <div style={{width:26,height:26,borderRadius:7,flexShrink:0,
                    background:checked?`${C.purple}30`:"#0d1117",border:`1px solid ${checked?C.purple:C.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,color:checked?C.purple:C.muted,transition:"all 0.15s"}}>
                    {checked?"✓":""}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:checked?C.purple:C.text,fontWeight:600,textDecoration:checked?"line-through":"none",transition:"color 0.15s"}}>{ex.name}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                      {ex.id==="amrap_pushup"?`${ex.resolvedReps} reps (½ of ${pushupMax} max)`:ex.id==="amrap_squat_r"||ex.id==="amrap_squat_l"?`${ex.resolvedReps} reps · hold KB in rack`:`${ex.resolvedReps} reps · ${ex.muscle}`}
                    </div>
                  </div>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:checked?C.purple:C.muted}}>×{ex.resolvedReps}</div>
                </div>
              );
            })}
          </div>
          <button onClick={handleRoundDone} disabled={!allChecked}
            style={{width:"100%",background:allChecked?C.purple:"#1a1a2a",
              border:`1px solid ${allChecked?`${C.purple}80`:`${C.purple}20`}`,
              borderRadius:10,padding:13,fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:700,
              color:allChecked?"#fff":C.muted,letterSpacing:"0.1em",
              cursor:allChecked?"pointer":"not-allowed",transition:"all 0.2s"}}>
            {allChecked?`✓ ROUND ${roundCount+1} DONE — LOG IT`:"CHECK ALL EXERCISES FIRST"}
          </button>
        </>
      )}

      {isEnd&&(
        <div style={{background:`${C.purple}12`,border:`1px solid ${C.purple}30`,borderRadius:12,padding:16,textAlign:"center"}}>
          <div style={{fontSize:30,marginBottom:6}}>⏱</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:20,color:C.purple,letterSpacing:"0.06em"}}>TIME'S UP</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:40,fontWeight:700,color:C.text,marginTop:4}}>{roundCount}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>ROUNDS COMPLETED</div>
        </div>
      )}
    </div>
  );
}

// ── Flow Round Tracker ────────────────────────────────────────────────────────
function FlowRoundTracker({exercises,roundTimes,currentRound,onCompleteRound,elapsed}){
  const wk=WORKOUT_DEFS.circuit;
  const[checkedEx,setCheckedEx]=useState(Array(exercises.length).fill(false));
  const allChecked=checkedEx.every(Boolean);
  const toggleEx=(i)=>{if(currentRound>=wk.rounds)return;setCheckedEx(prev=>prev.map((v,idx)=>idx===i?!v:v));};
  const handleRoundDone=()=>{if(!allChecked)return;beepDone();setCheckedEx(Array(exercises.length).fill(false));onCompleteRound(elapsed);};
  return(
    <div style={{margin:"0 14px 12px"}}>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {Array.from({length:wk.rounds},(_,i)=>{
          const done=i<roundTimes.length;const active=i===roundTimes.length&&i<wk.rounds;
          return(<div key={i} style={{flex:1,borderRadius:8,padding:"9px 6px",textAlign:"center",background:done?"rgba(76,175,125,0.15)":active?"rgba(76,175,125,0.08)":C.card,border:`1px solid ${done?"rgba(76,175,125,0.4)":active?"rgba(76,175,125,0.25)":C.border}`,transition:"all 0.2s"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:done?C.green:active?C.text:C.muted,lineHeight:1}}>{done?fmt(roundTimes[i]):`R${i+1}`}</div>
            <div style={{fontSize:8,color:done?C.green:active?C.green:C.muted,letterSpacing:"0.08em",marginTop:3}}>{done?"DONE":active?"ACTIVE":"WAITING"}</div>
          </div>);
        })}
      </div>
      {currentRound<wk.rounds&&(
        <>
          <div style={{background:C.card,border:`1px solid ${C.green}30`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
            <div style={{padding:"9px 14px",background:"rgba(76,175,125,0.08)",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:C.green,letterSpacing:"0.1em",fontWeight:700}}>ROUND {currentRound+1} OF {wk.rounds}</span>
              <span style={{fontSize:10,color:C.muted}}>{checkedEx.filter(Boolean).length}/{exercises.length} done</span>
            </div>
            {exercises.map((ex,i)=>{const checked=checkedEx[i];return(
              <div key={ex.id} onClick={()=>toggleEx(i)} style={{padding:"11px 14px",borderBottom:i<exercises.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:checked?"rgba(76,175,125,0.06)":"transparent",transition:"background 0.15s"}}>
                <div style={{width:26,height:26,borderRadius:7,flexShrink:0,background:checked?"rgba(76,175,125,0.25)":"#0d1117",border:`1px solid ${checked?"rgba(76,175,125,0.5)":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:checked?C.green:C.muted,transition:"all 0.15s"}}>{checked?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:checked?C.green:C.text,fontWeight:600,textDecoration:checked?"line-through":"none",transition:"color 0.15s"}}>{ex.name}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:1}}>{ex.reps} reps · {ex.muscle}</div>
                </div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:checked?C.green:C.muted}}>×{ex.reps}</div>
              </div>
            );})}
          </div>
          <button onClick={handleRoundDone} disabled={!allChecked}
            style={{width:"100%",background:allChecked?C.green:"#1a2a1a",border:`1px solid ${allChecked?"rgba(76,175,125,0.6)":"rgba(76,175,125,0.15)"}`,borderRadius:10,padding:13,fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:700,color:allChecked?"#0a0c0f":C.muted,letterSpacing:"0.1em",cursor:allChecked?"pointer":"not-allowed",transition:"all 0.2s"}}>
            {allChecked?`✓ ROUND ${currentRound+1} COMPLETE — STAMP TIME`:"CHECK ALL EXERCISES TO LOG ROUND"}
          </button>
        </>
      )}
      {currentRound>=wk.rounds&&(
        <div style={{background:"rgba(76,175,125,0.1)",border:"1px solid rgba(76,175,125,0.3)",borderRadius:12,padding:"14px",textAlign:"center"}}>
          <div style={{fontSize:26,marginBottom:6}}>🏆</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:17,color:C.green,letterSpacing:"0.06em"}}>ALL 3 ROUNDS COMPLETE</div>
          <div style={{fontSize:11,color:C.muted,marginTop:6}}>Total time: {fmt(elapsed)}</div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            {roundTimes.map((t,i)=>(<div key={i} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 4px",textAlign:"center"}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:700,color:C.green}}>{fmt(t)}</div>
              <div style={{fontSize:8,color:C.muted,marginTop:2}}>R{i+1}</div>
            </div>))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SetRow & ExCard ───────────────────────────────────────────────────────────
function SetRow({setNum,weight,reps,status,onDone,onRepsChange,unit}){
  const isDone=status==="done",isActive=status==="active";
  const[localReps,setLocalReps]=useState(reps);const warn=parseInt(localReps)!==9;
  return(<div style={{display:"grid",gridTemplateColumns:"32px 1fr 72px 40px",alignItems:"center",padding:"7px 14px",borderTop:"1px solid #0d1117",background:isDone?"rgba(76,175,125,0.06)":isActive?"rgba(200,169,110,0.07)":C.card,transition:"background 0.15s"}}>
    <div style={{fontSize:11,fontWeight:700,color:isDone?C.green:isActive?C.accent:C.muted,fontFamily:"'Oswald',sans-serif"}}>{isDone?"✓":`S${setNum}`}</div>
    <div style={{fontSize:18,fontWeight:700,color:isDone?C.green:isActive?C.text:C.muted,fontFamily:"'Oswald',sans-serif",textAlign:"center",padding:"0 6px"}}>{weight||"—"}</div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"0 4px"}}>
      <input type="number" inputMode="numeric" value={localReps} disabled={isDone||status==="pending"}
        onChange={e=>{setLocalReps(e.target.value);onRepsChange(e.target.value);}} onClick={e=>e.stopPropagation()}
        style={{width:"100%",background:isDone||status==="pending"?"#0d1117":C.surface,border:`1px solid ${isActive?"rgba(200,169,110,0.4)":C.border}`,borderRadius:6,color:isDone?C.green:status==="pending"?C.muted:C.text,padding:"5px 4px",fontSize:14,fontWeight:700,fontFamily:"'Oswald',sans-serif",textAlign:"center"}}/>
      {warn&&!isDone&&isActive&&<div style={{fontSize:7,color:C.red}}>≠9</div>}
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <button onClick={e=>{e.stopPropagation();if(isActive)onDone();}} disabled={!isActive}
        style={{width:34,height:34,borderRadius:9,border:isDone?`1px solid rgba(76,175,125,0.28)`:"none",background:isDone?"rgba(76,175,125,0.18)":isActive?C.accent:"#1e2530",color:isDone?C.green:isActive?"#0a0c0f":C.muted,fontSize:15,fontWeight:700,cursor:isActive?"pointer":"default",fontFamily:"'Oswald',sans-serif"}}>✓</button>
    </div>
  </div>);
}

function ExCard({ex,exData:d,exIdx,isOpen,onToggle,onDone,onWeightChange,onRepsChange,prog,unit,wkType}){
  const doneCount=d.sets.filter(s=>s.done).length,allDone=doneCount===d.sets.length;
  const nextSi=d.sets.findIndex(s=>!s.done),isStarted=doneCount>0;
  const col=CAT_COLOR[wkType]||C.accent;
  return(<div style={{background:C.card,border:`1px solid ${allDone?"rgba(76,175,125,0.45)":isStarted?`${col}55`:C.border}`,borderRadius:12,margin:"0 14px 10px",overflow:"hidden",transition:"border-color 0.2s"}}>
    <div onClick={onToggle} style={{padding:"13px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:allDone?"rgba(76,175,125,0.22)":`${col}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:allDone?C.green:col,fontFamily:"'Oswald',sans-serif"}}>{allDone?"✓":exIdx+1}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,color:C.text,letterSpacing:"0.03em"}}>{ex.name}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:2}}>{ex.muscle} · {d.sets.length} sets × 9 reps</div>
        <div style={{display:"flex",gap:4,marginTop:5}}>
          {d.sets.map((_,si)=>(<div key={si} style={{height:3,flex:1,borderRadius:2,background:si<doneCount?C.green:si===nextSi&&!allDone?col:C.border,transition:"background 0.2s"}}/>))}
        </div>
      </div>
      {ex.injury&&<span style={{fontSize:10,color:C.red,fontWeight:700,marginRight:4}}>⚠</span>}
      <span style={{color:C.muted,fontSize:11}}>{isOpen?"▲":"▼"}</span>
    </div>
    {isOpen&&(<>
      {!d.locked?(<div style={{padding:"10px 14px 8px",borderTop:`1px solid ${C.border}`,background:"#0d1117"}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>SET WEIGHT FOR ALL {d.sets.length} SETS</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="number" inputMode="decimal" placeholder="0" defaultValue={d.weight} onInput={e=>onWeightChange(e.target.value)}
            style={{flex:1,background:C.card,border:`1px solid ${col}55`,borderRadius:8,color:C.text,padding:"10px 12px",fontSize:20,fontWeight:700,fontFamily:"'Oswald',sans-serif",textAlign:"center"}}/>
          <span style={{fontSize:11,color:C.muted}}>{unit}</span>
        </div>
      </div>):(<div style={{padding:"8px 14px",background:`${col}08`,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:7}}>
        <span>🔒</span><span style={{fontSize:10,color:C.dim}}>WEIGHT LOCKED AT {d.weight||"—"} {unit}</span>
      </div>)}
      {ex.injury&&<div style={{background:"rgba(224,82,82,0.08)",border:"1px solid rgba(224,82,82,0.2)",borderRadius:6,padding:"7px 10px",margin:"8px 14px 0",fontSize:11,color:C.red}}>⚠ {ex.injury}</div>}
      <div style={{display:"flex",gap:4,padding:"8px 14px",background:"#0a0c0f",borderTop:`1px solid ${C.border}`}}>
        {[["1–3","EXP↑ · 3s↓",C.orange,"rgba(232,136,58,0.09)","rgba(232,136,58,0.2)"],["4–6",`3s↓ · ${prog.hold}s⏸`,C.accent,"rgba(200,169,110,0.09)","rgba(200,169,110,0.2)"],["7–9","3s↓ · 3s↑",C.green,"rgba(76,175,125,0.09)","rgba(76,175,125,0.2)"]].map(([n,t,c,bg,bdr])=>(<div key={n} style={{flex:1,background:bg,border:`1px solid ${bdr}`,borderRadius:5,padding:"5px 4px",textAlign:"center"}}><div style={{fontSize:9,fontWeight:700,color:c,letterSpacing:"0.06em"}}>REPS {n}</div><div style={{fontSize:8,color:C.sub,marginTop:2}}>{t}</div></div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"32px 1fr 72px 40px",padding:"8px 14px 5px",borderTop:`1px solid ${C.border}`}}>
        {["SET",unit.toUpperCase(),"REPS","DONE"].map((h,i)=>(<div key={i} style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",fontWeight:700,textAlign:i>0?"center":"left"}}>{h}</div>))}
      </div>
      {d.sets.map((s,si)=>(<SetRow key={si} setNum={si+1} weight={d.weight} reps={s.reps} unit={unit}
        status={s.done?"done":si===nextSi?"active":"pending"} onDone={()=>onDone(si)} onRepsChange={val=>onRepsChange(si,val)}/>))}
      <div style={{padding:"7px 14px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name+" tricon Gary Walker")}`} target="_blank" rel="noreferrer"
          style={{fontSize:10,color:"#ff6b6b",textDecoration:"none",background:"rgba(255,0,0,0.09)",border:"1px solid rgba(255,0,0,0.2)",borderRadius:5,padding:"5px 10px",fontWeight:700}}>▶ Watch technique</a>
        <span style={{fontSize:10,color:C.muted}}>{doneCount}/{d.sets.length} sets</span>
      </div>
    </>)}
  </div>);
}

// ── WorkoutScreen ─────────────────────────────────────────────────────────────
function WorkoutScreen({type,weekIdx,unit,pushupMax,kbWeight,onComplete,onBack}){
  const prog={...PROG[weekIdx],useTricon:WORKOUT_DEFS[type]?.useTricon||false};
  const wkDef=WORKOUT_DEFS[type];
  const list=wkDef.exercises;
  const isFlow=type==="circuit";
  const isAMRAP=type==="amrap";
  const[phase,setPhase]=useState("warmup");
  const[elapsed,setElapsed]=useState(0);
  const[openEx,setOpenEx]=useState(null);
  const[exData,setExData]=useState(()=>{const lw=load(KEYS.lastWeights,{});return list.map(ex=>({weight:lw[ex.id]||"",locked:false,sets:Array.from({length:prog.sets},()=>({reps:"9",done:false}))}));});
  const[rest,setRest]=useState(null);
  const[roundTimes,setRoundTimes]=useState([]);
  const[amrapRounds,setAmrapRounds]=useState(0);
  const elRef=useRef(null);
  const currentRound=roundTimes.length;
  const halfPushups=Math.max(1,Math.floor((pushupMax||10)/2));

  useEffect(()=>{
    if(phase!=="active")return;
    elRef.current=setInterval(()=>setElapsed(e=>{
      const next=e+1;
      if(isAMRAP&&next>=AMRAP_TOTAL){clearInterval(elRef.current);beepDone();setTimeout(()=>setPhase("done"),600);}
      return next;
    }),1000);
    return()=>clearInterval(elRef.current);
  },[phase,isAMRAP]);

  const handleWeightChange=(ei,val)=>setExData(prev=>prev.map((ex,i)=>i!==ei?ex:{...ex,weight:val}));
  const handleRepsChange=(ei,si,val)=>setExData(prev=>prev.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.map((s,j)=>j!==si?s:{...s,reps:val})}));
  const handleDone=(ei,si)=>{
    getCtx();
    setExData(prev=>{const updated=prev.map((ex,i)=>i!==ei?ex:{...ex,locked:true,sets:ex.sets.map((s,j)=>j!==si?s:{...s,done:true})});
      if(updated[ei].sets.every(s=>s.done)){const next=ei+1;if(next<list.length)setTimeout(()=>setOpenEx(next),100);}
      return updated;});
    const allSetsDoneAfter=exData[ei].sets.filter(s=>s.done).length+1>=exData[ei].sets.length;
    if(!allSetsDoneAfter)setRest({exIdx:ei,setIdx:si});
  };
  const handleCompleteFlowRound=(time)=>{
    const newRounds=[...roundTimes,time];
    setRoundTimes(newRounds);
    if(newRounds.length>=wkDef.rounds)setTimeout(()=>setPhase("done"),600);
  };
  const handleAmrapRoundComplete=()=>setAmrapRounds(r=>r+1);
  const totalVol=exData.reduce((acc,ex)=>acc+ex.sets.reduce((a,s)=>a+(parseFloat(ex.weight)||0)*(parseInt(s.reps)||0),0),0);

  const warmupItems=isAMRAP
    ?["10× light KB swings — groove the hip hinge","5× each arm shoulder circles with KB","10× bodyweight squats — slow and controlled","5× push-up to downward dog"]
    :isFlow
    ?["KB halos ×10 — 2 min","Shoulder circles & neck rolls — 1 min","Light KB helicopters ×5 each side — 2 min"]
    :type==="upper"
    ?["Arm circles & shoulder rolls — 2 min","Band pull-aparts & external rotations — 3 min","Treadmill incline walk — 3 min"]
    :["Hip circles & leg swings — 2 min","Bodyweight squats ×15 — 2 min","Elliptical / bike — 4 min"];

  // ── DONE ──
  if(phase==="done")return(<div style={{height:"100%",display:"flex",flexDirection:"column",background:C.bg}}>
    <TopBar title="Session Complete" onBack={onBack}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:54,color:isAMRAP?C.purple:C.green,lineHeight:1}}>{isAMRAP?"⏱":"✓"}</div>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:25,color:C.text,marginTop:12,textAlign:"center",letterSpacing:"0.04em"}}>{isAMRAP?"AMRAP\nCOMPLETE":"SESSION\nCOMPLETE"}</div>
      <div style={{color:C.muted,fontSize:12,marginTop:7}}>{wkDef.name} · {fmt(elapsed)}</div>
      {isAMRAP&&(
        <div style={{background:`${C.purple}12`,border:`1px solid ${C.purple}30`,borderRadius:12,padding:20,marginTop:16,width:"100%",textAlign:"center"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:54,fontWeight:700,color:C.purple,lineHeight:1}}>{amrapRounds}</div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:"0.1em",marginTop:4}}>ROUNDS IN 30 MINUTES</div>
          <div style={{fontSize:10,color:C.sub,marginTop:8,lineHeight:1.6}}>{kbWeight} {unit} · {halfPushups} push-ups per round (½ of {pushupMax})</div>
        </div>
      )}
      {isFlow&&roundTimes.length>0&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginTop:14,width:"100%"}}>
          <div style={{fontSize:10,color:C.green,letterSpacing:"0.1em",marginBottom:8}}>ROUND SPLITS</div>
          <div style={{display:"flex",gap:8}}>
            {roundTimes.map((t,i)=>(<div key={i} style={{flex:1,textAlign:"center",background:"rgba(76,175,125,0.08)",border:"1px solid rgba(76,175,125,0.2)",borderRadius:8,padding:"9px 4px"}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:19,fontWeight:700,color:C.green}}>{fmt(t)}</div>
              <div style={{fontSize:8,color:C.muted,marginTop:2}}>ROUND {i+1}</div>
            </div>))}
          </div>
        </div>
      )}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginTop:12,width:"100%"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"center"}}>
          <div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:isAMRAP?C.purple:C.green}}>{fmt(elapsed)}</div><div style={{fontSize:9,color:C.muted,marginTop:3,letterSpacing:"0.08em"}}>DURATION</div></div>
          <div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:C.blue}}>{isAMRAP?amrapRounds:isFlow?`${roundTimes.length}/${wkDef.rounds}`:Math.round(totalVol)}</div><div style={{fontSize:9,color:C.muted,marginTop:3,letterSpacing:"0.08em"}}>{isAMRAP?"ROUNDS":isFlow?"ROUNDS":"TOTAL "+unit.toUpperCase()}</div></div>
        </div>
      </div>
      <button onClick={()=>onComplete({type,date:new Date().toISOString(),duration:elapsed,volume:isAMRAP?amrapRounds:isFlow?roundTimes.length:totalVol,exData,roundTimes,amrapRounds})}
        style={{width:"100%",marginTop:18,background:isAMRAP?C.purple:C.green,border:"none",borderRadius:10,padding:14,fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:700,color:"#fff",letterSpacing:"0.1em",cursor:"pointer"}}>SAVE SESSION</button>
    </div>
  </div>);

  // ── WARMUP ──
  if(phase==="warmup")return(<div style={{height:"100%",display:"flex",flexDirection:"column",background:C.bg}}>
    <TopBar title={`${wkDef.name} — Warm Up`} onBack={onBack}/>
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
      <div style={{background:C.card,borderRadius:12,overflow:"hidden",marginBottom:10,border:`1px solid ${C.border}`}}>
        <div style={{background:isAMRAP?`${C.purple}18`:"rgba(76,175,125,0.1)",padding:"11px 14px",borderBottom:`1px solid ${C.border}`,fontSize:12,color:isAMRAP?C.purple:C.green,letterSpacing:"0.08em"}}>🔥 WARM-UP — 5 MINUTES</div>
        {warmupItems.map((w,i)=>(<div key={i} style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:isAMRAP?`${C.purple}25`:"rgba(76,175,125,0.18)",color:isAMRAP?C.purple:C.green,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
          <span style={{fontSize:12,color:C.text}}>{w}</span>
        </div>))}
      </div>

      {isAMRAP&&(
        <>
          {/* Session setup */}
          <div style={{background:C.card,border:`1px solid ${C.purple}30`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
            <div style={{padding:"10px 14px",background:`${C.purple}12`,borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.purple,letterSpacing:"0.08em",fontWeight:700}}>SESSION SETUP</div>
            <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:10,color:C.muted,marginBottom:3}}>KB WEIGHT</div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:24,fontWeight:700,color:C.text}}>{kbWeight||"—"} <span style={{fontSize:12,color:C.muted}}>{unit}</span></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.muted,marginBottom:3}}>PUSH-UPS / ROUND</div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:24,fontWeight:700,color:C.purple}}>{halfPushups} <span style={{fontSize:12,color:C.muted}}>reps (½ of {pushupMax})</span></div></div>
            </div>
            <div style={{padding:"10px 14px",fontSize:10,color:C.muted}}>Update KB weight and push-up max in Settings ⚙</div>
          </div>
          {/* Round breakdown */}
          <div style={{background:"#0d1117",border:`1px solid ${C.purple}30`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
            <div style={{padding:"10px 14px",background:`${C.purple}12`,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:C.purple,letterSpacing:"0.08em",fontWeight:700}}>ONE ROUND</span>
              <span style={{fontSize:9,color:C.muted}}>Trevor's Instinct</span>
            </div>
            {list.map((ex,i)=>{const reps=ex.id==="amrap_pushup"?halfPushups:ex.reps;return(
              <div key={ex.id} style={{padding:"10px 14px",borderBottom:i<list.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:26,height:26,borderRadius:6,background:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.purple,flexShrink:0,fontFamily:"'Oswald',sans-serif"}}>{i+1}</div>
                <div style={{flex:1}}><div style={{fontSize:12,color:C.text,fontWeight:600}}>{ex.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{ex.note}</div></div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:C.purple}}>×{reps}</div>
              </div>
            );})}
            <div style={{padding:"10px 14px",background:`${C.purple}08`,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:C.muted}}>Clock runs for</span>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:C.purple}}>30:00</span>
            </div>
          </div>
          <div style={{background:`${C.purple}08`,border:`1px solid ${C.purple}20`,borderRadius:10,padding:"11px 14px",marginBottom:10}}>
            <div style={{fontSize:10,color:C.purple,letterSpacing:"0.1em",marginBottom:6}}>HOW TO TRACK</div>
            <div style={{fontSize:11,color:C.sub,lineHeight:1.8}}>
              <div>· Tap each exercise to check it off</div>
              <div>· Hit <span style={{color:C.purple,fontWeight:700}}>ROUND DONE</span> to increment your counter</div>
              <div>· Rest as needed — clock keeps running</div>
              <div>· Try to beat your round count every Friday</div>
            </div>
          </div>
        </>
      )}

      {isFlow&&(
        <div style={{background:"#0d1117",border:`1px solid ${C.green}30`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
          <div style={{padding:"10px 14px",background:"rgba(76,175,125,0.1)",borderBottom:`1px solid ${C.border}`,fontSize:12,color:C.green,fontWeight:700}}>EACH ROUND — 5 MOVEMENTS</div>
          {list.map((ex,i)=>(<div key={ex.id} style={{padding:"10px 14px",borderBottom:i<list.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:24,height:24,borderRadius:6,background:"rgba(76,175,125,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.green,flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontSize:12,color:C.text,fontWeight:600}}>{ex.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{ex.note}</div></div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:C.green}}>×{ex.reps}</div>
          </div>))}
        </div>
      )}

      <a href={wkDef.sourceVideo} target="_blank" rel="noreferrer"
        style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,0,0,0.08)",border:"1px solid rgba(255,0,0,0.2)",borderRadius:10,padding:"11px 14px",textDecoration:"none",marginBottom:10}}>
        <span style={{fontSize:20}}>▶</span>
        <div><div style={{fontSize:12,color:"#ff6b6b",fontWeight:700}}>Watch on YouTube</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>@trevorsinstinct · {wkDef.name}</div></div>
      </a>
    </div>
    <div style={{padding:"10px 14px 20px",flexShrink:0}}>
      <button onClick={()=>setPhase("active")}
        style={{width:"100%",background:wkDef.color,border:"none",borderRadius:10,padding:13,fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:700,color:isAMRAP?"#fff":"#0a0c0f",letterSpacing:"0.12em",cursor:"pointer"}}>
        {isAMRAP?"START CLOCK — 30:00 →":"START CLOCK →"}
      </button>
    </div>
  </div>);

  // ── ACTIVE ──
  return(<div style={{height:"100%",display:"flex",flexDirection:"column",background:C.bg,position:"relative"}}>
    <TopBar title={isAMRAP?`${fmt(AMRAP_TOTAL-elapsed)} LEFT`:fmt(elapsed)} onBack={onBack}
      right={<button onClick={()=>setPhase("done")} style={{background:isAMRAP?`${C.purple}20`:"rgba(76,175,125,0.15)",border:`1px solid ${isAMRAP?`${C.purple}40`:"rgba(76,175,125,0.3)"}`,borderRadius:6,padding:"5px 12px",color:isAMRAP?C.purple:C.green,fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Oswald',sans-serif"}}>FINISH</button>}/>
    <div style={{flex:1,overflowY:"auto",paddingTop:8,paddingBottom:rest?"52%":80}}>
      <div style={{margin:"0 14px 10px",padding:"7px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:C.muted}}>{isAMRAP?"AMRAP 30 MIN":isFlow?"3 Rounds For Time":`Wk ${PROG[weekIdx].week} · ${PROG[weekIdx].label}`}</span>
        <span style={{fontSize:10,color:wkDef.color,fontWeight:700,fontFamily:"'Oswald',sans-serif"}}>{wkDef.label}</span>
      </div>
      {isAMRAP?(<AmrapTracker exercises={list} elapsed={elapsed} pushupMax={pushupMax||10} kbWeight={kbWeight} unit={unit} onRoundComplete={handleAmrapRoundComplete} roundCount={amrapRounds}/>)
      :isFlow?(<FlowRoundTracker exercises={list} roundTimes={roundTimes} currentRound={currentRound} onCompleteRound={handleCompleteFlowRound} elapsed={elapsed}/>)
      :(list.map((ex,ei)=>(<ExCard key={ex.id} ex={ex} exData={exData[ei]} exIdx={ei} isOpen={openEx===ei} onToggle={()=>setOpenEx(openEx===ei?null:ei)} onDone={si=>handleDone(ei,si)} onWeightChange={val=>handleWeightChange(ei,val)} onRepsChange={(si,val)=>handleRepsChange(ei,si,val)} prog={prog} unit={unit} wkType={type}/>)))}
      <div style={{margin:"0 14px 10px",background:C.card,border:`1px solid ${C.blue}33`,borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:11,color:C.blue,letterSpacing:"0.08em",marginBottom:5}}>❄ COOL-DOWN — 5 MIN</div>
        <div style={{fontSize:11,color:C.sub,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:type==="upper"?"• Chest, shoulders, triceps, lats — 30s each<br>• Box breathing — 2 min":type==="lower"?"• Quads, hamstrings, glutes, calves — 30s each<br>• Foam roll IT band, quads, calves":"• Chest opener, lat stretch, shoulder cross-body — 30s each<br>• Neck rolls · wrist circles<br>• Box breathing — 2 min"}}/>
      </div>
    </div>
    {rest&&<RestTimer exName={list[rest.exIdx].name} setIdx={rest.setIdx} onDone={()=>setRest(null)} onSkip={()=>setRest(null)}/>}
  </div>);
}

// ── CalendarScreen ────────────────────────────────────────────────────────────
function CalendarScreen({sessions,weekIdx,onStartWorkout}){
  const[selectedDay,setSelectedDay]=useState(null);
  const weekDates=getWeekDates();const prog=PROG[weekIdx];

  const renderDayCard=(dayIdx)=>{
    const schedType=SCHEDULE[dayIdx];
    const date=weekDates[dayIdx];
    const isToday=date.toDateString()===new Date().toDateString();

    if(!schedType)return(<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,textAlign:"center",marginTop:4}}>
      <div style={{fontSize:28,marginBottom:8}}>🔋</div>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,color:C.text,letterSpacing:"0.06em"}}>REST DAY</div>
      <div style={{fontSize:11,color:C.muted,marginTop:6,lineHeight:1.6}}>Active recovery · Light walking encouraged<br/>Adaptation happens at rest</div>
    </div>);

    if(schedType==="friday"){
      return(<div style={{marginTop:4}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>FRIDAY — CHOOSE YOUR WORKOUT</div>
        {FRIDAY_WORKOUTS.map(fType=>{
          const wk=WORKOUT_DEFS[fType];
          const fdone=sessions.some(s=>new Date(s.date).toDateString()===date.toDateString()&&s.type===fType);
          return(<div key={fType} style={{background:`linear-gradient(135deg,${wk.color}18 0%,${wk.color}06 100%)`,border:`1px solid ${wk.color}40`,borderRadius:14,padding:14,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:9,color:wk.color,letterSpacing:"0.12em",fontWeight:700,marginBottom:3}}>{wk.label}</div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:C.text,lineHeight:1}}>{wk.name.toUpperCase()}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>{wk.duration} · {wk.method}</div>
              </div>
              {fdone&&<div style={{fontSize:10,color:C.green,fontWeight:700,background:`${C.green}18`,border:`1px solid ${C.green}30`,borderRadius:5,padding:"3px 8px"}}>DONE ✓</div>}
            </div>
            <div style={{fontSize:10,color:C.sub,lineHeight:1.8,marginBottom:10}}>
              {fType==="amrap"?"10× Swings · 5× Press L+R · 5× Squat R+L · ½max Push-Ups":"Helicopters CCW+CW · Halos CCW+CW · Pullovers"}
            </div>
            <button onClick={()=>onStartWorkout(fType)} style={{width:"100%",background:wk.color,border:"none",borderRadius:8,padding:10,fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:700,color:fType==="amrap"?"#fff":"#0a0c0f",letterSpacing:"0.1em",cursor:"pointer"}}>{fdone?"START AGAIN →":"START →"}</button>
          </div>);
        })}
      </div>);
    }

    const wk=WORKOUT_DEFS[schedType];
    const done=sessions.some(s=>new Date(s.date).toDateString()===date.toDateString());
    return(<div style={{marginTop:4}}>
      <div style={{background:`linear-gradient(135deg,${wk.color}18 0%,${wk.color}06 100%)`,border:`1px solid ${wk.color}40`,borderRadius:14,padding:16,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:10,color:wk.color,letterSpacing:"0.12em",fontWeight:700,marginBottom:4}}>{wk.label}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:24,fontWeight:700,color:C.text,lineHeight:1}}>{wk.name.toUpperCase()}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:5}}>{DN[dayIdx]} · {wk.duration}</div>
          </div>
          {done?<div style={{fontSize:11,color:C.green,fontWeight:700,background:`${C.green}18`,border:`1px solid ${C.green}30`,borderRadius:6,padding:"5px 10px"}}>DONE ✓</div>
          :<div style={{fontSize:11,color:wk.color,fontWeight:700,background:`${wk.color}18`,border:`1px solid ${wk.color}30`,borderRadius:6,padding:"5px 10px"}}>{isToday?"TODAY":"UPCOMING"}</div>}
        </div>
        <button onClick={()=>onStartWorkout(schedType)} style={{width:"100%",background:wk.color,border:"none",borderRadius:10,padding:13,fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:700,color:"#0a0c0f",letterSpacing:"0.12em",cursor:"pointer"}}>{done?"START AGAIN →":"START WORKOUT →"}</button>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
        {wk.exercises.map((ex,i)=>(<div key={ex.id} style={{padding:"11px 14px",borderBottom:i<wk.exercises.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:24,height:24,background:`${wk.color}18`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:wk.color,flexShrink:0}}>{i+1}</div>
          <div style={{flex:1}}><div style={{fontSize:13,color:C.text,fontWeight:600}}>{ex.name}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{ex.muscle}</div></div>
          <div style={{fontSize:9,color:wk.color,fontWeight:700}}>{prog.sets}×9</div>
        </div>))}
      </div>
    </div>);
  };

  return(<div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"16px 14px 10px",flexShrink:0}}>
      <div style={{fontSize:20,color:C.text,letterSpacing:"0.06em",marginBottom:4}}>PLAN</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Tap a day to preview and start your workout</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",margin:"0 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",flexShrink:0}}>
      {weekDates.map((d,i)=>{
        const isT=d.toDateString()===new Date().toDateString();
        const schedType=SCHEDULE[i];
        const isFri=schedType==="friday";
        const done=sessions.some(s=>new Date(s.date).toDateString()===d.toDateString());
        const isSel=selectedDay===i;
        const dotColor=isFri?C.purple:schedType?WORKOUT_DEFS[schedType]?.color:null;
        return(<div key={i} onClick={()=>setSelectedDay(prev=>prev===i?null:i)}
          style={{padding:"10px 3px",textAlign:"center",borderRight:i<6?`1px solid ${C.border}`:"none",
            background:isSel?(dotColor?`${dotColor}18`:"rgba(200,169,110,0.08)"):isT?"rgba(200,169,110,0.06)":"transparent",cursor:"pointer",minHeight:80,transition:"background 0.15s"}}>
          <div style={{fontSize:8,color:isT||isSel?(dotColor||C.accent):C.muted,letterSpacing:"0.07em",marginBottom:3}}>{DN[i]}</div>
          <div style={{fontSize:13,fontWeight:700,color:isT||isSel?(dotColor||C.accent):C.text,marginBottom:5}}>{d.getDate()}</div>
          {isFri?(<div style={{fontSize:8,background:done?`${C.green}33`:`${C.purple}22`,color:done?C.green:C.purple,borderRadius:3,padding:"2px",fontWeight:700,lineHeight:1.2}}>{done?"✓":"KB"}</div>)
          :schedType?(<div style={{fontSize:8,background:done?`${C.green}33`:`${dotColor}22`,color:done?C.green:dotColor,borderRadius:3,padding:"2px",fontWeight:700,lineHeight:1.2}}>{done?"✓":WORKOUT_DEFS[schedType]?.name.split(" ").map(w=>w.slice(0,3)).join(" ")}</div>)
          :(<div style={{fontSize:8,color:C.border,marginTop:4}}>REST</div>)}
          {isSel&&<div style={{width:14,height:2,background:dotColor||C.accent,borderRadius:1,margin:"4px auto 0"}}/>}
        </div>);
      })}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px 80px"}}>
      {selectedDay!==null?renderDayCard(selectedDay):(
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:4}}>
          {[["upper",0],["lower",2]].map(([type,dayIdx])=>{
            const wk=WORKOUT_DEFS[type];const done=sessions.some(s=>new Date(s.date).toDateString()===getWeekDates()[dayIdx].toDateString());
            return(<div key={type} onClick={()=>setSelectedDay(dayIdx)} style={{background:C.card,border:`1px solid ${wk.color}30`,borderRadius:10,padding:"13px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,background:`${wk.color}18`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{fontSize:10,fontWeight:700,color:wk.color,fontFamily:"'Oswald',sans-serif"}}>{DN[dayIdx].slice(0,3)}</div></div>
              <div style={{flex:1}}><div style={{fontSize:13,color:C.text,fontWeight:600}}>{wk.name}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{wk.dayName} · {wk.duration}</div></div>
              {done?<span style={{fontSize:10,color:C.green,fontWeight:700}}>DONE ✓</span>:<span style={{color:C.muted,fontSize:13}}>›</span>}
            </div>);
          })}
          <div onClick={()=>setSelectedDay(4)} style={{background:C.card,border:`1px solid ${C.purple}30`,borderRadius:10,padding:"13px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,background:`${C.purple}18`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{fontSize:10,fontWeight:700,color:C.purple,fontFamily:"'Oswald',sans-serif"}}>FRI</div></div>
            <div style={{flex:1}}><div style={{fontSize:13,color:C.text,fontWeight:600}}>Friday Kettlebell</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>KB Benchmark AMRAP · Kettlebell Flow</div></div>
            <span style={{color:C.muted,fontSize:13}}>›</span>
          </div>
        </div>
      )}
    </div>
  </div>);
}

// ── LibraryScreen ─────────────────────────────────────────────────────────────
function LibraryScreen({weekIdx,unit}){
  const[libTab,setLibTab]=useState("method");const[libFilter,setLibFilter]=useState("all");
  const[libSearch,setLibSearch]=useState("");const[libOpen,setLibOpen]=useState(null);
  const prog=PROG[weekIdx];const phases=TRICON_PHASES(prog.hold);
  const filtered=ALL_EX.filter(e=>(libFilter==="all"||e.cat===libFilter)&&e.name.toLowerCase().includes(libSearch.toLowerCase()));
  return(<div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"16px 14px 0",flexShrink:0}}>
      <div style={{fontSize:20,color:C.text,letterSpacing:"0.06em",marginBottom:10}}>LIBRARY</div>
      <div style={{display:"flex",gap:6}}>
        {[["method","METHOD"],["exercises","EXERCISES"]].map(([v,l])=>(<button key={v} onClick={()=>setLibTab(v)} style={{flex:1,padding:"8px 0",borderRadius:"7px 7px 0 0",fontSize:11,fontWeight:700,letterSpacing:"0.08em",cursor:"pointer",border:"none",fontFamily:"Oswald,sans-serif",background:libTab===v?C.card:"transparent",color:libTab===v?C.accent:C.muted,borderBottom:libTab===v?`2px solid ${C.accent}`:"2px solid transparent"}}>{l}</button>))}
      </div>
    </div>
    {libTab==="method"?(<div style={{flex:1,overflowY:"auto",padding:"12px 14px 80px"}}>
      {/* TRICON */}
      <div style={{background:"#0d1117",border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"14px 16px",background:"linear-gradient(135deg,rgba(200,169,110,0.14) 0%,rgba(232,136,58,0.07) 100%)",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",marginBottom:3}}>GARY WALKER</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:C.text}}>TRICON LIFTING METHOD</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3}}>Monday & Wednesday · 9 reps per set</div>
        </div>
        {phases.map((ph,i)=>(<div key={i} style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,background:ph.bg,borderLeft:`3px solid ${ph.color}`}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:700,color:ph.color,letterSpacing:"0.12em",minWidth:76}}>{ph.repRange}</span>
            <span style={{fontFamily:"'Oswald',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>{ph.name}</span>
          </div>
          {ph.steps.map((s,j)=>(<div key={j} style={{display:"flex",gap:10,padding:"6px 8px",background:`${ph.color}12`,borderRadius:5,border:`1px solid ${ph.color}20`,marginBottom:4,alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:700,color:ph.color,minWidth:36,fontFamily:"'Oswald',sans-serif"}}>{s.time}</span>
            <span style={{fontSize:11,color:C.sub,lineHeight:1.4}}>{s.desc}</span>
          </div>))}
          <div style={{fontSize:10,color:C.muted,fontStyle:"italic",marginTop:6,lineHeight:1.4}}>{ph.why}</div>
        </div>))}
      </div>
      {/* KB Benchmark AMRAP */}
      <div style={{background:"#0d1117",border:`1px solid ${C.purple}30`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"14px 16px",background:`${C.purple}10`,borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",marginBottom:3}}>TREVOR'S INSTINCT</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:C.text}}>KB BENCHMARK</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3}}>Friday · AMRAP 30 min · One Kettlebell</div>
        </div>
        <div style={{borderLeft:`3px solid ${C.purple}`}}>
          {WORKOUT_DEFS.amrap.exercises.map((ex,i)=>(
            <div key={ex.id} style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <div style={{width:24,height:24,borderRadius:6,background:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.purple,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}><div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:700,color:C.text}}>{ex.name}</div><div style={{fontSize:10,color:C.muted}}>{ex.muscle}</div></div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:C.purple}}>{ex.id==="amrap_pushup"?"½max":ex.reps}</div>
              </div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.5,paddingLeft:34}}>{ex.note}</div>
            </div>
          ))}
          <div style={{padding:"12px 16px",background:`${C.purple}08`}}>
            <div style={{background:`${C.purple}12`,border:`1px solid ${C.purple}20`,borderRadius:7,padding:"9px 12px"}}>
              <div style={{fontSize:10,color:C.purple,fontWeight:700,marginBottom:4}}>AMRAP STRATEGY</div>
              <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>Move steadily — don't sprint round 1. Rest as needed between rounds. Aim to beat your round count every week. The push-up cap (½ max) prevents failure and keeps you moving for the full 30 minutes.</div>
            </div>
          </div>
        </div>
      </div>
      {/* KB Flow */}
      <div style={{background:"#0d1117",border:`1px solid ${C.green}30`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"14px 16px",background:"rgba(76,175,125,0.08)",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.14em",marginBottom:3}}>TREVOR'S INSTINCT</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:C.text}}>KETTLEBELL FLOW</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3}}>Friday · ~20–30 min · 3 Rounds For Time</div>
        </div>
        <div style={{borderLeft:`3px solid ${C.green}`}}>
          {WORKOUT_DEFS.circuit.exercises.map((ex,i)=>(<div key={ex.id} style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <div style={{width:24,height:24,borderRadius:6,background:"rgba(76,175,125,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.green,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}><div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:700,color:C.text}}>{ex.name}</div><div style={{fontSize:10,color:C.muted}}>×{ex.reps}</div></div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:C.green}}>×{ex.reps}</div>
            </div>
            <div style={{fontSize:11,color:C.sub,lineHeight:1.5,paddingLeft:34}}>{ex.note}</div>
          </div>))}
        </div>
      </div>
    </div>):(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"10px 14px 8px",flexShrink:0}}>
        <input style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:13,fontFamily:"'Oswald',sans-serif",boxSizing:"border-box"}} placeholder="Search exercises..." value={libSearch} onChange={e=>setLibSearch(e.target.value)}/>
        <div style={{display:"flex",gap:5,marginTop:8}}>
          {[["all","All"],["upper","Upper"],["lower","Lower"],["circuit","Flow"],["amrap","AMRAP"]].map(([v,l])=>(<button key={v} onClick={()=>setLibFilter(v)} style={{flex:1,borderRadius:6,padding:"7px 0",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Oswald',sans-serif",background:libFilter===v?(CAT_COLOR[v]||C.accent):C.card,border:`1px solid ${libFilter===v?(CAT_COLOR[v]||C.accent):C.border}`,color:libFilter===v?"#fff":C.muted}}>{l}</button>))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 14px 80px"}}>
        {filtered.map(ex=>{const col=CAT_COLOR[ex.cat];const isKB=ex.cat==="circuit"||ex.cat==="amrap";return(<div key={ex.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:8,overflow:"hidden"}}>
          <div onClick={()=>setLibOpen(libOpen===ex.id?null:ex.id)} style={{padding:"11px 13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <div style={{flex:1}}><div style={{fontSize:13,color:C.text,fontWeight:600}}>{ex.name}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{ex.muscle}</div></div>
            <span style={{background:col+"1e",color:col,fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:4,letterSpacing:"0.08em"}}>{CAT_LABEL[ex.cat]}</span>
          </div>
          {libOpen===ex.id&&(<div style={{borderTop:`1px solid ${C.border}`,padding:"10px 13px"}}>
            {ex.injury&&<div style={{background:"rgba(224,82,82,0.08)",border:"1px solid rgba(224,82,82,0.2)",borderRadius:5,padding:"7px 10px",marginBottom:8,fontSize:11,color:C.red}}>⚠ {ex.injury}</div>}
            {isKB?(<div style={{background:`${col}0e`,border:`1px solid ${col}1e`,borderRadius:6,padding:"8px 10px",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:col,letterSpacing:"0.08em",marginBottom:4}}>{ex.cat==="amrap"?"KB BENCHMARK — AMRAP 30 MIN":"KETTLEBELL FLOW — 3 ROUNDS FOR TIME"}</div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.6,marginBottom:ex.id==="amrap_pushup"?6:0}}>{ex.note}</div>
              {ex.id==="amrap_pushup"&&<div style={{fontSize:10,color:C.muted,fontStyle:"italic",marginTop:4}}>Reps = ½ your max push-ups (set in Settings ⚙)</div>}
            </div>):(<>
              <div style={{fontSize:10,color:C.accent,letterSpacing:"0.08em",marginBottom:6}}>TRICON 9-REP SEQUENCE</div>
              {[["1–3 reps","Explosive up · 3s controlled down",C.orange],["3–6 reps",`3s down · ${prog.hold}s iso hold`,C.accent],["6–9 reps","3s down · 3s up (full ROM)",C.green]].map(([r,d,c])=>(<div key={r} style={{display:"flex",gap:8,padding:"5px 8px",background:c+"0d",borderRadius:5,border:`1px solid ${c}1e`,marginBottom:4,alignItems:"center"}}><span style={{fontSize:9,fontWeight:700,color:c,minWidth:44,fontFamily:"'Oswald',sans-serif"}}>{r}</span><span style={{fontSize:11,color:C.sub}}>{d}</span></div>))}
            </>)}
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name+(isKB?" kettlebell trevorsinstinct":" tricon Gary Walker"))}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,background:"rgba(255,0,0,0.08)",border:"1px solid rgba(255,0,0,0.2)",borderRadius:5,padding:"5px 10px",color:"#ff6b6b",fontSize:11,fontWeight:700,textDecoration:"none"}}>▶ Watch on YouTube</a>
          </div>)}
        </div>);})}
      </div>
    </div>)}
  </div>);
}

// ── StatsScreen ───────────────────────────────────────────────────────────────
function StatsScreen({sessions,unit}){
  const[statsTab,setStatsTab]=useState("exercises");const[catFilter,setCatFilter]=useState("all");const[drillEx,setDrillEx]=useState(null);
  const history=buildExHistory(sessions);
  const wS=getWeekStart(0),lwS=getWeekStart(-1),lwE=getWeekStart(0);
  const twSessions=sessions.filter(s=>new Date(s.date)>=wS);
  const tp={upper:0,lower:0,circuit:0,amrap:0};sessions.forEach(s=>{if(tp[s.type]!==undefined)tp[s.type]++;});

  if(drillEx){
    const ex=ALL_EX.find(e=>e.id===drillEx);const col=CAT_COLOR[ex.cat];
    const tw=weekWeightFromHistory(history,ex.id,0);const lw=weekWeightFromHistory(history,ex.id,-1);
    const chg=weekChangeFromHistory(history,ex.id);
    const exHist=(history[ex.id]||[]).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const chgStr=chg!==null?`${chg>0?"+":""}${chg.toFixed(1)}%`:"—";const chgCol=chg===null?C.muted:chg>0?C.green:chg<0?C.red:C.muted;
    return(<div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <TopBar title={ex.name} onBack={()=>setDrillEx(null)} right={<span style={{fontSize:10,color:col,background:col+"18",padding:"4px 8px",borderRadius:4,fontWeight:700,letterSpacing:"0.06em"}}>{CAT_LABEL[ex.cat]}</span>}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,padding:"12px 14px"}}>
          {[{val:tw!==null?tw:"—",lbl:`THIS WK\n${unit}`,col:C.text,bg:C.card,bdr:C.border},{val:lw!==null?lw:"—",lbl:`LAST WK\n${unit}`,col:C.muted,bg:C.card,bdr:C.border},{val:chgStr,lbl:"WK CHANGE",col:chgCol,bg:col+"12",bdr:col+"30"}].map((s,i)=>(<div key={i} style={{background:s.bg,border:`1px solid ${s.bdr}`,borderRadius:9,padding:"11px 8px",textAlign:"center"}}><div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700,color:s.col,lineHeight:1}}>{s.val}</div><div style={{fontSize:8,color:C.muted,marginTop:4,letterSpacing:"0.06em",lineHeight:1.4,whiteSpace:"pre-line"}}>{s.lbl}</div></div>))}
        </div>
        <div style={{padding:"0 14px"}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>SESSION LOG</div>
          {exHist.length===0&&<div style={{fontSize:12,color:C.muted,padding:"12px 0"}}>No sessions logged yet.</div>}
          {exHist.slice(0,8).map((h,i)=>(<div key={i} style={{display:"flex",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{flex:1}}><div style={{fontSize:12,color:C.text}}>{new Date(h.date).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</div></div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:C.text}}>{h.weight} <span style={{fontSize:10,color:C.muted}}>{unit}</span></div>
          </div>))}
        </div>
      </div>
    </div>);
  }

  return(<div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"18px 14px 0",flexShrink:0}}>
      <div style={{fontSize:20,color:C.text,letterSpacing:"0.06em",marginBottom:12}}>STATISTICS</div>
      <div style={{display:"flex",gap:6}}>
        {[["exercises","BY EXERCISE"],["overview","OVERVIEW"]].map(([v,l])=>(<button key={v} onClick={()=>setStatsTab(v)} style={{flex:1,padding:"8px 0",borderRadius:"7px 7px 0 0",fontSize:11,fontWeight:700,letterSpacing:"0.08em",cursor:"pointer",border:"none",fontFamily:"Oswald,sans-serif",background:statsTab===v?C.card:"transparent",color:statsTab===v?C.accent:C.muted,borderBottom:statsTab===v?`2px solid ${C.accent}`:"2px solid transparent"}}>{l}</button>))}
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",paddingBottom:80,background:C.bg}}>
      {statsTab==="exercises"?(<>
        <div style={{display:"flex",gap:5,padding:"10px 14px 6px",flexWrap:"wrap"}}>
          {[["all","All"],["upper","Upper"],["lower","Lower"],["circuit","Flow"],["amrap","AMRAP"]].map(([v,l])=>(<button key={v} onClick={()=>setCatFilter(v)} style={{padding:"5px 10px",borderRadius:20,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"Oswald,sans-serif",letterSpacing:"0.06em",border:`1px solid ${catFilter===v?(CAT_COLOR[v]||C.accent):C.border}`,background:catFilter===v?(CAT_COLOR[v]||C.accent)+"18":"transparent",color:catFilter===v?(CAT_COLOR[v]||C.accent):C.muted}}>{l}</button>))}
        </div>
        {(catFilter==="all"?["upper","lower","circuit","amrap"]:[catFilter]).map(cat=>{
          const exList=ALL_EX.filter(e=>e.cat===cat);const col=CAT_COLOR[cat];
          return(<div key={cat}>
            <div style={{padding:"6px 14px 4px",fontSize:9,color:col,letterSpacing:"0.14em",background:col+"0a",borderTop:`1px solid ${col}22`,borderBottom:`1px solid ${col}22`,fontWeight:700}}>{CAT_LABEL[cat]}</div>
            {exList.map(ex=>{const tw2=weekWeightFromHistory(history,ex.id,0);return(<div key={ex.id} onClick={()=>setDrillEx(ex.id)} style={{display:"flex",alignItems:"center",padding:"11px 14px",borderBottom:"1px solid #111318",cursor:"pointer"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0,marginRight:10}}/>
              <div style={{flex:1}}><div style={{fontSize:13,color:C.text,fontWeight:600}}>{ex.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{ex.muscle}</div></div>
              <div style={{textAlign:"right"}}>{tw2!==null?<div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:700,color:C.text}}>{tw2}<span style={{fontSize:10,color:C.muted,marginLeft:2}}>{unit}</span></div>:<div style={{fontSize:11,color:C.border}}>NO DATA</div>}</div>
              <div style={{marginLeft:8,color:C.muted,fontSize:11}}>›</div>
            </div>);})}
          </div>);
        })}
      </>):(<>
        <div style={{margin:"10px 14px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:13}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.08em",marginBottom:10}}>SESSIONS BY TYPE</div>
          {[["upper","Upper Lift",C.accent],["lower","Lower Body",C.blue],["circuit","Kettlebell Flow",C.green],["amrap","KB Benchmark",C.purple]].map(([k,l,col])=>(<div key={k} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:C.text}}>{l}</span><span style={{fontSize:12,color:col,fontWeight:700}}>{tp[k]}</span></div>
            <div style={{height:4,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{width:`${(tp[k]/(sessions.length||1))*100}%`,height:"100%",background:col,borderRadius:3}}/></div>
          </div>))}
        </div>
        {sessions.length===0&&<div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:30,marginBottom:10}}>📊</div><div style={{fontSize:12,color:C.muted}}>Complete your first session to see stats</div></div>}
      </>)}
    </div>
  </div>);
}

// ── HomeHero ──────────────────────────────────────────────────────────────────
function HomeHero({sessions}){
  const tw=sessions.filter(s=>new Date(s.date)>=getWeekStart(0));
  return(<div style={{position:"relative",background:C.bg,minHeight:240}}>
    <svg style={{position:"absolute",top:0,left:0,width:"100%",height:240,opacity:0.04,pointerEvents:"none"}} viewBox="0 0 375 240" preserveAspectRatio="none">
      {Array.from({length:20},(_,i)=><line key={`v${i}`} x1={i*20} y1="0" x2={i*20} y2="240" stroke={C.accent} strokeWidth="0.5"/>)}
      {Array.from({length:13},(_,i)=><line key={`h${i}`} x1="0" y1={i*20} x2="375" y2={i*20} stroke={C.accent} strokeWidth="0.5"/>)}
    </svg>
    <div style={{position:"absolute",left:0,top:0,right:0,height:3,background:`linear-gradient(90deg,${C.accent} 0%,${C.orange} 50%,transparent 100%)`}}/>
    <div style={{padding:"36px 18px 30px",position:"relative",zIndex:1,textAlign:"center"}}>
      <div style={{fontSize:10,color:C.dim,letterSpacing:"0.18em",marginBottom:10,fontFamily:"'Oswald',sans-serif"}}>TRAINING METHOD FOR THE OLDER AND WISER ATHLETE</div>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:52,fontWeight:700,color:C.text,lineHeight:1.1,letterSpacing:"0.02em",display:"block"}}>TRICON</div>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:52,fontWeight:700,lineHeight:1.1,letterSpacing:"0.02em",marginBottom:24,display:"block"}}><span style={{color:C.accent}}>WORKOUT</span></div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
        {[[sessions.length,"SESSIONS",C.accent],[tw.length,"THIS WEEK",C.text],[9,"REPS/SET",C.text]].map(([v,l,col],i)=>(<div key={l} style={{display:"flex",alignItems:"center"}}>
          {i>0&&<div style={{width:1,height:36,background:C.border,margin:"0 20px"}}/>}
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:32,fontWeight:700,color:col,lineHeight:1.1}}>{v}</div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginTop:3}}>{l}</div>
          </div>
        </div>))}
      </div>
    </div>
  </div>);
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function TriConApp(){
  const[sessions,setSessions]=useState(()=>load(KEYS.sessions,[]));
  const[lastWeights,setLastWeights]=useState(()=>load(KEYS.lastWeights,{}));
  const[unit,setUnit]=useState(()=>load(KEYS.unit,"kg"));
  const[weekIdx,setWeekIdx]=useState(()=>load(KEYS.weekIdx,0));
  const[pushupMax,setPushupMax]=useState(()=>load(KEYS.pushupMax,20));
  const[kbWeight,setKbWeight]=useState(()=>load(KEYS.kbWeight,""));
  const[screen,setScreen]=useState("home");
  const[workoutType,setWorkoutType]=useState(null);

  useEffect(()=>save(KEYS.sessions,sessions),[sessions]);
  useEffect(()=>save(KEYS.lastWeights,lastWeights),[lastWeights]);
  useEffect(()=>save(KEYS.unit,unit),[unit]);
  useEffect(()=>save(KEYS.weekIdx,weekIdx),[weekIdx]);
  useEffect(()=>save(KEYS.pushupMax,pushupMax),[pushupMax]);
  useEffect(()=>save(KEYS.kbWeight,kbWeight),[kbWeight]);

  const handleComplete=({type,date,duration,volume,exData,roundTimes,amrapRounds})=>{
    const list=getList(type);const newW={...lastWeights};
    list.forEach((ex,i)=>{if(exData[i]?.weight)newW[ex.id]=exData[i].weight;});
    setLastWeights(newW);
    setSessions(prev=>[...prev,{type,date,duration,volume,exData,roundTimes,amrapRounds}]);
    setScreen("home");
  };

  const startWorkout=(type)=>{setWorkoutType(type);setScreen("workout");};

  const prog=PROG[weekIdx];
  const today=new Date().getDay();
  const todayKey=today===1?"upper":today===3?"lower":today===5?"friday":null;
  const weekDates=getWeekDates();
  const wfd={0:"upper",2:"lower",4:"friday"};
  const tw=sessions.filter(s=>new Date(s.date)>=getWeekStart(0));

  const TABS=[{id:"home",icon:"⌂",label:"HOME"},{id:"calendar",icon:"▦",label:"PLAN"},{id:"stats",icon:"◎",label:"STATS"},{id:"library",icon:"≡",label:"LIBRARY"},{id:"settings",icon:"⚙",label:"SETTINGS"}];

  // ── Workout screen (full screen, no tabs) ──
  if(screen==="workout")return(<div style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",background:C.bg,fontFamily:"'Oswald','Arial Narrow',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap" rel="stylesheet"/>
    <WorkoutScreen type={workoutType} weekIdx={weekIdx} unit={unit} pushupMax={pushupMax} kbWeight={kbWeight} onComplete={handleComplete} onBack={()=>setScreen("home")}/>
  </div>);

  // ── Friday picker screen ──
  if(screen==="fridaypicker")return(<div style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:"'Oswald','Arial Narrow',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap" rel="stylesheet"/>
    <TopBar title="FRIDAY KETTLEBELL" onBack={()=>setScreen("home")}/>
    <FridayPicker onSelect={startWorkout}/>
  </div>);

  // ── Settings renderer ──
  const renderSettings=()=>(<div style={{flex:1,overflowY:"auto",padding:"16px 14px 80px"}}>
    <div style={{fontSize:20,color:C.text,letterSpacing:"0.06em",marginBottom:16}}>SETTINGS</div>

    {/* KB Setup */}
    <div style={{background:C.card,border:`1px solid ${C.purple}40`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,fontSize:10,color:C.purple,letterSpacing:"0.1em",fontWeight:700}}>KETTLEBELL SETUP</div>
      <div style={{padding:"14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.08em",marginBottom:8}}>KB WEIGHT (shown during AMRAP sessions)</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="number" inputMode="decimal" placeholder="e.g. 16" value={kbWeight}
            onChange={e=>{setKbWeight(e.target.value);save(KEYS.kbWeight,e.target.value);}}
            style={{flex:1,background:"#0d1117",border:`1px solid ${C.purple}50`,borderRadius:8,color:C.text,padding:"12px 14px",fontSize:22,fontWeight:700,fontFamily:"'Oswald',sans-serif",textAlign:"center"}}/>
          <span style={{fontSize:13,color:C.muted,fontWeight:700}}>{unit}</span>
        </div>
      </div>
      <div style={{padding:"14px"}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.08em",marginBottom:8}}>PUSH-UP MAX (sets your per-round rep count)</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="number" inputMode="numeric" placeholder="e.g. 20" value={pushupMax||""}
            onChange={e=>{const v=parseInt(e.target.value)||0;setPushupMax(v);save(KEYS.pushupMax,v);}}
            style={{flex:1,background:"#0d1117",border:`1px solid ${C.purple}50`,borderRadius:8,color:C.text,padding:"12px 14px",fontSize:22,fontWeight:700,fontFamily:"'Oswald',sans-serif",textAlign:"center"}}/>
          <span style={{fontSize:13,color:C.muted,fontWeight:700}}>reps</span>
        </div>
        {pushupMax>0&&<div style={{marginTop:10,background:`${C.purple}10`,border:`1px solid ${C.purple}20`,borderRadius:7,padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:C.muted}}>Per-round push-ups</span>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,color:C.purple}}>{Math.max(1,Math.floor(pushupMax/2))} reps</span>
        </div>}
        <div style={{fontSize:10,color:C.muted,marginTop:8,lineHeight:1.5}}>Test your max fresh, then enter it here. Update when your max improves.</div>
      </div>
    </div>

    {/* Units */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,fontSize:10,color:C.accent,letterSpacing:"0.1em"}}>UNITS</div>
      {[["kg","Kilograms (kg)"],["lbs","Pounds (lbs)"]].map(([v,l])=>(<div key={v} onClick={()=>setUnit(v)} style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:unit===v?C.accent+"0d":"transparent"}}>
        <span style={{fontSize:13,color:C.text}}>{l}</span>
        <div style={{width:18,height:18,borderRadius:"50%",background:unit===v?C.accent:"transparent",border:`2px solid ${unit===v?C.accent:C.muted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#0a0c0f"}}>{unit===v?"✓":""}</div>
      </div>))}
    </div>

    {/* Week selector */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,fontSize:10,color:C.accent,letterSpacing:"0.1em"}}>ACTIVE WEEK</div>
      {PROG.map((p,i)=>(<div key={i} onClick={()=>setWeekIdx(i)} style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:weekIdx===i?C.accent+"0d":"transparent"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,color:p.deload?C.blue:C.text}}>Wk {p.week} — {p.label}{p.deload?" (deload)":""}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{p.sets} sets · {p.intensity} · {p.hold}s iso hold</div></div>
          {weekIdx===i&&<span style={{fontSize:9,color:C.accent,fontWeight:700,letterSpacing:"0.08em",fontFamily:"'Oswald',sans-serif"}}>ACTIVE</span>}
        </div>
      </div>))}
    </div>

    {/* Schedule */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
      <div style={{fontSize:10,color:C.accent,letterSpacing:"0.1em",marginBottom:8}}>SCHEDULE</div>
      {[["Monday","Upper Body","TRICON lifting · 60 min",C.accent],["Wednesday","Lower Body","TRICON lifting · 60 min",C.blue],["Friday","KB Benchmark or Flow","AMRAP 30 min · or 3 Rounds For Time",C.purple]].map(([day,name,detail,col])=>(<div key={day} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:12,color:C.text,fontWeight:600}}>{day} — {name}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{detail}</div></div>
        <div style={{width:8,height:8,borderRadius:"50%",background:col}}/>
      </div>))}
    </div>

    {/* Storage */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
      <div style={{fontSize:10,color:C.accent,letterSpacing:"0.1em",marginBottom:8}}>DATA</div>
      <div style={{fontSize:11,color:C.sub,lineHeight:1.8}}>
        <div>Sessions saved: <span style={{color:C.green,fontWeight:700}}>{sessions.length}</span></div>
      </div>
      {sessions.length>0&&<button onClick={()=>{if(window.confirm("Clear all data? Cannot be undone.")){setSessions([]);setLastWeights({});}}} style={{marginTop:10,background:"rgba(224,82,82,0.1)",border:"1px solid rgba(224,82,82,0.25)",borderRadius:7,padding:"8px 14px",color:C.red,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Oswald',sans-serif",letterSpacing:"0.06em"}}>CLEAR ALL DATA</button>}
    </div>
  </div>);

  // ── Main shell ──
  return(<div style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:"'Oswald','Arial Narrow',sans-serif",overflow:"hidden"}}>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap" rel="stylesheet"/>
    <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      {screen==="calendar"?<CalendarScreen sessions={sessions} weekIdx={weekIdx} onStartWorkout={(t)=>t==="friday"?setScreen("fridaypicker"):startWorkout(t)}/>:
       screen==="stats"?<StatsScreen sessions={sessions} unit={unit}/>:
       screen==="library"?<LibraryScreen weekIdx={weekIdx} unit={unit}/>:
       screen==="settings"?renderSettings():
       /* HOME */
       <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
         <HomeHero sessions={sessions}/>
         {/* Mini week strip */}
         <div style={{display:"flex",gap:4,padding:"10px 14px 12px"}}>
           {weekDates.map((d,i)=>{
             const isT=d.toDateString()===new Date().toDateString();
             const done=sessions.some(s=>new Date(s.date).toDateString()===d.toDateString());
             const schedT=wfd[i];const isFri=schedT==="friday";
             const dotColor=done?C.green:isFri?C.purple:schedT?C.dim:"transparent";
             return(<div key={i} onClick={()=>setScreen("calendar")} style={{flex:1,background:isT?"rgba(200,169,110,0.13)":C.surface,border:`1px solid ${isT?"rgba(200,169,110,0.42)":C.border}`,borderRadius:7,padding:"7px 0",textAlign:"center",cursor:"pointer"}}>
               <div style={{fontSize:7,color:isT?C.accent:C.muted,letterSpacing:"0.05em",marginBottom:2}}>{DN[i]}</div>
               <div style={{fontSize:12,fontWeight:700,color:isT?C.accent:C.text}}>{d.getDate()}</div>
               <div style={{width:5,height:5,borderRadius:"50%",background:dotColor,margin:"3px auto 0"}}/>
             </div>);
           })}
         </div>

         {/* Today's workout CTA */}
         {todayKey==="friday"?(
           <div style={{margin:"0 14px 12px"}}>
             <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>TODAY — FRIDAY KETTLEBELL</div>
             <div style={{display:"flex",gap:8}}>
               {FRIDAY_WORKOUTS.map(t=>{const wk=WORKOUT_DEFS[t];return(
                 <div key={t} onClick={()=>startWorkout(t)} style={{flex:1,background:`${wk.color}12`,border:`1px solid ${wk.color}35`,borderRadius:12,padding:12,cursor:"pointer",textAlign:"center"}}>
                   <div style={{fontSize:9,color:wk.color,letterSpacing:"0.1em",fontWeight:700,marginBottom:4}}>{wk.label}</div>
                   <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:C.text,lineHeight:1.3,marginBottom:8,whiteSpace:"pre-line"}}>{t==="amrap"?"AMRAP\n30 MIN":"3 ROUNDS\nFOR TIME"}</div>
                   <div style={{background:wk.color,borderRadius:6,padding:"7px 0",fontFamily:"'Oswald',sans-serif",fontSize:11,fontWeight:700,color:t==="amrap"?"#fff":"#0a0c0f",letterSpacing:"0.1em"}}>START →</div>
                 </div>
               );})}
             </div>
           </div>
         ):todayKey?(
           <div onClick={()=>startWorkout(todayKey)} style={{margin:"0 14px 12px",background:`linear-gradient(135deg,${WORKOUT_DEFS[todayKey].color}18 0%,${WORKOUT_DEFS[todayKey].color}06 100%)`,border:`1px solid ${WORKOUT_DEFS[todayKey].color}40`,borderRadius:14,padding:16,cursor:"pointer"}}>
             <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
               <span style={{background:`${WORKOUT_DEFS[todayKey].color}28`,color:WORKOUT_DEFS[todayKey].color,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,letterSpacing:"0.1em"}}>{WORKOUT_DEFS[todayKey].label}</span>
               <span style={{fontSize:10,color:C.muted}}>Wk {prog.week} {prog.label}</span>
             </div>
             <div style={{fontFamily:"'Oswald',sans-serif",fontSize:19,fontWeight:600,color:C.text,marginBottom:3}}>{WORKOUT_DEFS[todayKey].name}</div>
             <div style={{color:C.muted,fontSize:11,marginBottom:12}}>{WORKOUT_DEFS[todayKey].duration} · {WORKOUT_DEFS[todayKey].method}</div>
             <div style={{background:WORKOUT_DEFS[todayKey].color,borderRadius:8,padding:11,textAlign:"center",fontFamily:"'Oswald',sans-serif",fontWeight:700,fontSize:14,color:"#0a0c0f",letterSpacing:"0.12em"}}>START WORKOUT →</div>
           </div>
         ):(
           <div style={{margin:"0 14px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,textAlign:"center"}}>
             <div style={{fontSize:26,marginBottom:6}}>🔋</div>
             <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,color:C.text,letterSpacing:"0.04em"}}>REST DAY</div>
             <div style={{color:C.muted,fontSize:11,marginTop:4,marginBottom:11}}>Recovery is where strength is built</div>
             <div style={{display:"flex",gap:7}}>
               {[["upper","UPPER",C.accent],["lower","LOWER",C.blue],["circuit","FLOW",C.green],["amrap","AMRAP",C.purple]].map(([t,l,col])=>(<div key={t} onClick={()=>startWorkout(t)} style={{flex:1,background:col+"12",border:`1px solid ${col}28`,borderRadius:7,padding:8,cursor:"pointer",fontSize:9,color:col,fontWeight:700,letterSpacing:"0.06em"}}>{l}</div>))}
             </div>
           </div>
         )}

         {/* Stats tiles */}
         <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"0 14px 14px"}}>
           <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:13}}><div style={{fontFamily:"'Oswald',sans-serif",fontSize:26,fontWeight:700,color:C.blue}}>{tw.length}</div><div style={{fontSize:11,color:C.text,marginTop:3}}>This Week</div><div style={{fontSize:10,color:C.muted}}>of 3 planned</div></div>
           <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:13}}><div style={{fontFamily:"'Oswald',sans-serif",fontSize:26,fontWeight:700,color:C.accent}}>{sessions.length}</div><div style={{fontSize:11,color:C.text,marginTop:3}}>All Time</div><div style={{fontSize:10,color:C.muted}}>sessions</div></div>
         </div>
       </div>}
    </div>
    {/* Tab bar */}
    <div style={{display:"flex",background:C.surface,borderTop:`1px solid ${C.border}`}}>
      {TABS.map(tab=>{const active=screen===tab.id||screen==="fridaypicker"&&tab.id==="calendar";return(<button key={tab.id} onClick={()=>setScreen(tab.id)} style={{flex:1,background:"none",border:"none",padding:"10px 0 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{fontSize:18,lineHeight:1,color:active?C.accent:C.muted}}>{tab.icon}</span>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:active?C.accent:C.muted}}>{tab.label}</span>
        {active&&<div style={{width:16,height:2,background:C.accent,borderRadius:1}}/>}
      </button>);})}
    </div>
  </div>);
}
