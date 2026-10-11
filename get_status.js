const cp = require('child_process');
const fs = require('fs');
let out = '';
const cmds = [
  'git branch --show-current',
  'git log --oneline -3',
  'git status -sb',
  'git --no-pager diff --stat',
  'powershell -Command "Get-ChildItem public\\\\brand -ErrorAction SilentlyContinue | Out-String"'
];
for (let c of cmds) {
  out += '### ' + c + '\n';
  try {
    out += cp.execSync(c, { encoding: 'utf-8' }) + '\n';
  } catch (e) {
    out += (e.stdout || e.stderr || e.toString()) + '\n';
  }
}
fs.writeFileSync('temp_out.txt', out, 'utf8');
