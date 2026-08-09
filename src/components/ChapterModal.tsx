import React, { useState, useEffect } from 'react';
import type { ChapterResponse, ChapterRequestData } from '../types';
import { X, Upload, FileText, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { compressMultipleImages, formatFileSize } from '../utils/imageCompressor';

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChapterRequestData, imageFiles: File[]) => Promise<void>;
  initialData?: ChapterResponse | null;
  comicTitle?: string;
}

export const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  comicTitle,
}) => {
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setChapterNumber(initialData.chapterNumber || 1);
      setTitle(initialData.title || '');
      setImageFiles([]);
    } else {
      setChapterNumber(1);
      setTitle('');
      setImageFiles([]);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      try {
        setIsCompressing(true);
        setErrorMsg('');
        setCompressProgress({ current: 0, total: selected.length });
        
        // Tự động resize (max 1920x2560) & nén quality 80% sang WebP ngay trên trình duyệt người dùng
        const compressedList = await compressMultipleImages(
          selected,
          { maxWidth: 1920, maxHeight: 2560, quality: 0.8, outputType: 'image/webp' },
          (current, total) => setCompressProgress({ current, total })
        );
        setImageFiles((prev) => [...prev, ...compressedList]);
      } catch (err) {
        console.error('Lỗi khi nén ảnh trang:', err);
        setImageFiles((prev) => [...prev, ...selected]);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterNumber || chapterNumber <= 0) {
      setErrorMsg('Số chương phải lớn hơn 0');
      return;
    }
    if (!initialData && imageFiles.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 ảnh trang truyện');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmit({ chapterNumber, title }, imageFiles);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin chương');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? 'Chỉnh Sửa Chương' : 'Thêm Chương Mới'}
            </h2>
            {comicTitle && (
              <p className="text-xs text-slate-500 font-medium">Truyện: {comicTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số chương <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseFloat(e.target.value))}
                placeholder="VD: 1, 2, 2.5..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề chương
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Khởi đầu mới..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Danh sách ảnh trang truyện {initialData ? '(Để trống nếu không thay đổi)' : '*'}
            </label>

            <label className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed ${isCompressing ? 'border-indigo-300 bg-indigo-50/80 cursor-wait' : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'} rounded-2xl transition-colors`}>
              {isCompressing ? (
                <>
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                  <span className="text-xs font-semibold text-indigo-700">Đang nén ảnh WebP (Quality 80%)...</span>
                  <span className="text-[11px] text-indigo-500 font-medium mt-1">Đang xử lý {compressProgress.current} / {compressProgress.total} tệp</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-xs font-semibold text-indigo-700">Tải lên các trang ảnh</span>
                  <span className="text-[11px] text-slate-400 mt-1">Hệ thống sẽ tự động resize & nén sang WebP (Quality 80%) tại trình duyệt</span>
                </>
              )}
              <input
                type="file"
                multiple
                disabled={isCompressing}
                accept="image/*"
                onChange={handleFilesChange}
                className="hidden"
              />
            </label>

            {imageFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-600">Đã nén ({imageFiles.length} trang):</p>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tổng dung lượng: {formatFileSize(imageFiles.reduce((acc, f) => acc + f.size, 0))}
                  </span>
                </div>
                {imageFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 text-xs bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <span className="truncate max-w-[280px] font-medium text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" /> Trang {idx + 1}: {file.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-500">{formatFileSize(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-200 transition-all"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Chương' : 'Tạo Chương Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
