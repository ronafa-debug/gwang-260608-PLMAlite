export interface AuthUser {
  id: string
  name: string
  email: string
  role?: 'teacher' | 'admin'
}
