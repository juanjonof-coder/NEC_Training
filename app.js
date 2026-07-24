
const D=window.COURSE_DATA; let current=+(localStorage.necModule||1);
let done=JSON.parse(localStorage.necDone||"[]"); let view="module";
const $=s=>document.querySelector(s);
function save(){localStorage.necModule=current;localStorage.necDone=JSON.stringify(done)}
function nav(){
 const n=$("#moduleNav");n.innerHTML="";
 D.modules.forEach(m=>{let b=document.createElement("button");b.className=m.id===current?"active":"";
 b.innerHTML=`<strong>${m.id}. ${m.title}</strong><br><small class="muted">${done.includes(m.id)?"Completed":"Not completed"}</small>`;
 b.onclick=()=>{current=m.id;view="module";save();render()};n.appendChild(b)});
 $("#progress").style.width=(done.length/D.modules.length*100)+"%";
 $("#progressText").textContent=`${done.length} of ${D.modules.length} modules completed`;
}
function setTabs(){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===view))}
function moduleView(){
 const m=D.modules.find(x=>x.id===current);
 const related=D.scenarios.filter(s=> {
   const key=m.title.toLowerCase();
   return s.topic.toLowerCase().includes(key.split(" ")[0]) || 
    (key.includes("tray")&&s.topic==="Cable Tray")||(key.includes("raceway")&&s.topic==="Raceways")||
    (key.includes("motor")&&s.topic==="Motors")||(key.includes("ground")&&s.topic.includes("250"))||
    (key.includes("working")&&s.topic==="Working Space")||(key.includes("conductor")&&s.topic==="Conductors")||
    (key.includes("transformer")&&s.topic==="Transformers")||(key.includes("hazard")&&s.topic==="Hazardous Locations")||
    (key.includes("review")&&s.topic==="EPC Review");
 }).slice(0,10);
 $("#content").innerHTML=`
 <section class="card"><span class="badge">Module ${m.id}</span><span class="badge">${m.references}</span>
 <h2>${m.title}</h2><p>${m.description}</p></section>
 <section class="card"><h3>Learning objectives</h3><ul>${m.objectives.map(x=>`<li>${x}</li>`).join("")}</ul></section>
 <section class="card"><h3>How to study this module</h3><ol>${m.workflow.map(x=>`<li>${x}</li>`).join("")}</ol>
 <div class="ref warning"><strong>Required code habit:</strong> Open the adopted NEC edition while studying. Read the article scope first, then definitions, rule, exceptions, tables, and referenced sections. Do not rely on this course as code text.</div></section>
 <section class="card"><h3>Applied challenges</h3>${related.length?related.map(s=>scenarioCard(s)).join(""):"<p class='muted'>Use the Scenario Bank and filter by this topic.</p>"}</section>
 <button class="action" onclick="toggleDone()">${done.includes(m.id)?"Mark incomplete":"Mark module complete"}</button>`;
}
function scenarioCard(s){
 return `<article class="card"><span class="badge">${s.topic}</span><span class="badge">${s.category}</span>
 <div class="question">${s.question}</div>
 <button class="action secondary" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">Show answer</button>
 <div class="answer"><p>${s.answer}</p><div class="ref"><strong>Reference trail:</strong> ${s.references}</div></div></article>`;
}
function bankView(){
 $("#content").innerHTML=`<section class="card"><h2>Real-World Scenario Bank</h2>
 <p class="muted">${D.scenarios.length} original EPC scenarios. Search by topic, equipment, condition, article, or phrase.</p>
 <input class="search" id="search" placeholder="Search: 750 kcmil, tray, 110.26, transformer, pull box...">
 <select id="topic"><option value="">All topics</option>${[...new Set(D.scenarios.map(x=>x.topic))].sort().map(x=>`<option>${x}</option>`).join("")}</select></section>
 <div id="results"></div>`; $("#search").oninput=filter;$("#topic").onchange=filter;filter();
}
function filter(){
 let q=$("#search").value.toLowerCase(),t=$("#topic").value;
 let a=D.scenarios.filter(s=>(!t||s.topic===t)&&(!q||JSON.stringify(s).toLowerCase().includes(q)));
 $("#results").innerHTML=`<p class="muted">${a.length} matches</p><div class="scenario-grid">${a.map(s=>scenarioCard(s)).join("")}</div>`;
}
function quizView(){
 let pool=[...D.scenarios].sort(()=>Math.random()-.5).slice(0,15);
 window.quizPool=pool;
 $("#content").innerHTML=`<section class="card"><h2>15-Question Applied Quiz</h2>
 <p>Choose the best first response. The purpose is code navigation and engineering judgment, not memorizing exact wording.</p></section>`+
 pool.map((s,i)=>{
  let wrong=D.scenarios.filter(x=>x.id!==s.id).sort(()=>Math.random()-.5).slice(0,2).map(x=>x.answer);
  let opts=[s.answer,...wrong].sort(()=>Math.random()-.5);
  return `<section class="card" data-answer="${encodeURIComponent(s.answer)}"><div class="question">${i+1}. ${s.question}</div>
  ${opts.map(o=>`<label class="option"><input type="radio" name="q${i}" value="${encodeURIComponent(o)}"> ${o}</label>`).join("")}
  <div class="ref"><strong>Where to look:</strong> ${s.references}</div></section>`;
 }).join("")+`<button class="action" onclick="grade()">Grade quiz</button><div id="grade" class="card"></div>`;
}
function grade(){
 let score=0;document.querySelectorAll("#content section[data-answer]").forEach((c,i)=>{
  let a=c.dataset.answer,sel=c.querySelector("input:checked");
  c.querySelectorAll(".option").forEach(l=>{l.classList.remove("correct","incorrect");if(l.querySelector("input").value===a)l.classList.add("correct")});
  if(sel){if(sel.value===a)score++;else sel.parentElement.classList.add("incorrect")}
 });$("#grade").innerHTML=`<h3>Score: ${score}/15</h3><p>${score>=12?"Strong result. Review the reference trail for any missed items.":"Review each highlighted answer and open the listed NEC articles before retaking."}</p>`;
}
function refsView(){
 const rows=[
 ["General equipment installation","Article 110","Listing, ratings, terminals, fault duty, markings, working space"],
 ["Overcurrent protection","Article 240","Conductor protection, taps, standard sizes, coordination"],
 ["Grounding and bonding","Article 250","System grounding, bonding, EGCs, separately derived systems"],
 ["General wiring methods","Article 300","Environment, grouping, physical protection, penetrations"],
 ["Conductors","Article 310","Ampacity, derating, terminals, parallel conductors"],
 ["Cabinets and boxes","Articles 312 and 314","Wire bending, cabinet entries, pull-box sizing"],
 ["Cable trays","Article 392","Permitted cables, fill, ampacity, supports, bonding"],
 ["Motors and VFDs","Article 430","Conductors, overloads, short-circuit protection, disconnects"],
 ["Industrial control panels","Article 409","SCCR, markings, supply arrangements"],
 ["Transformers","Article 450","Protection, ventilation, installation"],
 ["Hazardous locations","Articles 500–505","Classification, equipment, wiring methods, seals"],
 ["Emergency/standby","Articles 700–702, 708","Classification, transfer, separation, reliability"],
 ["Raceway fill","Chapter 9 and Annex C","Areas, dimensions, conductor counts"],
 ["Tray installation practice","NEMA VE 2","Supports, installation geometry, transitions, field practices"],
 ["Cable bend and pull limits","Cable manufacturer / ICEA guidance","Minimum radius, maximum pulling tension, sidewall pressure"],
 ["Equipment entry and service space","Manufacturer manual","Cable compartments, lug orientation, ventilation, removal access"]
 ];
 $("#content").innerHTML=`<section class="card"><h2>Reference Map</h2><p>Use this as the first-stop index. It tells you where to begin, not where to stop.</p></section>`+
 rows.map(r=>`<section class="card"><h3>${r[0]}</h3><span class="badge">${r[1]}</span><p>${r[2]}</p></section>`).join("");
}
function toggleDone(){done=done.includes(current)?done.filter(x=>x!==current):[...done,current];save();render()}
function render(){nav();setTabs();({module:moduleView,bank:bankView,quiz:quizView,refs:refsView})[view]()}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{view=b.dataset.view;render()});render();
