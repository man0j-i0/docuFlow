import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { completeUpload, presignUpload, uploadToStorage } from './api'
import { documentKeys } from './hooks'
import { applicationKeys } from '@/features/applications/hooks'
import type { UploadItem } from './types'

function uid() {
  return crypto.randomUUID()
}

export function useUploadManager(applicationId: string) {
  const [items, setItems] = useState<UploadItem[]>([])
  const queryClient = useQueryClient()

  const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)))
  }, [])

  const runOne = useCallback(
    async (item: UploadItem) => {
      try {
        patch(item.id, { phase: 'presigning' })
        const { document, upload_url } = await presignUpload(
          applicationId, item.file.name, item.file.type || 'application/octet-stream',
        )

        patch(item.id, { phase: 'uploading', progress: 0 })
        await uploadToStorage(upload_url, item.file, (p) => patch(item.id, { progress: p }))

        patch(item.id, { phase: 'completing' })
        await completeUpload(document.id)

        patch(item.id, { phase: 'done', progress: 100 })
      } catch (e) {
        // One file failing must not touch the others.
        patch(item.id, {
          phase: 'error',
          error: e instanceof Error ? e.message : 'Upload failed',
        })
      }
    },
    [applicationId, patch],
  )

  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: UploadItem[] = files.map((file) => ({
        id: uid(), file, phase: 'queued', progress: 0,
      }))
      setItems((prev) => [...prev, ...newItems])

      // Fire them concurrently; refresh server state once the batch settles.
      Promise.allSettled(newItems.map(runOne)).then(() => {
        queryClient.invalidateQueries({ queryKey: documentKeys.forApplication(applicationId) })
        queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
      })
    },
    [runOne, queryClient, applicationId],
  )

  const retry = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id)
      if (item) void runOne({ ...item, phase: 'queued', progress: 0, error: undefined })
      return prev
    })
  }, [runOne])

  const clearFinished = useCallback(() => {
    setItems((prev) => prev.filter((it) => it.phase !== 'done'))
  }, [])

  return { items, addFiles, retry, clearFinished }
}
