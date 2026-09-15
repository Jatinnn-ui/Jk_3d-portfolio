import * as THREE from 'three';
import { buildWorld } from './build-world.js';
import { CameraNavigation } from '../camera/navigation.js';
import { locations } from '../data/portfolio.js';
export function startWorld(ui){
  const host=document.getElementById('scene');let mobile=innerWidth<=600;
  const renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.7));renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Floating island. Drag to orbit, or use the World index to explore.');
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#0b151c',.0045);
  const camera=new THREE.PerspectiveCamera(37,innerWidth/innerHeight,.1,350);
  let viewShift=mobile?.115:.055,targetViewShift=viewShift;
  function framing(){camera.aspect=innerWidth/innerHeight;camera.setViewOffset(innerWidth,innerHeight,mobile?0:-innerWidth*.105,-innerHeight*viewShift,innerWidth,innerHeight);camera.updateProjectionMatrix();}
  framing();
  scene.add(new THREE.HemisphereLight('#c6dcdd','#263a40',1.55));
  const key=new THREE.DirectionalLight('#ecede0',3.35);key.position.set(-18,30,12);key.castShadow=!mobile;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-23;key.shadow.camera.right=23;key.shadow.camera.top=23;key.shadow.camera.bottom=-23;key.shadow.camera.near=.5;key.shadow.camera.far=85;key.shadow.normalBias=.055;key.shadow.bias=-.00025;key.shadow.radius=3;scene.add(key);
  const rim=new THREE.DirectionalLight('#98cbd5',1.8);rim.position.set(10,10,-20);scene.add(rim);
  const world=buildWorld(scene,{mobile});const nav=new CameraNavigation(camera,renderer.domElement,mobile,ui.reduced);
  const pointer=new THREE.Vector2(4,4),raycaster=new THREE.Raycaster();let dragging=false,down=null,hover=null,stopped=false,motion=!ui.reduced;
  const projectPoint=new THREE.Vector3();let lastPointer={x:0,y:0},pointerDirty=false;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};dragging=false;});
  renderer.domElement.addEventListener('pointermove',e=>{lastPointer={x:e.clientX,y:e.clientY};pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);pointerDirty=true;if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)dragging=true;});
  const pick=()=>{raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(world.hitTargets,false);return (hits.find(hit=>hit.object.userData.project)||hits[0])?.object.userData;};
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&!dragging&&!ui.active){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);const hit=pick();if(hit)ui.navigate(hit.location,hit.project);}down=null;});
  renderer.domElement.addEventListener('pointerleave',()=>{down=null;pointer.set(4,4);pointerDirty=true;});
  renderer.domElement.addEventListener('pointercancel',()=>{down=null;dragging=false;});
  ui.labels.forEach(label=>{label.addEventListener('pointerenter',()=>world.highlight(label.dataset.location));label.addEventListener('pointerleave',()=>world.highlight(null));label.addEventListener('focus',()=>world.highlight(label.dataset.location));label.addEventListener('blur',()=>world.highlight(null));});
  ui.onNavigate((loc,project)=>{targetViewShift=mobile?-.19:.055;nav.go(loc,project);world.highlight(project?.id||loc.id,true);world.highlight(null);hover=null;document.getElementById('hover-label').style.display='none';});
  ui.onHome(()=>{targetViewShift=mobile?.115:.055;nav.home();world.highlight(null,true);});
  ui.onMotion(reduced=>{motion=!reduced;nav.setReduced(reduced);});
  ui.onFallback(()=>{stopped=true;nav.controls.dispose();renderer.domElement.style.opacity='0';});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ui.fallback('The 3D connection was interrupted. All portfolio content remains available below.');});
  function resize(){mobile=innerWidth<=600;targetViewShift=mobile?(ui.active?-.19:.115):.055;renderer.setSize(innerWidth,innerHeight);framing();nav.resize(mobile);if(!ui.active)nav.home();}
  window.addEventListener('resize',resize);
  let last=performance.now(),elapsed=0,frames=0,perfTime=0,quality=0,raf;
  const showLabel=document.getElementById('hover-label'),cameraMarker=document.getElementById('camera-indicator');
  function frame(now){
    if(stopped)return;raf=requestAnimationFrame(frame);
    if(document.hidden){last=now;return;}
    const raw=Math.max(0,(now-last)/1000),delta=Math.min(raw,.05);last=now;elapsed+=motion?delta:0;
    if(Math.abs(viewShift-targetViewShift)>.0001){viewShift+=(targetViewShift-viewShift)*Math.min(1,delta*(ui.reduced?30:3));framing();}
    nav.update(now,delta);world.update(elapsed,delta,motion);
    // Position real HTML buttons over their physical landmarks.
    if(!ui.active)ui.labels.forEach((label,i)=>{const loc=locations[i];projectPoint.set(...loc.position).project(camera);const x=(projectPoint.x*.5+.5)*innerWidth+(loc.labelOffset?.[0]||0)*(mobile?.45:1),y=(-projectPoint.y*.5+.5)*innerHeight+(loc.labelOffset?.[1]||0)*(mobile?.5:1);label.style.left=`${Math.max(42,Math.min(innerWidth-42,x))}px`;label.style.top=`${y}px`;label.style.visibility=projectPoint.z>1||y<100||y>innerHeight-115?'hidden':'visible';});
    if(pointerDirty&&!down&&!ui.active){pointerDirty=false;const hit=pick(),id=hit?.project||hit?.location;if(id!==hover){hover=id;world.highlight(id);renderer.domElement.style.cursor=id?'pointer':'grab';}showLabel.style.display=id?'block':'none';if(id){showLabel.textContent=hit.project?hit.project.toUpperCase():locations.find(l=>l.id===hit.location).category.toUpperCase();showLabel.style.left=`${lastPointer.x+16}px`;showLabel.style.top=`${lastPointer.y-15}px`;}}
    const angle=Math.atan2(camera.position.x-nav.controls.target.x,camera.position.z-nav.controls.target.z);cameraMarker.setAttribute('transform',`translate(${56+Math.sin(angle)*45},${38+Math.cos(angle)*32}) rotate(${-angle*180/Math.PI})`);
    renderer.render(scene,camera);
    // Adapt after a stable sample, without reacting to one slow initialization frame.
    if(frames>90&&raw<.5){perfTime+=raw;if(frames%120===0){const average=perfTime/120;if(average>.033&&quality<2){quality++;renderer.setPixelRatio(Math.max(.8,renderer.getPixelRatio()*.76));renderer.shadowMap.enabled=false;world.stars.geometry.setDrawRange(0,Math.floor(world.stars.geometry.attributes.position.count*.6));world.droplets.visible=quality<2;console.info(`World: adaptive quality ${quality}`);}perfTime=0;}}
    frames++;
  }
  renderer.render(scene,camera);raf=requestAnimationFrame(frame);document.getElementById('scene-status').hidden=true;
  console.info(`World ready: ${renderer.info.render.calls} draw calls, ${renderer.info.render.triangles} triangles.`);
  return {renderer,scene,camera,world,nav,get running(){return !stopped;},dispose(){stopped=true;cancelAnimationFrame(raf);nav.controls.dispose();window.removeEventListener('resize',resize);renderer.dispose();}};
}
