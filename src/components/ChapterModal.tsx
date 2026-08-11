import React, { useState, useEffect } from 'react';
import type { ChapterResponse, ChapterRequestData } from '../types';
import { X, Upload, Loader2, FileArchive } from 'lucide-react';
import { compressMultipleImages } from '../utils/imageCompressor';
import { isZipFile, extractImagesFromZip } from '../utils/zipExtractor';
import { ImageReorderGrid } from './ImageReorderGrid';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
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
        setIsProcessing(true);
        setErrorMsg('');

        let filesToCompress: File[] = [];

        // Check if any selected file is a ZIP archive
        const zipFile = selected.find(isZipFile);
        if (zipFile) {
          setProcessingStatus('Đang đọc và giải nén tệp ZIP...');
          const extracted = await extractImagesFromZip(zipFile, (current, total) => {
            setProcessingStatus(`Đang giải nén file ZIP (${current}/${total} trang)...`);
          });

          if (extracted.length === 0) {
            throw new Error('Tệp ZIP không chứa hình ảnh hợp lệ (.jpg, .png, .webp)');
          }
          filesToCompress = extracted;
        } else {
          filesToCompress = selected.filter((f) => f.type.startsWith('image/'));
        }

        setProcessingStatus(`Đang nén WebP (0/${filesToCompress.length})...`);
        const compressedList = await compressMultipleImages(
          filesToCompress,
          { maxWidth: 1920, maxHeight: 2560, quality: 0.8, outputType: 'image/webp' },
          (current, total) => {
            setProcessingStatus(`Đang nén WebP (Quality 80%): ${current}/${total} trang...`);
          }
        );

        setImageFiles((prev) => [...prev, ...compressedList]);
      } catch (err: any) {
         console.error('Lỗi khi xử lý file:', err);
         setErrorMsg(err.message || 'Lỗi khi giải nén hoặc nén ảnh trang');
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
        e.target.value = '';
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
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
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

            <label className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed ${isProcessing ? 'border-indigo-300 bg-indigo-50/80 cursor-wait' : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'} rounded-2xl transition-colors`}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                  <span className="text-xs font-semibold text-indigo-700">Đang xử lý tập tin tại trình duyệt...</span>
                  <span className="text-[11px] text-indigo-500 font-medium mt-1">{processingStatus}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2 text-indigo-500">
                    <Upload className="w-7 h-7" />
                    <FileArchive className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-700">Tải lên các trang ảnh hoặc File nén .ZIP</span>
                  <span className="text-[11px] text-slate-400 mt-1 text-center">
                    Hỗ trợ tệp ảnh (.jpg, .png, .webp) hoặc gói .zip chứa toàn bộ chương.<br/>
                    Tự động giải nén, sắp xếp thứ tự tự nhiên & nén WebP 80%.
                  </span>
                </>
              )}
              <input
                type="file"
                multiple
                disabled={isProcessing}
                accept="image/*,.zip,application/zip,application/x-zip-compressed,application/zip-compressed"
                onChange={handleFilesChange}
                className="hidden"
              />
            </label>

            {/* Drag & Drop Interactive Grid */}
            <ImageReorderGrid
              files={imageFiles}
              onReorder={setImageFiles}
              onRemove={removeFile}
              onClearAll={() => setImageFiles([])}
            />
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
              disabled={isSubmitting || isProcessing}
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

