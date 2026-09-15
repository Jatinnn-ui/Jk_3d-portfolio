// Content is deliberately separate from geometry. Add verified URLs here to enable links.
export const profile = {
  name: 'Jatin Kashyap', role: 'AI Full Stack Developer',
  statement: 'I build AI-powered products and interactive web experiences.',
  bio: 'B.Tech CSE graduate focused on building practical AI, full-stack and interactive web products.',
  location: 'Gurugram, India', status: 'Open to opportunities',
  email: null, github: null, linkedin: null, resume: null
};
export const projects = [
  { id:'maya', name:'MAYA AI', subtitle:'AI English Learning Platform', description:'Practice English through natural voice conversations with an AI tutor.', functionality:'A conversational learning experience centered on spoken English practice and natural interaction.', technologies:['React.js','Next.js','Python','AI APIs'], status:'Featured project', demoUrl:null, githubUrl:null, featured:true, buildingPosition:[6,1.5,3] },
  { id:'forge', name:'FORGE AI', subtitle:'AI Agent Builder', description:'Create and configure AI-powered agents and workflows through a visual interface.', functionality:'A visual configuration layer for composing agents, defining their behavior, and connecting AI-powered workflows.', technologies:['React.js','TypeScript','AI APIs','Node.js'], status:'Featured project', demoUrl:null, githubUrl:null, featured:true, buildingPosition:[9,1.5,1] },
  { id:'chess', name:'CHESS AI', subtitle:'Interactive Chess Experience', description:'Browser-based chess with legal move validation and a Minimax-powered AI opponent.', functionality:'A Minimax decision tree evaluates possible moves, while game logic keeps play within the rules of chess.', technologies:['React.js','JavaScript','Minimax','Game Logic'], status:'Featured project', demoUrl:null, githubUrl:null, featured:true, buildingPosition:[9,1.5,5] },
  { id:'pixelforge', name:'PIXELFORGE', subtitle:'Interactive Image Editor', description:'A browser-based workspace for image transformations, adjustments, history, and multi-format export.', functionality:'Transform and adjust images, revisit edits through history, and export your work in multiple formats.', technologies:['Next.js','React','TypeScript','Canvas API','Tailwind CSS'], status:'Featured project', demoUrl:null, githubUrl:null, featured:true, buildingPosition:[5,1.5,6] }
];
export const skills = [
  {name:'Frontend',tools:['React.js','Next.js','JavaScript','TypeScript','Tailwind CSS'],capability:'Building responsive, interactive product interfaces.'},
  {name:'Backend',tools:['Node.js','Express.js','Python','FastAPI','REST APIs'],capability:'Connecting interfaces, application logic, and APIs.'},
  {name:'AI Engineering',tools:['Gemini API','LLM integration','AI Agents','RAG concepts','Prompt Engineering'],capability:'Exploring practical AI-powered applications and agent workflows.'},
  {name:'Data',tools:['PostgreSQL','MongoDB','Supabase','Database design','API / data integration'],capability:'Structuring product data and integrating it into applications.'},
  {name:'Automation & Tools',tools:['Git','GitHub','n8n','API integrations','Workflow automation'],capability:'Versioning work and connecting tools into repeatable workflows.'}
];
export const timeline = [
  {date:'2025–2026',title:'Independent Product Development',text:'AI-powered applications, full-stack products, interactive web experiences, automation workflows, and AI agents.'},
  {date:'2026',title:'B.Tech CSE Graduate',text:'St. Andrews Institute of Technology & Management · Computer Science & Engineering.'},
  {date:'CURRENT',title:'AI Engineering Focus',text:'Deepening expertise in AI applications, AI agents, full-stack architecture, automation, and Three.js / WebGL.'}
];
// Unverified Google certificates or other third-party awards are intentionally omitted.
export const achievements = [
  {date:'EDUCATION · 2026',title:'B.Tech in Computer Science',text:'Completed Computer Science & Engineering at St. Andrews Institute of Technology & Management.'},
  {date:'PRODUCT DEVELOPMENT',title:'Ideas made interactive',text:'AI learning, agent building, browser-based chess, and creative image editing — four different explorations of useful software.'}
];
export const experiments = [
  {name:'Procedural Worlds',description:'Interactive miniature environments and cinematic camera systems.',technologies:['Three.js','WebGL'],status:'Experiment'},
  {name:'Agent Workflows',description:'Explorations in tool calling, connected agents, and automation.',technologies:['AI APIs','n8n'],status:'Experiment'},
  {name:'Creative Coding',description:'Generative visuals, particle studies, and real-time graphics.',technologies:['JavaScript','WebGL'],status:'Experiment'},
  {name:'Interface Studies',description:'Small investigations into expressive interfaces and interaction systems.',technologies:['React','CSS'],status:'Experiment'}
];
export const locations = [
  {id:'about',name:'Observatory',category:'About',position:[0,5.8,-1],cameraPosition:[13,13,20],cameraTarget:[0,3,-1],labelOffset:[-10,-35],description:'The person behind the world',content:'profile',interactions:['hover','select']},
  {id:'projects',name:'The District',category:'Projects',position:[7.3,4,3.6],cameraPosition:[21,14,22],cameraTarget:[7,2,3],labelOffset:[48,5],description:'Ideas turned into products',content:'projects',interactions:['hover','select']},
  {id:'experience',name:'The River',category:'Experience',position:[-2,1.8,6.5],cameraPosition:[11,15,25],cameraTarget:[-1,1,5],labelOffset:[-26,27],description:'A journey, still unfolding',content:'timeline',interactions:['hover','select']},
  {id:'skills',name:'The Summits',category:'Skills',position:[-5,7.5,-6],cameraPosition:[6,17,16],cameraTarget:[-5,4,-6],labelOffset:[-30,-12],description:'A foundation for building',content:'skills',interactions:['hover','select']},
  {id:'achievements',name:'The Falls',category:'Highlights',position:[2,-.5,11.2],cameraPosition:[15,7,27],cameraTarget:[2,-1,10],labelOffset:[38,27],description:'Milestones along the way',content:'achievements',interactions:['hover','select'],secondary:true},
  {id:'personal',name:'The Grove',category:'Personal',position:[-9,2.8,3],cameraPosition:[3,12,22],cameraTarget:[-9,1,3],labelOffset:[-40,10],description:'Away from the keyboard',content:'personal',interactions:['hover','select'],secondary:true},
  {id:'contact',name:'Connection Bridge',category:'Contact',position:[3.5,2,6.4],cameraPosition:[16,11,25],cameraTarget:[3,1,6],labelOffset:[55,2],description:'Good things start with a conversation',content:'contact',interactions:['hover','select']},
  {id:'lab',name:'Outer Islands',category:'The Lab',position:[14,3,-6],cameraPosition:[27,13,12],cameraTarget:[14,2,-6],labelOffset:[18,-10],description:'A little beyond the familiar',content:'experiments',interactions:['hover','select'],secondary:true}
];
