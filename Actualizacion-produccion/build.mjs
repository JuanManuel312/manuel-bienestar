import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const esbuild=require(process.env.LOCAL_ESBUILD_PATH||'esbuild');
fs.mkdirSync('public',{recursive:true});
await esbuild.build({entryPoints:['src/main.tsx'],bundle:true,minify:true,format:'iife',jsx:'automatic',outfile:'public/app.js',nodePaths:process.env.LOCAL_NODE_MODULES?[process.env.LOCAL_NODE_MODULES]:[],define:{'process.env.NODE_ENV':'"production"'}});
fs.copyFileSync('src/globals.css','public/style.css');
const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Adiós al Metabolismo Lento | Manuel Santos</title><meta name="description" content="Entiende tu metabolismo y conecta tu alimentación con tu vida real. Una guía de Manuel Santos."><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/app.js" defer></script></body></html>';
fs.writeFileSync('public/index.html',html);
// Keep the former root entry current for hosts which still use the repository root.
fs.writeFileSync('index.html',html);
console.log('Frontend built.');
