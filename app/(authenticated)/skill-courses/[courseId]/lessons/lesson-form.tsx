'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
  order_num: z.number().min(1, 'Must be greater than 0'),
  video_url: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function LessonForm({ courseId, initialData, nextOrderNum, onSuccess }: { courseId: string; initialData?: any; nextOrderNum: number; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      duration: initialData?.duration || '',
      order_num: initialData?.order_num || nextOrderNum,
      video_url: initialData?.video_url || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = { ...data, course_id: courseId }
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('skill_course_lessons').update(payload).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Lesson updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('skill_course_lessons').insert(payload).select().single()
        if (error) throw error
        toast.success('Lesson added')
        onSuccess(created)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="grid grid-cols-[100px_1fr] gap-4">
        <div className="space-y-2">
          <Label>Order *</Label>
          <Input type="number" {...register('order_num', { valueAsNumber: true })} />
          {errors.order_num && <p className="text-red-500 text-sm">{errors.order_num.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration *</Label>
          <Input placeholder="e.g. 15 mins" {...register('duration')} />
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input placeholder="https://..." {...register('video_url')} />
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Add Lesson'}
      </Button>
    </form>
  )
}
