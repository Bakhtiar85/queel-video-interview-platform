// types/index.ts

export interface Recruiter {
  id: string
  email: string
  name: string
}

export interface ApiResponse<T = unknown> {
  message?: string
  statusCode: number
  data?: T
  error?: string | object | null
  status: boolean
}