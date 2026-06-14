'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'

interface QuizEditorProps {
  questions: QuizQuestion[]
  onChange: (questions: QuizQuestion[]) => void
}

function emptyQuestion(): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    questionEn: '',
    questionAm: '',
    options: [
      { en: '', am: '' },
      { en: '', am: '' },
      { en: '', am: '' },
      { en: '', am: '' },
    ],
    correctAnswer: 0,
    explanationEn: '',
    explanationAm: '',
  }
}

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  function update(index: number, patch: Partial<QuizQuestion>) {
    const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q))
    onChange(next)
  }

  function updateOption(qIndex: number, optIndex: number, lang: 'en' | 'am', value: string) {
    const next = questions.map((q, i) => {
      if (i !== qIndex) return q
      const options = q.options.map((o, oi) =>
        oi === optIndex ? { ...o, [lang]: value } : o
      )
      return { ...q, options }
    })
    onChange(next)
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...questions]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  function moveDown(index: number) {
    if (index === questions.length - 1) return
    const next = [...questions]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  function remove(index: number) {
    onChange(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <Card key={q.id}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Question {qi + 1}</CardTitle>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(qi)}
                  disabled={qi === 0}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(qi)}
                  disabled={qi === questions.length - 1}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(qi)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Question (EN)</Label>
                <Textarea
                  rows={2}
                  value={q.questionEn}
                  onChange={(e) => update(qi, { questionEn: e.target.value })}
                  placeholder="Question in English"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Question (AM)</Label>
                <Textarea
                  rows={2}
                  value={q.questionAm}
                  onChange={(e) => update(qi, { questionAm: e.target.value })}
                  placeholder="ጥያቄ በአማርኛ"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="grid grid-cols-2 gap-2">
                  <Input
                    value={opt.en}
                    onChange={(e) => updateOption(qi, oi, 'en', e.target.value)}
                    placeholder={`Option ${oi} EN`}
                    className="text-xs h-8"
                  />
                  <Input
                    value={opt.am}
                    onChange={(e) => updateOption(qi, oi, 'am', e.target.value)}
                    placeholder={`Option ${oi} AM`}
                    className="text-xs h-8"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Correct Answer</Label>
              <Select
                value={String(q.correctAnswer)}
                onChange={(e) => update(qi, { correctAnswer: Number(e.target.value) })}
                className="text-xs h-8"
              >
                {q.options.map((opt, oi) => (
                  <option key={oi} value={oi}>
                    Option {oi}{opt.en ? ` — ${opt.en}` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Explanation (EN)</Label>
                <Textarea
                  rows={2}
                  value={q.explanationEn}
                  onChange={(e) => update(qi, { explanationEn: e.target.value })}
                  placeholder="Shown after wrong answer"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Explanation (AM)</Label>
                <Textarea
                  rows={2}
                  value={q.explanationAm}
                  onChange={(e) => update(qi, { explanationAm: e.target.value })}
                  placeholder="ከተሳሳቱ በኋላ ይታያል"
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...questions, emptyQuestion()])}
        className="w-full"
      >
        <Plus className="size-4" />
        Add Question
      </Button>
    </div>
  )
}
