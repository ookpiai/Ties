import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getJobPostingById, updateJobPosting, addRoleToJob, updateJobRole, deleteJobRole, cancelJobPosting } from '../../api/jobs'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, Trash2, Edit2, DollarSign, Users, Calendar, MapPin, XCircle } from 'lucide-react'
import JobBasicDetailsForm from './JobBasicDetailsForm'
import AddRoleModal from './AddRoleModal'

const EditJobPage = () => {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState('details')

  // Original job data (for comparison)
  const [originalJob, setOriginalJob] = useState(null)

  // Editable job data
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    event_type: 'wedding',
    start_date: '',
    end_date: '',
    application_deadline: ''
  })

  // Roles (managed separately)
  const [roles, setRoles] = useState([])
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [roleActionLoading, setRoleActionLoading] = useState(null)

  useEffect(() => {
    loadJob()
  }, [jobId])

  const loadJob = async () => {
    setLoading(true)
    setError(null)

    const result = await getJobPostingById(jobId)

    if (result.success) {
      const job = result.data

      // Check if user is the owner
      if (job.organiser_id !== user.id) {
        setError('You do not have permission to edit this job')
        setLoading(false)
        return
      }

      setOriginalJob(job)
      setJobData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        event_type: job.event_type || 'wedding',
        start_date: job.start_date?.split('T')[0] || '',
        end_date: job.end_date?.split('T')[0] || '',
        application_deadline: job.application_deadline?.split('T')[0] || ''
      })
      setRoles(job.roles || [])
    } else {
      setError(result.error || 'Failed to load job')
    }

    setLoading(false)
  }

  // Calculate total budget from roles
  const totalBudget = roles.reduce((sum, role) => sum + (parseFloat(role.budget) || 0), 0)

  // Save job details
  const handleSaveDetails = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const updates = {
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      event_type: jobData.event_type,
      start_date: jobData.start_date,
      end_date: jobData.end_date,
      application_deadline: jobData.application_deadline || null,
      total_budget: totalBudget
    }

    const result = await updateJobPosting(jobId, updates)

    if (result.success) {
      setSuccess('Job details saved successfully!')
      setOriginalJob({ ...originalJob, ...updates })
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to save changes')
    }

    setSaving(false)
  }

  // Add new role
  const handleAddRole = async (roleData) => {
    setRoleActionLoading('adding')
    setError(null)

    const result = await addRoleToJob(jobId, {
      role_type: roleData.role_type,
      role_title: roleData.role_title,
      role_description: roleData.role_description || null,
      budget: parseFloat(roleData.budget),
      quantity: parseInt(roleData.quantity)
    })

    if (result.success) {
      // Reload job to get updated roles
      await loadJob()
      setSuccess('Role added successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to add role')
    }

    setIsAddRoleModalOpen(false)
    setRoleActionLoading(null)
  }

  // Update existing role
  const handleUpdateRole = async (roleData) => {
    if (!editingRole) return

    setRoleActionLoading(editingRole.id)
    setError(null)

    const result = await updateJobRole(editingRole.id, {
      role_title: roleData.role_title,
      role_description: roleData.role_description || null,
      budget: parseFloat(roleData.budget),
      quantity: parseInt(roleData.quantity)
    })

    if (result.success) {
      await loadJob()
      setSuccess('Role updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to update role')
    }

    setEditingRole(null)
    setIsAddRoleModalOpen(false)
    setRoleActionLoading(null)
  }

  // Delete role
  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role? This cannot be undone.')) {
      return
    }

    setRoleActionLoading(roleId)
    setError(null)

    const result = await deleteJobRole(roleId)

    if (result.success) {
      await loadJob()
      setSuccess('Role deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to delete role')
    }

    setRoleActionLoading(null)
  }

  // Cancel job
  const handleCancelJob = async () => {
    if (!confirm('Are you sure you want to cancel this job? This will notify all applicants.')) {
      return
    }

    setSaving(true)
    setError(null)

    const result = await cancelJobPosting(jobId)

    if (result.success) {
      setSuccess('Job cancelled successfully')
      setTimeout(() => navigate('/jobs'), 1500)
    } else {
      setError(result.error || 'Failed to cancel job')
    }

    setSaving(false)
  }

  const getRoleTypeColor = (roleType) => {
    switch (roleType) {
      case 'freelancer':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'venue':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'vendor':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Open</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      case 'filled':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Filled</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error && !originalJob) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Job</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/jobs')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
                {originalJob && getStatusBadge(originalJob.status)}
              </div>
              <p className="text-gray-600">
                Update your job posting details and manage roles
              </p>
            </div>

            {originalJob?.status === 'open' && (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleCancelJob}
                disabled={saving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Job
              </Button>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              Roles
              <Badge variant="secondary">{roles.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* JOB DETAILS TAB */}
          <TabsContent value="details">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <JobBasicDetailsForm
                jobData={jobData}
                setJobData={setJobData}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                Cancel
              </Button>
              <Button onClick={handleSaveDetails} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* ROLES TAB */}
          <TabsContent value="roles">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Manage Roles</h2>
                  <p className="text-sm text-gray-600">
                    Add, edit, or remove roles for this job
                  </p>
                </div>
                <Button onClick={() => {
                  setEditingRole(null)
                  setIsAddRoleModalOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              {/* Roles List */}
              {roles.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No roles defined</h3>
                  <p className="text-gray-600 mb-4">
                    Add roles to specify what positions you need filled
                  </p>
                  <Button onClick={() => setIsAddRoleModalOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Role
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {roles.map((role) => {
                    const filled = role.filled_count || 0
                    const total = role.quantity || 1
                    const hasApplicants = filled > 0

                    return (
                      <div
                        key={role.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {role.role_title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getRoleTypeColor(role.role_type)}`}>
                                {role.role_type}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({filled}/{total} filled)
                              </span>
                            </div>

                            {role.role_description && (
                              <p className="text-sm text-gray-600 mb-3">{role.role_description}</p>
                            )}

                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1 font-semibold text-green-600">
                                <DollarSign className="h-4 w-4" />
                                <span>${parseFloat(role.budget).toFixed(2)}</span>
                              </div>
                              <div className="text-gray-600">
                                Quantity: <span className="font-medium">{role.quantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingRole(role)
                                setIsAddRoleModalOpen(true)
                              }}
                              disabled={roleActionLoading === role.id}
                              className="p-2 text-gray-600 hover:text-[#E03131] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Edit role"
                            >
                              {roleActionLoading === role.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit2 className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={roleActionLoading === role.id || hasApplicants}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={hasApplicants ? 'Cannot delete role with applicants' : 'Delete role'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {hasApplicants && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-amber-600">
                              This role has {filled} selected applicant(s) and cannot be deleted
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Total Budget Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Budget</p>
                        <p className="text-xs text-gray-500">
                          {roles.length} {roles.length === 1 ? 'role' : 'roles'}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ${totalBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note about saving */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Role changes are saved automatically. The total budget will update when you save job details.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Role Modal */}
        <AddRoleModal
          isOpen={isAddRoleModalOpen}
          onClose={() => {
            setIsAddRoleModalOpen(false)
            setEditingRole(null)
          }}
          onSave={editingRole ? handleUpdateRole : handleAddRole}
          initialData={editingRole ? {
            role_type: editingRole.role_type,
            role_title: editingRole.role_title,
            role_description: editingRole.role_description || '',
            budget: editingRole.budget,
            quantity: editingRole.quantity
          } : null}
        />
      </div>
    </div>
  )
}

export default EditJobPage
