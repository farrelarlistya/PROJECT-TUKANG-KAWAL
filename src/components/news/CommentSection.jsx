/**
 * CommentSection.jsx — Komponen komentar untuk halaman artikel
 *
 * Fitur:
 * - Menampilkan daftar komentar dengan avatar & nama user
 * - Formulir kirim komentar (hanya untuk user yang login)
 * - Edit & hapus komentar milik sendiri
 * - Reply ke komentar lain (nested 1 level)
 * - Animasi masuk & micro-interactions
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { getCommentsByArticle, addComment, updateComment, deleteComment } from '@/services/commentService';
import { timeAgo } from '@/utils/formatters';

export default function CommentSection({ articleId }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const textareaRef = useRef(null);
  const replyRef = useRef(null);

  // Muat komentar
  useEffect(() => {
    if (!articleId) return;
    loadComments();
  }, [articleId]);

  async function loadComments() {
    setLoading(true);
    const { data } = await getCommentsByArticle(articleId);
    setComments(data);
    setLoading(false);
  }

  // Kirim komentar baru
  async function handleSubmit(e) {
    e.preventDefault();
    if (!newComment.trim() || !user?.id) return;

    setSubmitting(true);
    const { data, error } = await addComment({
      articleId,
      userId: user.id,
      content: newComment,
    });

    if (!error && data) {
      setComments(prev => [...prev, data]);
      setNewComment('');
    }
    setSubmitting(false);
  }

  // Kirim reply
  async function handleReply(e, parentId) {
    e.preventDefault();
    if (!replyContent.trim() || !user?.id) return;

    setSubmitting(true);
    const { data, error } = await addComment({
      articleId,
      userId: user.id,
      content: replyContent,
      parentId,
    });

    if (!error && data) {
      setComments(prev => [...prev, data]);
      setReplyContent('');
      setReplyingTo(null);
    }
    setSubmitting(false);
  }

  // Update komentar
  async function handleUpdate(e, commentId) {
    e.preventDefault();
    if (!editContent.trim()) return;

    const { data, error } = await updateComment(commentId, editContent);
    if (!error && data) {
      setComments(prev => prev.map(c => c.id === commentId ? data : c));
      setEditingId(null);
      setEditContent('');
    }
  }

  // Hapus komentar
  async function handleDelete(commentId) {
    setDeletingId(commentId);
    const { error } = await deleteComment(commentId);
    if (!error) {
      // Hapus komentar dan semua reply-nya
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
    }
    setDeletingId(null);
  }

  // Struktur nested: root comments + replies
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  const totalCount = comments.length;

  return (
    <section className="comment-section mt-10 pt-8 border-t border-[#eaeaea]" id="komentar">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand to-[#3b82f6] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-[20px] font-bold text-[#222] m-0">Komentar</h3>
          <p className="text-[13px] text-[#888] m-0">
            {loading ? 'Memuat...' : `${totalCount} komentar`}
          </p>
        </div>
      </div>

      {/* Form Input Komentar */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment-form mb-8">
          <div className="flex gap-3 items-start">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[13px] shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.initials || 'U'
              )}
            </div>
            {/* Input Area */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar atau kritik Anda..."
                className="comment-textarea w-full min-h-[90px] p-4 border border-[#e0e0e0] rounded-xl text-[14px] font-dm-sans text-[#333] resize-y bg-white transition-all duration-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 placeholder:text-[#aaa]"
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] text-[#bbb]">
                  {newComment.length}/2000
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="comment-submit-btn py-2 px-5 bg-gradient-to-r from-brand to-[#3b82f6] text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-brand/25 hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </span>
                  ) : (
                    'Kirim Komentar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt mb-8 p-5 rounded-xl bg-gradient-to-r from-[#f0f4ff] to-[#f8f9ff] border border-[#e0e8ff] text-center">
          <p className="text-[14px] text-[#555] mb-3">
            Silakan login untuk meninggalkan komentar atau kritik.
          </p>
          <Link
            to="/login"
            className="inline-block py-2 px-6 bg-brand text-white text-[13px] font-semibold rounded-lg no-underline transition-all duration-200 hover:bg-brand-dark hover:shadow-md"
          >
            Masuk Sekarang
          </Link>
        </div>
      )}

      {/* Daftar Komentar */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#e8e8e8] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-[#e8e8e8] rounded" />
                <div className="h-3 w-full bg-[#e8e8e8] rounded" />
                <div className="h-3 w-3/4 bg-[#e8e8e8] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="comment-empty text-center py-10">
          <div className="text-[48px] mb-3 opacity-40 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-[15px] text-[#999] font-medium">Belum ada komentar.</p>
          <p className="text-[13px] text-[#bbb]">Jadilah yang pertama berkomentar!</p>
        </div>
      ) : (
        <div className="comment-list space-y-0">
          {rootComments.map((comment, idx) => (
            <div key={comment.id} className="comment-thread article-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              {/* Root Comment */}
              <CommentItem
                comment={comment}
                user={user}
                isAdmin={isAdmin}
                editingId={editingId}
                editContent={editContent}
                deletingId={deletingId}
                replyingTo={replyingTo}
                onStartEdit={(c) => { setEditingId(c.id); setEditContent(c.content); }}
                onCancelEdit={() => { setEditingId(null); setEditContent(''); }}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onStartReply={(c) => { setReplyingTo(c.id); setReplyContent(''); }}
                onCancelReply={() => { setReplyingTo(null); setReplyContent(''); }}
                setEditContent={setEditContent}
                isAuthenticated={isAuthenticated}
              />

              {/* Reply Form */}
              {replyingTo === comment.id && isAuthenticated && (
                <div className="ml-14 mt-2 mb-3 article-fade-in">
                  <form onSubmit={(e) => handleReply(e, comment.id)} className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.initials || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea
                        ref={replyRef}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Balas komentar ${comment.profiles?.full_name || 'user'}...`}
                        className="comment-textarea w-full min-h-[60px] p-3 border border-[#e0e0e0] rounded-lg text-[13px] font-dm-sans text-[#333] resize-y bg-white transition-all duration-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 placeholder:text-[#aaa]"
                        maxLength={1000}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                          className="py-1.5 px-3.5 bg-transparent border border-[#ddd] rounded-md text-[12px] font-medium text-[#666] cursor-pointer transition-colors duration-200 hover:bg-[#f5f5f5]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={!replyContent.trim() || submitting}
                          className="py-1.5 px-3.5 bg-brand text-white rounded-md text-[12px] font-semibold border-none cursor-pointer transition-all duration-200 hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Mengirim...' : 'Balas'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-14 article-fade-in">
                  <CommentItem
                    comment={reply}
                    user={user}
                    isAdmin={isAdmin}
                    editingId={editingId}
                    editContent={editContent}
                    deletingId={deletingId}
                    replyingTo={replyingTo}
                    onStartEdit={(c) => { setEditingId(c.id); setEditContent(c.content); }}
                    onCancelEdit={() => { setEditingId(null); setEditContent(''); }}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onStartReply={() => { setReplyingTo(comment.id); setReplyContent(''); }}
                    onCancelReply={() => { setReplyingTo(null); setReplyContent(''); }}
                    setEditContent={setEditContent}
                    isReply
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


/**
 * Komponen individual untuk setiap komentar
 */
function CommentItem({
  comment,
  user,
  isAdmin,
  editingId,
  editContent,
  deletingId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onStartReply,
  setEditContent,
  isReply = false,
  isAuthenticated,
}) {
  const isOwner = user?.id === comment.user_id;
  const canModify = isOwner || isAdmin;
  const isEditing = editingId === comment.id;
  const isDeleting = deletingId === comment.id;
  const authorName = comment.profiles?.full_name || 'Anonim';
  const authorInitials = comment.profiles?.initials || authorName.substring(0, 2).toUpperCase();
  const isEdited = comment.updated_at && comment.updated_at !== comment.created_at;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className={`comment-item flex gap-3 py-4 ${!isReply ? 'border-b border-[#f0f0f0]' : 'pb-2'} group`}>
      {/* Avatar */}
      <div className={`${isReply ? 'w-7 h-7 text-[10px]' : 'w-10 h-10 text-[13px]'} rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white flex items-center justify-center font-bold shrink-0 overflow-hidden`}>
        {comment.profiles?.avatar_url ? (
          <img src={comment.profiles.avatar_url} alt={authorName} className="w-full h-full object-cover" />
        ) : (
          authorInitials
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`font-semibold text-[#222] ${isReply ? 'text-[13px]' : 'text-[14px]'}`}>
            {authorName}
          </span>
          {isOwner && (
            <span className="text-[10px] font-medium text-brand bg-brand/8 py-0.5 px-1.5 rounded">Anda</span>
          )}
          <span className="text-[12px] text-[#aaa]">·</span>
          <span className="text-[12px] text-[#aaa]">{timeAgo(comment.created_at)}</span>
          {isEdited && (
            <span className="text-[11px] text-[#ccc] italic">(diedit)</span>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={(e) => onUpdate(e, comment.id)} className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment-textarea w-full min-h-[70px] p-3 border border-brand/30 rounded-lg text-[13px] font-dm-sans text-[#333] resize-y bg-[#fafbff] transition-all duration-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              maxLength={2000}
              autoFocus
            />
            <div className="flex gap-2 mt-1.5 justify-end">
              <button
                type="button"
                onClick={onCancelEdit}
                className="py-1.5 px-3.5 bg-transparent border border-[#ddd] rounded-md text-[12px] font-medium text-[#666] cursor-pointer transition-colors duration-200 hover:bg-[#f5f5f5]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!editContent.trim()}
                className="py-1.5 px-3.5 bg-brand text-white rounded-md text-[12px] font-semibold border-none cursor-pointer transition-all duration-200 hover:bg-brand-dark disabled:opacity-40"
              >
                Simpan
              </button>
            </div>
          </form>
        ) : (
          <p className={`text-[#444] leading-[1.6] whitespace-pre-wrap m-0 ${isReply ? 'text-[13px]' : 'text-[14px]'}`}>
            {comment.content}
          </p>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isAuthenticated && (
              <button
                onClick={() => onStartReply(comment)}
                className="comment-action-btn flex items-center gap-1 text-[12px] text-[#888] bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 hover:text-brand"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                </svg>
                Balas
              </button>
            )}

            {canModify && (
              <>
                <button
                  onClick={() => onStartEdit(comment)}
                  className="comment-action-btn flex items-center gap-1 text-[12px] text-[#888] bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 hover:text-[#e6a817]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>

                {showConfirmDelete ? (
                  <span className="flex items-center gap-1.5 text-[12px]">
                    <span className="text-[#c53030]">Hapus?</span>
                    <button
                      onClick={() => { onDelete(comment.id); setShowConfirmDelete(false); }}
                      disabled={isDeleting}
                      className="text-[12px] text-white bg-[#c53030] border-none rounded px-2 py-0.5 cursor-pointer hover:bg-[#9b2c2c] transition-colors duration-200 disabled:opacity-50"
                    >
                      {isDeleting ? '...' : 'Ya'}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="text-[12px] text-[#888] bg-transparent border border-[#ddd] rounded px-2 py-0.5 cursor-pointer hover:bg-[#f5f5f5] transition-colors duration-200"
                    >
                      Tidak
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="comment-action-btn flex items-center gap-1 text-[12px] text-[#888] bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 hover:text-[#c53030]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Hapus
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
