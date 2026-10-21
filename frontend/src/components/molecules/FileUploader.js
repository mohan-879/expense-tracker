'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';

export default function FileUploader({
  name,
  onFileSelect,
  accept = '.jpg,.jpeg,.png,.pdf',
  label = 'Upload Receipt / Bill',
  required = false,
  error = '',
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        name={name}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        required={required}
      />
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed ${
            error ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30'
          } rounded-xl p-4 text-center cursor-pointer transition-all`}
        >
          <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">{label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, PDF (Max 5MB)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-emerald-900 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-emerald-700">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-1 text-emerald-700 hover:text-rose-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
