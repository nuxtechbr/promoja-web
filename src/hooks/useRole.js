import { useAuth } from '../contexts/AuthContext'

export function useRole(roles) {
  const { role } = useAuth()

  if (!roles) return !!role

  if (Array.isArray(roles)) {
    return roles.includes(role)
  }

  return role === roles
}