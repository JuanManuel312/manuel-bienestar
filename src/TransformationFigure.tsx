import {transformation, mix} from '../lib/transformation';

export default function TransformationFigure({progress}:{progress:number}) {
 const s=transformation(progress);
 const n=(a:number,b:number)=>mix(a,b,s.body);
 return <svg className="transformation-figure" viewBox="0 0 560 740" role="img" aria-label="Ilustración conceptual: la misma persona pasa progresivamente de un cuerpo grande a uno delgado, y al final sostiene la cintura holgada de su pantalón.">
 <defs>
  <linearGradient id="skin" x1="0" x2="1" y1="0" y2=".7"><stop stopColor="#efbc87"/><stop offset=".5" stopColor="#dca26d"/><stop offset="1" stopColor="#b87345"/></linearGradient>
  <radialGradient id="face" cx=".36" cy=".35" r=".75"><stop stopColor="#f3c797"/><stop offset=".65" stopColor="#dda471"/><stop offset="1" stopColor="#be7c4e"/></radialGradient>
  <linearGradient id="fabric" x1="0" x2="1" y1="0" y2=".5"><stop stopColor="#d5cfba"/><stop offset=".25" stopColor="#f7f2e2"/><stop offset=".55" stopColor="#fffbed"/><stop offset="1" stopColor="#c9c4ae"/></linearGradient>
  <linearGradient id="pants" x1="0" x2="1" y1="0" y2=".4"><stop stopColor="#9f4f32"/><stop offset=".26" stopColor="#c9764d"/><stop offset=".65" stopColor="#db8b5d"/><stop offset="1" stopColor="#a35538"/></linearGradient>
  <linearGradient id="hair" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#514434"/><stop offset=".5" stopColor="#352c24"/><stop offset="1" stopColor="#211e1a"/></linearGradient>
  <linearGradient id="shoe" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#476e52"/><stop offset="1" stopColor="#1b382d"/></linearGradient>
  <radialGradient id="floor"><stop stopColor="#1f352e" stopOpacity=".22"/><stop offset="1" stopColor="#1f352e" stopOpacity="0"/></radialGradient>
  <filter id="figure-shadow" x="-25%" y="-15%" width="160%" height="140%"><feDropShadow dx="5" dy="11" stdDeviation="7" floodColor="#4a4937" floodOpacity=".13"/></filter>
 </defs>
 <ellipse cx="274" cy="701" rx={n(159,140)} ry="24" fill="url(#floor)"/>
 <g filter="url(#figure-shadow)">
  <path d="M205 642 L205 678 Q218 689 238 678 L238 642 Z M300 642 L300 678 Q312 689 331 678 L332 642 Z" fill="url(#skin)"/>
  <g fill="url(#shoe)"><path d="M201 668 Q220 678 242 667 L250 694 Q244 708 210 708 L170 706 Q159 696 179 684 Z"/><path d="M292 669 Q316 677 335 668 L362 683 Q379 694 367 703 L315 709 Q293 711 287 697 Z"/></g>
  <g fill="#f0e9ce"><path d="M167 698 Q199 704 249 695 L249 705 Q211 718 170 710 Q164 708 167 698"/><path d="M287 696 Q323 706 371 696 L370 706 Q323 719 289 707 Z"/></g>
  <g stroke="#eae4c9" strokeWidth="4" strokeLinecap="round"><path d="M191 688 L218 690 M198 682 L225 684 M321 681 L345 685 M315 687 L341 691"/></g>
  <path d={s.trousers} fill="url(#pants)"/>
  <path d={`M ${n(155,190)} 426 Q 272 ${mix(409,402,s.pull)} ${s.waist} 421 Q ${s.waist-4} ${mix(448,477,s.pull)} 279 452 Q 198 450 ${n(155,190)} 426`} fill="#633c29"/>
  <path d={`M ${n(177,214)} 405 Q 270 398 ${n(356,321)} 405 L ${n(346,315)} 447 Q 270 456 ${n(183,218)} 440 Z`} fill="url(#skin)"/>
  <path d={`M ${n(158,193)} 427 Q 268 458 ${s.waist-3} 426 L ${s.waist-5} 441 Q 275 478 ${n(158,192)} 442 Z`} fill="url(#pants)" stroke="#9f5639" strokeWidth="1.5"/>
  <path d={`M ${n(161,195)} 433 Q 282 469 ${s.waist-5} 433`} fill="none" stroke="#efb183" strokeWidth="2" opacity=".7"/>
  <path d={`M 270 459 L271 501 Q264 511 252 513 M ${n(190,215)} 456 Q ${n(178,194)} 483 ${n(173,195)} 505 M ${n(350,335)} 466 Q ${n(355,340)} 489 ${n(360,340)} 503`} fill="none" stroke="#85482f" strokeWidth="2.5" opacity=".45"/>
  <g fill="none" stroke="#8c4c31" strokeLinecap="round" opacity={.08+s.loose*.38} strokeWidth="3"><path d={`M ${n(195,219)} 506 Q 207 555 215 610 M ${n(237,240)} 561 Q 223 615 222 645 M 305 515 Q 329 558 316 599 M 318 610 L306 647`}/><path d={`M 196 662 Q219 650 246 662 M 292 663 Q312 651 332 660`}/></g>
  <path d={s.leftArm} fill="url(#skin)"/>
  <path d={s.rightArm} fill="url(#skin)"/>
  <path d={`M ${270-s.neck} 187 L ${270-s.neck} 229 Q270 250 ${270+s.neck} 229 L ${270+s.neck} 187 Z`} fill="url(#skin)"/>
  <path d={`M ${270-s.neck} 192 Q270 219 ${270+s.neck} 192 L ${270+s.neck} 207 Q270 231 ${270-s.neck} 208Z`} fill="#9e633e" opacity=".3"/>
  <path d={s.shirt} fill="url(#fabric)"/>
  <path d={`M ${n(205,219)} 219 Q270 260 ${n(335,321)} 219`} fill="none" stroke="#c0bda7" strokeWidth="9"/>
  <path d={`M ${n(205,219)} 216 Q270 254 ${n(335,321)} 216`} fill="none" stroke="#fffae9" strokeWidth="5"/>
  <path d={`M ${n(135,150)} 302 L ${n(170,185)} 319 M ${n(368,353)} 316 L ${n(400,382)} 300`} stroke="#b9b7a1" strokeWidth="4" opacity=".6"/>
  <path d={`M ${s.leftHem} 421 Q270 ${n(451,439)} ${s.rightHem} 421`} fill="none" stroke="#b9b6a0" strokeWidth="3" opacity=".6"/>
  <path d={`M ${n(184,201)} 306 Q ${n(187,226)} 354 ${n(167,195)} 415 M ${n(354,338)} 310 Q ${n(335,304)} 371 ${n(371,337)} 423`} stroke="#b6b39c" strokeWidth={1.5+s.loose*2.5} fill="none" opacity={.12+s.loose*.47}/>
  <g opacity={s.loose*.65} fill="none" strokeLinecap="round"><path d="M221 285 Q210 354 226 418 M303 279 Q317 346 299 427 M241 377 L248 432 M327 352 Q322 396 340 424" stroke="#c2bfaa" strokeWidth="3"/><path d="M226 286 Q215 355 231 418 M308 280 Q321 348 304 425" stroke="#fffdf2" strokeWidth="4"/></g>
  <path d={`M ${n(192,211)} 376 Q270 ${n(413,371)} ${n(354,331)} 377`} stroke="#b9b7a0" strokeWidth="2" fill="none" opacity={.25*(1-s.loose)}/>
  <g transform={`translate(${s.hand-393} 0)`}><path d="M386 416 Q383 403 390 398 Q398 395 402 407 L412 422 Q416 432 408 439 Q399 446 391 435 L383 429 Q379 422 386 416Z" fill="url(#skin)"/><path d="M389 419 Q399 415 406 425 M387 426 Q397 422 403 431" fill="none" stroke="#a36b44" strokeWidth="2" strokeLinecap="round"/></g>
  <g transform={`translate(${n(0,26)} 0)`}><path d="M137 431 Q134 450 146 461 Q152 465 155 456 Q163 463 166 454 Q174 452 168 437 L163 426 Z" fill="url(#skin)"/><path d="M146 443 L151 455 M155 441 L160 453" stroke="#af784e" strokeWidth="1.5" strokeLinecap="round"/></g>
  <g transform={`translate(270 150) scale(${n(1,.96)} 1) translate(-270 -150)`}>
   <ellipse cx={270-s.cheek+2} cy="158" rx="12" ry="18" fill="url(#skin)"/><ellipse cx={270+s.cheek-2} cy="158" rx="12" ry="18" fill="url(#skin)"/>
   <path d={s.face} fill="url(#face)"/>
   <path d={`M ${n(221,231)} 183 Q270 234 ${n(319,309)} 183`} stroke="#b47b50" strokeWidth="2.5" fill="none" opacity={.22*(1-s.body)}/>
   <ellipse cx="240" cy="169" rx={n(18,13)} ry="10" fill="#d48664" opacity=".26"/><ellipse cx="298" cy="169" rx={n(18,13)} ry="10" fill="#d48664" opacity=".22"/>
   <path d="M228 142 Q239 136 250 142 M286 141 Q298 135 308 142" stroke="#483628" strokeWidth="4" fill="none" strokeLinecap="round"/>
   <ellipse cx="242" cy="154" rx="5" ry="6.5" fill="#352d24"/><ellipse cx="295" cy="154" rx="5" ry="6.5" fill="#352d24"/>
   <circle cx="243.5" cy="152.5" r="1.5" fill="#fff4da"/><circle cx="296.5" cy="152.5" r="1.5" fill="#fff4da"/>
   <path d="M268 155 Q259 174 272 173" fill="none" stroke="#b7784a" strokeWidth="3" strokeLinecap="round"/>
   <path d={`M250 187 Q270 ${mix(198,204,s.body)} 290 185 Q270 195 250 187`} fill="#884b36"/>
   <path d="M255 188 Q271 193 284 187" stroke="#fff2d5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
   <g fill="url(#hair)"><path d="M212 154 Q193 126 211 101 Q222 77 247 83 Q277 60 305 88 Q339 88 331 135 L324 155 L313 121 Q289 133 279 109 Q250 139 226 119 Z"/><circle cx="222" cy="105" r="22"/><circle cx="246" cy="88" r="23"/><circle cx="273" cy="86" r="24"/><circle cx="298" cy="96" r="24"/><circle cx="318" cy="112" r="18"/></g>
   <g fill="none" stroke="#6c5940" strokeWidth="2" opacity=".5"><path d="M213 104 Q222 88 235 97 M235 86 Q248 72 259 85 M262 77 Q278 67 288 84 M289 90 Q304 81 315 99 M311 109 Q324 101 328 117"/></g>
  </g>
 </g>
 <g opacity={s.pull} className="clothes-callout">
  <path d="M405 455 Q470 499 501 466" stroke="#749242" strokeWidth="1.5" strokeDasharray="4 5" fill="none"/>
  <circle cx="405" cy="455" r="4" fill="#779448"/>
 </g>
 </svg>;
}
