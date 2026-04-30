import { api } from './api'
import type { UserDto } from '../types'

export const userService = {
  getMe: () => api.get<UserDto>('/users/me'),

  register: (data: Omit<UserDto, 'id'>) => api.post<UserDto>('/users', data),

  bootstrap: (data: Omit<UserDto, 'id'>) => api.post<UserDto>('/users/bootstrap', data),
}
