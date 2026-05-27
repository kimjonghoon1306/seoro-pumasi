export type MissionType = 'neighbor' | 'like' | 'comment'

export interface User {
  id: string
  email: string
  nickname: string
  blog_url: string
  points: number
  created_at: string
}

export interface Mission {
  id: string
  owner_id: string
  owner_nickname: string
  blog_url: string
  post_url?: string
  type: MissionType
  points: number
  total_count: number
  done_count: number
  status: 'active' | 'done' | 'paused'
  created_at: string
}

export interface Completion {
  id: string
  mission_id: string
  user_id: string
  screenshot_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export const MISSION_LABELS: Record<MissionType, string> = {
  neighbor: '서로이웃 추가',
  like: '공감 누르기',
  comment: '댓글 달기',
}

export const MISSION_POINTS: Record<MissionType, { earn: number; cost: number }> = {
  neighbor: { earn: 10, cost: 15 },
  like:     { earn: 3,  cost: 5  },
  comment:  { earn: 5,  cost: 8  },
}

export const MISSION_EMOJI: Record<MissionType, string> = {
  neighbor: '🤝',
  like:     '💛',
  comment:  '💬',
}
