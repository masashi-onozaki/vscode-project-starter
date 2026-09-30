const fs = require('fs/promises');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: minifyJs } = require('terser');

const filePath = process.argv[2];

if (!filePath) {
  throw new Error('Minify target file is required.');
}

const extension = path.extname(filePath).toLowerCase();
const basename = path.basename(filePath).toLowerCase();

if (basename.includes('.min.')) {
  process.exit(0);
}

const outputPath = filePath.replace(new RegExp(`${extension}$`, 'i'), `.min${extension}`);

async function minifyFile() {
  const source = await fs.readFile(filePath, 'utf8');
  let result;

  if (extension === '.css') {
    result = new CleanCSS({ level: 2 }).minify(source).styles;
  } else if (extension === '.js') {
    const minified = await minifyJs(source, { compress: true, mangle: true });
    if (minified.error) throw minified.error;
    result = minified.code;
  } else if (extension === '.html' || extension === '.htm') {
    result = await minifyHtml(source, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    });
  } else {
    process.exit(0);
  }

  await fs.writeFile(outputPath, result, 'utf8');
  console.log(`Created ${path.basename(outputPath)}`);
}

minifyFile().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
