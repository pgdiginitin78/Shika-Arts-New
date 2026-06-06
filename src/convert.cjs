const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const srcJsFiles = walk('./src_js');

srcJsFiles.forEach(jsFile => {
  const relativePath = path.relative('./src_js', jsFile);
  const srcFileTsx = path.join('./src', relativePath.replace(/\.js$/, '.tsx'));
  const srcFileTs = path.join('./src', relativePath.replace(/\.js$/, '.ts'));
  
  let targetExt = '.js';
  if (fs.existsSync(srcFileTsx)) {
    targetExt = '.jsx';
    fs.unlinkSync(srcFileTsx);
  } else if (fs.existsSync(srcFileTs)) {
    targetExt = '.js';
    fs.unlinkSync(srcFileTs);
  }

  const targetPath = path.join('./src', relativePath.replace(/\.js$/, targetExt));
  
  // Create dir if not exists
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.renameSync(jsFile, targetPath);
});

fs.rmSync('./src_js', { recursive: true, force: true });
console.log('Conversion complete.');
