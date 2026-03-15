'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Shield, Users, AlertTriangle, Settings, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

interface Report {
  id: string
  scamType: string
  platform: string
  description: string
  financialLoss: number
  currency: string
  victimAge?: string
  reportedAt: string
  severity: string
  status: string
  contactMethod?: string
  evidence?: string
  region?: string
  anonymous: boolean
  imageUrls?: string[]
}

interface UsersResponse {
  users: User[]
}

interface ReportsResponse {
  reports: Report[]
  total: number
  page: number
  limit: number
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-8 bg-ink-border/30 rounded animate-pulse"
              style={{ width: `${100 / cols}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'settings'>('users')
  const [reportsPage, setReportsPage] = useState(1)
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null)
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null)

  // Redirect if not admin
  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    },
    enabled: activeTab === 'users' && status === 'authenticated',
  })

  // Fetch reports with pagination
  const { data: reportsData, isLoading: reportsLoading } = useQuery<ReportsResponse>({
    queryKey: ['admin-reports', reportsPage],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports?page=${reportsPage}&limit=${PAGE_SIZE}`)
      if (!res.ok) throw new Error('Failed to fetch reports')
      return res.json()
    },
    enabled: activeTab === 'reports' && status === 'authenticated',
    placeholderData: keepPreviousData,
  })

  // Prefetch next page
  const totalReports = reportsData?.total || 0
  const totalPages = Math.ceil(totalReports / PAGE_SIZE)
  
  if (activeTab === 'reports' && reportsPage < totalPages) {
    queryClient.prefetchQuery({
      queryKey: ['admin-reports', reportsPage + 1],
      queryFn: async () => {
        const res = await fetch(`/api/admin/reports?page=${reportsPage + 1}&limit=${PAGE_SIZE}`)
        if (!res.ok) throw new Error('Failed to fetch reports')
        return res.json()
      },
    })
  }


  // Update user role mutation with optimistic update
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (!res.ok) throw new Error('Failed to update role')
      return res.json()
    },
    onMutate: async ({ userId, role }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-users'] })
      
      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(['admin-users'])
      
      // Optimistically update
      queryClient.setQueryData(['admin-users'], (old: UsersResponse | undefined) => ({
        ...old,
        users: old?.users?.map((user) =>
          user.id === userId ? { ...user, role } : user
        ) || [],
      }))
      
      return { previousUsers }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(['admin-users'], context.previousUsers)
      }
      toast.error('Failed to update role')
    },
    onSuccess: () => {
      toast.success('User role updated')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted')
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })

  // Update report status mutation with optimistic update
  const updateReportStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onMutate: async ({ reportId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-reports', reportsPage] })
      
      // Snapshot previous value
      const previousReports = queryClient.getQueryData(['admin-reports', reportsPage])
      
      // Optimistically update
      queryClient.setQueryData(['admin-reports', reportsPage], (old: ReportsResponse | undefined) => ({
        ...old,
        reports: old?.reports?.map((report) =>
          report.id === reportId ? { ...report, status } : report
        ) || [],
        total: old?.total || 0,
        page: old?.page || 1,
        limit: old?.limit || PAGE_SIZE,
      }))
      
      return { previousReports }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousReports) {
        queryClient.setQueryData(['admin-reports', reportsPage], context.previousReports)
      }
      toast.error('Failed to update status')
    },
    onSuccess: () => {
      toast.success('Report status updated')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
    },
  })

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await fetch(`/api/admin/reports?reportId=${reportId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete report')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.success('Report deleted')
    },
    onError: () => {
      toast.error('Failed to delete report')
    },
  })

  const updateUserRole = (userId: number, role: string) => {
    // Prevent session admin from changing their own role
    if (userId.toString() === session?.user?.id) {
      toast.error('You cannot change your own role')
      return
    }
    updateUserRoleMutation.mutate({ userId, role })
  }

  const deleteUser = (userId: number) => {
    // Prevent session admin from deleting themselves
    if (userId.toString() === session?.user?.id) {
      toast.error('You cannot delete your own account')
      return
    }
    if (!confirm('Are you sure you want to delete this user?')) return
    deleteUserMutation.mutate(userId)
  }

  const updateReportStatus = (reportId: string, status: string) => {
    updateReportStatusMutation.mutate({ reportId, status })
  }

  const deleteReport = (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    deleteReportMutation.mutate(reportId)
  }

  if (status === 'loading') {
    return <div className="p-8 min-h-screen grid-bg flex items-center justify-center">
      <div className="text-muted font-mono">Loading...</div>
    </div>
  }

  if (!session) return null

  const users = usersData?.users || []
  const reports = reportsData?.reports || []


  return (
    <div className="p-8 min-h-screen grid-bg">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-signal tracking-wider mb-2 flex items-center gap-2">
            <Shield size={14} />
            ADMIN PANEL
          </div>
          <h1 className="font-display font-black text-4xl text-frost">System Control</h1>
          <p className="text-muted-light mt-1 text-sm">Manage users, reports, and system settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'users' ? 'bg-acid text-ink' : 'text-muted-light hover:text-acid hover:bg-acid/5'
          }`}
        >
          <Users size={16} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'reports' ? 'bg-acid text-ink' : 'text-muted-light hover:text-acid hover:bg-acid/5'
          }`}
        >
          <AlertTriangle size={16} />
          Reports
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings' ? 'bg-acid text-ink' : 'text-muted-light hover:text-acid hover:bg-acid/5'
          }`}
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-ink-border">
            <h3 className="font-display font-bold text-frost">User Management</h3>
            <p className="text-xs text-muted mt-1">Manage user roles and permissions</p>
          </div>
          <div className="overflow-x-auto">
            {usersLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    <th className="text-left">Role</th>
                    <th className="text-left">Created</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSessionUser = user.id.toString() === session?.user?.id
                    return (
                      <tr key={user.id}>
                        <td className="font-mono text-muted">{user.id}</td>
                        <td className="text-frost font-medium">
                          {user.name}
                          {isSessionUser && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-acid/10 text-acid font-mono">YOU</span>
                          )}
                        </td>
                        <td className="text-muted-light">{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="bg-ink-border text-frost text-xs px-2 py-1 rounded border border-ink-border focus:border-acid focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSessionUser || updateUserRoleMutation.isPending}
                            title={isSessionUser ? 'You cannot change your own role' : ''}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="text-muted font-mono text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={isSessionUser || deleteUserMutation.isPending}
                            className="text-signal hover:text-signal/80 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSessionUser ? 'You cannot delete your own account' : 'Delete user'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-8 font-mono text-sm">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-ink-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-frost">Report Moderation</h3>
              <p className="text-xs text-muted mt-1">Review and manage scam reports</p>
            </div>
            {!reportsLoading && (
              <span className="text-xs font-mono text-muted">
                {totalReports.toLocaleString()} total reports
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            {reportsLoading ? (
              <TableSkeleton rows={PAGE_SIZE} cols={8} />
            ) : (
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">Platform</th>
                    <th className="text-left">Loss</th>
                    <th className="text-left">Images</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Reported</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const isExpanded = expandedReportId === report.id
                    const hasImages = report.imageUrls && report.imageUrls.length > 0
                    
                    return (
                      <>
                        <tr key={report.id} className={isExpanded ? 'bg-ink-soft/50' : ''}>
                          <td className="font-mono text-muted text-xs">{report.id.slice(0, 8)}</td>
                          <td className="text-frost">{report.scamType}</td>
                          <td className="text-muted-light">{report.platform}</td>
                          <td className="font-mono text-warn">
                            {report.financialLoss > 0 ? `RM ${report.financialLoss.toLocaleString()}` : '—'}
                          </td>
                          <td>
                            {hasImages ? (
                              <button
                                onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                                className="flex cursor-pointer items-center gap-1.5 text-acid hover:text-acid/80 text-xs"
                              >
                                <ImageIcon size={14} />
                                <span>{report.imageUrls?.length || 0}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            ) : (
                              <span className="text-muted text-xs">—</span>
                            )}
                          </td>
                          <td>
                            <select
                              value={report.status}
                              onChange={(e) => updateReportStatus(report.id, e.target.value)}
                              className="bg-ink-border text-frost text-xs px-2 py-1 rounded border border-ink-border focus:border-acid focus:outline-none"
                              disabled={updateReportStatusMutation.isPending}
                            >
                              <option value="pending">Pending</option>
                              <option value="verified">Verified</option>
                              <option value="investigating">Investigating</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="text-muted font-mono text-xs">
                            {new Date(report.reportedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              onClick={() => deleteReport(report.id)}
                              disabled={deleteReportMutation.isPending}
                              className="text-signal hover:text-signal/80 disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Row with Images */}
                        {isExpanded && hasImages && (
                          <tr key={`${report.id}-expanded`}>
                            <td colSpan={8} className="bg-ink-soft/30 border-t border-ink-border">
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <ImageIcon size={14} className="text-acid" />
                                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                                    Evidence Images ({report.imageUrls?.length || 0})
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                  {report.imageUrls?.map((url, index) => (
                                    <div
                                      key={index}
                                      className="relative group cursor-pointer"
                                      onClick={() => setImageModalUrl(url)}
                                    >
                                      <div className="aspect-square rounded-lg overflow-hidden bg-ink border border-ink-border hover:border-acid/50 transition-colors">
                                        <img
                                          src={url}
                                          alt={`Evidence ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <span className="text-xs text-acid font-mono">Click to enlarge</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {report.description && (
                                  <div className="mt-4 pt-4 border-t border-ink-border">
                                    <div className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Description</div>
                                    <p className="text-sm text-muted-light leading-relaxed">{report.description}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-8 font-mono text-sm">No reports found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-ink-border flex items-center justify-between">
              <span className="text-xs font-mono text-muted">
                Page {reportsPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportsPage(p => Math.max(1, p - 1))}
                  disabled={reportsPage <= 1 || reportsLoading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-muted-light hover:text-acid hover:bg-acid/5"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setReportsPage(p => Math.min(totalPages, p + 1))}
                  disabled={reportsPage >= totalPages || reportsLoading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-muted-light hover:text-acid hover:bg-acid/5"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-display font-bold text-frost mb-4">System Settings</h3>
          <div className="space-y-4">
            <div className="p-4 bg-ink-border/30 rounded-lg">
              <p className="text-sm text-muted-light">Database: <span className="text-acid font-mono">{process.env.NEXT_PUBLIC_DB_NAME || 'RDS MySQL'}</span></p>
              <p className="text-sm text-muted-light mt-2">Environment: <span className="text-acid font-mono">{process.env.NODE_ENV}</span></p>
            </div>
            <p className="text-xs text-muted">Additional settings coming soon...</p>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-sm p-4"
          onClick={() => setImageModalUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={() => setImageModalUrl(null)}
              className="absolute cursor-pointer -top-4 right-0 w-10 h-10 rounded-full bg-signal/20 hover:bg-signal/30 border border-signal/40 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-frost" />
            </button>
            <div className="bg-ink-soft border-2 border-acid/20 rounded-2xl overflow-hidden">
              <img
                src={imageModalUrl}
                alt="Evidence full size"
                className="w-full h-full object-contain max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="text-center mt-4">
              <a
                href={imageModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-acid hover:text-acid/80 font-mono"
                onClick={(e) => e.stopPropagation()}
              >
                Open in new tab →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
