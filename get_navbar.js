const cp = require('child_process');
const fs = require('fs');
let out = '';
out += '### Get-Content src\\components\\landing\\Navbar.tsx\n';
out += fs.readFileSync('src/components/landing/Navbar.tsx', 'utf-8');
out += '\n### Select-String -Path src\\components\\landing\\*.tsx -Pattern "getElementById|querySelector|ref=|id="\n';
try {
  out += cp.execSync('powershell -Command "Select-String -Path src\\\\components\\\\landing\\\\*.tsx -Pattern \\"getElementById|querySelector|ref=|id=\\""', { encoding: 'utf8' });
} catch (e) { out += e.stdout || e.stderr || e.message; }
fs.writeFileSync('temp_out3.txt', out, 'utf8');
