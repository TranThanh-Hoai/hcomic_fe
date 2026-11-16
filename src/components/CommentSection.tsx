import React, { useState } from 'react';
import type { CommentResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Edit2, Trash2, Check, X, User, Flag, ChevronDown, Loader2 } from 'lucide-react';
import { ReportModal } from './ReportModal';

interface CommentSectionProps {
  comments: CommentResponse[];
  totalComments?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  onAddComment: (content: string) => Promise<void>;
  onUpdateComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  totalComments,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reportingComment, setReportingComment] = useState<CommentResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Không thể đăng bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (comment: CommentResponse) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleUpdate = async (id: number) => {
    if (!editContent.trim()) return;
    try {
      await onUpdateComment(id, editContent.trim());
      setEditingId(null);
      setEditContent('');
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật bình luận');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await onDeleteComment(id);
      } catch (err: any) {
        alert(err.message || 'Không thể xóa bình luận');
      }
    }
  };

  const displayCount = totalComments !== undefined ? totalComments : comments.length;

  return (
    <div className="bg-[#141721] rounded-3xl p-6 border border-white/5 soft-shadow space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <MessageSquare className="w-5 h-5 text-orange-400" />
        <h3 className="text-base font-bold text-white tracking-tight">
          Bình Luận Độc Giả ({displayCount})
        </h3>
      </div>

      {/* Write Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận, dự đoán cốt truyện của bạn..."
              className="w-full p-3.5 text-xs sm:text-sm bg-[#090a0f] border border-white/10 rounded-2xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all text-white placeholder-zinc-500 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Bình Luận'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#090a0f] border border-white/5 rounded-2xl p-4 text-center text-xs text-zinc-400">
          Vui lòng <span className="font-bold text-orange-400">Đăng nhập</span> để tham gia bình luận cùng cộng đồng.
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-3 pt-1">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
          </p>
        ) : (
          <>
            {comments.map((comment) => {
              const isOwner = user && user.username === comment.username;
              const isEditing = editingId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3.5 rounded-2xl bg-[#090a0f] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {comment.username ? comment.username[0].toUpperCase() : <User className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {comment.username}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(comment)}
                            className="p-1 text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
                            title="Sửa bình luận"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Xóa bình luận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {!isOwner && isAuthenticated && (
                        <button
                          onClick={() => setReportingComment(comment)}
                          className="p-1 text-zinc-600 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Báo cáo vi phạm"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="w-full p-2.5 text-xs bg-[#141721] border border-white/10 rounded-xl focus:border-orange-500/50 text-white resize-none outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/5 rounded-lg cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 inline mr-1" /> Hủy
                          </button>
                          <button
                            onClick={() => handleUpdate(comment.id)}
                            className="px-2.5 py-1 text-xs bg-orange-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 inline mr-1" /> Lưu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#090a0f] hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5 disabled:opacity-50 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                      <span>Đang tải bình luận...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Tải thêm bình luận</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ReportModal
        isOpen={Boolean(reportingComment)}
        onClose={() => setReportingComment(null)}
        reportType="COMMENT"
        targetId={reportingComment?.id || 0}
        targetTitle={reportingComment?.content ? `"${reportingComment.content.substring(0, 30)}..."` : undefined}
      />
    </div>
  );
};
