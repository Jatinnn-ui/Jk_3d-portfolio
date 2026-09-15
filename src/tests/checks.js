import {locations,projects} from '../data/portfolio.js';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function runChecks(ui,runtime){
  let passed=0;const failures=[];const check=(condition,message)=>{if(condition){passed++;console.info('PASS:',message);}else{failures.push(message);console.error('FAIL:',message);}};
  await wait(2100);
  check(document.querySelectorAll('.location-label').length===8,'Eight interactive landmark buttons');
  if(runtime){check(runtime.renderer.info.render.calls<150,'Scene draw-call budget <150');check(runtime.renderer.info.render.triangles<50000,'Scene triangle budget <50k');check(Number.isFinite(runtime.camera.position.x),'Finite camera coordinates');}
  document.getElementById('world-index').click();check(!document.getElementById('world-menu').hidden,'World index opens');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));check(document.getElementById('world-menu').hidden,'Escape closes navigation');
  for(const loc of locations){document.querySelector(`#menu-locations [data-location="${loc.id}"]`).click();check(ui.active===loc.id&&!document.getElementById('content-panel').hidden&&document.getElementById('panel-title').textContent.length>0,`${loc.category}: opens real content`);check(location.hash.startsWith('#'+loc.id),`${loc.category}: deep link updates`);document.getElementById('return-world').click();check(!ui.active&&document.getElementById('content-panel').hidden,`${loc.category}: returns to world`);}
  ui.navigate('projects');for(const p of projects){document.querySelector(`[data-project="${p.id}"]`).click();check(document.getElementById('panel-title').textContent===p.name,`Project tab: ${p.name}`);}
  check(!document.querySelector('#panel-body a[href="#"]'),'No placeholder project links');
  ui.navigate('contact');check(document.getElementById('panel-body').textContent.includes('Gurugram'),'Contact includes real location');check(!document.querySelector('#panel-body a[href="#"]'),'No broken contact actions');
  const before=ui.reduced;document.getElementById('motion-toggle').click();check(ui.reduced!==before,'Motion toggle works');document.getElementById('motion-toggle').click();ui.close();
  if(runtime){ui.navigate('about');await wait(1900);check(runtime.nav.transition===null,'Cinematic travel completes');check(runtime.camera.position.distanceTo(runtime.nav.homePosition)>1,'Camera physically travels to location');ui.close();await wait(1900);check(runtime.camera.position.distanceTo(runtime.nav.homePosition)<1,'Camera returns to overview');}
  check(document.documentElement.scrollWidth<=innerWidth+1,'No horizontal layout overflow');
  const params=new URLSearchParams(location.search);
  if(params.has('fallback')){ui.fallback('Lightweight view test: all portfolio content is available.');ui.navigate('about');check(!document.getElementById('fallback').hidden,'Fallback retains portfolio access');}
  const destination=params.get('inspect');if(destination)ui.navigate(destination);
  console.info(`TEST SUMMARY: ${passed} passed, ${failures.length} failed. Viewport ${innerWidth}×${innerHeight}.`);
  document.body.dataset.tests=failures.length?'failed':'passed';
}
