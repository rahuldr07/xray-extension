const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['cm-entry.js'],
  bundle: true,
  minify: true,
  outfile: 'panel/codemirror.bundle.js',
  format: 'iife',
  globalName: 'CM',
}).then(() => console.log('bundled!'))
  .catch(() => process.exit(1));
