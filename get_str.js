const cp = require('child_process');
const fs = require('fs');
let out = '';
try {
  out = cp.execSync('Select-String -Path src\\components\\landing\\*.tsx -Pattern "getElementById|querySelector|ref=|id="', { shell: 'powershell.exe', encoding: 'utf8' });
} catch (e) {
  out = e.stdout || e.stderr || e.message;
}
fs.writeFileSync('temp_query2.txt', out, 'utf8');
