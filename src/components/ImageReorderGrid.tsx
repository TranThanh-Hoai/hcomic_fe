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

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

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

  const handleNaturalSort = () => {
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    onReorder(sorted);
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3 mt-4 text-left">
      {/* Header Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#090a0f] border border-white/5 rounded-2xl text-xs">
        <div className="flex items-center gap-2 font-medium text-zinc-300">
          <span className="font-bold text-orange-400">{files.length} trang ảnh</span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {formatFileSize(totalSize)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNaturalSort}
            title="Sắp xếp tự động theo tên file (1, 2, 10...)"
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-[#141721] hover:bg-white/5 text-orange-400 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3" /> Tự động xếp theo tên
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1.5 text-[11px] font-medium bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/20 rounded-xl transition-colors cursor-pointer"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 italic">
        💡 Kéo và thả thẻ trang để sắp xếp lại thứ tự đọc mong muốn
      </p>

      {/* Grid Thumbnail Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-2 border border-white/5 bg-[#090a0f] rounded-2xl">
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
              className={`relative group flex flex-col justify-between bg-[#141721] border rounded-xl overflow-hidden transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                isDragging ? 'opacity-40 border-dashed border-orange-500 scale-95' : ''
              } ${
                isDragOver && !isDragging
                  ? 'border-2 border-orange-500 ring-2 ring-orange-500/20 scale-102 z-10'
                  : 'border-white/5 hover:border-orange-500/30 hover:shadow-lg'
              }`}
            >
              {/* Drag Handle & Page Badge Header */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#090a0f] border-b border-white/5 text-[11px]">
                <div className="flex items-center gap-1 font-bold text-orange-400">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400" />
                  <span>Trang {idx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400 rounded-md hover:bg-red-950/20 transition-colors cursor-pointer"
                  title="Xóa trang này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Image Preview Container */}
              <div className="relative w-full aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                {previews[idx] ? (
                  <img
                    src={previews[idx]}
                    alt={`Trang ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-[10px] text-zinc-600">Đang tải...</div>
                )}
              </div>

              {/* Footer File Details */}
              <div className="p-2 border-t border-white/5 bg-[#141721]">
                <p className="text-[11px] font-medium text-zinc-300 truncate" title={file.name}>
                  {file.name}
                </p>
                <span className="text-[10px] text-zinc-500">{formatFileSize(file.size)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
