export interface StateTransition {
    id: string
    application: string
    from_state: string
    to_state: string
    actor: string | null
    actor_email: string | null
    created_at: string
}

export interface AuditEntry {
    id: string
    actor: string | null
    actor_email: string | null
    entity_id: string
    entity_type: string
    old_value: Record<string, unknown> | null
    new_value: Record<string, unknown> | null
    action: string
    created_at: string
}

export interface Paginated<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}