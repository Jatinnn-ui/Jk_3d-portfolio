import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { waypoints, beatAt, progressFor } from '../data/journey.js';
const clamp=THREE.MathUtils.clamp;
const smooth=t=>t*t*(3-2*t);
export class CameraNavigation {
  constructor(camera,canvas,mobile,reduced){
    this.camera=camera;this.canvas=canvas;this.mobile=mobile;this.reduced=reduced;
    this.progress=0;this.targetProgress=0;this.mode='guided';this.velocity=0;this.programmatic=false;this.blend=null;this.time=0;this.onInput=()=>{};this.onMode=()=>{};
    this.positionCurve=new THREE.CatmullRomCurve3(waypoints.map(w=>new THREE.Vector3(...w.position)),false,'catmullrom',.25);
    this.targetCurve=new THREE.CatmullRomCurve3(waypoints.map(w=>new THREE.Vector3(...w.lookAt)),false,'catmullrom',.25);
    this.controls=new OrbitControls(camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.enablePan=false;this.controls.enableZoom=false;this.controls.rotateSpeed=.35;this.controls.minPolarAngle=.38;this.controls.maxPolarAngle=1.35;this.controls.minDistance=12;this.controls.maxDistance=mobile?110:80;this.controls.autoRotate=false;
    // Wheel belongs to the journey. Two-finger pinch still belongs to OrbitControls.
    this.controls.touches.ONE=null;this.controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
    this.controls.addEventListener('start',()=>this.explore());
    this.homePosition=new THREE.Vector3();this.homeTarget=new THREE.Vector3();
    const initial=this.sample(0);this.homePosition.copy(initial.position);this.homeTarget.copy(initial.target);camera.position.copy(initial.position);this.controls.target.copy(initial.target);camera.fov=initial.fov;camera.updateProjectionMatrix();this.controls.update();
    this.boundWheel=e=>this.handleWheel(e);this.boundKey=e=>this.handleKey(e);
    window.addEventListener('wheel',this.boundWheel,{passive:false});window.addEventListener('keydown',this.boundKey);
    this.touch=null;
    this.touchStart=e=>{if(e.touches.length===1){const t=e.touches[0];this.touch={x:t.clientX,y:t.clientY,startX:t.clientX,startY:t.clientY,axis:null};}else{this.touch=null;this.controls.enableZoom=true;}};
    this.touchMove=e=>{if(e.touches.length!==1||!this.touch)return;const t=e.touches[0],s=this.touch;const totalX=t.clientX-s.startX,totalY=t.clientY-s.startY;if(!s.axis&&Math.hypot(totalX,totalY)>7)s.axis=Math.abs(totalY)>Math.abs(totalX)?'scroll':'orbit';if(!s.axis)return;e.preventDefault();if(s.axis==='scroll')this.input((s.y-t.clientY)*2.5);else this.orbit(t.clientX-s.x,t.clientY-s.y);s.x=t.clientX;s.y=t.clientY;};
    this.touchEnd=()=>{this.touch=null;this.controls.enableZoom=false;};
    canvas.addEventListener('touchstart',this.touchStart,{passive:true});canvas.addEventListener('touchmove',this.touchMove,{passive:false});canvas.addEventListener('touchend',this.touchEnd);
  }
  sample(progress){
    const p=clamp(progress,0,1);let index=waypoints.length-2;
    for(let i=0;i<waypoints.length-1;i++)if(p<=waypoints[i+1].progress){index=i;break;}
    const a=waypoints[index],b=waypoints[index+1],u=clamp((p-a.progress)/(b.progress-a.progress),0,1);
    // Deterministic soft settling near each waypoint; equally valid in reverse.
    const eased=u-.42*Math.sin(2*Math.PI*u)/(2*Math.PI),t=(index+eased)/(waypoints.length-1);
    const position=this.positionCurve.getPoint(t),target=this.targetCurve.getPoint(t);
    if(this.mobile)position.sub(target).multiplyScalar(1.5+(1-Math.min(1,p/.08))*.1).add(target);
    return {position,target,fov:THREE.MathUtils.lerp(a.fov,b.fov,smooth(u))};
  }
  beginBlend(duration=1.15){this.blend={position:this.camera.position.clone(),target:this.controls.target.clone(),fov:this.camera.fov,elapsed:0,duration};}
  explore(){if(this.mode==='explore')return;this.blend=null;this.programmatic=false;this.targetProgress=this.progress;this.mode='explore';this.onMode(this.mode);}
  resume(){
    if(this.mode!=='explore')return;
    // Search locally: avoids jumping to a distant chapter where the route crosses itself.
    let nearest=this.progress,best=Infinity;for(let i=0;i<=48;i++){const p=clamp(this.progress-.10+i/48*.20,0,1),s=this.sample(p);const score=s.position.distanceToSquared(this.camera.position)+s.target.distanceToSquared(this.controls.target)*2;if(score<best){best=score;nearest=p;}}
    this.progress=nearest;this.targetProgress=nearest;this.mode='guided';this.beginBlend();this.onMode(this.mode);
  }
  input(pixels){
    this.resume();this.programmatic=false;
    const delta=clamp(pixels,-480,480)/12500;
    this.targetProgress=clamp(this.targetProgress+delta,0,1);
    // Bound backlog so frantic wheel events never create a runaway camera animation.
    this.targetProgress=clamp(this.targetProgress,this.progress-.16,this.progress+.16);
    this.onInput();
  }
  go(location,project){this.resume();this.mode='guided';this.programmatic=true;this.targetProgress=progressFor(typeof location==='string'?location:location.id,typeof project==='string'?project:project?.id);this.onInput();}
  home(){this.progress=0;this.targetProgress=0;this.programmatic=false;this.mode='guided';this.beginBlend(1.35);this.onMode(this.mode);this.onInput();}
  orbit(dx,dy){this.explore();const offset=this.camera.position.clone().sub(this.controls.target),spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta-=dx*.006;spherical.phi=clamp(spherical.phi+dy*.004,.38,1.35);this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(spherical));this.controls.update();}
  zoom(factor){this.explore();const offset=this.camera.position.clone().sub(this.controls.target);offset.setLength(clamp(offset.length()*factor,12,this.mobile?110:80));this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}
  handleWheel(event){
    if(event.ctrlKey||event.metaKey)return; // Preserve browser zoom / accessibility gestures.
    const el=event.target instanceof Element?event.target:null;
    if(el?.closest('#world-menu,#fallback'))return;
    const scrollable=el?.closest('#panel-body,.journey-copy');
    if(scrollable&&scrollable.scrollHeight>scrollable.clientHeight+2){const canScroll=event.deltaY>0?scrollable.scrollTop+scrollable.clientHeight<scrollable.scrollHeight-2:scrollable.scrollTop>2;if(canScroll)return;}
    if(event.defaultPrevented)return;event.preventDefault();
    if(event.altKey){this.zoom(event.deltaY>0?1.08:.92);return;}
    const pixels=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);this.input(pixels);
  }
  handleKey(event){
    if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.target.closest?.('button,a,input,textarea,select,#world-menu,#content-panel'))return;
    const moves={ArrowDown:190,ArrowUp:-190,PageDown:650,PageUp:-650,' ':event.shiftKey?-650:650};
    if(event.key in moves){event.preventDefault();this.input(moves[event.key]);}
    if(event.key==='Home'){event.preventDefault();this.home();}
    if(event.key==='End'){event.preventDefault();this.resume();this.targetProgress=1;this.programmatic=true;this.onInput();}
  }
  setReduced(value){this.reduced=value;this.beginBlend(.2);}
  resize(mobile){this.mobile=mobile;this.controls.maxDistance=mobile?110:80;const sample=this.sample(0);this.homePosition.copy(sample.position);this.homeTarget.copy(sample.target);this.beginBlend(.6);}
  update(now,dt){
    this.time+=dt;if(this.mode==='explore'){this.controls.update(dt);return;}
    const previous=this.progress,difference=this.targetProgress-this.progress;
    const probeA=this.sample(Math.max(0,this.progress-.0004)),probeB=this.sample(Math.min(1,this.progress+.0004));
    const derivative=Math.max(probeA.position.distanceTo(probeB.position),probeA.target.distanceTo(probeB.target)*1.2)/.0008;
    const maxSpeed=Math.min(this.programmatic?.32:.15,(this.programmatic?24:13)/Math.max(1,derivative));
    const step=clamp(difference*(1-Math.exp(-dt*5.5)),-maxSpeed*dt,maxSpeed*dt);
    this.progress=clamp(this.progress+step,0,1);if(Math.abs(this.targetProgress-this.progress)<.00008)this.progress=this.targetProgress;
    this.velocity=dt>0?(this.progress-previous)/dt:0;
    const shot=this.sample(this.reduced?0:this.progress);
    if(this.blend){this.blend.elapsed+=dt;const t=smooth(clamp(this.blend.elapsed/this.blend.duration,0,1));shot.position.lerpVectors(this.blend.position,shot.position,t);shot.target.lerpVectors(this.blend.target,shot.target,t);shot.fov=THREE.MathUtils.lerp(this.blend.fov,shot.fov,t);if(t===1)this.blend=null;}
    this.camera.position.copy(shot.position);this.controls.target.copy(shot.target);this.camera.lookAt(shot.target);
    if(Math.abs(this.camera.fov-shot.fov)>.001){this.camera.fov=shot.fov;this.camera.updateProjectionMatrix();}
  }
  get beat(){return beatAt(this.progress);}
  get active(){return this.progress>.025;}
  dispose(){window.removeEventListener('wheel',this.boundWheel);window.removeEventListener('keydown',this.boundKey);this.canvas.removeEventListener('touchstart',this.touchStart);this.canvas.removeEventListener('touchmove',this.touchMove);this.canvas.removeEventListener('touchend',this.touchEnd);this.controls.dispose();}
}
