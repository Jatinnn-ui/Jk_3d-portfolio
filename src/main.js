import {createInterface} from './ui/interface.js';
window.addEventListener('error',event=>console.error('Runtime error:',event.error?.stack||event.message));
const ui=createInterface();
let runtime;
// UI is independent of WebGL and remains available even if the graphics CDN fails.
const deadline=setTimeout(()=>{if(!runtime){document.getElementById('scene-status').textContent='Taking a moment. World index is ready to explore.';}},5000);
try {
  const {startWorld}=await import('./world/renderer.js');
  if(!ui.isFallback)runtime=startWorld(ui);
} catch(error){
  console.warn('3D world unavailable; showing accessible portfolio.',error.message);
  ui.fallback('Your browser couldn’t open the 3D world. Explore the complete portfolio below.');
} finally {
  clearTimeout(deadline);ui.route();
}
// Explicit opt-in development tests; never run during ordinary visits.
if(new URLSearchParams(location.search).has('selftest')){
  const {runChecks}=await import('./tests/checks.js');await runChecks(ui,runtime);
}
