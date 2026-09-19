import * as THREE from 'three';
// Deterministic ridges with layered strata and irregular snow coverage, not capped cones.
export function mountainGeometry(radius,height,seed){
  const segments=18,rings=9,positions=[],colors=[],indices=[];
  const stone=new THREE.Color('#747a72'),snow=new THREE.Color('#d2d5c8'),color=new THREE.Color();
  for(let row=0;row<=rings;row++){
    const t=row/rings;
    for(let j=0;j<=segments;j++){
      const a=j/segments*Math.PI*2;
      const ridge=1+.19*Math.sin(a*3+seed)+.12*Math.cos(a*5-seed*.4)+.07*Math.sin(a*9+row*.8);
      const r=radius*Math.pow(1-t,.85)*ridge;
      const x=Math.cos(a)*r+Math.sin(t*2.4+seed)*t*.5,z=Math.sin(a)*r*.87+Math.cos(t*3+seed)*t*.4;
      const y=t*height+Math.sin(a*4+seed)*Math.sin(t*Math.PI)*height*.10;
      positions.push(x,y,z);
      const snowLine=.74+.12*Math.sin(a*3+seed);const cover=THREE.MathUtils.smoothstep(t,snowLine,snowLine+.11);
      color.copy(stone).multiplyScalar(.79+.15*Math.sin(a*3+row*.8+seed)+.12*t).lerp(snow,cover);
      colors.push(color.r,color.g,color.b);
      if(row<rings&&j<segments){const k=row*(segments+1)+j;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function pineGeometry(){
  const profile=[new THREE.Vector2(0,-.5),new THREE.Vector2(.35,-.46),new THREE.Vector2(.28,-.28),new THREE.Vector2(.39,-.23),new THREE.Vector2(.24,-.08),new THREE.Vector2(.31,.02),new THREE.Vector2(.18,.16),new THREE.Vector2(.22,.24),new THREE.Vector2(.12,.37),new THREE.Vector2(.15,.42),new THREE.Vector2(0,.75)];
  const geo=new THREE.LatheGeometry(profile,9);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.12*Math.sin(x*53+y*37+z*19);p.setXYZ(i,x*n,y,z*n);}geo.computeVertexNormals();return geo;
}
export function beveledUnitBox(){
  const shape=new THREE.Shape();shape.moveTo(-.47,-.47);shape.lineTo(.47,-.47);shape.lineTo(.47,.47);shape.lineTo(-.47,.47);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.94,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.03,bevelThickness:.03,curveSegments:1});geo.translate(0,0,-.47);return geo;
}
export function mistTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(196,221,214,.55)');gradient.addColorStop(.35,'rgba(171,204,203,.22)');gradient.addColorStop(1,'rgba(171,204,203,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas);
}
