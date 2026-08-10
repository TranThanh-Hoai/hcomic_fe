import React, { useState, useEffect } from 'react';
import { Trash2, GripVertical, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../utils/imageCompressor';

interface ImageReorderGridProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export const ImageReorderGrid: React.FC<ImageReorderGridProps> = ({
  files,
  onReorder,
  onRemove,
  onClearAll,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Create Object URLs for image previews
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    // Clean up Object URLs on unmount/change to prevent RAM leaks
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(draggedIndex, 1);
    updatedFiles.splice(dropIndex, 0, movedFile);

    onReorder(updatedFiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Sort files naturally by filename (1.jpg, 2.jpg, 10.jpg)
  const handleNaturalSort = () => {
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    onReorder(sorted);
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      {/* Header Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className="font-bold text-indigo-700">{files.length} trang ảnh</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {formatFileSize(totalSize)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNaturalSort}
            title="Sắp xếp tự động theo tên file (1, 2, 10...)"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors shadow-xs"
          >
            <ArrowUpDown className="w-3 h-3" /> Sắp xếp theo tên
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-2 py-1 text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 italic">
        💡 Kéo và thả thẻ trang để sắp xếp lại thứ tự trước khi đăng
      </p>

      {/* Grid Thumbnail Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-1.5 border border-slate-200 bg-slate-50/50 rounded-2xl">
        {files.map((file, idx) => {
          const isDragging = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={`${file.name}-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, idx)}
              className={`relative group flex flex-col justify-between bg-white border rounded-xl overflow-hidden shadow-2xs transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                isDragging ? 'opacity-40 border-dashed border-indigo-500 scale-95' : ''
              } ${
                isDragOver && !isDragging
                  ? 'border-2 border-indigo-500 ring-2 ring-indigo-200 scale-102 z-10'
                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              {/* Drag Handle & Page Badge Header */}
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-100/80 border-b border-slate-100 text-[11px]">
                <div className="flex items-center gap-1 font-bold text-indigo-700">
                  <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                  <span>Trang {idx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                  title="Xóa trang này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Image Preview Container */}
              <div className="relative w-full aspect-3/4 bg-slate-900/5 flex items-center justify-center overflow-hidden">
                {previews[idx] ? (
                  <img
                    src={previews[idx]}
                    alt={`Trang ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-[10px] text-slate-400">Đang tải...</div>
                )}
              </div>

              {/* Footer File Details */}
              <div className="p-2 border-t border-slate-100 bg-white">
                <p className="text-[11px] font-medium text-slate-700 truncate" title={file.name}>
                  {file.name}
                </p>
                <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
