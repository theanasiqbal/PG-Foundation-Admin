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
  description: z.string().optional(),
  date: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  ward: z.string().optional(),
  volunteers_needed: z.number(),
  is_recurring: z.boolean(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function VolunteerProgramForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date || '',
      location: initialData?.location || '',
      ward: initialData?.ward || '',
      volunteers_needed: initialData?.volunteers_needed || 0,
      is_recurring: initialData?.is_recurring ?? false,
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const payload = { ...data, created_by: userData.user?.id }
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('volunteer_programs').update(payload).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Program updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('volunteer_programs').insert(payload).select().single()
        if (error) throw error
        toast.success('Program added')
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
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input {...register('title')} />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={2} {...register('description')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" {...register('date')} />
          {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Location *</Label>
          <Input {...register('location')} />
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ward</Label>
          <Input placeholder="e.g. 12" {...register('ward')} />
        </div>
        <div className="space-y-2">
          <Label>Volunteers Needed</Label>
          <Input type="number" {...register('volunteers_needed', { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        {([['is_recurring', 'Recurring Program'], ['is_active', 'Active']] as const).map(([field, label]) => (
          <div key={field} className="flex items-center space-x-2">
            <Switch id={field} checked={watch(field)} onCheckedChange={(v) => setValue(field, v)} />
            <Label htmlFor={field}>{label}</Label>
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Add Program'}
      </Button>
    </form>
  )
}
