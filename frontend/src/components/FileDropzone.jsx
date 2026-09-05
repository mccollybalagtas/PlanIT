import { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function FileDropzone({ onFiles, maxSize = 5 * 1024 * 1024 }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const processFiles = (files) => {
    const validFiles = files.filter(f => f.size <= maxSize && (f.type.startsWith('image/') || !f.type.startsWith('image/')));
    const oversized = files.filter(f => f.size > maxSize);
    if (oversized.length > 0) {
      console.warn(`Skipped ${oversized.length} files over ${maxSize / 1024 / 1024}MB`);
    }
    if (validFiles.length > 0) {
      onFiles(validFiles);
    }
  };

  const handleFileSelect = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
        ${dragOver
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.zip"
        onChange={handleFileSelect}
        className="hidden"
      />
      <PaperClipIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-indigo-600 dark:text-indigo-400">Drag & drop files</span>
        {' '}or click to browse
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        Supports all file types (max {Math.round(maxSize / 1024 / 1024)}MB each)
      </p>
    </div>
  );
}

export function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const preview = isImage ? file.preview || URL.createObjectURL(file) : null;

  return (
    <div className="relative group">
      {isImage ? (
        <img src={preview} alt={file.name} className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <PaperClipIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-20">{file.name}</p>
    </div>
  );
}
