'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'

export function RegistrationsTable({ initialRegistrations }: { initialRegistrations: any[] }) {
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const supabase = createClient()

  const markAttended = async (id: string) => {
    const { error } = await supabase
      .from('program_registrations')
      .update({ status: 'attended' })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Marked as attended')
      setRegistrations(registrations.map((r) => (r.id === id ? { ...r, status: 'attended' } : r)))
    }
  }

  return (
    <div className="bg-card rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Citizen ID</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Ward</TableHead>
            <TableHead>Registered At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No registrations found
              </TableCell>
            </TableRow>
          ) : (
            registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className="font-medium">{reg.users?.name}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-muted text-foreground px-2 py-0.5 rounded">
                    {reg.users?.citizen_id}
                  </span>
                </TableCell>
                <TableCell>{reg.users?.phone}</TableCell>
                <TableCell>{reg.users?.ward}</TableCell>
                <TableCell>{format(new Date(reg.registered_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      reg.status === 'registered'
                        ? 'badge-in-progress'
                        : reg.status === 'attended'
                        ? 'badge-resolved'
                        : 'bg-muted text-muted-foreground border-border'
                    }
                  >
                    {reg.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reg.status === 'attended' || reg.status === 'cancelled'}
                    onClick={() => markAttended(reg.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Attended
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
