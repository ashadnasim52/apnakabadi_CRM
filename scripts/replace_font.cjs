const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./pages', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let dirty = false;
    
    // typography
    if (content.match(/text-2xl\b/)) {
      content = content.replaceAll(/\btext-2xl\b/g, 'text-xl md:text-2xl');
      dirty = true;
    }
    
    // padding
    if (content.match(/p-6\b/)) {
      content = content.replaceAll(/\bp-6\b/g, 'p-4 md:p-6');
      dirty = true;
    }
    
    // gap
    if (content.match(/gap-6\b/)) {
      content = content.replaceAll(/\bgap-6\b/g, 'gap-4 md:gap-6');
      dirty = true;
    }

    // specific max widths and min widths for tables to not overflow
    if (content.match(/min-w-\[\d+px\]/)) {
        content = content.replaceAll(/min-w-\[1000px\]/g, 'min-w-[800px]');
        content = content.replaceAll(/min-w-\[900px\]/g, 'min-w-[700px]');
        content = content.replaceAll(/min-w-\[800px\]/g, 'min-w-[600px]');
        content = content.replaceAll(/min-w-\[700px\]/g, 'min-w-[500px]');
        dirty = true;
    }

    if (dirty) {
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});

