import {profile,projects,skills,timeline,achievements,experiments,locations} from '../data/portfolio.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags=items=>`<div class="tags">${items.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
const safeLink=(url)=>{try{const u=new URL(url,location.href);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const link=(url,title)=>url&&safeLink(url)?`<a href="${esc(safeLink(url))}" ${String(url).startsWith('mailto:')?'':'target="_blank" rel="noopener noreferrer"'}>${title} ↗</a>`:'';
export function createInterface(){
  const labels=document.getElementById('location-labels'),menu=document.getElementById('world-menu'),panel=document.getElementById('content-panel'),body=document.getElementById('panel-body');
  let active=null,activeProject=null,returnFocus=null,isFallback=false,onNavigate=()=>{},onHome=()=>{},onMotion=()=>{},onFallback=()=>{};
  let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const number=id=>String(locations.findIndex(l=>l.id===id)+1).padStart(2,'0');
  const buttons=locations.map((l,i)=>`<button data-location="${l.id}"><span>${String(i+1).padStart(2,'0')}</span><span>${l.category}<small>${l.name}</small></span><span>↗</span></button>`).join('');
  document.getElementById('menu-locations').innerHTML=buttons;
  const simpleButton=document.createElement('button');simpleButton.className='text-link';simpleButton.textContent='Switch to lightweight view ↗';simpleButton.id='simple-view';menu.append(simpleButton);
  document.getElementById('fallback-locations').innerHTML=locations.map(l=>`<button data-location="${l.id}">${esc(l.category)}<small>${esc(l.description)}</small></button>`).join('');
  locations.forEach((l,i)=>{const button=document.createElement('button');button.className=`location-label ${l.secondary?'secondary':''}`;button.dataset.location=l.id;button.setAttribute('aria-label',`Explore ${l.category}: ${l.name}`);button.innerHTML=`<i></i><small>${String(i+1).padStart(2,'0')}</small>${esc(l.category.toUpperCase())}`;button.style.visibility='hidden';labels.append(button);
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',String(56+l.position[0]*2.5));dot.setAttribute('cy',String(38+l.position[2]*2));dot.setAttribute('r','1.6');dot.setAttribute('fill','#72908e');dot.dataset.map=l.id;document.getElementById('map-dots').append(dot);
  });
  function toggleMenu(force){const show=typeof force==='boolean'?force:menu.hidden;menu.hidden=!show;document.getElementById('menu-toggle').setAttribute('aria-expanded',String(show));document.getElementById('world-index').setAttribute('aria-expanded',String(show));if(show)menu.querySelector('button').focus();}
  function projectContent(id){const p=projects.find(p=>p.id===id)||projects[0];activeProject=p.id;return `<div class="project-tabs" role="group" aria-label="Featured projects">${projects.map((item,i)=>`<button data-project="${item.id}" class="${p.id===item.id?'active':''}" aria-pressed="${p.id===item.id}">${['MAYA','FORGE','CHESS','PIXEL'][i]}</button>`).join('')}</div><span class="project-number">0${projects.indexOf(p)+1}</span><p class="panel-kicker">${esc(p.subtitle)}</p><h2 id="panel-title">${esc(p.name)}</h2><p class="lead">${esc(p.description)}</p><p class="section-label">${p.id==='forge'?'AGENT ARCHITECTURE':p.id==='chess'?'AI BEHAVIOR':'KEY FUNCTIONALITY'}</p><p>${esc(p.functionality)}</p><p class="section-label">BUILT WITH</p>${tags(p.technologies)}<div class="panel-actions">${link(p.demoUrl,'Live Demo')}${link(p.githubUrl,'GitHub')}</div>`;}
  function content(id,projectId){
    switch(id){
      case 'about':return `<p class="panel-kicker">A builder, an explorer.</p><h2 id="panel-title">${profile.name}</h2><h3>${profile.role}</h3><p class="lead">${profile.statement}</p><p>${profile.bio}</p><span class="inline-status">${profile.status}</span><div class="panel-actions"><button data-location="projects">View Projects ↗</button><button data-location="contact">Contact Me</button></div>`;
      case 'projects':return projectContent(projectId);
      case 'experience':return `<p class="panel-kicker">Follow the current</p><h2 id="panel-title">A journey in building.</h2>${timeline.map(t=>`<article class="detail-block"><span class="date">${t.date}</span><h3>${t.title}</h3><p>${t.text}</p></article>`).join('')}`;
      case 'skills':return `<p class="panel-kicker">Built on solid ground</p><h2 id="panel-title">The tools. The thinking.</h2>${skills.map(s=>`<article class="detail-block"><h3>${s.name}</h3><p>${s.capability}</p>${tags(s.tools)}</article>`).join('')}`;
      case 'achievements':return `<p class="panel-kicker">Small steps, real progress</p><h2 id="panel-title">Milestones that matter.</h2>${achievements.map(a=>`<article class="detail-block"><span class="date">${a.date}</span><h3>${a.title}</h3><p>${a.text}</p></article>`).join('')}`;
      case 'personal':return `<p class="panel-kicker">Beyond the screen</p><h2 id="panel-title">Room to wander.</h2><p class="lead">Good ideas don’t always start at a keyboard.</p><p class="section-label">CREATIVE</p>${tags(['UI experimentation','3D web experiences','Cinematic web design'])}<p class="section-label">INTERESTS</p>${tags(['Photography','Music','Nature','Visual storytelling'])}<p class="section-label">CURRENTLY EXPLORING</p>${tags(['AI Engineering','AI Agents','Three.js / WebGL','Workflow Automation'])}`;
      case 'contact':return `<p class="panel-kicker">From one world to the next</p><h2 id="panel-title">Let’s build<br>something useful.</h2><p class="lead">I'm open to software development, AI engineering and interesting product opportunities.</p><p class="section-label">BASED IN</p><p style="color:var(--ink)">${profile.location}</p><span class="inline-status">${profile.status}</span><div class="panel-actions">${link(profile.email?`mailto:${profile.email}`:null,'Email')}${link(profile.github,'GitHub')}${link(profile.linkedin,'LinkedIn')}${link(profile.resume,'Resume')}</div>${!profile.email&&!profile.github&&!profile.linkedin?'<p class="section-label">CONTACT LINKS COMING SOON</p><p>Direct contact details have not been published yet.</p>':''}`;
      case 'lab':return `<p class="panel-kicker">A little off the map</p><h2 id="panel-title">Not finished.<br>Just getting interesting.</h2><p>Exploratory directions, not finished products.</p>${experiments.map(e=>`<article class="detail-block"><span class="date">${e.status.toUpperCase()}</span><h3>${e.name}</h3><p>${e.description}</p>${tags(e.technologies)}</article>`).join('')}`;
    }
  }
  function navigate(id,projectId,{hash=true,focus=true}={}){
    const loc=locations.find(l=>l.id===id);if(!loc)return;
    if(panel.hidden)returnFocus=document.activeElement;
    active=id;activeProject=id==='projects'?(projectId||projects[0].id):null;toggleMenu(false);
    body.innerHTML=content(id,activeProject);body.scrollTop=0;
    document.getElementById('panel-coordinate').textContent=`${number(id)} / ${loc.category.toUpperCase()} · ${loc.name.toUpperCase()}`;
    panel.hidden=false;document.body.classList.add('panel-open');labels.inert=true;document.getElementById('world-intro').inert=true;
    document.getElementById('current-location').textContent=loc.name.toUpperCase();document.getElementById('map-location').textContent=loc.category.toUpperCase();
    document.querySelectorAll('[data-map]').forEach(el=>{el.setAttribute('fill',el.dataset.map===id?'#def2dc':'#506c70');el.setAttribute('r',el.dataset.map===id?'2.8':'1.6');});
    if(hash)history.replaceState(null,'',`#${id}${activeProject?'/'+activeProject:''}`);
    onNavigate(loc,projects.find(p=>p.id===activeProject));
    if(focus){const title=document.getElementById('panel-title');title.tabIndex=-1;title.focus({preventScroll:true});}
  }
  function close({hash=true}={}){if(panel.hidden)return;panel.hidden=true;document.body.classList.remove('panel-open');labels.inert=false;document.getElementById('world-intro').inert=false;active=null;activeProject=null;document.getElementById('current-location').textContent='EXPLORE THE WORLD';document.getElementById('map-location').textContent='WORLD VIEW';document.querySelectorAll('[data-map]').forEach(el=>{el.setAttribute('fill','#72908e');el.setAttribute('r','1.6');});if(hash)history.replaceState(null,'',location.pathname+location.search);onHome();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
  document.addEventListener('click',e=>{const destination=e.target.closest('[data-location]');if(destination){navigate(destination.dataset.location);return;}const project=e.target.closest('[data-project]');if(project){navigate('projects',project.dataset.project,{focus:false});body.querySelector(`[data-project="${project.dataset.project}"]`)?.focus();return;}if(!menu.hidden&&!menu.contains(e.target)&&!e.target.closest('#menu-toggle,#world-index'))toggleMenu(false);});
  document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleMenu(true);});
  document.getElementById('menu-toggle').addEventListener('click',()=>toggleMenu());document.getElementById('world-index').addEventListener('click',()=>toggleMenu());
  document.getElementById('close-panel').addEventListener('click',()=>close());document.getElementById('return-world').addEventListener('click',()=>close());
  function updateMotion(){const b=document.getElementById('motion-toggle');b.setAttribute('aria-label',reduced?'Enable environmental motion':'Pause environmental motion');b.title=reduced?'Enable environmental motion':'Pause environmental motion';b.setAttribute('aria-pressed',String(reduced));b.innerHTML=reduced?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 6 9 6-9 6V6Z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 6v12M15 6v12"/></svg>';onMotion(reduced);}
  document.getElementById('motion-toggle').addEventListener('click',()=>{reduced=!reduced;updateMotion();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;updateMotion();});updateMotion();
  document.addEventListener('keydown',e=>{if(e.target.matches?.('input,textarea,select'))return;if(e.key==='Escape'){if(!menu.hidden){toggleMenu(false);document.getElementById('menu-toggle').focus();}else close();}if(e.key.toLowerCase()==='m'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();toggleMenu();}if(!menu.hidden&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const buttons=[...menu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}});
  function fallback(message='Lightweight view is on. Every chapter is still here.') {isFallback=true;onFallback();document.body.classList.add('fallback-mode');labels.hidden=true;document.getElementById('fallback').hidden=false;document.getElementById('fallback-message').textContent=message;document.getElementById('scene-status').hidden=true;toggleMenu(false);simpleButton.hidden=true;}
  simpleButton.addEventListener('click',()=>fallback());
  function route(){const [id,project]=location.hash.slice(1).split('/');if(locations.some(l=>l.id===id))navigate(id,project,{hash:false});else close({hash:false});}
  window.addEventListener('hashchange',route);
  return {navigate,close,fallback,route,get reduced(){return reduced;},get active(){return active;},get isFallback(){return isFallback;},onNavigate(fn){onNavigate=fn;},onHome(fn){onHome=fn;},onMotion(fn){onMotion=fn;},onFallback(fn){onFallback=fn;},labels:[...labels.children]};
}
