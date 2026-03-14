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

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(['general', 'urgent', 'event', 'achievement']),
  ward: z.string().default('all'),
  expires_at: z.string().optional(),
  is_active: z.boolean().default(true),
})

type AnnouncementFormValues = z.input<typeof announcementSchema>

export function AnnouncementForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const defaultValues: Partial<AnnouncementFormValues> = {
    title: initialData?.title || '',
    body: initialData?.body || '',
    type: initialData?.type || 'general',
    ward: initialData?.ward || 'all',
    expires_at: initialData?.expires_at ? new Date(initialData.expires_at).toISOString().split('T')[0] : '',
    is_active: initialData?.is_active ?? true,
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues,
  })

  const onSubmit = async (data: AnnouncementFormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const payload = {
        ...data,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        created_by: userData.user.id,
      }

      if (initialData?.id) {
        const { data: updatedAnnouncement, error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Announcement updated successfully')
        onSuccess(updatedAnnouncement)
      } else {
        const { data: newAnnouncement, error } = await supabase
          .from('announcements')
          .insert(payload)
          .select()
          .single()

        if (error) throw error
        toast.success('Announcement created successfully')
        onSuccess(newAnnouncement)
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body *</Label>
        <Textarea id="body" rows={4} {...register('body')} />
        {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => setValue('type', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ward">Target Ward</Label>
          <Input id="ward" placeholder="e.g. 12 or all" {...register('ward')} />
          {errors.ward && <p className="text-red-500 text-sm">{errors.ward.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expires_at">Expires At</Label>
        <Input id="expires_at" type="date" {...register('expires_at')} />
      </div>

      <div className="flex items-center space-x-2 py-4">
        <Switch
          id="is_active"
          checked={watch('is_active')}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Active Announcement</Label>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Create Announcement'}
      </Button>
    </form>
  )
}
