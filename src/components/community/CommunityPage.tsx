import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { useAuth } from '@/contexts/AuthContext'
import { useLibraryItems } from '@/hooks/useLibraryItems'
import {
  addComment,
  createCommunityPost,
  deleteComment,
  deleteCommunityPost,
  listComments,
  listCommunityPosts,
  snapshotFromLibraryItem,
} from '@/lib/communityApi'
import { cn, formatDateTime } from '@/lib/utils'
import type { LibraryItem } from '@/types'
import {
  COMMUNITY_BOARDS,
  type CommunityBoard,
  type CommunityComment,
  type CommunityPost,
} from '@/types/community'

function materialTypeLabel(type: string | null | undefined) {
  if (type === 'storytelling') return '스토리텔링'
  if (type === 'diary') return '그림일기'
  return '학습 자료'
}

function PostCard({
  post,
  onOpen,
}: {
  post: CommunityPost
  onOpen: () => void
}) {
  const snap = post.material_snapshot
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {post.author_name} · {formatDateTime(post.created_at)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{post.title}</h3>
          {post.body ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comment_count ?? 0}
        </span>
      </div>

      {snap ? (
        <div className="mt-3 flex gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
            {snap.imageUrl ? (
              <img src={snap.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <BookOpen className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">
              {materialTypeLabel(snap.materialType)}
              {snap.subject ? ` · ${snap.subject}` : ''}
            </p>
            <p className="truncate text-sm font-medium text-foreground">{snap.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{snap.preview}</p>
          </div>
        </div>
      ) : null}
    </button>
  )
}

export function CommunityPage() {
  const { user, isDemo } = useAuth()
  const { items: libraryItems, loading: libraryLoading } = useLibraryItems()

  const [board, setBoard] = useState<CommunityBoard>('materials')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [pickedItemId, setPickedItemId] = useState<string | null>(null)

  const boardMeta = COMMUNITY_BOARDS.find((b) => b.id === board) ?? COMMUNITY_BOARDS[0]
  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedId) ?? null,
    [posts, selectedId],
  )

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await listCommunityPosts(board, { isDemo })
      setPosts(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [board, isDemo])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const openPost = async (postId: string) => {
    setSelectedId(postId)
    setCommentDraft('')
    setActionError(null)
    setDetailLoading(true)
    try {
      const list = await listComments(postId, { isDemo })
      setComments(list)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '댓글을 불러오지 못했습니다.')
      setComments([])
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    setComments([])
    setCommentDraft('')
    setActionError(null)
  }

  const openCompose = () => {
    setComposeTitle('')
    setComposeBody('')
    setPickedItemId(null)
    setActionError(null)
    setComposeOpen(true)
  }

  const submitPost = async () => {
    if (!user) return
    setSubmitting(true)
    setActionError(null)
    try {
      let materialSnapshot = null
      let materialType = null
      let materialId = null

      if (board === 'materials') {
        const item = libraryItems.find((it) => it.data.id === pickedItemId)
        if (!item) throw new Error('공유할 학습 자료를 선택해 주세요.')
        materialSnapshot = snapshotFromLibraryItem(item)
        materialType = materialSnapshot.materialType
        materialId = materialSnapshot.materialId
      }

      await createCommunityPost(
        {
          board,
          title: composeTitle,
          body: composeBody,
          materialType,
          materialId,
          materialSnapshot,
        },
        { id: user.id, name: user.name },
        { isDemo },
      )
      setComposeOpen(false)
      await loadPosts()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '게시글을 올리지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitComment = async () => {
    if (!user || !selectedId) return
    setSubmitting(true)
    setActionError(null)
    try {
      const created = await addComment(
        selectedId,
        commentDraft,
        { id: user.id, name: user.name },
        { isDemo },
      )
      setComments((prev) => [...prev, created])
      setCommentDraft('')
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedId
            ? { ...p, comment_count: (p.comment_count ?? 0) + 1 }
            : p,
        ),
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '댓글을 올리지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const removePost = async (post: CommunityPost) => {
    if (!user || post.user_id !== user.id) return
    if (!window.confirm('이 글을 삭제할까요?')) return
    try {
      await deleteCommunityPost(post.id, { isDemo, userId: user.id })
      closeDetail()
      await loadPosts()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '삭제하지 못했습니다.')
    }
  }

  const removeComment = async (comment: CommunityComment) => {
    if (!user || comment.user_id !== user.id) return
    try {
      await deleteComment(comment.id, { isDemo, userId: user.id })
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
      setPosts((prev) =>
        prev.map((p) =>
          p.id === comment.post_id
            ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) }
            : p,
        ),
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '댓글을 삭제하지 못했습니다.')
    }
  }

  const composeHint =
    board === 'materials'
      ? '내 자료에서 하나를 고르고, 수업에서 어떻게 썼는지 적어 주세요.'
      : board === 'qna'
        ? '궁금한 점을 구체적으로 적어 주시면 답글이 달리기 쉬워요.'
        : '다른 선생님에게 도움이 될 짧은 팁을 남겨 주세요.'

  if (selectedPost) {
    const snap = selectedPost.material_snapshot
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-start gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={closeDetail} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
            목록
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {boardMeta.label} · {selectedPost.author_name} ·{' '}
              {formatDateTime(selectedPost.created_at)}
            </p>
            <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              {selectedPost.title}
            </h1>
          </div>
          {user && selectedPost.user_id === user.id ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => void removePost(selectedPost)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {selectedPost.body ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {selectedPost.body}
          </p>
        ) : null}

        {snap ? (
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium text-primary">
              공유된 {materialTypeLabel(snap.materialType)}
              {snap.subject ? ` · ${snap.subject}` : ''}
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">{snap.title}</p>
            {snap.meta ? (
              <p className="mt-1 text-xs text-muted-foreground">{snap.meta}</p>
            ) : null}
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {snap.preview}
              {snap.preview.length >= 160 ? '…' : ''}
            </p>
            {snap.imageUrl ? (
              <img
                src={snap.imageUrl}
                alt=""
                className="mt-3 max-h-56 rounded-xl border border-border object-contain"
              />
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              미리보기 스냅샷입니다. 원본은 작성자 계정에만 저장됩니다.
            </p>
          </div>
        ) : null}

        <section className="space-y-3 border-t border-border/70 pt-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            댓글 {comments.length}
          </h2>

          {detailLoading ? (
            <LoadingState message="댓글을 불러오는 중..." />
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">첫 댓글로 대화를 시작해 보세요.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-border/70 bg-card px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {c.author_name} · {formatDateTime(c.created_at)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{c.body}</p>
                    </div>
                    {user && c.user_id === user.id ? (
                      <button
                        type="button"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => void removeComment(c)}
                        aria-label="댓글 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="응원·질문·수업 후기를 남겨 보세요"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void submitComment()
                }
              }}
            />
            <Button
              type="button"
              disabled={submitting || !commentDraft.trim()}
              onClick={() => void submitComment()}
            >
              댓글 달기
            </Button>
          </div>
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">커뮤니티</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            만든 학습 자료를 나누고, 질문과 댓글로 함께 성장하는 교사 공간입니다.
          </p>
        </div>
        <Button type="button" onClick={openCompose}>
          {board === 'materials' ? (
            <>
              <Share2 className="h-4 w-4" />
              자료 공유
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              글쓰기
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMUNITY_BOARDS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setBoard(id)
              closeDetail()
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              board === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{boardMeta.description}</p>

      {isDemo ? (
        <p className="rounded-xl border border-accent-blue/30 bg-accent-blue/10 px-3 py-2 text-xs text-accent-blue-foreground">
          데모에서는 샘플 글·댓글이 브라우저에만 저장됩니다. 실제 계정에서는 Supabase 마이그레이션{' '}
          <code className="rounded bg-muted px-1">010_community.sql</code> 적용이 필요합니다.
        </p>
      ) : null}

      {loading ? (
        <LoadingState message="커뮤니티를 불러오는 중..." />
      ) : error ? (
        <EmptyState
          title="불러오지 못했습니다"
          description={
            error.includes('community_posts') || error.includes('schema cache')
              ? 'Supabase에서 010_community.sql을 실행한 뒤 새로고침해 주세요.'
              : error
          }
        />
      ) : posts.length === 0 ? (
        <EmptyState
          title={board === 'materials' ? '아직 공유된 자료가 없어요' : '아직 글이 없어요'}
          description={
            board === 'materials'
              ? '내 자료에서 하나를 골라 첫 공유를 올려 보세요.'
              : '첫 글을 올려 동료 선생님과 소통해 보세요.'
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={() => void openPost(post.id)} />
          ))}
        </div>
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {board === 'materials' ? '학습 자료 공유' : `${boardMeta.label} 글쓰기`}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{composeHint}</p>

          {board === 'materials' ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">내 자료 선택</p>
              {libraryLoading ? (
                <p className="text-sm text-muted-foreground">자료 목록 불러오는 중…</p>
              ) : libraryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  공유할 자료가 없습니다. 개별 학습 자료에서 먼저 저장해 주세요.
                </p>
              ) : (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                  {libraryItems.map((item: LibraryItem) => {
                    const snap = snapshotFromLibraryItem(item)
                    const active = pickedItemId === item.data.id
                    return (
                      <button
                        key={item.data.id}
                        type="button"
                        onClick={() => {
                          setPickedItemId(item.data.id)
                          if (!composeTitle.trim()) {
                            setComposeTitle(
                              `${materialTypeLabel(snap.materialType)} · ${snap.title}`,
                            )
                          }
                        }}
                        className={cn(
                          'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          active
                            ? 'bg-primary/15 ring-1 ring-primary/40'
                            : 'hover:bg-muted',
                        )}
                      >
                        <span className="font-medium text-foreground">
                          {materialTypeLabel(item.type)} · {snap.title}
                        </span>
                        <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
                          {snap.preview}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="community-title">
              제목
            </label>
            <Input
              id="community-title"
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              placeholder="한눈에 보이는 제목"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="community-body">
              내용
            </label>
            <textarea
              id="community-body"
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              rows={5}
              placeholder={
                board === 'materials'
                  ? '이 자료를 어떻게 썼는지, 아이 반응이 어땠는지 적어 주세요.'
                  : '내용을 입력하세요.'
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 focus:ring-2"
            />
          </div>

          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>
              취소
            </Button>
            <Button
              type="button"
              disabled={
                submitting ||
                !composeTitle.trim() ||
                (board === 'materials' && !pickedItemId)
              }
              onClick={() => void submitPost()}
            >
              {submitting ? '올리는 중…' : '올리기'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
