import fs from 'fs';
const stats = fs.statSync('./public/assets/base_basic_pbr.glb');
console.log(`GLB size: ${stats.size / 1024 / 1024} MB`);
