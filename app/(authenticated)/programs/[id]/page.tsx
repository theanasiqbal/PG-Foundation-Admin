import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, Users, Phone } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { RegistrationsTable } from './registrations-table'

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: program, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !program) {
    notFound()
  }

  const { data: registrations } = await supabase
    .from('program_registrations')
    .select(`
      *,
      users (
        name,
        phone,
        citizen_id,
        ward
      )
    `)
    .eq('program_id', id)
    .order('registered_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/programs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Program Details</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{program.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={
                    program.category === 'Healthcare'
                      ? 'badge-healthcare'
                      : program.category === 'Education'
                      ? 'badge-education'
                      : 'badge-community'
                  }
                >
                  {program.category}
                </Badge>
                <span className="text-sm text-muted-foreground">{program.subcategory}</span>
              </div>
            </div>
            <Badge
              className={
                program.is_active
                  ? 'badge-resolved'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {program.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-6">{program.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 opacity-70" />
              <span>
                {program.location} (Ward: {program.ward === 'all' ? 'All' : program.ward})
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>{program.date || 'No date specified'}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Users className="w-4 h-4 opacity-70" />
              <span>
                {program.registrations_count || 0} / {program.seats_available === null ? 'Unlimited' : program.seats_available} seats
              </span>
            </div>
            {program.contact_info && (
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 opacity-70" />
                <span>{program.contact_info}</span>
              </div>
            )}
          </div>

          {program.tags && program.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {program.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Registered Citizens</h2>
        <RegistrationsTable initialRegistrations={registrations || []} />
      </div>
    </div>
  )
}
