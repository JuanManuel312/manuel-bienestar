"use client";
import Icon from './Icon';

import {useEffect,useRef,useState} from 'react';
import TransformationFigure from './TransformationFigure';
import {clamp,smooth} from '../lib/transformation';

const scenes=[
 {label:'EL PUNTO DE PARTIDA',title:<>¿Y si el cambio<br/>empieza por <em>entender?</em></>,text:'Desliza. Sigue a la misma persona y descubre cómo cambia su silueta.',tag:'Cada historia tiene un comienzo.'},
 {label:'01 / ENTIENDE TU CUERPO',title:<>Menos confusión.<br/><em>Más contexto.</em></>,text:'Metabolismo: una palabra que escuchas mucho. Empieza por conocer qué significa.',tag:'Conocer tu cuerpo.'},
 {label:'02 / CONECTA LAS PIEZAS',title:<>Tu alimentación.<br/><em>Tu vida real.</em></>,text:'Lo que comes, cómo descansas, cómo te mueves. Mira el conjunto.',tag:'Conectar tus hábitos.'},
 {label:'03 / CAMBIA LA MIRADA',title:<>El cambio<br/>se empieza a <em>notar.</em></>,text:'La silueta cambia. La misma ropa empieza a quedar holgada. Sigue deslizando.',tag:'La misma persona. La misma ropa.'},
 {label:'AHORA, TU PRIMER PASO',title:<>Imagina el cambio.<br/><em>Empieza por entender.</em></>,text:'Adiós al Metabolismo Lento: Adelgaza sin Dietas. Tu guía para empezar con más claridad.',tag:'La misma ropa. Ahora, holgada.'},
];

export default function TransformationHero(){
 const section=useRef<HTMLElement>(null);const [progress,setProgress]=useState(0);const [reduced,setReduced]=useState(false);
 useEffect(()=>{let raf=0;const motion=matchMedia('(prefers-reduced-motion: reduce)');const setMotion=()=>setReduced(motion.matches);setMotion();motion.addEventListener('change',setMotion);
 const update=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const el=section.current;if(!el)return;const r=el.getBoundingClientRect();const stage=el.querySelector('.transformation-stage') as HTMLElement;setProgress(clamp(-r.top/Math.max(1,el.offsetHeight-stage.offsetHeight)));});};
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();return()=>{cancelAnimationFrame(raf);removeEventListener('scroll',update);removeEventListener('resize',update);motion.removeEventListener('change',setMotion)};},[]);
 const active=Math.min(4,Math.floor(progress*5));const finish=smooth((progress-.79)/.13);
 const jump=(p:number)=>{const el=section.current;if(!el)return;const stage=el.querySelector('.transformation-stage') as HTMLElement;window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(el.offsetHeight-stage.offsetHeight)*p,behavior:reduced?'instant':'smooth'});};
 return <section className="transformation" ref={section} id="recorrido" aria-label="Transformación ilustrada controlada por el scroll">
  <div className={'transformation-stage moment-'+active} style={{'--journey':progress,'--finish':finish} as React.CSSProperties}>
   <div className="journey-halo" aria-hidden="true"/><div className="journey-grain" aria-hidden="true"/>
   <div className="journey-layout">
    <div className="journey-narration">
     {scenes.map((scene,i)=>{const start=i/5;const alpha=i===active?1:0;return <div className={'journey-copy '+(i===active?'is-current':'')} key={start} aria-hidden={i!==active} style={{opacity:alpha}}><p className="eyebrow"><span className="dot"/>{scene.label}</p>{i===0?<h1>{scene.title}</h1>:<h2>{scene.title}</h2>}<p className="journey-description">{scene.text}</p></div>})}
     <div className="journey-action">{active===4?<a className="pill dark" href="#guia">Quiero entender mi metabolismo <span><Icon name="arrow"/></span></a>:<button className="journey-next" onClick={()=>jump(Math.min(.98,(active+1)*.2+.025))}>Sigue la transformación <span><Icon name="down"/></span></button>}<a href="#guia" className="journey-skip">Ir directamente a la guía <Icon name="arrow"/></a></div>
    </div>
    <div className="journey-person">
     <div className="journey-arch" aria-hidden="true"/><span className="journey-orbit orbit-left" aria-hidden="true"/><span className="journey-orbit orbit-right" aria-hidden="true"/>
     <TransformationFigure progress={progress}/>
     <span className="garment-note" style={{opacity:finish,transform:`translateY(${(1-finish)*15}px)`}}>La misma talla.<br/><em>Otra silueta.</em></span>
     <span className="person-caption">{scenes[active].tag}</span>
    </div>
   </div>
   <div className="journey-footer"><div className="journey-progress-head"><span>{active===4?'EL SIGUIENTE PASO ES TUYO':'DESLIZA PARA TRANSFORMAR'} <span aria-hidden="true"><Icon name="down"/></span></span><span>0{active+1} <i>/ 05</i></span></div><div className="journey-progress-track"><span style={{transform:`scaleX(${progress})`}}/></div><div className="journey-bottom"><div className="journey-stops" aria-label="Etapas de la ilustración">{scenes.map((_,i)=><button key={i} aria-label={'Ver etapa '+(i+1)} aria-current={active===i?'step':undefined} onClick={()=>jump(i===0?0:i*.2+.05)}><span/></button>)}</div><small>Transformación ilustrativa. No representa resultados ni plazos garantizados.</small></div></div>
  </div>
 </section>;
}
