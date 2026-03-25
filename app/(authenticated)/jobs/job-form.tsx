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
  company: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  type: z.enum(['Full-time', 'Part-time', 'Remote', 'Contract']),
  salary: z.string().optional(),
  description: z.string().min(1, 'Required'),
  requirements: z.string().optional(),
  how_to_apply: z.string().optional(),
  ward: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function JobForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      company: initialData?.company || '',
      location: initialData?.location || '',
      type: initialData?.type || 'Full-time',
      salary: initialData?.salary || '',
      description: initialData?.description || '',
      requirements: initialData?.requirements?.join(', ') || '',
      how_to_apply: initialData?.how_to_apply || '',
      ward: initialData?.ward || '',
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        requirements: data.requirements ? data.requirements.split(',').map((r) => r.trim()).filter(Boolean) : [],
      }
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('job_listings').update(payload).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Job updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('job_listings').insert(payload).select().single()
        if (error) throw error
        toast.success('Job posted')
        onSuccess(created)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Company *</Label>
          <Input {...register('company')} />
          {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Location *</Label>
          <Input {...register('location')} />
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={watch('type')} onValueChange={(v) => setValue('type', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Full-time', 'Part-time', 'Remote', 'Contract'].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Salary</Label>
          <Input placeholder="e.g. PKR 50,000/month" {...register('salary')} />
        </div>
        <div className="space-y-2">
          <Label>Ward</Label>
          <Input placeholder="e.g. 12" {...register('ward')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea rows={3} {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Requirements (comma-separated)</Label>
        <Textarea rows={2} placeholder="e.g. Bachelor's degree, 2 years experience" {...register('requirements')} />
      </div>
      <div className="space-y-2">
        <Label>How to Apply</Label>
        <Textarea rows={2} {...register('how_to_apply')} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="is_active_job" checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
        <Label htmlFor="is_active_job">Active</Label>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Post Job'}
      </Button>
    </form>
  )
}
