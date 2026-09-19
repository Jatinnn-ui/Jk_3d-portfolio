import {locations,projects,skills} from '../data/portfolio.js';
import {waypoints,sections,beatAt,progressFor} from '../data/journey.js';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function runChecks(ui,runtime){
  let passed=0;const failures=[];const check=(condition,message)=>{if(condition){passed++;console.info('PASS:',message);}else{failures.push(message);console.error('FAIL:',message);}};
  const params=new URLSearchParams(location.search);
  await wait(300);
  check(document.querySelectorAll('.location-label').length===8,'Eight accessible landmark buttons');
  document.getElementById('world-index').click();check(!document.getElementById('world-menu').hidden,'World index opens');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));check(document.getElementById('world-menu').hidden,'Escape closes world index');
  if(runtime){
    const {nav,journey,camera,world,renderer,scene}=runtime;let simTime=performance.now();
    const advance=(n=180)=>{for(let i=0;i<n;i++){simTime+=1000/60;nav.update(simTime,1/60);}journey.update(.6);};
    const settle=()=>{for(let i=0;i<2400;i++){simTime+=1000/60;nav.update(simTime,1/60);if(Math.abs(nav.progress-nav.targetProgress)<.00009&&!nav.blend)break;}journey.update(.6);};
    let objectCount=0;scene.traverse(()=>objectCount++);
    check(renderer.info.render.calls<150,'Rendering budget: fewer than 150 draw calls');check(renderer.info.render.triangles<95000,'Rendering budget: fewer than 95k visible triangles');
    check(waypoints.every((w,i)=>!i||w.progress>waypoints[i-1].progress),'Waypoint progress is strictly increasing');
    check(sections.every((s,i)=>!i||s.from===sections[i-1].to),'Eight section ranges are contiguous');
    check(waypoints.every(w=>w.position.length===3&&w.lookAt.length===3&&Number.isFinite(w.fov)),'All waypoints have camera, gaze and FOV data');
    for(const loc of locations){
      document.querySelector(`#menu-locations [data-location="${loc.id}"]`).click();check(Math.abs(nav.targetProgress-progressFor(loc.id))<.00001,`${loc.category}: direct navigation targets scroll progress`);settle();
      check(nav.beat?.locationId===loc.id&&!document.getElementById('journey-card').hidden,`${loc.category}: content activates at its route stop`);
      check(location.hash.startsWith('#'+loc.id),`${loc.category}: shareable URL synchronized`);
      document.getElementById('journey-details').click();check(ui.active===loc.id&&document.getElementById('panel-title')?.textContent.length>0,`${loc.category}: full details accessible`);ui.dismiss();
    }
    for(const p of projects){ui.navigate('projects',p.id);settle();check(document.getElementById('journey-title').textContent===p.name,`Individual building showcase: ${p.name}`);}
    for(let i=0;i<skills.length;i++){nav.targetProgress=waypoints.find(w=>w.key==='peak-'+i).progress;settle();check(document.getElementById('journey-title').textContent===skills[i].name,`Individual skill peak: ${skills[i].name}`);}
    for(let i=0;i<3;i++){nav.targetProgress=waypoints.find(w=>w.key==='experience-'+i).progress;settle();check(nav.beat.index===i,`River milestone ${i+1} activates independently`);}
    const sampleA=nav.sample(.65),sampleB=nav.sample(.2),sampleC=nav.sample(.65);check(sampleA.position.distanceTo(sampleC.position)<1e-9&&sampleA.target.distanceTo(sampleC.target)<1e-9,'Same progress has identical geometry in either scroll direction');
    nav.home();settle();const beforeScroll=camera.position.clone();
    const wheel=new WheelEvent('wheel',{deltaY:480,bubbles:true,cancelable:true});renderer.domElement.dispatchEvent(wheel);check(wheel.defaultPrevented&&nav.targetProgress>0,'Real wheel event advances virtual progress, not the page');settle();check(camera.position.distanceTo(beforeScroll)>.1,'Wheel progress physically moves the camera');
    const previous=nav.progress;renderer.domElement.dispatchEvent(new WheelEvent('wheel',{deltaY:-240,bubbles:true,cancelable:true}));settle();check(nav.progress<previous,'Upward scrolling retraces the route');check(window.scrollY===0,'Document remains fixed while camera travels');
    nav.progress=.62;nav.targetProgress=.78;nav.programmatic=false;nav.blend=null;nav.update(simTime,0);let maxDistance=0;
    for(let i=0;i<240;i++){const position=camera.position.clone();nav.update(simTime+i*1000/60,1/60);maxDistance=Math.max(maxDistance,position.distanceTo(camera.position));}
    check(maxDistance<.5,'World-space speed cap prevents violent mountain transitions');
    document.getElementById('zoom-in').click();check(nav.mode==='explore','Zoom enters temporary free-explore mode');const explored=camera.position.clone();nav.input(120);check(nav.mode==='guided'&&!!nav.blend,'Scroll resumes guided mode with a blend');check(camera.position.distanceTo(explored)<1e-9,'Resuming does not teleport the camera');settle();
    nav.orbit(30,5);check(nav.mode==='explore','Drag/orbit leaves the route temporarily');nav.input(100);settle();check(nav.mode==='guided','Scrolling restores the cinematic route after orbit');
    const prior=nav.targetProgress;const touch=(type,x,y)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:[{clientX:x,clientY:y}]});renderer.domElement.dispatchEvent(e);};
    touch('touchstart',150,450);touch('touchmove',152,370);touch('touchend',152,370);check(nav.targetProgress>prior,'Vertical touch swipe advances the journey');
    touch('touchstart',150,450);touch('touchmove',205,452);touch('touchend',205,452);check(nav.mode==='explore','Horizontal touch swipe orbits the world');nav.input(1);settle();
    const savedReduced=ui.reduced;if(!ui.reduced)document.getElementById('motion-toggle').click();advance(60);const still=camera.position.clone();ui.navigate('lab');settle();check(camera.position.distanceTo(still)<.01&&nav.beat.locationId==='lab','Reduced motion keeps camera still while content navigation works');if(ui.reduced!==savedReduced)document.getElementById('motion-toggle').click();
    const oldTarget=nav.targetProgress;const zoomEvent=new WheelEvent('wheel',{deltaY:300,ctrlKey:true,bubbles:true,cancelable:true});renderer.domElement.dispatchEvent(zoomEvent);check(!zoomEvent.defaultPrevented&&nav.targetProgress===oldTarget,'Browser Ctrl+wheel zoom is preserved');
    document.getElementById('world-home').click();settle();check(nav.progress===0&&nav.targetProgress===0&&!ui.active,'WORLD resets route and content without reloading');check(camera.position.distanceTo(nav.homePosition)<.02,'WORLD smoothly returns to complete overview');
    nav.home();settle();document.getElementById('journey-next').click();settle();check(nav.beat.locationId==='about','Next discovery control works without scrolling');
    const slider=document.getElementById('journey-progress');slider.value='895';slider.dispatchEvent(new Event('input',{bubbles:true}));settle();check(nav.beat.locationId==='contact','Accessible progress slider controls the actual route');
    history.replaceState(null,'','#projects/forge');ui.route();settle();check(nav.beat.projectId==='forge','Project deep link targets the correct building');
    let afterCount=0;scene.traverse(()=>afterCount++);check(afterCount===objectCount,'Scene object count remains stable across the entire journey');
    check(!document.querySelector('#journey-card a[href="#"]'),'Missing URLs never create dummy project links');
    nav.home();settle();await wait(100);
    if(params.get('inspect')){ui.navigate(params.get('inspect'),params.get('project')||undefined);settle();if(params.has('detail'))ui.openDetails(params.get('inspect'),params.get('project')||undefined);await wait(1700);}
  }else{check(ui.isFallback,'Unavailable WebGL has an accessible fallback');}
  check(document.documentElement.scrollWidth<=innerWidth+1,'No horizontal viewport overflow');
  if(params.has('fallback')){ui.fallback('Lightweight view: every portfolio chapter is still available.');ui.navigate('about');check(!document.getElementById('fallback').hidden&&ui.active==='about','Fallback retains full portfolio access');}
  console.info(`TEST SUMMARY: ${passed} passed, ${failures.length} failed. Viewport ${innerWidth}×${innerHeight}.`);
  document.body.dataset.tests=failures.length?'failed':'passed';document.body.dataset.testFailures=failures.join('; ');
}
