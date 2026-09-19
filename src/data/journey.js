// A single reversible route. Every stop has a physical camera position, gaze and FOV.
// Progress is virtual scroll, not document position; tune this file to art-direct the journey.
export const waypoints = [
  {progress:0,position:[30,25,36],lookAt:[0,.2,0],fov:37,locationId:null},
  {progress:.09,position:[12,11,19],lookAt:[0,3.5,-1],fov:38,locationId:'about',key:'about'},
  {progress:.15,position:[14,10,16],lookAt:[3,3,0],fov:40,locationId:'about'},
  {progress:.205,position:[16,9,16],lookAt:[6,3.3,3],fov:39,locationId:'projects',key:'maya',projectId:'maya'},
  {progress:.265,position:[20,11,11],lookAt:[9,4,1],fov:38,locationId:'projects',key:'forge',projectId:'forge'},
  {progress:.325,position:[20,9,19],lookAt:[9,3,5],fov:39,locationId:'projects',key:'chess',projectId:'chess'},
  {progress:.385,position:[12,8,21],lookAt:[5,2.8,6],fov:39,locationId:'projects',key:'pixelforge',projectId:'pixelforge'},
  {progress:.435,position:[9,10,22],lookAt:[-.5,1.8,8],fov:40,locationId:'experience',key:'experience-0',index:0},
  {progress:.475,position:[7,11,16],lookAt:[-3,2,3],fov:40,locationId:'experience',key:'experience-1',index:1},
  {progress:.515,position:[5,13,9],lookAt:[-3.4,2.5,-2.5],fov:41,locationId:'experience',key:'experience-2',index:2},
  {progress:.56,position:[0,15,8],lookAt:[-7.8,5,-5.8],fov:42,locationId:'skills',key:'peak-0',index:0},
  {progress:.59,position:[4,17,7],lookAt:[-4.7,6,-7.1],fov:41,locationId:'skills',key:'peak-1',index:1},
  {progress:.62,position:[7,15,7],lookAt:[-1.4,5,-7.8],fov:41,locationId:'skills',key:'peak-2',index:2},
  {progress:.65,position:[-3,14,10],lookAt:[-9.6,4,-3.5],fov:43,locationId:'skills',key:'peak-3',index:3},
  {progress:.68,position:[12,15,8],lookAt:[2.1,4.5,-7.9],fov:42,locationId:'skills',key:'peak-4',index:4},
  {progress:.707,position:[18,15,21],lookAt:[3,2,5],fov:43,locationId:'achievements'},
  {progress:.735,position:[12,7,26],lookAt:[2,-.3,10.55],fov:40,locationId:'achievements',key:'fall-0',index:0},
  {progress:.765,position:[8,6,25],lookAt:[3.6,-.3,10.2],fov:41,locationId:'achievements',key:'fall-1',index:1},
  {progress:.82,position:[-1,10,19],lookAt:[-8,2,4],fov:42,locationId:'personal',key:'personal'},
  {progress:.895,position:[14,13,25],lookAt:[2.5,2,6.45],fov:44,locationId:'contact',key:'contact'},
  {progress:.955,position:[29,16,14],lookAt:[14,2,-6],fov:43,locationId:'lab',key:'lab'},
  {progress:1,position:[34,29,38],lookAt:[2,.5,-1],fov:42,locationId:'lab',key:'ending'}
];
export const sections=[
  {id:'about',from:0,to:.175,anchor:.09},
  {id:'projects',from:.175,to:.412,anchor:.205},
  {id:'experience',from:.412,to:.538,anchor:.435},
  {id:'skills',from:.538,to:.702,anchor:.56},
  {id:'achievements',from:.702,to:.787,anchor:.735},
  {id:'personal',from:.787,to:.857,anchor:.82},
  {id:'contact',from:.857,to:.929,anchor:.895},
  {id:'lab',from:.929,to:1.001,anchor:.955}
];
export function beatAt(progress){
  if(progress<.025)return null;
  const section=sections.find(s=>progress>=s.from&&progress<s.to)||sections.at(-1);
  const candidates=waypoints.filter(w=>w.locationId===section.id&&w.key&&w.key!=='ending');
  let beat=candidates[0];for(const candidate of candidates)if(Math.abs(candidate.progress-progress)<Math.abs(beat.progress-progress))beat=candidate;
  return {...beat,section,sectionIndex:sections.indexOf(section),ending:progress>.983};
}
export function progressFor(id,project){return waypoints.find(w=>w.projectId===project&&project)?.progress??sections.find(s=>s.id===id)?.anchor??0;}
