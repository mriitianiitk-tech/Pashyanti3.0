/**
 * Robust CSV parser that handles multi-line fields, quoted cells, and quotes escaping.
 * Supports the 3-column specification: Sanskrit Text, Meaning, Description.
 */
export function parseNaamJapaCSV(csvText) {
  if (!csvText || !csvText.trim()) {
    throw new Error('CSV text is empty.');
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  // Clean BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  while (i < csvText.length) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quotes
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (!insideQuotes && char === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (!insideQuotes && (char === '\r' || char === '\n')) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  // Push remainder field and row
  currentRow.push(currentField.trim());
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    throw new Error('No valid records found in CSV file.');
  }

  // Determine if first row is header
  let startIndex = 0;
  const firstRow = rows[0].map((c) => c.toLowerCase());
  const isHeader =
    firstRow.some((c) => c.includes('sanskrit') || c.includes('name') || c.includes('text') || c.includes('mantra')) ||
    firstRow.some((c) => c.includes('meaning') || c.includes('arth') || c.includes('translation')) ||
    firstRow.some((c) => c.includes('description') || c.includes('desc') || c.includes('commentary'));

  let sanskritIdx = 0;
  let meaningIdx = 1;
  let descIdx = 2;

  if (isHeader) {
    startIndex = 1;
    // Map indices if named headers exist
    firstRow.forEach((col, idx) => {
      if (col.includes('sanskrit') || col.includes('name') || col.includes('text') || col.includes('line')) {
        sanskritIdx = idx;
      } else if (col.includes('meaning') || col.includes('arth') || col.includes('trans')) {
        meaningIdx = idx;
      } else if (col.includes('desc') || col.includes('comment') || col.includes('detail') || col.includes('bhashya')) {
        descIdx = idx;
      }
    });
  }

  const items = [];
  for (let r = startIndex; r < rows.length; r++) {
    const row = rows[r];
    const sanskrit = row[sanskritIdx] !== undefined ? row[sanskritIdx].trim() : '';
    const meaning = row[meaningIdx] !== undefined ? row[meaningIdx].trim() : '';
    const description = row[descIdx] !== undefined ? row[descIdx].trim() : '';

    if (sanskrit) {
      items.push({
        id: `item-${r}-${Date.now().toString(36)}`,
        index: items.length + 1,
        sanskrit,
        meaning: meaning || '',
        description: description || ''
      });
    }
  }

  if (items.length === 0) {
    throw new Error('Could not find valid rows with Sanskrit text. Please ensure the CSV has text in the first column or labeled header.');
  }

  return items;
}

/**
 * Downloads a sample CSV template for the user to fill out.
 */
export function downloadCSVTemplate() {
  const sampleContent = `sanskrit text,meaning,description
"ॐ विष्णवे नमः","Salutations to Lord Vishnu, the all-pervading Supreme Reality.","He who encompasses and pervades the entire cosmos without boundaries."
"ॐ जिष्णवे नमः","Salutations to the Ever-Victorious One.","He who conquers ego, ignorance, and all cosmic hurdles."
"ॐ वामनाय नमः","Salutations to the One who appeared in the divine dwarf form.","Embodying humility, restoring cosmic dharma with three infinite steps."
"ॐ शम्भवे नमः","Salutations to the Source of auspiciousness and tranquility.","One from whom supreme bliss and auspicious benedictions emanate eternally."
"ॐ ईशानाय नमः","Salutations to the Supreme Ruler and Sovereign of all domains.","The all-governing consciousness sustaining the universe in rhythm."`;

  const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'pashyanti_naamjapa_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
