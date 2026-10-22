// Runs `node --test` over files matched by simple glob patterns. Node 20 (the declared floor)
// does not expand globs in `node --test`; Node 21+ does. Patterns support `**/` and `*` only.
// Usage: node scripts/run-node-tests.mjs [--node-flag ...] "test/**/*.test.js" "test/**/*.test.mjs"
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const root = process.cwd();
const flags = process.argv.slice(2).filter(arg => arg.startsWith('--'));
const patterns = process.argv.slice(2).filter(arg => !arg.startsWith('--'));

function toRegExp(pattern) {
  let source = '';
  for (let i = 0; i < pattern.length; i += 1) {
    if (pattern.startsWith('**/', i)) {
      source += '(?:.*/)?';
      i += 2;
    } else if (pattern[i] === '*') {
      source += '[^/]*';
    } else {
      source += pattern[i].replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${source}$`);
}

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

const matchers = patterns.map(toRegExp);
const bases = [...new Set(patterns.map(pattern => pattern.split('/')[0]))];
const files = bases
  .flatMap(base => walk(join(root, base), []))
  .filter(file => matchers.some(re => re.test(file)))
  .sort();

if (files.length === 0) {
  console.error(`No test files match: ${patterns.join(' ')}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...flags, ...files], { stdio: 'inherit' });
process.exit(result.status ?? 1);
