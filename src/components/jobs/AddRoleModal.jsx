import { useState, useEffect } from 'react'
import { X, Users, Building2, Package, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'

const AddRoleModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [roleData, setRoleData] = useState({
    role_type: 'freelancer',
    role_title: '',
    role_description: '',
    budget: '',
    quantity: 1
  })

  const [errors, setErrors] = useState({})

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setRoleData(initialData)
    } else {
      setRoleData({
        role_type: 'freelancer',
        role_title: '',
        role_description: '',
        budget: '',
        quantity: 1
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleChange = (field, value) => {
    setRoleData({ ...roleData, [field]: value })
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!roleData.role_type) {
      newErrors.role_type = 'Role type is required'
    }

    if (!roleData.role_title.trim()) {
      newErrors.role_title = 'Role title is required'
    }

    if (!roleData.budget || parseFloat(roleData.budget) <= 0) {
      newErrors.budget = 'Budget must be greater than 0'
    }

    if (!roleData.quantity || parseInt(roleData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...roleData,
        budget: parseFloat(roleData.budget),
        quantity: parseInt(roleData.quantity)
      })
    }
  }

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'freelancer':
        return <Users className="h-5 w-5" />
      case 'venue':
        return <Building2 className="h-5 w-5" />
      case 'vendor':
        return <Package className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const roleTypeDescriptions = {
    freelancer: 'Independent professionals (DJs, photographers, artists, etc.)',
    venue: 'Event spaces and locations',
    vendor: 'Service providers and suppliers (catering, equipment, etc.)'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Role' : 'Add New Role'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Define the role requirements and budget
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Role Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['freelancer', 'venue', 'vendor'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('role_type', type)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    roleData.role_type === type
                      ? 'border-[#E03131] bg-[#E03131]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {getRoleIcon(type)}
                  </div>
                  <p className="font-medium capitalize text-sm">{type}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {roleTypeDescriptions[roleData.role_type]}
            </p>
            {errors.role_type && (
              <p className="text-sm text-red-600 mt-1">{errors.role_type}</p>
            )}
          </div>

          {/* Role Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., DJ, Photographer, Wedding Venue"
              value={roleData.role_title}
              onChange={(e) => handleChange('role_title', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent ${
                errors.role_title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.role_title && (
              <p className="text-sm text-red-600 mt-1">{errors.role_title}</p>
            )}
          </div>

          {/* Role Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Description (Optional)
            </label>
            <textarea
              placeholder="Describe the specific requirements for this role..."
              value={roleData.role_description}
              onChange={(e) => handleChange('role_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
            />
          </div>

          {/* Budget and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Budget (AUD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={roleData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent ${
                  errors.budget ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.budget && (
                <p className="text-sm text-red-600 mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="1"
                value={roleData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                How many people needed for this role
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialData ? 'Update Role' : 'Add Role'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddRoleModal
