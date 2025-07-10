import fs from 'fs/promises';

async function formatOnlyClosingBrackets(files) {
  for (const file of files) {
    try {
      let code = await fs.readFile(file, 'utf-8');

      // remove enter before closing tag /> and add space
      code = code.replace(/\s*\n\s*(\/>)/g, ' $1');

      // remove enter before closing tag >
      code = code.replace(/\s*\n\s*(>)/g, '$1');

      await fs.writeFile(file, code, 'utf-8');
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

const stagedFiles = process.argv.slice(2); // lint-staged file lists
if (stagedFiles.length === 0) {
  console.log('No staged files to format.');
  process.exit(0);
}

formatOnlyClosingBrackets(stagedFiles);
