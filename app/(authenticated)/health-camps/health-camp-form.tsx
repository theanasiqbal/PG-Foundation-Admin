'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  subcategory: z.string().optional(),
  location: z.string().min(1, 'Required'),
  ward: z.string().min(1, 'Required'),
  date: z.string().optional(),
  seats_available: z.number().optional(),
  contact_info: z.string().optional(),
  image: z.string().optional(),
  tags: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function HealthCampForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      subcategory: initialData?.subcategory || '',
      location: initialData?.location || '',
      ward: initialData?.ward || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      seats_available: initialData?.seats_available || undefined,
      contact_info: initialData?.contact_info || '',
      image: initialData?.image || '',
      tags: initialData?.tags?.join(', ') || '',
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const payload = {
        ...data,
        date: data.date ? new Date(data.date).toISOString() : null,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        created_by: userData.user?.id,
      }
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('health_camps').update(payload).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Health camp updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('health_camps').insert(payload).select().single()
        if (error) throw error
        toast.success('Health camp added')
        onSuccess(created)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Category *</Label>
          <Input placeholder="e.g. Eye Care, Dental" {...register('category')} />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea rows={3} {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Location *</Label>
          <Input {...register('location')} />
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Ward *</Label>
          <Input placeholder="e.g. 12" {...register('ward')} />
          {errors.ward && <p className="text-red-500 text-sm">{errors.ward.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" {...register('date')} />
        </div>
        <div className="space-y-2">
          <Label>Available Seats</Label>
          <Input type="number" {...register('seats_available', { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Input {...register('subcategory')} />
        </div>
        <div className="space-y-2">
          <Label>Contact Info</Label>
          <Input {...register('contact_info')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags (comma-separated)</Label>
        <Input placeholder="e.g. free, diabetes, screening" {...register('tags')} />
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input placeholder="https://..." {...register('image')} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="is_active_camp" checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
        <Label htmlFor="is_active_camp">Active</Label>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Add Health Camp'}
      </Button>
    </form>
  )
}
