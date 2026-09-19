import * as THREE from 'three';
function surfaceGrain(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),image=ctx.createImageData(128,128);let seed=739;
  for(let i=0;i<image.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=120+(seed%35);image.data[i]=image.data[i+1]=image.data[i+2]=v;image.data[i+3]=255;}ctx.putImageData(image,0,0);const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);return texture;
}
export function createMaterials(){
  const grain=surfaceGrain();
  const matte=(color,roughness=.85,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
  const stoneExtra={bumpMap:grain,bumpScale:.045};
  const water=matte('#447d82',.19,{metalness:.28,envMapIntensity:.9});
  const waterTime={value:0};water.userData.time=waterTime;
  water.onBeforeCompile=shader=>{shader.uniforms.uWaterTime=waterTime;shader.vertexShader='uniform float uWaterTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal.x += sin(position.z * 7.0 + uWaterTime * 1.3) * 0.085;\nobjectNormal.z += cos(position.x * 9.0 + uWaterTime) * 0.055;');};
  const waterfall=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform float uTime; varying vec2 vUv; void main(){float edge=smoothstep(0.0,0.12,vUv.x)*smoothstep(0.0,0.12,1.0-vUv.x); float streak=sin(vUv.x*90.0+sin(vUv.y*11.0-uTime*3.0))*0.5+0.5; float flow=sin(vUv.y*55.0+uTime*5.0+vUv.x*12.0)*0.5+0.5; vec3 color=mix(vec3(0.26,0.49,0.51),vec3(0.75,0.88,0.84),streak*0.48+flow*0.16); gl_FragColor=vec4(color,edge*(0.45+streak*0.25));}'});
  return {
    stone:matte('#6b736c',.93,stoneExtra),cliff:matte('#47534e',.98,stoneExtra),darkRock:matte('#303f3e',1,stoneExtra),edge:matte('#8a9080',.9,stoneExtra),
    terrain:matte('#657360',1,stoneExtra),grass:matte('#718060'),sand:matte('#aaa88b',.95),path:matte('#a3a897',.87,stoneExtra),
    building:matte('#c4c6b9',.64,{bumpMap:grain,bumpScale:.008}),buildingDark:matte('#6a7b7a',.58),metal:matte('#899a99',.3,{metalness:.72,envMapIntensity:.7}),
    glass:new THREE.MeshPhysicalMaterial({color:'#354f57',roughness:.12,metalness:.48,clearcoat:1,clearcoatRoughness:.16,envMapIntensity:1.1}),trim:matte('#d5d5c6',.38,{metalness:.12}),
    water,waterfall,waterLight:matte('#bed3c9',.28,{transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide}),
    pine:matte('#334d3c',1),pineLight:matte('#4f6346',1),trunk:matte('#6a624e',1),
    warm:new THREE.MeshBasicMaterial({color:'#dec49a'}),glow:new THREE.MeshBasicMaterial({color:'#b4cdc1'}),
    snow:matte('#cfd2c2',.85),soil:matte('#586048',1),mountain:matte('#ffffff',.95,{vertexColors:true})
  };
}
