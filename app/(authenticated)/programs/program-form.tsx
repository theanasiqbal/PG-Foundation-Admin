'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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

const programSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  ward: z.string().min(1, 'Ward is required'),
  date: z.string().nullish(),
  seats_available: z.any().optional(),
  contact_info: z.string().nullish(),
  tags: z.string().nullish(),
  image: z.string().nullish(),
  is_active: z.boolean(),
})

type ProgramFormValues = z.infer<typeof programSchema>

const SUBCATEGORIES = {
  Healthcare: ['Health Camp', 'Doctor Booking', 'Teleconsultation'],
  Education: ['Scholarship', 'Skill Training', 'Digital Literacy'],
  Community: ['Volunteer', 'Cleanup Drive', 'Event'],
}

export function ProgramForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const defaultValues: Partial<ProgramFormValues> = {
    title: initialData?.title || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    ward: initialData?.ward || '',
    date: initialData?.date || '',
    seats_available: initialData?.seats_available ?? '',
    contact_info: initialData?.contact_info || '',
    tags: initialData?.tags?.join(', ') || '',
    image: initialData?.image || '',
    is_active: initialData?.is_active ?? true,
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues,
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      // Process seats_available to be either a number or null
      const seats = data.seats_available === '' || data.seats_available === null || data.seats_available === undefined 
        ? null 
        : Number(data.seats_available);

      const payload = {
        ...data,
        seats_available: seats,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
      }

      if (initialData?.id) {
        const { data: updatedProgram, error } = await supabase
          .from('programs')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Program updated successfully')
        onSuccess(updatedProgram)
      } else {
        const { data: newProgram, error } = await supabase
          .from('programs')
          .insert(payload)
          .select()
          .single()

        if (error) throw error
        toast.success('Program created successfully')
        onSuccess(newProgram)
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
        {errors.title && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  setValue('subcategory', '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory *</Label>
          <Controller
            name="subcategory"
            control={control}
            render={({ field }) => (
              <Select
                key={selectedCategory}
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory &&
                    SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES]?.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subcategory && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.subcategory.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input id="location" {...register('location')} />
          {errors.location && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ward">Ward *</Label>
          <Input id="ward" placeholder="e.g. 12 or all" {...register('ward')} />
          {errors.ward && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.ward.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input && 'showPicker' in input) {
                (input as any).showPicker();
              }
            }}
            className="cursor-pointer"
          >
            <Input id="date" type="date" {...register('date')} className="cursor-pointer" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seats_available">Seats Available (Optional)</Label>
          <Input
            id="seats_available"
            type="number"
            placeholder="Unlimited if blank"
            {...register('seats_available')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_info">Contact Info (Optional)</Label>
        <Input id="contact_info" {...register('contact_info')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (Optional)</Label>
        <Input id="tags" placeholder="Education, Health, etc." {...register('tags')} />
      </div>


      <div className="space-y-2">
        <Label htmlFor="image">Image URL (Optional)</Label>
        <Input id="image" {...register('image')} />
      </div>

      <div className="flex items-center space-x-2 py-4">
        <Switch
          id="is_active"
          checked={watch('is_active')}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Active Program</Label>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Create Program'}
      </Button>
    </form>
  )
}
