import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildWorld } from './build-world.js';
import { CameraNavigation } from '../camera/navigation.js';
import { createJourneyUI } from '../ui/journey.js';
import { locations } from '../data/portfolio.js';
export function startWorld(ui){
  const host=document.getElementById('scene');let mobile=innerWidth<=600;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.5));renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Scroll or swipe up to travel. Drag to orbit. Use plus and minus to zoom.');
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#101b22',.0038);
  // A small prefiltered studio environment gives glass and metals real reflections, once at startup.
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const environment=pmrem.fromScene(room,.02);scene.environment=environment.texture;scene.environmentIntensity=.34;room.dispose();pmrem.dispose();
  const camera=new THREE.PerspectiveCamera(37,innerWidth/innerHeight,.15,300);
  let viewShift=mobile?.115:.055,targetViewShift=viewShift;
  function framing(){camera.aspect=innerWidth/innerHeight;camera.setViewOffset(innerWidth,innerHeight,mobile?0:-innerWidth*.105,-innerHeight*viewShift,innerWidth,innerHeight);camera.updateProjectionMatrix();}
  framing();
  scene.add(new THREE.HemisphereLight('#c4d5e2','#27322a',1.25));
  const key=new THREE.DirectionalLight('#fff0d8',2.65);key.position.set(-16,27,15);key.castShadow=true;key.shadow.mapSize.set(mobile?512:1536,mobile?512:1536);Object.assign(key.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:.5,far:85});key.shadow.normalBias=.055;key.shadow.bias=-.0002;key.shadow.radius=3;scene.add(key);
  const rim=new THREE.DirectionalLight('#abc9dc',1.45);rim.position.set(10,14,-18);scene.add(rim);
  const world=buildWorld(scene,{mobile}),nav=new CameraNavigation(camera,renderer.domElement,mobile,ui.reduced),journey=createJourneyUI(ui,nav);
  const pointer=new THREE.Vector2(4,4),raycaster=new THREE.Raycaster();let dragging=false,down=null,hover=null,stopped=false,motion=!ui.reduced;
  const projectPoint=new THREE.Vector3();let lastPointer={x:0,y:0},pointerDirty=false;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};dragging=false;});
  renderer.domElement.addEventListener('pointermove',e=>{lastPointer={x:e.clientX,y:e.clientY};pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);pointerDirty=true;if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)dragging=true;});
  const pick=()=>{raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(world.hitTargets,false);return (hits.find(hit=>hit.object.userData.project)||hits[0])?.object.userData;};
  let pendingDetail=null;
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&!dragging&&!ui.active){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);const hit=pick();if(hit){ui.navigate(hit.location,hit.project);if(hit.project)pendingDetail={id:hit.location,project:hit.project};}}down=null;});
  renderer.domElement.addEventListener('pointerleave',()=>{down=null;pointer.set(4,4);pointerDirty=true;});renderer.domElement.addEventListener('pointercancel',()=>{down=null;dragging=false;});
  ui.labels.forEach(label=>{label.addEventListener('pointerenter',()=>world.highlight(label.dataset.location));label.addEventListener('pointerleave',()=>world.highlight(null));label.addEventListener('focus',()=>world.highlight(label.dataset.location));label.addEventListener('blur',()=>world.highlight(null));});
  ui.attachJourney((id,project)=>{if(!locations.some(l=>l.id===id))return;ui.dismiss();pendingDetail=null;nav.go(id,project);});
  ui.onNavigate(()=>{nav.targetProgress=nav.progress;world.highlight(null);hover=null;document.getElementById('hover-label').style.display='none';});
  ui.onHome(()=>journey.home());
  nav.onInput=()=>{ui.dismiss();pendingDetail=null;};
  ui.onMotion(reduced=>{motion=!reduced;nav.setReduced(reduced);});
  ui.onFallback(()=>{stopped=true;nav.dispose();journey.dispose();renderer.domElement.style.opacity='0';});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ui.fallback('The graphics connection was interrupted. Every portfolio chapter is still available below.');});
  function resize(){mobile=innerWidth<=600;renderer.setSize(innerWidth,innerHeight);framing();nav.resize(mobile);}
  window.addEventListener('resize',resize);
  let last=performance.now(),elapsed=0,frames=0,perfTime=0,samples=0,quality=0,raf,lastHighlight=null;
  const showLabel=document.getElementById('hover-label'),cameraMarker=document.getElementById('camera-indicator');
  function renderFrame(now){
    if(stopped)return;raf=requestAnimationFrame(frame);
    if(document.hidden){last=now;return;}
    const raw=Math.max(0,(now-last)/1000),delta=Math.min(raw,.05);last=now;elapsed+=motion?delta:0;
    nav.update(now,delta);const beat=nav.beat;
    targetViewShift=mobile?(ui.active?-.19:beat?-.14:.115):.055;
    if(Math.abs(viewShift-targetViewShift)>.0001){viewShift+=(targetViewShift-viewShift)*(1-Math.exp(-delta*(ui.reduced?20:3)));framing();}
    const highlight=beat?(beat.projectId||(/^(peak|fall)-/.test(beat.key)?beat.key:beat.locationId)):null;
    if(highlight!==lastHighlight){lastHighlight=highlight;world.highlight(highlight,true);}
    world.update(elapsed,delta,motion,beat?.locationId);journey.update(delta);
    if(pendingDetail&&Math.abs(nav.progress-nav.targetProgress)<.0003){const detail=pendingDetail;pendingDetail=null;ui.openDetails(detail.id,detail.project);}
    // Labels stay accessible in world/explore mode; guided mode introduces one chapter at a time.
    const labelsVisible=(!beat||nav.mode==='explore')&&!ui.active;
    ui.labels.forEach((label,i)=>{label.tabIndex=labelsVisible?0:-1;if(!labelsVisible){label.style.visibility='hidden';return;}const loc=locations[i];projectPoint.set(...loc.position).project(camera);const x=(projectPoint.x*.5+.5)*innerWidth+(loc.labelOffset?.[0]||0)*(mobile?.45:1),y=(-projectPoint.y*.5+.5)*innerHeight+(loc.labelOffset?.[1]||0)*(mobile?.5:1);label.style.left=`${Math.max(42,Math.min(innerWidth-42,x))}px`;label.style.top=`${y}px`;label.style.visibility=projectPoint.z>1||y<100||y>innerHeight-120?'hidden':'visible';});
    if(pointerDirty&&!down&&!ui.active){pointerDirty=false;const hit=pick(),id=hit?.project||hit?.location;if(id!==hover){hover=id;world.highlight(id);renderer.domElement.style.cursor=id?'pointer':'grab';}showLabel.style.display=id?'block':'none';if(id){showLabel.textContent=hit.project?hit.project.toUpperCase():locations.find(l=>l.id===hit.location).category.toUpperCase();showLabel.style.left=`${lastPointer.x+16}px`;showLabel.style.top=`${lastPointer.y-15}px`;}}
    const angle=Math.atan2(camera.position.x-nav.controls.target.x,camera.position.z-nav.controls.target.z);cameraMarker.setAttribute('transform',`translate(${56+Math.sin(angle)*45},${38+Math.cos(angle)*32}) rotate(${-angle*180/Math.PI})`);
    // Forest is a quieter interlude; lighting changes gently without rebuilding the scene.
    rim.intensity=THREE.MathUtils.damp(rim.intensity,beat?.locationId==='personal'?1.05:1.45,2,delta);
    renderer.render(scene,camera);
    if(frames>100&&raw>0&&raw<.5){perfTime+=raw;samples++;if(samples>=120){if(perfTime/samples>.035&&quality<2){quality++;renderer.setPixelRatio(Math.max(.8,renderer.getPixelRatio()*.8));if(quality===2)renderer.shadowMap.enabled=false;world.stars.geometry.setDrawRange(0,Math.floor(world.stars.geometry.attributes.position.count*.6));world.droplets.visible=quality<2;console.info(`World: adaptive quality ${quality}`);}samples=0;perfTime=0;}}
    frames++;
  }
  function frame(now){try{renderFrame(now);}catch(error){console.error('World runtime recovered to fallback:',error.stack);ui.fallback('The graphics renderer encountered a problem. Your portfolio is still available in lightweight view.');}}
  renderer.render(scene,camera);raf=requestAnimationFrame(frame);document.getElementById('scene-status').hidden=true;
  console.info(`World ready: ${renderer.info.render.calls} draw calls, ${renderer.info.render.triangles} triangles.`);
  return {renderer,scene,camera,world,nav,journey,get running(){return !stopped;},dispose(){stopped=true;cancelAnimationFrame(raf);nav.dispose();journey.dispose();window.removeEventListener('resize',resize);environment.dispose();renderer.dispose();}};
}
