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
            setProcessingStatus(`Đang nén WebP: ${current}/${total} trang...`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141721] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-white/10 space-y-5 max-h-[92vh] overflow-y-auto text-left">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {initialData ? 'Chỉnh Sửa Chương' : 'Thêm Chương Mới'}
            </h2>
            {comicTitle && (
              <p className="text-xs text-orange-400 font-medium">Bộ truyện: {comicTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Số chương <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseFloat(e.target.value))}
                placeholder="VD: 1, 2, 2.5..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Tiêu đề chương
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Khởi đầu mới..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-xl focus:border-orange-500/50 text-white placeholder-zinc-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Danh sách ảnh trang truyện {initialData ? '(Để trống nếu không thay đổi)' : '*'}
            </label>

            <label
              className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed ${
                isProcessing
                  ? 'border-orange-500/40 bg-orange-950/20 cursor-wait'
                  : 'border-white/10 bg-[#090a0f] hover:border-orange-500/30 hover:bg-white/5'
              } rounded-2xl transition-colors`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
                  <span className="text-xs font-bold text-white">Đang xử lý tập tin tại trình duyệt...</span>
                  <span className="text-[11px] text-orange-400 font-medium mt-1">{processingStatus}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2 text-orange-400">
                    <Upload className="w-7 h-7" />
                    <FileArchive className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-white">Tải lên các trang ảnh hoặc File nén .ZIP</span>
                  <span className="text-[11px] text-zinc-400 mt-1 text-center max-w-sm">
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#090a0f] hover:bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessing}
              className="px-5 py-2 text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập Nhật Chương' : 'Tạo Chương Mới'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
