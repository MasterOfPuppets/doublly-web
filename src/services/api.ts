import { auth } from '../lib/firebase'

const BASE_URL = '/api/v1'

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await auth.currentUser?.getIdToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers = await getAuthHeaders()
  const url = `${BASE_URL}${path}`
  console.log(`[API] ${method} ${url}`)

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  console.log(`[API] ${method} ${url} → ${res.status}`)

  if (!res.ok) {
    const rawError = await res.text()
    const error = (() => {
      if (!rawError) return { message: res.statusText }
      try {
        return JSON.parse(rawError)
      } catch {
        return { message: rawError }
      }
    })()
    console.error(`[API] Error:`, error)
    throw new Error(error.message ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T

  const rawResponse = await res.text()
  if (!rawResponse) return undefined as T

  try {
    return JSON.parse(rawResponse) as T
  } catch {
    return rawResponse as T
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
