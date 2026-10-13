export default function Icon({name='arrow',className=''}:{name?:'arrow'|'down'|'back'|'star'|'plus',className?:string}){
 const paths={arrow:'M5 19 19 5M5 5h14v14',down:'M12 3v18M4 13l8 8 8-8',back:'M21 12H3m8-8-8 8 8 8',star:'M12 1v22M1 12h22M4.2 4.2l15.6 15.6M4.2 19.8 19.8 4.2',plus:'M12 4v16M4 12h16'};
 return <svg className={'icon icon-'+name+' '+className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name==='star'?1.25:1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]}/></svg>;
}
