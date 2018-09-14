const path = require('path');
const pascalCase = require('pascal-case');
const {execSync} = require('child_process');
process.chdir(path.resolve(__dirname, '..'));
const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  });
const packageName = require('../package').name;
console.log('\n🌬️  Cleaning old modules...');
exec('rimraf cjs esm umd');
console.log('\n🏗️  Generating ES modules...');
exec(`rollup -c scripts/config.js -f es -o esm/${packageName}.js`);
console.log('\n🏗️  Generating CommonJS modules...');
exec(`rollup -c scripts/config.js -f cjs -o cjs/${packageName}.js`);
console.log('\n🏗️  Generating UMD modules...');
const varName = pascalCase(packageName);
exec(`rollup -c scripts/config.js -f umd -n ${varName} -o umd/${packageName}.js`, {
  BUILD_ENV: 'development'
});
exec(`rollup -c scripts/config.js -f umd -n ${varName} -o umd/${packageName}.min.js`, {
  BUILD_ENV: 'production'
});
