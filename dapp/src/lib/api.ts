const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1'

export type Agent = {
  id?: string
  walletAddress: string
  name: string
  ownerAddress?: string | null
  capabilities: string[]
  pricePerTask: number
  reputation: number
  tasksCompleted?: number
  tasksFailed?: number
  active?: boolean
  metadataUri?: string | null
  createdAt?: string
  updatedAt?: string
}

type ApiResponse<T> = {
  data: T
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message || `API request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function readErrorMessage(response: Response) {
  const fallback = `${response.status} ${response.statusText}`.trim()

  try {
    const payload = await response.clone().json()

    if (typeof payload?.message === 'string' && payload.message) {
      return payload.message
    }

    if (typeof payload?.error === 'string' && payload.error) {
      return payload.error
    }
  } catch {
    const text = await response.text()
    return text || fallback
  }

  return fallback
}

export function getAgents() {
  return apiRequest<ApiResponse<Agent[]>>('/agents')
}

export function createAgent(input: {
  walletAddress: string
  name: string
  ownerAddress?: string
  capabilities: string[]
  pricePerTask: number
  metadataUri?: string
}) {
  return apiRequest<ApiResponse<Agent>>('/agents', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function queryRegistry(input: {
  capability: string
  minReputation?: number
  maxPrice?: number
}) {
  const params = new URLSearchParams({
    capability: input.capability,
    minReputation: String(input.minReputation ?? 20),
  })

  if (input.maxPrice !== undefined) {
    params.set('maxPrice', String(input.maxPrice))
  }

  return apiRequest<ApiResponse<Agent[]>>(`/registry/query?${params.toString()}`)
}
