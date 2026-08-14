import { api } from '@/lib/api'
import type { AuditEntry, Paginated, StateTransition } from './types'


export async function listTransitions(applicationId: string): Promise<StateTransition[]> {
    const { data } = await api.get<Paginated<StateTransition>>('/transitions', {
        params: { application: applicationId, ordering: '-created_at' },
    })
    return data.results
}

export async function listAudit(params: Record<string, string> = {}): Promise<Paginated<AuditEntry>> {
    const { data } = await api.get<Paginated<AuditEntry>>('/audit', {
        params: { ordering: '-created_at', ...params },
    })
    return data
}

export type WorkFlowAction = 'submit_review' | 'approve' | 'reject' | 'send_back'

export async function applicationAction(applicationId: string, action: WorkFlowAction) {
    const { data } = await api.post(`/applications/${applicationId}/${action}`, {})
    return data
}