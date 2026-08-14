import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationAction, listAudit, listTransitions, type WorkFlowAction } from './api'
import { applicationKeys } from '@/features/applications/hooks'


export function useTransitions(applicationId: string) {
    return useQuery({
        queryKey: ['transitions', applicationId],
        queryFn: () => listTransitions(applicationId),
        enabled: Boolean(applicationId),
    })
}

export function useAudit(params: Record<string, string> = {}) {
    return useQuery({
        queryKey: ['audit', params],
        queryFn: () => listAudit(params),
    })
}

export function useApplicationAction(applicationId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (action: WorkFlowAction) => applicationAction(applicationId, action),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
            qc.invalidateQueries({ queryKey: ['transitions', applicationId] })
        },
    })
}