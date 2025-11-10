import { useState } from 'react'
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import AddRoleModal from './AddRoleModal'

const JobRolesManager = ({ roles, setRoles, totalBudget }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRoleIndex, setEditingRoleIndex] = useState(null)

  const handleAddRole = (roleData) => {
    if (editingRoleIndex !== null) {
      // Editing existing role
      const updatedRoles = [...roles]
      updatedRoles[editingRoleIndex] = roleData
      setRoles(updatedRoles)
      setEditingRoleIndex(null)
    } else {
      // Adding new role
      setRoles([...roles, roleData])
    }
    setIsAddModalOpen(false)
  }

  const handleEditRole = (index) => {
    setEditingRoleIndex(index)
    setIsAddModalOpen(true)
  }

  const handleDeleteRole = (index) => {
    if (confirm('Are you sure you want to remove this role?')) {
      setRoles(roles.filter((_, i) => i !== index))
    }
  }

  const handleCancelEdit = () => {
    setEditingRoleIndex(null)
    setIsAddModalOpen(false)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Roles</h2>
        <p className="text-gray-600">
          Define the roles you need for this event. You can add one or multiple roles.
        </p>
      </div>

      {/* Add Role Button */}
      <div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Roles List */}
      {roles.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-3">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No roles added yet</h3>
          <p className="text-gray-600 mb-4">
            Start by adding the roles you need for your event
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Role
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role, index) => (
            <div
              key={index}
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
                    onClick={() => handleEditRole(index)}
                    className="p-2 text-gray-600 hover:text-[#E03131] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit role"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(index)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete role"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Total Budget Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xs text-gray-500">{roles.length} {roles.length === 1 ? 'role' : 'roles'} added</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${totalBudget.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      <AddRoleModal
        isOpen={isAddModalOpen}
        onClose={handleCancelEdit}
        onSave={handleAddRole}
        initialData={editingRoleIndex !== null ? roles[editingRoleIndex] : null}
      />
    </div>
  )
}

export default JobRolesManager
