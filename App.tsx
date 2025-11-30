import React, { useState, useEffect, useCallback } from 'react';
import { FileDown, FileText, Table as TableIcon, Trash2, Code, Info } from 'lucide-react';
import Button from './components/Button';
import CsvTable from './components/CsvTable';
import { parseCSV, generateCSV, downloadCSV } from './utils/csvHelper';

enum ViewMode {
  RAW = 'RAW',
  TABLE = 'TABLE'
}

const App: React.FC = () => {
  const [rawCsv, setRawCsv] = useState<string>("");
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>("export");
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RAW);
  const [error, setError] = useState<string | null>(null);

  // Parse CSV whenever raw input changes, but only if we are in RAW mode or initial load
  useEffect(() => {
    try {
      if (viewMode === ViewMode.RAW) {
        const parsed = parseCSV(rawCsv);
        setParsedData(parsed);
        setError(null);
      }
    } catch (e) {
      setError("Failed to parse CSV format.");
    }
  }, [rawCsv, viewMode]);

  // Handle cell edits from the table
  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setParsedData(prev => {
      const newData = [...prev.map(row => [...row])];
      // Ensure row exists
      if (!newData[rowIndex]) newData[rowIndex] = [];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  }, []);

  // Update raw CSV when switching back to RAW mode from TABLE mode
  // Or whenever table data changes if we want live sync (but expensive for large files)
  // Let's sync on mode switch or manually. Syncing on every keypress in table might be okay for small files.
  useEffect(() => {
    if (viewMode === ViewMode.TABLE) {
      const newRaw = generateCSV(parsedData);
      if (newRaw !== rawCsv) {
        setRawCsv(newRaw);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedData, viewMode]);

  const handleDownload = () => {
    const contentToDownload = viewMode === ViewMode.TABLE ? generateCSV(parsedData) : rawCsv;
    downloadCSV(contentToDownload, fileName);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setRawCsv("");
      setParsedData([]);
      setViewMode(ViewMode.RAW);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CSV-Flow</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Pure client-side CSV utility</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setViewMode(ViewMode.RAW)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === ViewMode.RAW 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4 mr-2" />
                Raw Input
              </button>
              <button
                onClick={() => setViewMode(ViewMode.TABLE)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === ViewMode.TABLE 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Table Editor
              </button>
            </div>
            
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-300 hidden md:block"
            >
              <Info className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
        
        {/* Actions Bar */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex items-center gap-3">
            <label className="text-sm font-medium text-slate-400 whitespace-nowrap">Filename:</label>
            <div className="relative flex items-center w-full md:w-64">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="filename"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-12 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <span className="absolute right-3 text-slate-500 text-xs font-mono">.csv</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button 
                variant="ghost" 
                onClick={handleClear} 
                className="text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full md:w-auto"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Clear
              </Button>
            <Button 
              variant="primary" 
              onClick={handleDownload}
              className="w-full md:w-auto shadow-lg shadow-blue-900/20"
              icon={<FileDown className="w-4 h-4" />}
            >
              Download CSV
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center">
            <span className="bg-red-800 w-1.5 h-1.5 rounded-full mr-2"></span>
            {error}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 min-h-[500px] relative">
          {viewMode === ViewMode.RAW ? (
            <div className="h-full flex flex-col">
              <label className="block text-sm font-medium text-slate-400 mb-2">Paste your CSV content here:</label>
              <textarea
                className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-300 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none shadow-inner"
                placeholder="id,name,value&#10;1,Item A,100&#10;2,Item B,200"
                value={rawCsv}
                onChange={(e) => setRawCsv(e.target.value)}
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col">
               <label className="block text-sm font-medium text-slate-400 mb-2">Review and edit data:</label>
               <div className="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-inner">
                 <CsvTable 
                    data={parsedData} 
                    onCellChange={handleCellChange} 
                 />
               </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>Secure & Private: Your data never leaves your browser.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;