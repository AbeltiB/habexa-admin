'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizEditor } from './QuizEditor'
import { adminApi } from '@/lib/api'
import type { Module, ModuleFormData, QuizQuestion } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

interface ModuleFormProps {
  module?: Module
}

type FormValues = Omit<ModuleFormData, 'questions'>

function validateBeforePublish(data: FormValues, questions: QuizQuestion[]): string | null {
  if (!data.titleEn || !data.titleAm) return 'Both EN and AM titles are required'
  if (data.type === 'Video' && !data.videoUrl) return 'Video URL is required for video modules'
  if (data.type === 'Article' && (!data.contentEn || !data.contentAm))
    return 'Both EN and AM content are required for article modules'
  if (questions.length === 0) return 'At least 1 quiz question is required'
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    if (q.options.some((o) => !o.en || !o.am))
      return `Question ${i + 1}: all 4 options must be filled in both languages`
  }
  return null
}

export function ModuleForm({ module }: ModuleFormProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>(module?.questions ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      track: module?.track ?? 'Foundation',
      order: module?.order ?? 1,
      type: module?.type ?? 'Video',
      isPremium: module?.isPremium ?? false,
      durationMin: module?.durationMin ?? 5,
      status: module?.status ?? 'Draft',
      titleEn: module?.titleEn ?? '',
      titleAm: module?.titleAm ?? '',
      descriptionEn: module?.descriptionEn ?? '',
      descriptionAm: module?.descriptionAm ?? '',
      thumbnailUrl: module?.thumbnailUrl ?? '',
      videoUrl: module?.videoUrl ?? '',
      contentEn: module?.contentEn ?? '',
      contentAm: module?.contentAm ?? '',
    },
  })

  const moduleType = watch('type')
  const status = watch('status')

  async function onSubmit(data: FormValues) {
    if (data.status === 'Live') {
      const validationError = validateBeforePublish(data, questions)
      if (validationError) { setError(validationError); return }
    }
    setError('')
    setSaving(true)
    try {
      if (module) {
        await adminApi.modules.update(module.id, { ...data, questions })
      } else {
        await adminApi.modules.create({ ...data, questions })
      }
      setSuccess('Saved successfully')
      setTimeout(() => router.push('/modules'), 1000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 items-start">
      {/* Left panel — metadata */}
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="track">Track</Label>
                <Select id="track" {...register('track')}>
                  <option>Foundation</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" min={1} {...register('order', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Select id="type" {...register('type')}>
                  <option>Video</option>
                  <option>Article</option>
                  <option>Interactive</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="isPremium">Premium</Label>
                <Select id="isPremium" {...register('isPremium', { setValueAs: (v) => v === 'true' })}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="durationMin">Duration (min)</Label>
                <Input id="durationMin" type="number" min={1} {...register('durationMin', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register('status')}>
                  <option>Draft</option>
                  <option>Live</option>
                  <option>Hidden</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleEn">Title (EN) *</Label>
              <Input
                id="titleEn"
                {...register('titleEn', { required: 'Required' })}
                placeholder="Module title in English"
              />
              {errors.titleEn && <p className="text-xs text-destructive">{errors.titleEn.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleAm">Title (AM) *</Label>
              <Input
                id="titleAm"
                {...register('titleAm', { required: 'Required' })}
                placeholder="የሞጁሉ ርዕስ በአማርኛ"
              />
              {errors.titleAm && <p className="text-xs text-destructive">{errors.titleAm.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descriptionEn">Description (EN)</Label>
              <Textarea id="descriptionEn" rows={3} {...register('descriptionEn')} placeholder="Short description" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descriptionAm">Description (AM)</Label>
              <Textarea id="descriptionAm" rows={3} {...register('descriptionAm')} placeholder="አጭር መግለጫ" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input id="thumbnailUrl" type="url" {...register('thumbnailUrl')} placeholder="https://…" />
            </div>

            {moduleType === 'Video' && (
              <div className="space-y-1.5">
                <Label htmlFor="videoUrl">Video URL (Cloudflare Stream)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  {...register('videoUrl')}
                  placeholder="https://videodelivery.net/…"
                />
                <a
                  href="https://dash.cloudflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  <ExternalLink className="size-3" />
                  Upload to Cloudflare Stream
                </a>
              </div>
            )}

            {moduleType === 'Article' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="contentEn">Content (EN) — Markdown</Label>
                  <Textarea
                    id="contentEn"
                    rows={10}
                    {...register('contentEn')}
                    placeholder="# Title&#10;&#10;Markdown content…"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contentAm">Content (AM) — Markdown</Label>
                  <Textarea
                    id="contentAm"
                    rows={10}
                    {...register('contentAm')}
                    placeholder="# ርዕስ&#10;&#10;የማርክዳውን ይዘት…"
                    className="font-mono text-xs"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>
            {module ? 'Save Changes' : 'Create Module'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/modules')}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Right panel — quiz */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Quiz Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizEditor questions={questions} onChange={setQuestions} />
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
