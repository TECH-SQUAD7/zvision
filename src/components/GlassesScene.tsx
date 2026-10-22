import { Suspense, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { scenePalette as p, type ExperienceState } from '@/lib/experience';

function lensShape() {
  const s = new THREE.Shape();
  s.moveTo(-1.18, .69); s.bezierCurveTo(-.68,.84,.66,.84,1.13,.63);
  s.bezierCurveTo(1.37,.42,1.25,-.55,.94,-.76);
  s.bezierCurveTo(.54,-.95,-.67,-.92,-.98,-.65);
  s.bezierCurveTo(-1.22,-.44,-1.42,.43,-1.18,.69);
  return s;
}

function Tube({ points, radius=.045, color=p.graphite }: { points: number[][]; radius?: number; color?: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(v[0],v[1],v[2]))), [points]);
  return <mesh><tubeGeometry args={[curve,48,radius,10,false]} /><meshStandardMaterial color={color} metalness={.92} roughness={.23} /></mesh>;
}

function Glasses({ state }: { state: MutableRefObject<ExperienceState> }) {
  const group = useRef<THREE.Group>(null);
  const lenses = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const electronics = useRef<THREE.Group>(null);
  const { size } = useThree();
  const background = useMemo(() => new THREE.Color(p.dark), []);
  const darkColor = useMemo(() => new THREE.Color(p.dark), []);
  const skyColor = useMemo(() => new THREE.Color(p.sky), []);
  const warmColor = useMemo(() => new THREE.Color(p.white), []);
  const shape = useMemo(lensShape, []);
  const rim = useMemo(() => new THREE.CatmullRomCurve3(shape.getPoints(100).map(v => new THREE.Vector3(v.x,v.y,0)),true), [shape]);
  useFrame(({ camera, clock, scene }, rawDelta) => {
    const g = group.current; if (!g) return;
    const { scroll:s, pointerX, pointerY, mobile, reduced } = state.current;
    const dt = Math.min(rawDelta,.05), ease = reduced ? 1 : 1-Math.exp(-12*dt);
    const enter = THREE.MathUtils.smoothstep(s,.65,1.8);
    const returning = THREE.MathUtils.smoothstep(s,3.35,4.1);
    const end = THREE.MathUtils.smoothstep(s,5.05,5.5);
    const firstPerson = enter*(1-returning);
    const explode = THREE.MathUtils.smoothstep(s,3.9,4.45)*(1-THREE.MathUtils.smoothstep(s,5.05,5.5));
    g.visible = firstPerson < .999;
    g.position.x = THREE.MathUtils.lerp(g.position.x, mobile ? 0 : 2.8*(1-enter)*(1-returning)+end*3.3,ease);
    g.position.y = THREE.MathUtils.lerp(g.position.y, mobile && s<.65 ? 2.8 : (mobile&&end>.5 ? -3.2 : s>3.4 ? .6 : .1),ease);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x,.32*(1-enter)+pointerY*.025*(1-enter),ease);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y,-.48*(1-enter)+returning*.5+pointerX*.06*(1-enter),ease);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z,-.12*(1-enter)+returning*.05,ease);
    const scale = 1+firstPerson*10;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x,scale,ease));
    if (lenses.current) lenses.current.position.z = THREE.MathUtils.lerp(lenses.current.position.z,explode*1.4,ease);
    if (arms.current) arms.current.position.z = THREE.MathUtils.lerp(arms.current.position.z,-explode*.9,ease);
    if (electronics.current) electronics.current.position.y = THREE.MathUtils.lerp(electronics.current.position.y,explode*1.4,ease);
    const aspect = size.width/size.height;
    const baseDistance = (mobile ? 4.25 : 8.2)/(Math.tan(THREE.MathUtils.degToRad(32)/2)*aspect);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z,baseDistance*(1-firstPerson)+4*firstPerson,ease);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, .8*(1-firstPerson),ease);
    camera.lookAt(0,0,0);
    background.copy(darkColor).lerp(skyColor,firstPerson).lerp(warmColor,end); scene.background = background;
    g.traverse(obj => { if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) { const transparent=end>.01 || obj.material.name==='optical'; if(obj.material.transparent!==transparent){obj.material.transparent=transparent;obj.material.needsUpdate=true;} if (obj.material.name!=='optical') obj.material.opacity=1-end*.94; } });
    if (!reduced) g.position.y += Math.sin(clock.elapsedTime*.5)*.001;
  });
  return <group ref={group}>
    {[-1,1].map(side => <group key={side} position={[side*1.49,0,0]}>
      <mesh><tubeGeometry args={[rim,120,.057,12,true]} /><meshStandardMaterial color={p.graphite} metalness={.94} roughness={.22} /></mesh>
      <mesh position-z={.009}><tubeGeometry args={[rim,120,.012,8,true]} /><meshStandardMaterial color={p.edge} metalness={1} roughness={.16} /></mesh>
    </group>)}
    <group ref={lenses}>{[-1,1].map(side => <mesh key={side} position={[side*1.49,0,.01]}>
      <extrudeGeometry args={[shape,{depth:.027,bevelEnabled:true,bevelSize:.012,bevelThickness:.015,bevelSegments:3,steps:1,curveSegments:32}]} />
      <meshPhysicalMaterial name="optical" color={p.lens} metalness={.12} roughness={.06} transparent opacity={.13} thickness={.08} ior={1.46} clearcoat={1} iridescence={.35} iridescenceIOR={1.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>)}</group>
    <Tube points={[[-.33,.36,0],[-.19,.53,.06],[0,.57,.08],[.19,.53,.06],[.33,.36,0]]} radius={.065} />
    {[-1,1].map(side=><group key={side}>
      <Tube points={[[side*.36,.26,-.01],[side*.43,.02,-.13],[side*.47,-.23,-.22]]} radius={.029} color={p.edge} />
      <mesh position={[side*.47,-.21,-.23]} rotation-z={side*.2}><capsuleGeometry args={[.065,.2,6,12]} /><meshPhysicalMaterial color={p.lens} transparent opacity={.48} roughness={.4} /></mesh>
    </group>)}
    <group ref={arms}>{[-1,1].map(side=><group key={side}>
      <Tube points={[[side*2.74,.43,0],[side*2.9,.44,-.28],[side*2.99,.38,-1.65],[side*2.87,.19,-3.02],[side*2.65,-.28,-3.58]]} radius={.09} />
      <RoundedBox args={[.14,.23,1.38]} radius={.055} position={[side*2.95,.38,-.99]}><meshStandardMaterial color={p.graphite} roughness={.31} metalness={.73} /></RoundedBox>
      <mesh position={[side*2.72,.43,.07]} rotation-x={Math.PI/2}><cylinderGeometry args={[.077,.077,.075,24]} /><meshStandardMaterial color={p.edge} metalness={.9} roughness={.25} /></mesh>
      {[0,1,2].map(i=><mesh key={i} position={[side*3.025,.37,-1.12-i*.1]}><sphereGeometry args={[.017,8,8]} /><meshBasicMaterial color={p.black} /></mesh>)}
    </group>)}</group>
    <group ref={electronics}>
      <mesh position={[2.62,.51,.052]} rotation-x={Math.PI/2}><cylinderGeometry args={[.082,.082,.08,32]} /><meshStandardMaterial color={p.black} metalness={.6} roughness={.21} /></mesh>
      <mesh position={[2.62,.51,.101]}><sphereGeometry args={[.045,20,20]} /><meshPhysicalMaterial color={p.optical} metalness={.5} roughness={.07} /></mesh>
      {[-1,1].map(side=><RoundedBox key={side} args={[.13,.07,.68]} radius={.02} position={[side*2.95,.43,-.85]}><meshStandardMaterial color={p.circuit} metalness={.5} roughness={.4} /></RoundedBox>)}
    </group>
  </group>;
}

