// Convert a QA report (Markdown subset) to .docx.
// Usage: node tools/md2docx.js <in.md> <out.docx>
// Supports: #/##/### headings, pipe tables, - bullets, 1. lists, **bold**, `code`, *italic*.
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, AlignmentType, LevelFormat, Footer, PageNumber, TableLayoutType } =
  require(path.join(__dirname, 'node_modules', 'docx'));

const [, , src, out] = process.argv;
const lines = fs.readFileSync(src, 'utf8').split('\n');
const title = (lines.find(l => /^# /.test(l)) || '# Report').slice(2).trim();

const FONT = 'Calibri';
const CONTENT_W = 11906 - 2 * 1152; // A4 portrait, 0.8" margins
const border = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
const borders = { top: border, bottom: border, left: border, right: border };

function runs(text, base = {}) {
  const res = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0, m;
  const push = (t, o) => { if (t) res.push(new TextRun({ text: t, font: FONT, ...base, ...o })); };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index), {});
    const tok = m[0];
    if (tok.startsWith('**')) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith('`')) push(tok.slice(1, -1), { font: 'Consolas', size: (base.size || 22) - 2, color: '404040' });
    else push(tok.slice(1, -1), { italics: true });
    last = m.index + tok.length;
  }
  push(text.slice(last), {});
  return res.length ? res : [new TextRun({ text: '', font: FONT, ...base })];
}

function splitRow(l) {
  const cells = []; let cur = ''; let tick = false;
  const s = l.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (const ch of s) {
    if (ch === '`') tick = !tick;
    if (ch === '|' && !tick) { cells.push(cur.trim()); cur = ''; } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function makeTable(rows) {
  const header = rows[0];
  const body = rows.slice(1);
  const n = header.length;
  const emptyHeader = header.every(c => c === '');
  const lens = Array.from({ length: n }, (_, i) =>
    Math.min(60, Math.max(6, ...rows.map(r => (r[i] || '').replace(/[*`]/g, '').length))));
  const total = lens.reduce((a, b) => a + b, 0);
  let widths = lens.map(l => Math.max(900, Math.round(CONTENT_W * l / total)));
  const sum = widths.reduce((a, b) => a + b, 0);
  widths = widths.map(w => Math.round(w * CONTENT_W / sum));
  widths[n - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);

  const cell = (txt, i, head) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA },
    shading: head ? { fill: 'E7EEF7', type: ShadingType.CLEAR, color: 'auto' }
      : (emptyHeader && i === 0 ? { fill: 'F5F5F5', type: ShadingType.CLEAR, color: 'auto' } : undefined),
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: runs(txt, { size: 18, bold: head || (emptyHeader && i === 0) ? true : undefined }) })],
  });
  const trs = [];
  if (!emptyHeader) trs.push(new TableRow({ tableHeader: true, children: header.map((c, i) => cell(c, i, true)) }));
  for (const r of body) trs.push(new TableRow({ children: Array.from({ length: n }, (_, i) => cell(r[i] || '', i, false)) }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, rows: trs });
}

const children = [];
let numInstance = 0;
let titleDone = false;
for (let i = 0; i < lines.length;) {
  const l = lines[i];
  let m;
  if (/^\s*\|/.test(l)) {
    const rows = [];
    while (i < lines.length && /^\s*\|/.test(lines[i])) {
      if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) rows.push(splitRow(lines[i]));
      i++;
    }
    children.push(makeTable(rows));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    continue;
  }
  if (/^---\s*$/.test(l) || l.trim() === '') { i++; continue; }
  if ((m = l.match(/^(#{1,3})\s+(.*)/))) {
    if (m[1].length === 1 && !titleDone) {
      titleDone = true;
      children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: runs(m[2], { size: 40, bold: true, color: '1F3864' }) }));
    } else {
      const H = [null, HeadingLevel.HEADING_1, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2][m[1].length];
      children.push(new Paragraph({ heading: H, children: runs(m[2]) }));
    }
    i++; continue;
  }
  if ((m = l.match(/^(\s*)- (.*)/))) {
    children.push(new Paragraph({ numbering: { reference: 'bullets', level: m[1].length >= 2 ? 1 : 0 }, children: runs(m[2]) }));
    i++; continue;
  }
  if ((m = l.match(/^\s*\d+\.\s+(.*)/))) {
    if (!/^\s*\d+\.\s+/.test(lines[i - 1] || '')) numInstance++;
    children.push(new Paragraph({ numbering: { reference: 'numbers', level: 0, instance: numInstance }, children: runs(m[1]) }));
    i++; continue;
  }
  children.push(new Paragraph({ spacing: { after: 120 }, children: runs(l) }));
  i++;
}

const doc = new Document({
  creator: 'QA', title,
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, color: '1F3864', font: FONT }, paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 25, bold: true, color: '2E5597', font: FONT }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: 'bullets', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } } ] },
    { reference: 'numbers', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } } ] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1152, bottom: 1152, left: 1152, right: 1152 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: `${title} · Page `, font: FONT, size: 16, color: '808080' }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '808080' }) ] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(out, b); console.log('wrote', out, b.length, 'bytes'); });
