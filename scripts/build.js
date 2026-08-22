import { cpSync,mkdirSync,rmSync } from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist',{recursive:true});for(const p of ['src','package.json','README.md','LICENSE'])cpSync(p,`dist/${p}`,{recursive:true});console.log('Built dist/');
