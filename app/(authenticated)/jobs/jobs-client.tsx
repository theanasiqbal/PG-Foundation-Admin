'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Edit, Trash2, Briefcase, Plus, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { JobForm } from './job-form'

interface JobsClientProps {
  initialJobs: any[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function JobsClient({
  initialJobs,
  currentPage,
  totalPages,
  totalCount
}: JobsClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved')
  const [selectedPendingJob, setSelectedPendingJob] = useState<any>(null)
  const [mockPendingJobs, setMockPendingJobs] = useState([
    {
      id: 'm1',
      title: 'Senior React Developer',
      companyName: 'TechCorp India',
      location: 'Civil Lines',
      gstNumber: '27AABCU9603R1ZX',
      vacancies: '3',
      salary: '₹12,00,000 - ₹18,00,000',
      jobType: 'Full-time',
      requirements: '5+ years experience in React, TypeScript, Next.js',
      howToApply: 'Send resume with portfolio',
      description: 'We are looking for an experienced developer to lead our frontend team.',
      submittedBy: 'Rahul Sharma',
      status: 'Pending'
    },
    {
      id: 'm2',
      title: 'Part-time Graphic Designer',
      companyName: 'Creative Minds',
      location: 'Remote',
      gstNumber: '07AAPCA8603R1ZX',
      vacancies: '1',
      salary: '₹20,000 / month',
      jobType: 'Part-time',
      requirements: 'Proficiency in Adobe Creative Suite',
      howToApply: 'Upload portfolio link',
      description: 'Need a creative designer for social media posts.',
      submittedBy: 'Priya Patel',
      status: 'Pending'
    }
  ])

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const supabase = createClient()

  useEffect(() => {
    setJobs(initialJobs)
  }, [initialJobs])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('job_listings').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Job deleted')
      setJobs(jobs.filter((j: any) => j.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('job_listings').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setJobs(jobs.map((j: any) => j.id === id ? { ...j, is_active: !current } : j))
    }
  }

  const handleApproveMock = (id: string) => {
    toast.success('Job approved successfully!')
    setMockPendingJobs(mockPendingJobs.filter(j => j.id !== id))
    setSelectedPendingJob(null)
  }

  const handleRejectMock = (id: string) => {
    toast.success('Job rejected')
    setMockPendingJobs(mockPendingJobs.filter(j => j.id !== id))
    setSelectedPendingJob(null)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const typeVariant: Record<string, any> = {
    'Full-time': 'resolved',
    'Part-time': 'in_progress',
    'Remote': 'pending',
    'Contract': 'default',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Job Listings</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount}
          </div>
          <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Post Job</Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Job' : 'Post Job'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <JobForm
                initialData={editing}
                onSuccess={(j: any) => {
                  setIsDialogOpen(false)
                  if (editing) { setJobs(jobs.map((x: any) => x.id === j.id ? j : x)) }
                  else { setJobs([j, ...jobs]) }
                  setEditing(null)
                  router.refresh()
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
        <button
          style={{
            padding: '8px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'approved' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'approved' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'approved' ? 500 : 400,
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
          onClick={() => setActiveTab('approved')}
        >
          Active Jobs
        </button>
        <button
          style={{
            padding: '8px 4px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'pending' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'pending' ? 500 : 400,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('pending')}
        >
          Pending Job Approvals
          {mockPendingJobs.length > 0 && (
            <span style={{
              background: 'var(--danger-bg)', color: 'var(--danger)',
              fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600
            }}>
              {mockPendingJobs.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'approved' ? (
        <>
          <div className="premium-table-container">
            <Table className="premium-table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8}>
                      <div className="empty-state">
                        <Briefcase size={40} className="empty-state-icon" />
                        <div className="empty-state-title">No jobs found</div>
                        <div className="empty-state-desc">Post your first job listing -&gt;</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((j: any) => (
                    <TableRow key={j.id}>
                      <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{j.title}</TableCell>
                      <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.company}</TableCell>
                      <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.location}</TableCell>
                      <TableCell><Badge variant={typeVariant[j.type] || 'default'}>{j.type}</Badge></TableCell>
                      <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.ward || '-'}</TableCell>
                      <TableCell style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{format(new Date(j.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleActive(j.id, j.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: j.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                          {j.is_active ? <Check size={16} /> : <X size={16} />}
                        </button>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(j); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{j.title}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(j.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="premium-table-container">
          <Table className="premium-table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Citizen (Submitter)</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPendingJobs.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5}>
                    <div className="empty-state">
                      <Check size={40} className="empty-state-icon" style={{ color: 'var(--success)' }} />
                      <div className="empty-state-title">All Caught Up!</div>
                      <div className="empty-state-desc">No pending job approvals from citizens.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                mockPendingJobs.map((j) => (
                  <TableRow
                    key={j.id}
                    className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    onClick={() => setSelectedPendingJob(j)}
                  >
                    <TableCell>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{j.title}</div>
                      <Badge variant="outline" style={{ marginTop: '4px' }}>{j.jobType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{j.companyName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>GST: {j.gstNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.location}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{j.vacancies} vacancies • {j.salary}</div>
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.submittedBy}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button
                          size="sm"
                          style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleApproveMock(j.id); }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleRejectMock(j.id); }}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pending Approval Detail Modal */}
      <Dialog open={!!selectedPendingJob} onOpenChange={(open) => { if (!open) setSelectedPendingJob(null) }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Approval Details</DialogTitle>
          </DialogHeader>
          {selectedPendingJob && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Job Title</div>
                  <div style={{ fontWeight: 500 }}>{selectedPendingJob.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Company</div>
                  <div style={{ fontWeight: 500 }}>{selectedPendingJob.companyName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Location</div>
                  <div>{selectedPendingJob.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>GST Number</div>
                  <div>{selectedPendingJob.gstNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Salary</div>
                  <div>{selectedPendingJob.salary}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Job Type & Vacancies</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Badge variant="outline">{selectedPendingJob.jobType}</Badge> <span>• {selectedPendingJob.vacancies} vacancies</span></div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Requirements</div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', fontSize: '14px' }}>{selectedPendingJob.requirements}</div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', fontSize: '14px' }}>{selectedPendingJob.description}</div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>How to Apply</div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', fontSize: '14px' }}>{selectedPendingJob.howToApply}</div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Submitted By (Citizen)</div>
                <div style={{ fontWeight: 500 }}>{selectedPendingJob.submittedBy}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <Button
                  variant="outline"
                  style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--danger-bg)' }}
                  onClick={() => handleRejectMock(selectedPendingJob.id)}
                >
                  Reject Job
                </Button>
                <Button
                  style={{ backgroundColor: '#10B981', color: 'white' }}
                  onClick={() => handleApproveMock(selectedPendingJob.id)}
                  className="hover:bg-emerald-600"
                >
                  Approve Job
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