function Landscape({ state }: { state: MutableRefObject<ExperienceState> }) {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(150,100,120,80); const pos = g.getAttribute('position');
    for (let i=0;i<pos.count;i++) {
      const x=pos.getX(i), y=pos.getY(i);
      const shore = Math.max(0,Math.abs(x)-10+y*.1);
      const ridges = Math.pow(shore,.82)*.65*(1+Math.sin(x*.13+y*.095)*.4);
      const distant = Math.max(0,y-24)*.45*(1+.35*Math.sin(x*.2)+.2*Math.cos(x*.37));
      pos.setZ(i,ridges+distant+Math.sin(x*.28)*Math.cos(y*.2)*Math.min(shore*.15,2.2));
    }
    g.computeVertexNormals();
    const colors = new Float32Array(pos.count*3);
    const low=new THREE.Color(p.mountain), high=new THREE.Color(p.white), c=new THREE.Color();
    for(let i=0;i<pos.count;i++){c.copy(low).lerp(high,THREE.MathUtils.smoothstep(pos.getZ(i),22,42)*.7);colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(colors,3)); return g;
  },[]);
  const texture = useMemo(() => {
    const a = new Uint8Array(64*64*4);
    for(let i=0;i<64*64;i++){ const v=130+Math.sin(i*12.9898)*35; a[i*4]=v;a[i*4+1]=v;a[i*4+2]=v;a[i*4+3]=255; }
    const t=new THREE.DataTexture(a,64,64);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,12);t.needsUpdate=true;return t;
  },[]);
  useFrame(({clock})=>{if(group.current){ group.current.visible=state.current.scroll>.95&&state.current.scroll<3.9; if(!state.current.reduced) {group.current.position.x=Math.sin(clock.elapsedTime*.07)*.35;texture.offset.x=clock.elapsedTime*.002;} }});
  return <group ref={group} position={[0,-3,-40]}>
    <mesh geometry={geo} rotation-x={-Math.PI/2} position={[0,-.2,-20]}><meshStandardMaterial vertexColors roughness={.92} bumpMap={texture} bumpScale={.04} /></mesh>
    <mesh rotation-x={-Math.PI/2} position={[0,0,-15]}><planeGeometry args={[150,120]} /><meshStandardMaterial color={p.water} roughness={.24} metalness={.35} bumpMap={texture} bumpScale={.055} /></mesh>
  </group>;
}

export default function GlassesScene({ state }: { state: MutableRefObject<ExperienceState> }) {
  return <Canvas dpr={[1,1.5]} camera={{position:[0,.8,18],fov:32,near:.01,far:250}} gl={{antialias:true,alpha:true}}>
    <ambientLight intensity={.65} />
    <directionalLight position={[5,10,8]} intensity={3} color={p.white} />
    <directionalLight position={[-8,4,-4]} intensity={2} color={p.optical} />
    <Suspense fallback={null}>
      <Environment resolution={128}>
        <Lightformer intensity={7} position={[0,5,2]} scale={[10,1,1]} />
        <Lightformer intensity={3} position={[-6,1,1]} rotation-y={Math.PI/2} scale={[8,2,1]} />
        <Lightformer intensity={2} color={p.optical} position={[3,-1,-4]} scale={[5,.3,1]} />
      </Environment>
      <Glasses state={state} /><Landscape state={state} />
    </Suspense>
  </Canvas>;
}