import * as THREE from 'three';
export function createMaterials(){
  const matte=(color,roughness=.85,extra={})=>new THREE.MeshStandardMaterial({color,roughness,flatShading:true,...extra});
  return {
    stone:matte('#54696b'), cliff:matte('#34494c'), darkRock:matte('#24363c'), edge:matte('#718582'),
    terrain:matte('#566c63'), grass:matte('#647969'), sand:matte('#a2a797'), path:matte('#919e91'),
    building:matte('#c0c7ba',.62), buildingDark:matte('#637979',.7), metal:matte('#7c9593',.45,{metalness:.3}),
    glass:matte('#243d43',.22,{metalness:.45}), trim:matte('#d4d7c7',.5),
    water:matte('#5dadae',.24,{metalness:.35,emissive:'#235356',emissiveIntensity:.2}),
    waterLight:matte('#99c9c3',.4,{transparent:true,opacity:.58,emissive:'#518a91',emissiveIntensity:.2,side:THREE.DoubleSide}),
    pine:matte('#344f48'), pineLight:matte('#496459'), trunk:matte('#625e4f'),
    warm:new THREE.MeshBasicMaterial({color:'#e4ce9b'}), glow:new THREE.MeshBasicMaterial({color:'#beddd2'}),
    snow:matte('#b8c2b5'), soil:matte('#505951'),
  };
}
