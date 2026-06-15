'use client'

import { useState, useRef } from 'react'
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
import { Upload, Link as LinkIcon, Youtube, Image as ImageIcon, Loader2, Check, X } from 'lucide-react'

interface ModuleFormProps {
  module?: Module
}

type FormValues = Omit<ModuleFormData, 'questions'>
type VideoInputMode = 'url' | 'upload'
type VideoDestination = 'imagekit' | 'youtube'
type YouTubeVisibility = 'public' | 'unlisted' | 'private'
type ThumbnailMode = 'url' | 'upload'

function detectVideoSource(url: string): 'youtube' | 'imagekit' | 'other' {
  if (!url) return 'other'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('ik.imagekit.io')) return 'imagekit'
  return 'other'
}

function validateBeforePublish(data: FormValues, questions: QuizQuestion[]): string | null {
  if (!data.titleEn || !data.titleAm) return 'Both EN and AM titles are required'
  if ((data.type === 'Video' || data.type === 'video') && !data.videoUrl)
    return 'Video URL is required for video modules'
  if ((data.type === 'Article' || data.type === 'article') && (!data.contentEn || !data.contentAm))
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

  // Video state
  const [videoMode, setVideoMode] = useState<VideoInputMode>('url')
  const [videoDest, setVideoDest] = useState<VideoDestination>('imagekit')
  const [ytVisibility, setYtVisibility] = useState<YouTubeVisibility>('unlisted')
  const [ytTitle, setYtTitle] = useState('')
  const [ytDescription, setYtDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState('')
  const videoFileRef = useRef<HTMLInputElement>(null)

  // Thumbnail state
  const [thumbMode, setThumbMode] = useState<ThumbnailMode>('url')
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbUploading, setThumbUploading] = useState(false)
  const thumbFileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
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
  const videoUrl = watch('videoUrl')
  const detectedSource = detectVideoSource(videoUrl ?? '')

  async function uploadThumbnail() {
    if (!thumbFile) return
    setThumbUploading(true)
    try {
      const result = await adminApi.upload.thumbnail(thumbFile)
      setValue('thumbnailUrl', result.data.url)
      setThumbFile(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Thumbnail upload failed')
    } finally {
      setThumbUploading(false)
    }
  }

  async function uploadVideo() {
    if (!videoFile) return
    setVideoUploading(true)
    setVideoUploadProgress('Uploading…')
    try {
      if (videoDest === 'youtube') {
        if (!ytTitle.trim()) { setError('YouTube title is required'); setVideoUploading(false); return }
        setVideoUploadProgress('Sending to YouTube (may take a minute)…')
        const result = await adminApi.upload.videoToYouTube(videoFile, {
          title: ytTitle,
          description: ytDescription,
          visibility: ytVisibility,
        })
        setValue('videoUrl', result.data.embedUrl)
        setVideoUploadProgress('')
      } else {
        setVideoUploadProgress('Uploading to ImageKit…')
        const result = await adminApi.upload.videoToImageKit(videoFile)
        setValue('videoUrl', result.data.url)
        setVideoUploadProgress('')
      }
      setVideoFile(null)
      setVideoMode('url')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Video upload failed')
      setVideoUploadProgress('')
    } finally {
      setVideoUploading(false)
    }
  }

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
              <Input id="titleEn" {...register('titleEn', { required: 'Required' })} placeholder="Module title in English" />
              {errors.titleEn && <p className="text-xs text-destructive">{errors.titleEn.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleAm">Title (AM) *</Label>
              <Input id="titleAm" {...register('titleAm', { required: 'Required' })} placeholder="የሞጁሉ ርዕስ በአማርኛ" />
              {errors.titleAm && <p className="text-xs text-destructive">{errors.titleAm.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descriptionEn">Description (EN)</Label>
              <Textarea id="descriptionEn" rows={2} {...register('descriptionEn')} placeholder="Short description" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descriptionAm">Description (AM)</Label>
              <Textarea id="descriptionAm" rows={2} {...register('descriptionAm')} placeholder="አጭር መግለጫ" />
            </div>

            {/* Thumbnail — URL or upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Thumbnail</Label>
                <div className="flex rounded-md border text-xs overflow-hidden">
                  <button type="button" onClick={() => setThumbMode('url')} className={`px-2 py-1 ${thumbMode === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    URL
                  </button>
                  <button type="button" onClick={() => setThumbMode('upload')} className={`px-2 py-1 ${thumbMode === 'upload' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    Upload
                  </button>
                </div>
              </div>
              {thumbMode === 'url' ? (
                <Input type="url" {...register('thumbnailUrl')} placeholder="https://ik.imagekit.io/…" />
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={thumbFileRef}
                      onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={!thumbFile || thumbUploading}
                      onClick={uploadThumbnail}
                    >
                      {thumbUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    </Button>
                  </div>
                  {watch('thumbnailUrl') && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="size-3" /> Uploaded · {watch('thumbnailUrl')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Video section */}
            {(moduleType === 'Video' || moduleType === 'video') && (
              <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Video</Label>
                  <div className="flex rounded-md border text-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setVideoMode('url')}
                      className={`flex items-center gap-1 px-2 py-1 ${videoMode === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      <LinkIcon className="size-3" /> Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      className={`flex items-center gap-1 px-2 py-1 ${videoMode === 'upload' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      <Upload className="size-3" /> Upload File
                    </button>
                  </div>
                </div>

                {videoMode === 'url' ? (
                  <div className="space-y-1.5">
                    <Input
                      type="url"
                      {...register('videoUrl')}
                      placeholder="https://youtube.com/embed/… or https://ik.imagekit.io/…"
                    />
                    {videoUrl && (
                      <p className="text-xs text-muted-foreground">
                        Detected source:{' '}
                        <span className={detectedSource === 'youtube' ? 'text-red-500' : detectedSource === 'imagekit' ? 'text-blue-500' : 'text-muted-foreground'}>
                          {detectedSource === 'youtube' ? '▶ YouTube' : detectedSource === 'imagekit' ? '☁ ImageKit' : 'Unknown — will render as video'}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Destination picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Upload to</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoDest('imagekit')}
                          className={`flex-1 py-2 rounded-md border text-xs font-medium transition-colors ${videoDest === 'imagekit' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
                        >
                          <ImageIcon className="size-3 inline mr-1" />
                          ImageKit
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoDest('youtube')}
                          className={`flex-1 py-2 rounded-md border text-xs font-medium transition-colors ${videoDest === 'youtube' ? 'border-red-500 bg-red-500/10 text-red-600' : 'border-border text-muted-foreground'}`}
                        >
                          <Youtube className="size-3 inline mr-1" />
                          YouTube
                        </button>
                      </div>
                    </div>

                    {/* YouTube-specific options */}
                    {videoDest === 'youtube' && (
                      <div className="space-y-2 p-2 bg-red-50 rounded-md border border-red-100">
                        <div className="space-y-1">
                          <Label className="text-xs">Video Title *</Label>
                          <Input
                            value={ytTitle}
                            onChange={(e) => setYtTitle(e.target.value)}
                            placeholder="Module title for YouTube"
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description (optional)</Label>
                          <Textarea
                            value={ytDescription}
                            onChange={(e) => setYtDescription(e.target.value)}
                            rows={2}
                            placeholder="Short description for YouTube"
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Visibility</Label>
                          <div className="flex gap-2">
                            {(['public', 'unlisted', 'private'] as YouTubeVisibility[]).map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setYtVisibility(v)}
                                className={`flex-1 py-1 rounded text-xs border capitalize ${ytVisibility === v ? 'border-red-500 bg-red-500/10 text-red-600' : 'border-border text-muted-foreground'}`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground">Default: Unlisted (not searchable, accessible via link)</p>
                        </div>
                      </div>
                    )}

                    {/* File picker + upload button */}
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="video/*"
                        ref={videoFileRef}
                        onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                      />
                      {videoFile && (
                        <p className="text-xs text-muted-foreground">{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={!videoFile || videoUploading}
                        onClick={uploadVideo}
                      >
                        {videoUploading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            {videoUploadProgress}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="size-4" />
                            Upload {videoDest === 'youtube' ? 'to YouTube' : 'to ImageKit'}
                          </span>
                        )}
                      </Button>
                    </div>

                    {/* Show result URL after upload */}
                    {videoUrl && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <Check className="size-3 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-700 break-all">{videoUrl}</span>
                        <button
                          type="button"
                          onClick={() => { setValue('videoUrl', ''); setVideoFile(null) }}
                          className="ml-auto text-muted-foreground hover:text-destructive flex-shrink-0"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Article content */}
            {(moduleType === 'Article' || moduleType === 'article') && (
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
