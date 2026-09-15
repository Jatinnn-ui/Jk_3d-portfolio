import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createMaterials } from './materials.js';
import { projects, locations } from '../data/portfolio.js';

// Deterministic geometry, no downloaded models or texture dependencies.
function randomGenerator(seed=81){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
class GeometryBatch {
  constructor(parent){this.parent=parent;this.buckets=new Map();this.transform=new THREE.Object3D();}
  add(geometry,material,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
    const g=geometry.index?geometry.toNonIndexed():geometry.clone();
    g.deleteAttribute('uv');this.transform.position.set(...position);this.transform.scale.set(...scale);this.transform.rotation.set(...rotation);this.transform.updateMatrix();g.applyMatrix4(this.transform.matrix);
    if(!this.buckets.has(material))this.buckets.set(material,[]);this.buckets.get(material).push(g);
  }
  finish(){for(const [material,geometries] of this.buckets){const geometry=mergeGeometries(geometries,false);const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;this.parent.add(mesh);geometries.forEach(g=>g.dispose());}this.buckets.clear();}
}
export function buildWorld(scene,{mobile=false}={}){
  const materials=createMaterials(),rand=randomGenerator();
  const root=new THREE.Group();scene.add(root);
  const ground=new GeometryBatch(root),landmarks=new Map(),hitTargets=[];
  const box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,12),cone=new THREE.ConeGeometry(1,1,5),rock=new THREE.IcosahedronGeometry(1,0);
  const cube=(b,m,x,y,z,sx,sy,sz,ry=0)=>b.add(box,m,[x,y,z],[sx,sy,sz],[0,ry,0]);
  const tube=(b,points,r,mat,segments=40)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));b.add(new THREE.TubeGeometry(curve,segments,r,5,false),mat);};
  const height=(x,z)=>1.15+.12*Math.sin(x*.6)+.1*Math.cos(z*.6)+1.25*Math.exp(-(x*x+(z+2)*(z+2))/25);
  const region=(id)=>{const group=new THREE.Group();group.name=id;root.add(group);landmarks.set(id,group);return new GeometryBatch(group);};

  // Hand-shaped elliptical, faceted island: top terraces and tapering geological layers.
  const count=38,rim=[];
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const r=13.5+(rand()-.5)*1.6;rim.push([Math.cos(a)*r,Math.sin(a)*r*.79]);}
  const topVertices=[],topColors=[],cliffVertices=[],cliffColors=[];
  function tri(target,colors,a,b,c,color){target.push(...a,...b,...c);for(let i=0;i<3;i++)colors.push(color.r,color.g,color.b);}
  const green=new THREE.Color(),slate=new THREE.Color();
  for(let ring=0;ring<4;ring++)for(let i=0;i<count;i++){
    const j=(i+1)%count,inner=ring/4,outer=(ring+1)/4;
    const point=(idx,s)=>{const [x,z]=rim[idx];return[x*s,height(x*s,z*s),z*s];};
    const a=point(i,inner),b=point(i,outer),c=point(j,outer),d=point(j,inner);
    green.setHSL(.36+rand()*.025,.105,.30+rand()*.065);tri(topVertices,topColors,a,c,b,green);
    if(ring){green.offsetHSL(0,0,(rand()-.5)*.035);tri(topVertices,topColors,a,d,c,green);}
  }
  for(let layer=0;layer<3;layer++)for(let i=0;i<count;i++){
    const j=(i+1)%count;const scales=[1,.9,.58,.12],ys=[0,-2.8,-6.3,-8.8];
    const p=(idx,l)=>{const [x,z]=rim[idx];return[x*scales[l]+(l>1?.8:0),l===0?height(x,z):ys[l]+Math.sin(idx*2.9+l)*.55,z*scales[l]];};
    slate.setHSL(.51,.12,.22+rand()*.09-layer*.035);tri(cliffVertices,cliffColors,p(i,layer),p(j,layer),p(i,layer+1),slate);
    slate.offsetHSL(0,0,-.02);tri(cliffVertices,cliffColors,p(j,layer),p(j,layer+1),p(i,layer+1),slate);
  }
  const coloredMesh=(vertices,colors)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));m.receiveShadow=true;m.castShadow=true;root.add(m);};
  coloredMesh(topVertices,topColors);coloredMesh(cliffVertices,cliffColors);
  // Outcrops define the edge instead of an artificially clean circular platform.
  for(let i=0;i<33;i++){const a=rand()*Math.PI*2,r=11.8+rand()*1.7;const x=Math.cos(a)*r,z=Math.sin(a)*r*.76;ground.add(rock,i%3?materials.stone:materials.edge,[x,height(x,z)-.25,z],[.6+rand(),.4+rand()*.9,.5+rand()],[rand(),rand(),0]);}

  // Mountain silhouettes, with distinct peaks and small snow caps.
  const mountains=region('skills');
  const peaks=[[-7.8,-5.8,3.1,5.5],[-4.7,-7.1,3.4,7.5],[-1.4,-7.8,2.7,5.3],[-9.6,-3.5,2.2,3.8],[2.1,-7.9,2.4,4.4]];
  peaks.forEach(([x,z,r,h],i)=>{
    const y=height(x,z);const geom=new THREE.ConeGeometry(r,h,5,1);mountains.add(geom,i%2?materials.stone:materials.edge,[x,y+h/2-.25,z],[1,1,.85],[0,i*.8,0]);
    mountains.add(new THREE.ConeGeometry(r*.23,h*.24,5),materials.snow,[x,y+h*.88-.25,z],[1,1,.85],[0,i*.8,0]);
    mountains.add(rock,materials.darkRock,[x+r*.55,y+.4,z+1],[r*.65,.9,r*.55],[0,i,0]);
  });
  mountains.finish();

  // Observatory: stepped circular architecture, glazed drum, ribs, and a faceted dome.
  const obs=region('about'),oy=height(0,-1);
  [3,2.7,2.4].forEach((r,i)=>obs.add(cylinder,i===0?materials.stone:materials.building,[0,oy+.1+i*.2,-1],[r,.23,r]));
  obs.add(cylinder,materials.building,[0,oy+1.05,-1],[1.65,1.35,1.65]);
  obs.add(cylinder,materials.glass,[0,oy+2.08,-1],[1.67,.85,1.67]);
  obs.add(cylinder,materials.trim,[0,oy+2.55,-1],[1.85,.18,1.85]);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;cube(obs,materials.building,Math.cos(a)*1.65,oy+2.07,-1+Math.sin(a)*1.65,.09,.88,.12,-a);}
  const dome=new THREE.SphereGeometry(1.73,16,5,0,Math.PI*2,0,Math.PI/2);
  obs.add(dome,materials.metal,[0,oy+2.64,-1],[1,.75,1]);
  obs.add(new THREE.TorusGeometry(1.77,.04,4,32),materials.glow,[0,oy+2.65,-1],[1,1,1],[Math.PI/2,0,0]);
  cube(obs,materials.glass,.2,oy+3.27,.37,.32,1.04,.65,-.12);
  cube(obs,materials.metal,0,oy+4.3,-1,.065,1.15,.065);
  obs.add(new THREE.SphereGeometry(.10,8,6),materials.glow,[0,oy+4.93,-1]);
  cube(obs,materials.building,2.3,oy+.4,.3,2.1,.35,1.1);
  cube(obs,materials.glass,2.65,oy+.59,.3,1.1,.035,.7);
  // Observatory stairway and approach plaza.
  for(let i=0;i<7;i++)cube(obs,materials.path,0,oy+.48-i*.07,1.7+i*.2,1.4,.16,.24);
  obs.finish();
  const antenna=new THREE.Group();antenna.position.set(0,oy+4.3,-1);root.add(antenna);
  const ab=new GeometryBatch(antenna);cube(ab,materials.metal,0,0,0,1.15,.06,.06);cube(ab,materials.glow,.56,0,0,.06,.12,.1);ab.finish();

  // Thin stone paths unite the city, observatory, and grove.
  const road=(points,width=.16)=>tube(ground,points.map(([x,z])=>[x,height(x,z)+.035,z]),width,materials.path,50);
  road([[0,2],[2,3],[4,4],[7,4],[10,3]],.23);
  road([[0,2],[-2,3],[-6,2],[-9,3],[-10,5]],.14);
  road([[4,4],[4,6],[6,7],[9,6]],.18);
  road([[-3,3],[-4,5],[-2,7],[1,8],[4,7]],.13);

  // Four individually selectable project buildings, unified by a quiet architectural language.
  const cityBase=region('projects');
  cube(cityBase,materials.stone,7.25,1.4,3.4,7.8,.35,6.8);
  cube(cityBase,materials.path,7.2,1.59,3.6,7.2,.035,.36);
  cube(cityBase,materials.path,7.5,1.59,3.5,.35,.035,6.1);
  projects.forEach((project,i)=>{
    const [x,,z]=project.buildingPosition;
    const group=new THREE.Group();root.add(group);landmarks.set(project.id,group);const b=new GeometryBatch(group);
    const h=[3.6,5.4,2.6,2.15][i],w=[1.55,1.35,1.9,2.45][i],y=1.65;
    cube(b,materials.edge,x,y,z,w+.5,.24,1.95);
    cube(b,i===1?materials.buildingDark:materials.building,x,y+h/2,z,w,h,1.6);
    cube(b,materials.glass,x+.015,y+h*.54,z+.813,w*.74,h*.77,.035);
    if(i===1){cube(b,materials.building,x+.65,y+h*.53,z,.22,h*.98,1.72);cube(b,materials.trim,x,y+h+.1,z,1.55,.2,1.85);cube(b,materials.metal,x,y+h+.58,z,.055,.9,.055);}
    if(i===0){cube(b,materials.building,x-.55,y+h+.4,z,.55,.8,1.65);cube(b,materials.glass,x+.78,y+h*.6,z,.025,h*.63,1.25);}
    if(i===2){cube(b,materials.buildingDark,x+.3,y+h+.4,z,.95,.8,1.3);cube(b,materials.trim,x,y+h,z,2.1,.15,1.85);}
    if(i===3){cube(b,materials.glass,x,y+.5,z+.9,2.15,.8,.65);cube(b,materials.trim,x,y+1,z+.4,2.7,.16,2.7);cube(b,materials.building,x-.55,y+h+.35,z,.8,.7,1.1);}
    for(let floor=0;floor<Math.floor(h/.5);floor++){
      cube(b,materials.building,x,y+.4+floor*.49,z+.85,w*.92,.07,.08);
      for(let k=0;k<3;k++)if(rand()>.3)cube(b,materials.warm,x-w*.28+k*w*.28,y+.57+floor*.49,z+.845,.09,.16,.015);
    }
    cube(b,materials.glow,x,y+.1,z+1.1,w*.75,.025,.025);
    b.finish();
    const proxy=new THREE.Mesh(new THREE.BoxGeometry(w+.4,h+1,2.2),new THREE.MeshBasicMaterial({visible:false}));proxy.position.set(x,y+h/2,z);proxy.userData={location:'projects',project:project.id};root.add(proxy);hitTargets.push(proxy);
  });
  // Architectural connectors and understated plazas.
  cube(cityBase,materials.metal,7.5,3.5,1.6,2.2,.14,.55);
  cube(cityBase,materials.glass,7.5,3.72,1.35,2.2,.34,.04);
  for(let i=0;i<8;i++){const x=4.2+(i%4)*1.85,z=i<4?7.7:-.15;cube(cityBase,materials.metal,x,1.95,z,.035,.8,.035);cube(cityBase,materials.warm,x,2.36,z,.11,.07,.11);}
  cityBase.finish();

  // A continuous ribbon river, not a series of disconnected planes.
  const riverCurve=new THREE.CatmullRomCurve3([[-3.3,0,-7],[-3.1,0,-4.5],[-3.8,0,-2],[-4.4,0,.1],[-3.7,0,2.7],[-2.1,0,4.7],[-1.3,0,7],[.7,0,8.9],[2,0,10.75]].map(p=>new THREE.Vector3(...p)));
  const ribbon=(width,offset,mat)=>{const points=[],norm=new THREE.Vector3();for(let i=0;i<=100;i++){const t=i/100,p=riverCurve.getPoint(t),tan=riverCurve.getTangent(t);norm.set(-tan.z,0,tan.x).normalize();for(const side of [-1,1]){const x=p.x+norm.x*width*side,z=p.z+norm.z*width*side;points.push(x,height(x,z)+offset,z);}}const index=[];for(let i=0;i<100;i++){let n=i*2;index.push(n,n+2,n+1,n+1,n+2,n+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(index);g.computeVertexNormals();const mesh=new THREE.Mesh(g,mat);mesh.receiveShadow=true;root.add(mesh);return mesh;};
  ribbon(.60,.045,materials.sand);ribbon(.43,.072,materials.water);
  // River checkpoints, oldest upstream; tiny docks anchor the chronology.
  const journey=region('experience');
  [.23,.55,.83].forEach((t,i)=>{const p=riverCurve.getPoint(t),x=p.x+.9,z=p.z,y=height(x,z);cube(journey,materials.trunk,x,y+.12,z,1.15,.12,.55);for(let k=0;k<4;k++)cube(journey,materials.path,x-.43+k*.28,y+.2,z,.20,.06,.57);cube(journey,materials.metal,x+.45,y+.62,z,.055,.85,.055);journey.add(new THREE.SphereGeometry(.1,6,5),materials.warm,[x+.45,y+1.08,z]);});journey.finish();

  // Two cliff falls: layered translucent water, foam and falling light flecks.
  const falls=region('achievements');
  const fallPositions=[[2,10.55,1.05],[3.6,10.2,.46]];
  fallPositions.forEach(([x,z,w],i)=>{const y=height(x,z);cube(falls,materials.waterLight,x,y-3.0,z,w,6.25,.12);cube(falls,materials.waterLight,x+.12,y-3.12,z+.1,w*.36,6.4,.07);cube(falls,materials.water,x,y+.02,z-.35,w,.06,1.15);for(let k=0;k<5;k++)falls.add(rock,materials.waterLight,[x+(rand()-.5)*1.2,-4.8+rand()*.4,z],[.6,.08,.3]);});falls.finish();
  const dropletCount=mobile?20:50,dropGeo=new THREE.BufferGeometry(),dropPos=new Float32Array(dropletCount*3);
  for(let i=0;i<dropletCount;i++){dropPos[i*3]=2+(rand()-.5)*1;dropPos[i*3+1]=-5+rand()*6;dropPos[i*3+2]=10.65+rand()*.2;}
  dropGeo.setAttribute('position',new THREE.BufferAttribute(dropPos,3));const droplets=new THREE.Points(dropGeo,new THREE.PointsMaterial({color:'#bddfd7',size:.045,transparent:true,opacity:.55,depthWrite:false}));root.add(droplets);

  // A carefully spaced grove; geometry is instanced rather than one draw call per tree.
  const trees=[];for(let i=0;i<(mobile?34:60);i++){const x=-11+rand()*5.9,z=-.4+rand()*7.7;if(Math.hypot((x+7)*.7,z-3)>4.2)continue;trees.push([x,height(x,z),z,.7+rand()*.7]);}
  for(let i=0;i<16;i++){const x=3+rand()*7,z=-4+rand()*3;trees.push([x,height(x,z),z,.45+rand()*.55]);}
  const dummy=new THREE.Object3D();const treeCrown=new THREE.InstancedMesh(cone,materials.pine,trees.length*2),trunks=new THREE.InstancedMesh(cylinder,materials.trunk,trees.length);treeCrown.castShadow=true;trunks.castShadow=true;
  trees.forEach(([x,y,z,s],i)=>{dummy.position.set(x,y+.45*s,z);dummy.scale.set(.075*s,.9*s,.075*s);dummy.rotation.set(0,0,0);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);for(let k=0;k<2;k++){dummy.position.set(x,y+(.95+k*.48)*s,z);dummy.scale.set((.52-k*.13)*s,1.35*s,(.52-k*.13)*s);dummy.rotation.y=i*.81;dummy.updateMatrix();treeCrown.setMatrixAt(i*2+k,dummy.matrix);}});root.add(treeCrown,trunks);
  const grove=region('personal');
  grove.add(cylinder,materials.path,[-8,height(-8,4)+.04,4],[1.3,.06,1.3]);
  cube(grove,materials.trunk,-8,height(-8,4)+.35,4,1.05,.1,.35);
  cube(grove,materials.trunk,-8,height(-8,4)+.62,3.86,1.05,.44,.08);
  for(const dx of [-.4,.4])cube(grove,materials.metal,-8+dx,height(-8,4)+.2,4,.05,.35,.25);
  for(let i=0;i<12;i++){const x=-9+rand()*4,z=5+rand()*2;grove.add(rock,materials.edge,[x,height(x,z),z],[.2+rand()*.3,.25,.2+rand()*.3],[0,rand()*3,0]);}grove.finish();

  // Primary bridge connects the river path to the district, with slender cable rails.
  const bridges=region('contact');
  function bridge(x,z,length,rotation=0){const group=new THREE.Group();group.position.set(x,height(x,z)+.28,z);group.rotation.y=rotation;root.add(group);const b=new GeometryBatch(group);cube(b,materials.trunk,0,0,0,length,.16,.8);for(let i=0;i<Math.ceil(length/.22);i++)cube(b,materials.path,-length/2+i*.22,.1,0,.17,.055,.8);for(const side of [-1,1]){cube(b,materials.metal,0,.57,side*.46,length,.04,.04);for(let i=0;i<5;i++)cube(b,materials.metal,-length/2+i*length/4,.29,side*.46,.035,.65,.035);cube(b,materials.glow,0,.03,side*.46,length,.023,.023);}for(const dx of [-length*.35,length*.35])cube(b,materials.stone,dx,-.6,0,.18,1.1,.55);b.finish();return group;}
  const mainBridge=bridge(2.5,6.45,4.5,-.18);landmarks.set('contact',mainBridge);bridge(-3.9,.6,2.1,.1);bridges.finish();

  // Satellite islands host quiet experimental structures.
  const lab=region('lab');
  [[14,1,-6,2.2],[15,-1,1,1.05],[-14,-1,-5,1.3]].forEach(([x,y,z,s],i)=>{
    lab.add(new THREE.ConeGeometry(s,s*2,6),materials.cliff,[x,y-s,z],[1,1,.8],[Math.PI,0,i*.7]);
    lab.add(cylinder,materials.terrain,[x,y,z],[s,.17,s*.8]);
    if(i===0){cube(lab,materials.building,x,y+.5,z,1.35,.9,1.15);cube(lab,materials.glass,x,y+.55,z+.58,1.05,.5,.035);cube(lab,materials.trim,x,y+1.05,z,1.65,.2,1.4);lab.add(new THREE.TorusGeometry(.66,.045,5,28),materials.metal,[x,y+1.85,z],[1,1,1],[0,.5,0]);lab.add(new THREE.SphereGeometry(.11,8,6),materials.glow,[x,y+1.85,z]);}else{lab.add(rock,materials.edge,[x,y+.35,z],[.35,.7,.35]);}
  });lab.finish();
  // Small debris is instanced and completely static.
  const debris=new THREE.InstancedMesh(rock,materials.darkRock,mobile?12:24);for(let i=0;i<debris.count;i++){const a=rand()*Math.PI*2,r=13+rand()*5,s=.12+rand()*.42;dummy.position.set(Math.cos(a)*r,-3-rand()*6,Math.sin(a)*r*.73);dummy.scale.set(s,s*.8,s);dummy.rotation.set(rand(),rand(),rand());dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix);}root.add(debris);
  ground.finish();

  // Broad invisible hit areas retain usability even on small displays.
  locations.forEach(loc=>{const proxy=new THREE.Mesh(new THREE.SphereGeometry(loc.id==='skills'?3:loc.id==='projects'?3:1.8,8,6),new THREE.MeshBasicMaterial({visible:false}));proxy.position.set(...loc.position);proxy.userData.location=loc.id;root.add(proxy);hitTargets.push(proxy);});
  const starCount=mobile?170:430,starPositions=new Float32Array(starCount*3),starGeo=new THREE.BufferGeometry();for(let i=0;i<starCount;i++){const a=rand()*Math.PI*2,b=Math.acos(2*rand()-1),r=95+rand()*80;starPositions.set([Math.sin(b)*Math.cos(a)*r,Math.cos(b)*r,Math.sin(b)*Math.sin(a)*r],i*3);}starGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#9eafb7',size:.13,transparent:true,opacity:.47,sizeAttenuation:true,depthWrite:false}));scene.add(stars);
  const waterDots=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),materials.waterLight,mobile?9:18);root.add(waterDots);
  const traffic=new THREE.Mesh(new THREE.BoxGeometry(.16,.07,.09),materials.warm);root.add(traffic);
  const highlightMaterials=new Map();
  for(const [id,group] of landmarks){const list=[];group.traverse(object=>{if(object.isMesh&&object.material.emissive){object.material=object.material.clone();list.push({material:object.material,base:object.material.emissive.clone(),intensity:object.material.emissiveIntensity});}});highlightMaterials.set(id,list);}
  const scaleTarget=new THREE.Vector3();
  const shootingStar=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(2.3,1.1,0)]),new THREE.LineBasicMaterial({color:'#a7c6cf',transparent:true,opacity:0}));scene.add(shootingStar);
  let hoverId=null,selectedId=null;
  function highlight(id,selected=false){if(selected)selectedId=id;else hoverId=id;}
  function update(time,delta,motion){
    if(motion){antenna.rotation.y=time*.22;const attr=droplets.geometry.attributes.position;for(let i=0;i<dropletCount;i++){attr.array[i*3+1]-=delta*(1.5+(i%3)*.2);if(attr.array[i*3+1]<-5)attr.array[i*3+1]=1.2;}attr.needsUpdate=true;
      for(let i=0;i<waterDots.count;i++){const t=(i/waterDots.count+time*.022)%1,p=riverCurve.getPoint(t);dummy.position.set(p.x,height(p.x,p.z)+.10,p.z);dummy.scale.set(.09,.012,.24);dummy.rotation.set(0,-Math.atan2(riverCurve.getTangent(t).x,riverCurve.getTangent(t).z),0);dummy.updateMatrix();waterDots.setMatrixAt(i,dummy.matrix);}waterDots.instanceMatrix.needsUpdate=true;
      traffic.position.set(4.1+(time*.3)%6,1.69,3.55);
    }
    const phase=time%43;shootingStar.visible=motion&&phase>40&&phase<41.2;if(shootingStar.visible){const p=(phase-40)/1.2;shootingStar.position.set(-28+p*15,28-p*7,-40);shootingStar.material.opacity=Math.sin(p*Math.PI)*.4;}
    for(const [id,group] of landmarks){const active=id===hoverId||id===selectedId,target=active?1.012:1;group.scale.lerp(scaleTarget.setScalar(target),Math.min(1,delta*6));for(const entry of highlightMaterials.get(id)||[]){entry.material.emissive.copy(entry.base);if(active)entry.material.emissive.addScalar(.065);entry.material.emissiveIntensity=active?Math.max(.35,entry.intensity):entry.intensity;}}
  }
  // Initialize dynamic geometry even with reduced motion.
  update(0,0,true);
  return {root,landmarks,hitTargets,update,highlight,stars,droplets,height,materials};
}
