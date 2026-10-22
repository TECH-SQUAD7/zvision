import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, ChevronRight, Menu, X, Scan, Languages, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { interactions, journeyUrl, type ExperienceState } from '@/lib/experience';

const GlassesScene = lazy(() => import('@/components/GlassesScene'));
const chapters = ['First encounter','Enter the lenses','See beyond','Intelligence','The architecture','Stay in the world'];
const ids = ['vision','lenses','experience','intelligence','design','journey'] as const;

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    {title:'Z—Vison — The world, understood.'},
    {name:'description',content:'An independent smart glasses concept. Explore a cinematic vision of intelligence that moves with you.'},
    {property:'og:title',content:'Z—Vison — The perception engine'},
    {property:'og:description',content:'Enter a new perspective. A cinematic exploration of dual-lens smart glasses and ambient intelligence.'},
    {property:'og:type',content:'website'}, {name:'twitter:card',content:'summary_large_image'},
  ] }), component: Index,
});

function Index() {
  const state = useRef<ExperienceState>({scroll:0,pointerX:0,pointerY:0,reduced:false,mobile:false});
  const [chapter,setChapter] = useState(0);
  const [menu,setMenu] = useState(false);
  const [demo,setDemo] = useState(0);
  const [phase,setPhase] = useState(0);
  const [journeyOpen,setJourneyOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const sceneWrap = useRef<HTMLDivElement>(null);
  const followUrl = journeyUrl(import.meta.env['VITE_JOURNEY_URL']);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0;
    const update=()=>{
      state.current.mobile=window.innerWidth<768;
      state.current.reduced=media.matches;
      const sections=ids.map(id=>document.getElementById(id));
      const starts=[0,1,2,3,4,5.5];
      let progress=0;
      sections.forEach((section,i)=>{if(!section)return;const top=section.getBoundingClientRect().top;if(top<=0){const start=starts[i]??0;const duration=i===4?1.5:1;progress=start+Math.min(1,-top/section.offsetHeight)*duration;}});
      state.current.scroll=progress;
      let active=0; sections.forEach((section,i)=>{if(section && section.getBoundingClientRect().top<window.innerHeight*.5)active=i;});
      setChapter(active);
      header.current?.classList.toggle('light-header',active===5);
      sceneWrap.current?.classList.toggle('final-scene',active===5);
    };
    const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    const pointer=(e:PointerEvent)=>{state.current.pointerX=e.clientX/window.innerWidth*2-1;state.current.pointerY=e.clientY/window.innerHeight*2-1;};
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('is-visible');}),{threshold:.18});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    update();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);window.addEventListener('pointermove',pointer,{passive:true});media.addEventListener('change',update);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);window.removeEventListener('pointermove',pointer);media.removeEventListener('change',update);};
  },[]);

  useEffect(()=>{
    setPhase(0);
    const t1=window.setTimeout(()=>setPhase(1),650);
    const t2=window.setTimeout(()=>setPhase(2),1750);
    return()=>{window.clearTimeout(t1);window.clearTimeout(t2);};
  },[demo,chapter]);

  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);setJourneyOpen(false);}};
    window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
  },[]);

  const go=(id:string | undefined)=>{if(!id)return;document.getElementById(id)?.scrollIntoView({behavior:state.current.reduced?'instant':'smooth'});setMenu(false);};
  const interaction=interactions[demo];
  if (!interaction) return null;
  return <main>
    <a className="skip-link" href="#experience">Skip to experience</a>
    <div ref={sceneWrap} className="product-stage" aria-label="Interactive 3D Z—Vison dual-lens smart glasses concept" role="img">
      <ClientOnly fallback={null}><Suspense fallback={null}><GlassesScene state={state} /></Suspense></ClientOnly>
    </div>
    <div className="film-grain" aria-hidden="true" />
    <header ref={header} className="site-header">
      <Button variant="ghost" className="wordmark" onClick={()=>go('vision')} aria-label="Z—Vison, back to first encounter">Z—VISON<span className="brand-dot" /></Button>
      <nav className="desktop-nav" aria-label="Main navigation">
        {['vision','experience','design','journey'].map(id=><Button variant="ghost" key={id} onClick={()=>go(id)} className={ids[chapter]===id?'nav-active':''}>{id.toUpperCase()}</Button>)}
      </nav>
      <Button variant="ghost" size="icon" className="menu-toggle" onClick={()=>setMenu(!menu)} aria-label={menu?'Close chapter menu':'Open chapter menu'} aria-expanded={menu} aria-controls="chapter-menu">{menu?<X size={18}/>:<><span className="menu-circle"/><Menu className="mobile-menu-icon" size={18}/></>}</Button>
    </header>
    {menu&&<nav id="chapter-menu" className="chapter-menu" aria-label="Chapter menu"><span className="system-label">THE PERCEPTION ENGINE</span>{chapters.map((name,i)=><Button key={name} variant="ghost" onClick={()=>go(ids[i])}><span>0{i}</span>{name}<ArrowUpRight/></Button>)}</nav>}
    <aside className={`chapter-rail ${chapter===5?'on-light':''}`} aria-label="Chapter progress">{chapters.map((name,i)=><Button key={name} variant="ghost" size="icon" className={i===chapter?'current':''} onClick={()=>go(ids[i])} aria-label={`Chapter 0${i}: ${name}`} aria-current={i===chapter?'step':undefined} title={name}><span/></Button>)}</aside>

    <section id="vision" className="chapter encounter">
      <div className="opening-coordinate system-label">INDEPENDENT HARDWARE CONCEPT <span>↗</span></div>
      <div className="opening-copy">
        <div className="system-label intro-reveal"><span className="tiny-cross">+</span> Z—VISON / THE PERCEPTION ENGINE</div>
        <h1><span className="line-mask"><span>The world,</span></span><span className="line-mask"><span className="editorial">understood.</span></span></h1>
        <p className="intro-sub">An exploration of intelligence<br/>that moves with you.</p>
        <Button variant="ghost" onClick={()=>go('lenses')} className="enter-link">ENTER A NEW PERSPECTIVE <ArrowUpRight size={16}/></Button>
      </div>
      <div className="product-caption system-label"><span className="status-dot"/> DUAL-LENS INTELLIGENCE<span className="caption-secondary">CONCEPT / 001</span></div>
      <div className="opening-bottom"><Button variant="ghost" onClick={()=>go('lenses')} className="scroll-cue"><span className="scroll-line"/><span>SCROLL TO EXPLORE</span><ArrowDown size={13}/></Button><span className="system-label opening-bottom-right">A DIFFERENT WAY<br/>OF SEEING.</span></div>
    </section>

    <section id="lenses" className="chapter lens-chapter">
      <div className="chapter-heading reveal"><span className="system-label">01 / THE SHIFT</span><h2>A new <span className="editorial">perspective.</span></h2><p>Not another screen to look at.<br/>A new way to see what’s already there.</p></div>
      <div className="lens-bottom system-label reveal"><span>REALITY, WITH A LITTLE MORE CONTEXT.</span><span>↓</span></div>
    </section>

    <section id="experience" className="chapter perception">
      <div className="perception-hud" aria-label="Conceptual augmented reality demonstration">
        <div className="hud-top system-label"><span><span className="status-dot"/> PERCEPTION ACTIVE</span><span>SIMULATED FIELD OF VIEW</span></div>
        <div className="focus-mark focus-left"/><div className="focus-mark focus-right"/>
        <div className="recognition-target"><i/><i/><i/><i/><div className="system-label">LANDSCAPE IDENTIFIED<span>ALPINE LAKE</span></div></div>
        <div className="depth-scale system-label">NEAR<span/><span/><span/><span/><span/>FAR</div>
        <div className="hud-horizon"/>
      </div>
      <div className="perception-copy reveal"><span className="system-label">02 / SEE BEYOND</span><h2>More understanding.<br/><span className="editorial">Less interruption.</span></h2><p>Information, only when it matters.<br/>The rest belongs to the world.</p></div>
      <span className="concept-label system-label">CONCEPTUAL AR DEMONSTRATION — NOT PRODUCT FOOTAGE</span>
    </section>

    <section id="intelligence" className="chapter intelligence">
      <div className="intelligence-scrim"/>
      <div className="ai-heading reveal"><span className="system-label">03 / AMBIENT INTELLIGENCE</span><h2>Intelligence,<br/><span className="editorial">without friction.</span></h2></div>
      <div className="ai-demo reveal">
        <div className="ai-symbol"><span/><span/><span/></div>
        <span className="system-label text-accent">Z—VISON / LISTENING</span>
        <p className="user-question" key={`q${demo}`}>“{interaction.question}”</p>
        <div className={`waveform ${phase<2?'active':''}`} aria-hidden="true">{Array.from({length:29},(_,i)=><span key={i}/>)}</div>
        <div className="response-slot" aria-live="polite">
          {phase>=1&&<p className="ai-reply">{interaction.reply}</p>}
          {phase>=2&&<div className="context-response" key={demo}><span className="system-label"><Check size={12}/>{interaction.label}</span><p>{interaction.result}</p></div>}
        </div>
      </div>
      <div className="demo-selectors" aria-label="Sample interactions">{interactions.map((item,i)=>{const Icon=[Scan,Languages,Navigation][i] ?? Scan;return <Button key={item.title} variant="ghost" aria-pressed={demo===i} className={demo===i?'selected':''} onClick={()=>setDemo(i)}><Icon size={16}/>{item.title}<ChevronRight size={14}/></Button>;})}</div>
      <span className="concept-label system-label">SCRIPTED INTERACTION / CONCEPTUAL DEMONSTRATION</span>
    </section>

    <section id="design" className="chapter hardware">
      <div className="hardware-heading reveal"><span className="system-label">04 / DESIGNED AROUND YOU</span><h2>Complexity,<br/><span className="editorial">made invisible.</span></h2></div>
      <div className="hardware-note reveal"><span className="system-label">PROPOSED ARCHITECTURE</span><p>A familiar silhouette.<br/>An entirely different possibility.</p></div>
      <div className="hardware-labels reveal">{['Dual transparent AR lenses','Vision sensor','Microphone array','Open-ear audio','Processing module','Power architecture'].map((label,i)=><div key={label} className={`hardware-label component-${i}`}><span className="system-label">0{i+1}</span><span>{label}</span><i/></div>)}</div>
      <div className="hardware-footer system-label"><span>ONE OBJECT. A NEW POINT OF VIEW.</span><span>ARCHITECTURAL EXPLORATION / NOT FINAL ENGINEERING</span></div>
    </section>

    <section id="journey" className="chapter ending">
      <div className="ending-copy reveal"><span className="system-label">05 / BACK TO WHAT MATTERS</span><h2>Stay in<br/>the <span className="editorial">world.</span></h2><p>Technology should bring us closer to reality,<br/>not further away from it.</p><span className="system-label ending-concept">Z—VISON / INDEPENDENT HARDWARE CONCEPT</span>
        {followUrl?<Button asChild variant="ghost" className="journey-cta"><a href={followUrl} target="_blank" rel="noopener noreferrer">FOLLOW THE JOURNEY <ArrowUpRight/></a></Button>:<Button variant="ghost" className="journey-cta" onClick={()=>setJourneyOpen(true)}>FOLLOW THE JOURNEY <ArrowUpRight/></Button>}
      </div>
      <footer><span className="footer-brand">Z—VISON</span><span className="system-label">PRECISION. SILENCE. INTELLIGENCE.</span><Button variant="ghost" onClick={()=>go('vision')} className="back-top system-label">BACK TO THE BEGINNING <ArrowUpRight size={14}/></Button></footer>
    </section>
    {journeyOpen&&<div className="dialog-backdrop" onClick={()=>setJourneyOpen(false)}><div className="journey-dialog" role="dialog" aria-modal="true" aria-labelledby="journey-title" onClick={e=>e.stopPropagation()}><Button autoFocus variant="ghost" size="icon" className="dialog-close" onClick={()=>setJourneyOpen(false)} aria-label="Close journey details"><X/></Button><span className="system-label">Z—VISON / A WORK IN PROGRESS</span><h2 id="journey-title">The journey<br/>is <span className="editorial">just beginning.</span></h2><p>Z—Vison is an independent hardware exploration. A public updates channel has not been connected yet.</p><p>No email addresses are collected here.</p><Button variant="outline" onClick={()=>setJourneyOpen(false)}>Back to the world <ArrowUpRight/></Button></div></div>}
  </main>;
}
