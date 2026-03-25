'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  instructor: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
  thumbnail: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function SkillCourseForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      instructor: initialData?.instructor || '',
      duration: initialData?.duration || '',
      level: initialData?.level || 'Beginner',
      thumbnail: initialData?.thumbnail || '',
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('skill_courses').update(data).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Course updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('skill_courses').insert(data).select().single()
        if (error) throw error
        toast.success('Course added')
        onSuccess(created)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input {...register('title')} />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea rows={3} {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Instructor *</Label>
          <Input {...register('instructor')} />
          {errors.instructor && <p className="text-red-500 text-sm">{errors.instructor.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Duration *</Label>
          <Input placeholder="e.g. 6 weeks, 20 hours" {...register('duration')} />
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Level *</Label>
        <Select value={watch('level')} onValueChange={(v) => setValue('level', v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Thumbnail URL</Label>
        <Input placeholder="https://..." {...register('thumbnail')} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="is_active_course" checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
        <Label htmlFor="is_active_course">Active</Label>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Add Course'}
      </Button>
    </form>
  )
}
