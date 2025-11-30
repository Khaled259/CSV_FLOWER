import React from 'react';

interface CsvTableProps {
  data: string[][];
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}

const CsvTable: React.FC<CsvTableProps> = ({ data, onCellChange }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
        <p>No valid CSV data to display.</p>
      </div>
    );
  }

  // Determine max columns to handle ragged rows
  const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-xl bg-slate-900">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-12 sticky left-0 bg-slate-800 z-10 border-r border-slate-700">
              #
            </th>
            {Array.from({ length: maxCols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider min-w-[150px]">
                Col {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-900 divide-y divide-slate-800">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500 sticky left-0 bg-slate-900 border-r border-slate-800">
                {rowIndex + 1}
              </td>
              {Array.from({ length: maxCols }).map((_, colIndex) => {
                const cellValue = row[colIndex] || '';
                return (
                  <td key={colIndex} className="px-2 py-1 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full bg-transparent border border-transparent focus:border-blue-500 focus:bg-slate-800 rounded px-2 py-1 text-sm text-slate-300 focus:text-white outline-none transition-all"
                      value={cellValue}
                      onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvTable;