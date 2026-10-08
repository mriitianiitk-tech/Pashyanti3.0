import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseNaamJapaCSV, downloadCSVTemplate } from '../../utils/csvParser';
import { Upload, X, FileText, Download, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function NaamJapaUploadModal({ isOpen, onClose }) {
  const { addNaamJapaStotra, triggerFeedback } = useApp();
  const [title, setTitle] = useState('');
  const [deity, setDeity] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileProcess = (file) => {
    if (!file) return;
    setFileName(file.name);
    if (!title) {
      // Auto-extract title from file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setCsvContent(text);
      tryParse(text);
    };
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    handleFileProcess(file);
  };

  const tryParse = (text) => {
    try {
      setError('');
      const items = parseNaamJapaCSV(text);
      setParsedItems(items);
    } catch (err) {
      setError(err.message || 'Error parsing CSV file');
      setParsedItems([]);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCsvContent(val);
    if (val.trim()) {
      tryParse(val);
    } else {
      setParsedItems([]);
      setError('');
    }
  };

  const handleLoadSampleDemo = () => {
    setTitle('Vishnu Sahasranama Excerpt');
    setDeity('Lord Vishnu');
    const demoCsv = `sanskrit text,meaning,description
"ॐ विश्वस्मै नमः","Salutations to Him who is the Cosmos itself.","The entire manifest and unmanifest universe is His divine body."
"ॐ विष्णवे नमः","Salutations to the All-Pervading Supreme One.","He who penetrates and fills all space, consciousness, and living beings."
"ॐ वषट्काराय नमः","Salutations to Him for whom the Vedic sacrificial call 'Vashat' is uttered.","The ultimate beneficiary and pure essence of all spiritual oblations."
"ॐ भूतभव्यभवत्प्रभवे नमः","Salutations to the Lord of past, present, and future.","Transcending time, governing all sequences of creation, sustenance, and dissolution."
"ॐ भूतकृते नमः","Salutations to the Creator and Sustainer of all elements.","He creates all creatures and nature through His sovereign divine will."
"ॐ भूतभृते नमः","Salutations to Him who nourishes and supports all beings.","The foundation holding up the entire cosmos in harmonious order."
"ॐ भावाय नमः","Salutations to Him who exists as pure Being and Consciousness.","The eternal, unchanging reality underlying all ever-changing phenomena."
"ॐ भूतात्मने नमः","Salutations to the inner Self of all living beings.","The indwelling witness residing within the lotus of every heart."
"ॐ भूतभावनाय नमः","Salutations to Him who nurtures the spiritual growth of all beings.","Guiding the evolution of cosmic life towards liberation and truth."
"ॐ पूतात्मने नमः","Salutations to the Pure and Stainless Self.","Untouched by the dualities of karma, pleasure, pain, or delusion."`;
    setCsvContent(demoCsv);
    tryParse(demoCsv);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please provide a title for this Stotra (e.g. Vishnu Sahasranama).');
      return;
    }
    if (parsedItems.length === 0) {
      setError('No valid rows found to import.');
      return;
    }

    const newStotra = {
      id: `stotra-${Date.now()}`,
      title: title.trim(),
      deity: deity.trim() || 'Universal Divine',
      items: parsedItems,
      createdAt: new Date().toISOString()
    };

    addNaamJapaStotra(newStotra);
    triggerFeedback('chime');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 light:bg-white light:border-amber-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 light:border-amber-200 flex items-center justify-between bg-slate-950/40 light:bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 light:text-slate-900">
                Add Stotra for Naam Japa
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Upload CSV with 3 columns: <span className="text-amber-400 light:text-amber-700 font-mono">Sanskrit, Meaning, Description</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 light:hover:bg-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Metadata inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Stotra Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vishnu Sahasranama, Sri Rudram"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800/80 border border-slate-700 light:bg-amber-50/50 light:border-amber-300 text-slate-100 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Presiding Deity (Optional)
              </label>
              <input
                type="text"
                value={deity}
                onChange={(e) => setDeity(e.target.value)}
                placeholder="e.g. Lord Vishnu, Lord Shiva"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800/80 border border-slate-700 light:bg-amber-50/50 light:border-amber-300 text-slate-100 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              handleFileProcess(file);
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/30 light:border-amber-300 light:bg-amber-50/30'
            }`}
          >
            <input
              type="file"
              id="csv-file-input"
              accept=".csv,text/csv,text/plain"
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-slate-200 light:text-slate-800">
                {fileName ? (
                  <span className="text-amber-400 font-semibold">{fileName}</span>
                ) : (
                  <span>Click to browse CSV file or drag and drop here</span>
                )}
              </div>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Supports Sahasranamas (1000+ names), Suktas, Rudram, Stotras
              </p>
            </label>
          </div>

          {/* Template download & Quick demo buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 light:text-amber-700 light:hover:text-amber-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template Format
            </button>
            <button
              type="button"
              onClick={handleLoadSampleDemo}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-400 light:text-slate-600 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Load Sample Demo Data
            </button>
          </div>

          {/* Or Paste CSV text */}
          <details className="text-xs group">
            <summary className="cursor-pointer font-medium text-slate-400 hover:text-slate-300 light:text-slate-600 py-1">
              + Or paste raw CSV text directly
            </summary>
            <textarea
              value={csvContent}
              onChange={handleTextChange}
              rows={4}
              placeholder={`"Sanskrit Text","Meaning","Description"\n"ॐ विष्णवे नमः","Salutations to Vishnu...","The all-pervading Supreme Reality"`}
              className="w-full mt-2 p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] border border-slate-800 light:bg-amber-50 light:border-amber-300 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </details>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800 light:border-amber-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Successfully detected {parsedItems.length} lines/names!
                </span>
                <span className="text-slate-400">Previewing first 2:</span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {parsedItems.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 light:bg-amber-50 light:border-amber-200 text-xs space-y-1"
                  >
                    <div className="font-bold text-amber-400 light:text-amber-800 font-sanskrit text-sm">
                      {item.sanskrit}
                    </div>
                    {item.meaning && (
                      <div className="text-slate-300 light:text-slate-700">
                        <span className="text-slate-500 font-medium">Meaning:</span> {item.meaning}
                      </div>
                    )}
                    {item.description && (
                      <div className="text-slate-400 light:text-slate-600 italic">
                        <span className="text-slate-500 font-medium not-italic">Description:</span> {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 light:border-amber-200 flex items-center justify-end gap-2.5 bg-slate-950/40 light:bg-amber-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 light:text-slate-700 light:hover:bg-amber-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedItems.length === 0}
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-900/30 active:scale-95 transition-all"
          >
            Save to Naam Japa ({parsedItems.length} names)
          </button>
        </div>

      </div>
    </div>
  );
}
