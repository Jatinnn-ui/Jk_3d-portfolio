import {profile,projects,skills,timeline,achievements,experiments,locations} from '../data/portfolio.js';
import {waypoints} from '../data/journey.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags=list=>`<div class="tags">${list.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;
const heading=s=>`<h2 id="journey-title">${s}</h2>`;
const link=(url,label)=>{if(!url)return '';try{const u=new URL(url,location.href);return ['http:','https:','mailto:'].includes(u.protocol)?`<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`:'';}catch{return '';}};
export function createJourneyUI(ui,nav){
  const card=document.getElementById('journey-card'),copy=document.getElementById('journey-copy'),indicator=document.getElementById('journey-indicator'),slider=document.getElementById('journey-progress'),mode=document.getElementById('journey-mode');
  let currentKey=null,currentBeat=null,age=0,lastMode=null,lastSection=null;
  const stops=waypoints.filter(w=>w.key&&w.key!=='ending');
  function render(beat){
    const id=beat.locationId;let text='',sub='';
    switch(id){
      case 'about':text=heading(profile.name)+`<h3>${profile.role}</h3><p class="journey-lead">${profile.statement}</p><p>${profile.bio}</p><span class="inline-status">${profile.status}</span><div class="journey-actions"><button data-location="projects">View Projects ↗</button><button data-location="contact">Contact Me</button></div>`;break;
      case 'projects':{const p=projects.find(p=>p.id===beat.projectId);text=`<p class="discovery-type">${p.subtitle}</p>`+heading(p.name)+`<p class="journey-lead">${p.description}</p>${tags(p.technologies)}<div class="journey-actions">${link(p.demoUrl,'View Project')}${link(p.githubUrl,'GitHub')}</div>`;sub=`0${projects.indexOf(p)+1} / 04`;break;}
      case 'experience':{const t=timeline[beat.index];text=`<p class="discovery-type">${t.date}</p>`+heading(t.title)+`<p class="journey-lead">${t.text}</p>`;sub=`0${beat.index+1} / 03`;break;}
      case 'skills':{const s=skills[beat.index];text=`<p class="discovery-type">PEAK 0${beat.index+1}</p>`+heading(s.name)+`<p>${s.capability}</p>${tags(s.tools)}`;sub=`0${beat.index+1} / 05`;break;}
      case 'achievements':{const a=achievements[beat.index];text=`<p class="discovery-type">${a.date}</p>`+heading(a.title)+`<p class="journey-lead">${a.text}</p>`;sub=`0${beat.index+1} / 02`;break;}
      case 'personal':text=heading('Room to wander.')+`<p class="journey-lead">Good ideas don’t always start at a keyboard.</p><p>Photography. Music. Nature. Visual storytelling.</p>${tags(['Creative interfaces','Three.js / WebGL','AI Engineering'])}`;break;
      case 'contact':text=heading('Let’s build<br>something useful.')+`<p class="journey-lead">I'm open to software development, AI engineering and interesting product opportunities.</p><p>${profile.location}</p><span class="inline-status">${profile.status}</span><div class="journey-actions">${link(profile.email?'mailto:'+profile.email:null,'Email')}${link(profile.github,'GitHub')}${link(profile.linkedin,'LinkedIn')}${link(profile.resume,'Resume')}</div>${!profile.email&&!profile.github?'<p class="unpublished-note">Direct contact links have not been published yet.</p>':''}`;break;
      case 'lab':text=heading(beat.ending?'The world keeps growing.':'A little beyond<br>the familiar.')+`<p class="journey-lead">Experiments. Prototypes. Ideas in motion.</p>${experiments.slice(0,3).map(e=>`<p class="lab-line"><span>${e.name}</span><small>${e.status}</small></p>`).join('')}`;break;
    }
    copy.innerHTML=text;copy.scrollTop=0;document.getElementById('journey-substep').textContent=sub;
    document.getElementById('journey-kicker').textContent=`${String(beat.sectionIndex+1).padStart(2,'0')} / ${locations.find(l=>l.id===id).name.toUpperCase()}`;
    document.getElementById('journey-details').textContent=id==='projects'?'Full project details ↗':id==='skills'?'All capabilities ↗':'Explore this chapter ↗';
  }
  const home=()=>{ui.dismiss();nav.home();currentKey=null;history.replaceState(null,'',location.pathname+location.search);};
  document.getElementById('world-home').addEventListener('click',home);
  document.querySelector('.identity').addEventListener('click',e=>{e.preventDefault();home();});
  document.getElementById('journey-details').addEventListener('click',()=>{if(currentBeat){nav.targetProgress=nav.progress;ui.openDetails(currentBeat.locationId,currentBeat.projectId);}});
  document.getElementById('zoom-in').addEventListener('click',()=>nav.zoom(.9));document.getElementById('zoom-out').addEventListener('click',()=>nav.zoom(1.1));
  mode.addEventListener('click',()=>{if(nav.mode==='explore')nav.resume();else nav.explore();});
  slider.addEventListener('input',()=>{nav.resume();nav.targetProgress=Number(slider.value)/1000;nav.programmatic=true;nav.onInput();});
  const step=direction=>{nav.resume();const next=direction>0?stops.find(s=>s.progress>nav.progress+.009):[...stops].reverse().find(s=>s.progress<nav.progress-.009);nav.targetProgress=next?.progress??(direction>0?1:0);nav.programmatic=true;nav.onInput();};
  document.getElementById('journey-next').addEventListener('click',()=>step(1));document.getElementById('journey-previous').addEventListener('click',()=>step(-1));
  function update(delta){
    const beat=nav.beat,p=nav.progress,key=beat?beat.key+(beat.ending?'-end':''):null;
    document.body.classList.toggle('journey-active',!!beat);document.body.classList.toggle('explore-mode',nav.mode==='explore');
    if(lastMode!==nav.mode){lastMode=nav.mode;mode.textContent=nav.mode==='explore'?'EXPLORE MODE':'GUIDED MODE';mode.setAttribute('aria-label',nav.mode==='explore'?'Resume guided journey':'Switch to free exploration');document.getElementById('current-location').textContent=nav.mode==='explore'?'SCROLL TO RESUME':p>.99?'A WORLD OF POSSIBILITIES':'SCROLL TO EXPLORE';}
    if(document.activeElement!==slider)slider.value=String(Math.round(p*1000));slider.setAttribute('aria-valuetext',`${Math.round(p*100)} percent, ${beat?.locationId||'world overview'}`);
    if(key!==currentKey){currentKey=key;currentBeat=beat;age=0;if(beat){render(beat);const hash=`#${beat.locationId}${beat.projectId?'/'+beat.projectId:''}`;if(!ui.active)history.replaceState(null,'',hash);}else{card.hidden=true;document.getElementById('journey-region').textContent='WORLD VIEW';document.getElementById('journey-chapter').innerHTML='00 <span>/ 08</span>';}}
    age+=delta;
    if(beat){const category=locations.find(l=>l.id===beat.locationId).category;document.getElementById('journey-chapter').innerHTML=`${String(beat.sectionIndex+1).padStart(2,'0')} <span>/ 08</span>`;document.getElementById('journey-region').textContent=category.toUpperCase();
      if(lastSection!==beat.locationId){lastSection=beat.locationId;document.getElementById('chapter-announcement').textContent=`Chapter ${beat.sectionIndex+1} of 8: ${category}`;document.getElementById('map-location').textContent=category.toUpperCase();document.querySelectorAll('[data-map]').forEach(dot=>{const active=dot.dataset.map===beat.locationId;dot.setAttribute('fill',active?'#e1ecdb':'#607779');dot.setAttribute('r',active?'2.8':'1.6');});}
      const distance=Math.abs(p-beat.progress),settled=Math.abs(nav.targetProgress-p)<.003;
      const reveal=nav.mode==='explore'||settled?1:Math.max(0,Math.min(1,(.057-distance)/.027));
      const opacity=Math.min(1,Math.max(0,(age-.12)/.28))*reveal;
      card.hidden=!!ui.active;card.style.opacity=String(opacity);card.style.transform=`translateY(${(1-opacity)*9}px)`;card.inert=opacity<.4||!!ui.active;
    }else{lastSection=null;}
    indicator.dataset.mode=nav.mode;
  }
  return {update,home,get beat(){return currentBeat;},dispose(){card.hidden=true;indicator.hidden=true;document.getElementById('exploration-controls').hidden=true;document.body.classList.remove('journey-active','explore-mode');}};
}
