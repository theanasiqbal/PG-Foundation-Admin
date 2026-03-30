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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


const schema = z.object({
  name: z.string().min(1, 'Required'),
  organization: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  last_date: z.string().min(1, 'Required'),
  website: z.string().optional(),
  eligibility: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  benefits: z.string().optional(),
  provider_type: z.enum(['Foundation', 'Government']),
  is_active: z.boolean(),
})


type FormValues = z.infer<typeof schema>

export function ScholarshipForm({ initialData, onSuccess }: { initialData?: any; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      organization: initialData?.organization || '',
      category: initialData?.category || '',
      amount: initialData?.amount || '',
      last_date: initialData?.last_date || '',
      website: initialData?.website || '',
      eligibility: initialData?.eligibility || '',
      description: initialData?.description || '',
      benefits: initialData?.benefits?.join(', ') || '',
      provider_type: initialData?.provider_type || 'Government',
      is_active: initialData?.is_active ?? true,
    },

  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        benefits: data.benefits ? data.benefits.split(',').map((b) => b.trim()).filter(Boolean) : [],
      }
      if (initialData?.id) {
        const { data: updated, error } = await supabase.from('scholarships').update(payload).eq('id', initialData.id).select().single()
        if (error) throw error
        toast.success('Scholarship updated')
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from('scholarships').insert(payload).select().single()
        if (error) throw error
        toast.success('Scholarship added')
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
          <Label>Name *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Organization *</Label>
          <Input {...register('organization')} />
          {errors.organization && <p className="text-red-500 text-sm">{errors.organization.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Input placeholder="e.g. Merit, Need-based" {...register('category')} />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Amount *</Label>
          <Input placeholder="e.g. Rs. 50,000/year" {...register('amount')} />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Last Date *</Label>
          <Input type="date" {...register('last_date')} />
          {errors.last_date && <p className="text-red-500 text-sm">{errors.last_date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input placeholder="https://..." {...register('website')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Eligibility *</Label>
        <Textarea rows={2} {...register('eligibility')} />
        {errors.eligibility && <p className="text-red-500 text-sm">{errors.eligibility.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea rows={3} {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Benefits (comma-separated)</Label>
        <Input placeholder="e.g. Tuition fee, Monthly stipend" {...register('benefits')} />
      </div>
      <div className="space-y-2">
        <Label>Provider Type *</Label>
        <Select 
          value={watch('provider_type')} 
          onValueChange={(v) => setValue('provider_type', v as 'Foundation' | 'Government')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Foundation">Foundation Provided</SelectItem>
            <SelectItem value="Government">Govt Provided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active_scholarship" checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
        <Label htmlFor="is_active_scholarship">Active</Label>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Save Changes' : 'Add Scholarship'}
      </Button>
    </form>
  )
}
