import React, { useState } from 'react';
import type { CommentResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Edit2, Trash2, Check, X, User, Flag } from 'lucide-react';
import { ReportModal } from './ReportModal';

interface CommentSectionProps {
  comments: CommentResponse[];
  onAddComment: (content: string) => Promise<void>;
  onUpdateComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
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

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 soft-shadow space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-800">
          Bình Luận ({comments.length})
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
              placeholder="Chia sẻ cảm nghĩ của bạn về truyện..."
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-200"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-center text-xs text-indigo-700">
          Vui lòng <span className="font-bold underline">Đăng nhập</span> để tham gia thảo luận cùng độc giả.
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
          </p>
        ) : (
          comments.map((comment) => {
            const isOwner = user && user.username === comment.username;
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="flex gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {comment.username ? comment.username[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {comment.username}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {isOwner && !isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(comment)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Sửa bình luận"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {!isOwner && isAuthenticated && (
                      <button
                        onClick={() => setReportingComment(comment)}
                        className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
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
                        className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-md"
                        >
                          <X className="w-3.5 h-3.5 inline mr-1" /> Hủy
                        </button>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="px-2.5 py-1 text-xs bg-indigo-600 text-white font-medium rounded-md shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 inline mr-1" /> Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })
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
