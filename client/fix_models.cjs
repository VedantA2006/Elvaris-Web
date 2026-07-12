const fs = require('fs');
const path = require('path');
const modelsDir = 'c:/Users/samee/Desktop/Elvaris-Web-main/client/src/server/models';
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Match: const ModelName = mongoose.model('ModelName', schemaName);
  content = content.replace(
    /const\s+(\w+)\s*=\s*mongoose\.model\(\s*['"](\w+)['"]\s*,\s*(\w+)\s*\);/g,
    'const $1 = mongoose.models.$1 || mongoose.model(\'$2\', $3);'
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Fixed models');
