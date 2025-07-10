import fs from 'fs';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';

const files = process.argv.slice(2);

function formatSelector(selector) {
  return selector
    .replace(/\s*\n\s*/g, '')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

function formatDeclarations(nodes) {
  return nodes
    .filter(node => node.type === 'decl')
    .map(decl => {
      // change enter to space and make one line
      const cleanValue = decl.value
        .replace(/\s*\n\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const important = decl.important ? ' !important' : '';
      return `${decl.prop}: ${cleanValue}${important};`;
    })
    .join(' ');
}

function formatRule(rule) {
  const selector = formatSelector(rule.selector);
  const declarations = formatDeclarations(rule.nodes);
  return declarations ? `${selector} { ${declarations} }` : '';
}

function formatAtRule(atRule) {
  if (!atRule.nodes) {
    return `@${atRule.name} ${atRule.params};`;
  }
  const inner = atRule.nodes
    .map(node => {
      if (node.type === 'rule') return '  ' + formatRule(node);
      if (node.type === 'decl') {
        const value = node.value.replace(/\s*\n\s*/g, ' ').trim();
        const important = node.important ? ' !important' : '';
        return `  ${node.prop}: ${value}${important};`;
      }
      if (node.type === 'atrule') return '  ' + formatAtRule(node);
      if (node.type === 'comment') return `  /* ${node.text} */`;
      return '';
    })
    .filter(Boolean)
    .join('\n');

  return `@${atRule.name} ${atRule.params} {\n${inner}\n}`;
}

function getFormattedNodesWithLineInfo(root) {
  const result = [];
  for (const node of root.nodes) {
    let formatted = '';
    if (node.type === 'comment') {
      formatted = `/* ${node.text} */`;
    } else if (node.type === 'rule') {
      formatted = formatRule(node);
    } else if (node.type === 'atrule') {
      formatted = formatAtRule(node);
    }
    if (formatted) {
      result.push({
        formatted,
        startLine: node.source?.start?.line ?? 0,
        endLine: node.source?.end?.line ?? 0
      });
    }
  }

  return result;
}

function processCSS(css) {
  const root = postcss.parse(css, { syntax: postcssScss });
  const nodes = getFormattedNodesWithLineInfo(root);
  const output = [];
  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i];
    const prev = nodes[i - 1];
    if (i > 0) {
      const lineGap = current.startLine - prev.endLine;
      if (lineGap >= 2) {
        output.push(''); // make only one enter line
      }
    }
    output.push(current.formatted);
  }
  return output.join('\n') + '\n';
}

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const formatted = processCSS(content);
    fs.writeFileSync(file, formatted, 'utf8');
  } catch (e) {
    console.error(`Error formatting ${file}: ${e.message}`);
  }
}
