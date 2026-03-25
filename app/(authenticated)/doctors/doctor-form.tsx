'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  specialization: z.string().min(1, 'Required'),
  hospital: z.string().min(1, 'Required'),
  experience: z.string().min(1, 'Required'),
  rating: z.number().min(0).max(5).optional(),
  avatar_url: z.string().optional(),
  ward: z.string().optional(),
  languages: z.string().optional(),
  available_in_person: z.boolean(),
  available_online: z.boolean(),
  available: z.boolean(),
  online_only: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function DoctorForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      specialization: initialData?.specialization || '',
      hospital: initialData?.hospital || '',
      experience: initialData?.experience || '',
      rating: initialData?.rating || undefined,
      avatar_url: initialData?.avatar_url || '',
      ward: initialData?.ward || '',
      languages: initialData?.languages || '',
      available_in_person: initialData?.available_in_person ?? true,
      available_online: initialData?.available_online ?? false,
      available: initialData?.available ?? true,
      online_only: initialData?.online_only ?? false,
    },
  })

  const onSubmit = async (data: FormValues): Promise<void> => {
    setLoading(true)
    try {
      const payload = { ...data, rating: data.rating ?? null }
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('doctors').update(payload).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Doctor updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('doctors').insert(payload).select().single()
        if (error) throw error
        toast.success('Doctor added')
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Specialization *</Label>
          <Input {...register('specialization')} />
          {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Hospital *</Label>
          <Input {...register('hospital')} />
          {errors.hospital && <p className="text-red-500 text-sm">{errors.hospital.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Experience *</Label>
          <Input placeholder="e.g. 10 years" {...register('experience')} />
          {errors.experience && <p className="text-red-500 text-sm">{errors.experience.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ward</Label>
          <Input placeholder="e.g. 12" {...register('ward')} />
        </div>
        <div className="space-y-2">
          <Label>Avatar URL</Label>
          <Input placeholder="https://..." {...register('avatar_url')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Languages</Label>
        <Input placeholder="e.g. English, Hindi, Urdu" {...register('languages')} />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1">
        {([
          ['available_in_person', 'Available In-Person'],
          ['available_online', 'Available Online'],
          ['available', 'Currently Available'],
          ['online_only', 'Online Only'],
        ] as const).map(([field, label]) => (
          <div key={field} className="flex items-center space-x-2">
            <Switch id={field} checked={watch(field)} onCheckedChange={(v) => setValue(field, v)} />
            <Label htmlFor={field}>{label}</Label>
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Add Doctor'}
      </Button>
    </form>
  )
}
