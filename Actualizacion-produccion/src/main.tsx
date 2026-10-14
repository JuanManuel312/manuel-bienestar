import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from './Home';
import Access from './Access';
const path=location.pathname.replace(/\/$/,'');
createRoot(document.getElementById('root')!).render(path==='/pago'?<Access payment/>:path==='/mi-guia'?<Access/>:<Home/>);
