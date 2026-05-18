import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('\n📂 Merging dapp build into frontend...');

const frontendDist = path.join(rootDir, 'frontend', 'dist');
const dappDist = path.join(rootDir, 'dapp', 'dist');
const targetDappFolder = path.join(frontendDist, 'dapp');

if (fs.existsSync(targetDappFolder)) {
  fs.rmSync(targetDappFolder, { recursive: true, force: true });
}

fs.cpSync(dappDist, targetDappFolder, { recursive: true });

console.log('✨ Combined build completed successfully!');
console.log('📁 Output directory to deploy on Vercel is: frontend/dist\n');
