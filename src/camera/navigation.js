import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export class CameraNavigation {
  constructor(camera,canvas,mobile,reduced){
    this.camera=camera;this.mobile=mobile;this.reduced=reduced;this.transition=null;this.active=false;
    this.controls=new OrbitControls(camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.065;this.controls.enablePan=false;this.controls.enableZoom=true;this.controls.minPolarAngle=.52;this.controls.maxPolarAngle=1.26;this.controls.rotateSpeed=.35;this.controls.zoomSpeed=.45;this.controls.minDistance=24;this.controls.maxDistance=mobile?105:72;this.controls.autoRotate=!reduced;this.controls.autoRotateSpeed=.13;
    this.controls.addEventListener('start',()=>{this.transition=null;this.controls.autoRotate=false;});
    this.homeTarget=new THREE.Vector3(0,.2,0);this.homePosition=new THREE.Vector3(30,25,36).multiplyScalar(mobile?1.6:1);
    this.camera.position.copy(this.homePosition).multiplyScalar(reduced?1:1.13);this.controls.target.copy(this.homeTarget);this.controls.update();
    if(!reduced)this.travel(this.homePosition,this.homeTarget,1.8);
  }
  travel(position,target,duration=1.7){
    this.transition={from:this.camera.position.clone(),to:position.clone(),fromTarget:this.controls.target.clone(),toTarget:target.clone(),start:performance.now(),duration:this.reduced?.12:duration};
    this.controls.enabled=false;this.controls.autoRotate=false;
  }
  go(location,project){
    this.active=true;let position=new THREE.Vector3(...location.cameraPosition),target=new THREE.Vector3(...location.cameraTarget);
    if(project){target.set(...project.buildingPosition);target.y+=1.5;position.copy(target).add(new THREE.Vector3(14,11,18));}
    if(this.mobile){position.sub(target).multiplyScalar(1.48).add(target);}
    this.travel(position,target);
  }
  home(){this.active=false;this.travel(this.homePosition,this.homeTarget,1.8);}
  setReduced(value){this.reduced=value;this.controls.autoRotate=!value&&!this.active&&!this.transition;}
  resize(mobile){this.mobile=mobile;this.homePosition.set(30,25,36).multiplyScalar(mobile?1.6:1);this.controls.maxDistance=mobile?105:72;}
  update(now,delta){
    if(this.transition){const tr=this.transition,t=Math.max(0,Math.min(1,(now-tr.start)/(tr.duration*1000))),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;this.camera.position.lerpVectors(tr.from,tr.to,e);this.controls.target.lerpVectors(tr.fromTarget,tr.toTarget,e);this.camera.lookAt(this.controls.target);if(t===1){this.transition=null;this.controls.enabled=!this.active;this.controls.autoRotate=!this.reduced&&!this.active;}}
    else this.controls.update(delta);
  }
}
