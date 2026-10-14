export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };

// Body and fabric are separate geometry, not a scaled picture or a crossfade.
export function transformation(raw: number) {
  const p = clamp(raw);
  const body = smooth((p - .035) / .83);
  const loose = smooth((p - .38) / .52);
  const pull = smooth((p - .67) / .25);
  const n = (a: number, b: number) => +mix(a, b, body).toFixed(2);
  const hand = +mix(393, 453, pull).toFixed(2);
  const waist = +mix(390, 450, pull).toFixed(2);
  return {
    progress: p, body, loose, pull, hand, waist,
    cheek: n(63, 47), neck: n(33, 22),
    shirt: `M ${n(205,219)} 218 Q 270 241 ${n(335,321)} 218 L ${n(370,348)} 232 Q ${n(393,382)} 260 ${n(405,387)} 307 L ${n(365,350)} 326 L ${n(357,344)} 304 Q ${n(375,336)} 350 ${n(390,353)} 420 Q 337 ${n(450,439)} 270 ${n(443,431)} Q 200 ${n(451,449)} ${n(147,180)} 421 Q ${n(151,198)} 350 ${n(178,197)} 306 L ${n(170,183)} 329 L ${n(130,145)} 309 Q ${n(140,155)} 261 ${n(170,192)} 234 Z`,
    leftArm: `M ${n(143,158)} 300 Q ${n(124,145)} 350 ${n(131,157)} 405 L ${n(137,167)} 446 Q ${n(153,180)} 462 ${n(172,188)} 444 L ${n(172,186)} 404 Q ${n(169,174)} 357 ${n(180,190)} 314 Z`,
    rightArm: `M ${n(365,353)} 307 Q ${n(368,369)} 362 ${mix(373,413,pull)} 391 L ${hand-12} 424 Q ${hand-2} 442 ${hand+12} 434 Q ${hand+22} 425 ${hand+9} 408 L ${mix(411,443,pull)} 380 Q ${n(427,408)} 340 ${n(399,380)} 297 Z`,
    trousers: `M ${n(155,190)} 421 Q 266 410 ${waist} 421 L ${waist-3} 454 Q ${n(390,358)} 481 ${n(376,341)} 522 L ${n(351,330)} 667 Q ${n(323,311)} 681 ${n(287,289)} 668 L 273 512 Q 271 502 266 519 L ${n(250,248)} 668 Q ${n(220,222)} 681 ${n(184,205)} 669 L ${n(163,192)} 532 Q ${n(148,174)} 476 ${n(155,190)} 421 Z`,
    face: `M ${270-n(58,46)} 126 C ${270-n(72,54)} 170 ${270-n(64,45)} 199 246 211 Q 270 224 294 210 C ${270+n(65,46)} 194 ${270+n(70,53)} 166 ${270+n(58,46)} 124 Q 270 81 ${270-n(58,46)} 126 Z`,
    leftSleeve: n(159,174), rightSleeve:n(385,368),
    leftHem:n(159,190), rightHem:n(382,352),
  };
}
