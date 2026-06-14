'use client'

import useSWR from 'swr'
import { use } from 'react'
import { adminApi } from '@/lib/api'
import { ModuleForm } from '@/components/modules/ModuleForm'
import type { Module } from '@/lib/types'

export default function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: module, error } = useSWR<Module>(`modules/${id}`, () => adminApi.modules.get(id))

  if (error) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Failed to load module
      </div>
    )
  }

  if (!module) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Module</h1>
        <p className="text-sm text-muted-foreground">{module.titleEn}</p>
      </div>
      <ModuleForm module={module} />
    </div>
  )
}
