import { requireSupabase } from '@/lib/supabase'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { LibraryItem } from '@/types'
import type {
  CommunityBoard,
  CommunityComment,
  CommunityPost,
  CreateCommunityPostInput,
  MaterialSnapshot,
} from '@/types/community'

const DEMO_POSTS_KEY = 'demo_community_posts'
const DEMO_COMMENTS_KEY = 'demo_community_comments'

function nowIso() {
  return new Date().toISOString()
}

function demoId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

/** Seed demo community so the feed is not empty on first visit */
function ensureDemoSeed(): void {
  const existing = getStorageItem<CommunityPost[] | null>(DEMO_POSTS_KEY, null)
  if (existing && existing.length > 0) return

  const t0 = Date.now()
  const posts: CommunityPost[] = [
    {
      id: 'demo-post-share-1',
      user_id: 'demo-peer-1',
      author_name: '김민정 선생님',
      board: 'materials',
      title: '3학년 친구 관계 스토리텔링 공유합니다',
      body: '모둠 활동 전에 읽히니 아이들이 이야기 속 갈등을 잘 따라오더라고요. 문제 5문항도 난이도가 적당했어요.',
      material_type: 'storytelling',
      material_id: 'demo-mat-1',
      material_snapshot: {
        materialType: 'storytelling',
        materialId: 'demo-mat-1',
        title: '운동장에서 생긴 일',
        preview:
          '어느 화창한 날, 민수와 지연이는 운동장에서 축구를 하다가 공이 담장 너머로 넘어가 버렸어요…',
        imageUrl: null,
        subject: '사회',
        meta: '학습 목표: 친구와 갈등 해결하기',
      },
      created_at: new Date(t0 - 1000 * 60 * 60 * 5).toISOString(),
      updated_at: new Date(t0 - 1000 * 60 * 60 * 5).toISOString(),
      comment_count: 2,
    },
    {
      id: 'demo-post-qna-1',
      user_id: 'demo-peer-2',
      author_name: '박서준 선생님',
      board: 'qna',
      title: '그림일기 원고지, 글자 수 기준 어떻게 두세요?',
      body: '저학년은 문장이 짧아서 칸이 남아 보이는데, 다들 몇 문장으로 맞추시나요?',
      material_type: null,
      material_id: null,
      material_snapshot: null,
      created_at: new Date(t0 - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(t0 - 1000 * 60 * 60 * 2).toISOString(),
      comment_count: 1,
    },
    {
      id: 'demo-post-tips-1',
      user_id: 'demo-peer-3',
      author_name: '이하늘 선생님',
      board: 'tips',
      title: '타이머 BGM + 랜덤 뽑기로 발표 루틴',
      body: '정리 시간 3분 타이머를 켠 뒤, 끝나면 랜덤 뽑기로 한 명만 발표하게 하니 대기 소음이 줄었어요.',
      material_type: null,
      material_id: null,
      material_snapshot: null,
      created_at: new Date(t0 - 1000 * 60 * 40).toISOString(),
      updated_at: new Date(t0 - 1000 * 60 * 40).toISOString(),
      comment_count: 0,
    },
  ]

  const comments: CommunityComment[] = [
    {
      id: 'demo-c1',
      post_id: 'demo-post-share-1',
      user_id: 'demo-peer-2',
      author_name: '박서준 선생님',
      body: '저희 반에도 써볼게요. 색칠하기 이미지도 아이들과 잘 맞을 것 같아요!',
      created_at: new Date(t0 - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'demo-c2',
      post_id: 'demo-post-share-1',
      user_id: 'demo-peer-3',
      author_name: '이하늘 선생님',
      body: '학습 목표를 모둠 규칙과 연결하니 더 좋더라고요. 감사합니다.',
      created_at: new Date(t0 - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: 'demo-c3',
      post_id: 'demo-post-qna-1',
      user_id: 'demo-peer-1',
      author_name: '김민정 선생님',
      body: '1–2학년은 3~4문장, 3학년은 5~6문장 정도로 맞추고 있어요.',
      created_at: new Date(t0 - 1000 * 60 * 50).toISOString(),
    },
  ]

  setStorageItem(DEMO_POSTS_KEY, posts)
  setStorageItem(DEMO_COMMENTS_KEY, comments)
}

export function snapshotFromLibraryItem(item: LibraryItem): MaterialSnapshot {
  if (item.type === 'storytelling') {
    const d = item.data
    return {
      materialType: 'storytelling',
      materialId: d.id,
      title: d.learning_goal?.trim() || '스토리텔링 자료',
      preview: (d.story_content || '').slice(0, 160),
      imageUrl: d.coloring_image_url,
      subject: d.subject,
      meta: d.story_situation ? `상황: ${d.story_situation}` : undefined,
    }
  }
  const d = item.data
  return {
    materialType: 'diary',
    materialId: d.id,
    title: d.title || '그림일기',
    preview: (d.final_text || d.raw_input || '').slice(0, 160),
    imageUrl: d.image_url,
    meta: undefined,
  }
}

function withCommentCounts(
  posts: CommunityPost[],
  comments: CommunityComment[],
): CommunityPost[] {
  const counts = new Map<string, number>()
  for (const c of comments) {
    counts.set(c.post_id, (counts.get(c.post_id) ?? 0) + 1)
  }
  return posts.map((p) => ({
    ...p,
    comment_count: counts.get(p.id) ?? p.comment_count ?? 0,
  }))
}

export async function listCommunityPosts(
  board: CommunityBoard,
  options: { isDemo: boolean },
): Promise<CommunityPost[]> {
  if (options.isDemo) {
    ensureDemoSeed()
    const posts = getStorageItem<CommunityPost[]>(DEMO_POSTS_KEY, [])
    const comments = getStorageItem<CommunityComment[]>(DEMO_COMMENTS_KEY, [])
    return withCommentCounts(
      posts
        .filter((p) => p.board === board)
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      comments,
    )
  }

  const sb = requireSupabase()
  const { data, error } = await sb
    .from('community_posts')
    .select('*')
    .eq('board', board)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)

  const posts = (data ?? []) as CommunityPost[]
  if (posts.length === 0) return []

  const ids = posts.map((p) => p.id)
  const { data: commentRows } = await sb
    .from('community_comments')
    .select('post_id')
    .in('post_id', ids)

  const counts = new Map<string, number>()
  for (const row of commentRows ?? []) {
    const pid = (row as { post_id: string }).post_id
    counts.set(pid, (counts.get(pid) ?? 0) + 1)
  }

  return posts.map((p) => ({
    ...p,
    comment_count: counts.get(p.id) ?? 0,
  }))
}

export async function getCommunityPost(
  postId: string,
  options: { isDemo: boolean },
): Promise<CommunityPost | null> {
  if (options.isDemo) {
    ensureDemoSeed()
    const posts = getStorageItem<CommunityPost[]>(DEMO_POSTS_KEY, [])
    const comments = getStorageItem<CommunityComment[]>(DEMO_COMMENTS_KEY, [])
    const post = posts.find((p) => p.id === postId)
    if (!post) return null
    return {
      ...post,
      comment_count: comments.filter((c) => c.post_id === postId).length,
    }
  }

  const sb = requireSupabase()
  const { data, error } = await sb
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const { count } = await sb
    .from('community_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  return {
    ...(data as CommunityPost),
    comment_count: count ?? 0,
  }
}

export async function createCommunityPost(
  input: CreateCommunityPostInput,
  author: { id: string; name: string },
  options: { isDemo: boolean },
): Promise<CommunityPost> {
  const title = input.title.trim()
  const body = input.body.trim()
  if (!title) throw new Error('제목을 입력해 주세요.')
  if (input.board === 'materials' && !input.materialSnapshot) {
    throw new Error('공유할 학습 자료를 선택해 주세요.')
  }

  const row = {
    user_id: author.id,
    author_name: author.name.trim() || '선생님',
    board: input.board,
    title,
    body,
    material_type: input.materialType ?? input.materialSnapshot?.materialType ?? null,
    material_id: input.materialId ?? input.materialSnapshot?.materialId ?? null,
    material_snapshot: input.materialSnapshot ?? null,
  }

  if (options.isDemo) {
    ensureDemoSeed()
    const posts = getStorageItem<CommunityPost[]>(DEMO_POSTS_KEY, [])
    const created: CommunityPost = {
      id: demoId('demo-post'),
      ...row,
      created_at: nowIso(),
      updated_at: nowIso(),
      comment_count: 0,
    }
    setStorageItem(DEMO_POSTS_KEY, [created, ...posts])
    return created
  }

  const sb = requireSupabase()
  const { data, error } = await sb
    .from('community_posts')
    .insert(row)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return { ...(data as CommunityPost), comment_count: 0 }
}

export async function deleteCommunityPost(
  postId: string,
  options: { isDemo: boolean; userId: string },
): Promise<void> {
  if (options.isDemo) {
    const posts = getStorageItem<CommunityPost[]>(DEMO_POSTS_KEY, [])
    const comments = getStorageItem<CommunityComment[]>(DEMO_COMMENTS_KEY, [])
    setStorageItem(
      DEMO_POSTS_KEY,
      posts.filter((p) => !(p.id === postId && p.user_id === options.userId)),
    )
    setStorageItem(
      DEMO_COMMENTS_KEY,
      comments.filter((c) => c.post_id !== postId),
    )
    return
  }

  const sb = requireSupabase()
  const { error } = await sb.from('community_posts').delete().eq('id', postId)
  if (error) throw new Error(error.message)
}

export async function listComments(
  postId: string,
  options: { isDemo: boolean },
): Promise<CommunityComment[]> {
  if (options.isDemo) {
    ensureDemoSeed()
    return getStorageItem<CommunityComment[]>(DEMO_COMMENTS_KEY, [])
      .filter((c) => c.post_id === postId)
      .sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
  }

  const sb = requireSupabase()
  const { data, error } = await sb
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as CommunityComment[]
}

export async function addComment(
  postId: string,
  body: string,
  author: { id: string; name: string },
  options: { isDemo: boolean },
): Promise<CommunityComment> {
  const text = body.trim()
  if (!text) throw new Error('댓글을 입력해 주세요.')

  if (options.isDemo) {
    ensureDemoSeed()
    const comments = getStorageItem<CommunityComment[]>(DEMO_COMMENTS_KEY, [])
    const created: CommunityComment = {
      id: demoId('demo-c'),
      post_id: postId,
      user_id: author.id,
      author_name: author.name.trim() || '선생님',
      body: text,
      created_at: nowIso(),
    }
    setStorageItem(DEMO_COMMENTS_KEY, [...comments, created])
    return created
  }

  const sb = requireSupabase()
  const { data, error } = await sb
    .from('community_comments')
    .insert({
      post_id: postId,
      user_id: author.id,
      author_name: author.name.trim() || '선생님',
      body: text,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as CommunityComment
}

export async function deleteComment(
  commentId: string,
  options: { isDemo: boolean; userId: string },
): Promise<void> {
  if (options.isDemo) {
    const comments = getStorageItem<CommunityComment[]>(DEMO_COMMENTS_KEY, [])
    setStorageItem(
      DEMO_COMMENTS_KEY,
      comments.filter((c) => !(c.id === commentId && c.user_id === options.userId)),
    )
    return
  }

  const sb = requireSupabase()
  const { error } = await sb.from('community_comments').delete().eq('id', commentId)
  if (error) throw new Error(error.message)
}
