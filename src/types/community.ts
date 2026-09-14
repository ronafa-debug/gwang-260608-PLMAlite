export type CommunityBoard = 'materials' | 'qna' | 'tips'

export type SharedMaterialType = 'storytelling' | 'diary'

export interface MaterialSnapshot {
  materialType: SharedMaterialType
  materialId: string
  title: string
  preview: string
  imageUrl?: string | null
  subject?: string
  meta?: string
}

export interface CommunityPost {
  id: string
  user_id: string
  author_name: string
  board: CommunityBoard
  title: string
  body: string
  material_type: SharedMaterialType | null
  material_id: string | null
  material_snapshot: MaterialSnapshot | null
  created_at: string
  updated_at: string
  /** Joined / computed */
  comment_count?: number
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  author_name: string
  body: string
  created_at: string
}

export interface CreateCommunityPostInput {
  board: CommunityBoard
  title: string
  body: string
  materialType?: SharedMaterialType | null
  materialId?: string | null
  materialSnapshot?: MaterialSnapshot | null
}

export const COMMUNITY_BOARDS: Array<{
  id: CommunityBoard
  label: string
  description: string
}> = [
  {
    id: 'materials',
    label: '자료 공유',
    description: '만든 학습 자료를 올리고 수업 활용 팁을 나눠요.',
  },
  {
    id: 'qna',
    label: '질문·답변',
    description: '수업·자료·도구에 대해 서로 물어보고 답해요.',
  },
  {
    id: 'tips',
    label: '수업 팁',
    description: '교실에서 바로 쓰는 노하우를 글로 남겨요.',
  },
]
