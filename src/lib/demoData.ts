import type { Student } from '@/types'

export const DEMO_USER_ID = 'demo-user-001'

export const DEMO_USER = {
  id: DEMO_USER_ID,
  name: '김선생님',
  email: 'demo@plma.app',
}

export const mockStudents: Student[] = [
  {
    id: 'demo-s1',
    user_id: DEMO_USER_ID,
    name: '민준',
    grade: '초1',
    favorite_character: '토마스',
    favorite_activity: '자동차 놀이',
    notes: '자동차를 좋아합니다.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-s2',
    user_id: DEMO_USER_ID,
    name: '서연',
    grade: '초2',
    favorite_character: '엘사',
    favorite_activity: '그림 그리기',
    notes: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-s3',
    user_id: DEMO_USER_ID,
    name: '지우',
    grade: '초3',
    favorite_character: '멜로디',
    favorite_activity: '브롤스타즈',
    notes: '게임을 좋아합니다.',
    created_at: new Date().toISOString(),
  },
]
