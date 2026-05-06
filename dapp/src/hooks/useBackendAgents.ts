import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAgent, getAgents, queryRegistry } from '../lib/api'
import type { Agent } from '../lib/api'

export function useBackendAgents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['backend-agents'],
    queryFn: getAgents,
  })

  return { agents: data?.data ?? [], isLoading, error }
}

export function useCreateBackendAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backend-agents'] })
    },
  })
}

export function useRegistrySearch() {
  return useMutation({
    mutationFn: queryRegistry,
  })
}

export type { Agent }
