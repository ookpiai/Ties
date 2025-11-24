/**
 * ServicesPage Component
 * Amendment 8: Universal Services Page
 *
 * Displays 3 universal sections with role-specific fields:
 * 1. What I Offer
 * 2. Pricing & Packages
 * 3. Logistics & Requirements
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Edit, Save, X, Loader2 } from 'lucide-react'
import { useAuth } from '../../App'
import { getProfile, updateProfile } from '../../api/profiles'
import { getDefaultServicesData, type ServicesData, type UserRole } from '../../types/services'
import FreelancerServicesForm from './services/FreelancerServicesForm'
import VenueServicesForm from './services/VenueServicesForm'
import VendorServicesForm from './services/VendorServicesForm'

interface ServicesPageProps {
  userId?: string
  isOwnProfile?: boolean
}

const ServicesPage = ({ userId, isOwnProfile = true }: ServicesPageProps) => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [servicesData, setServicesData] = useState<ServicesData | null>(null)

  useEffect(() => {
    loadServicesData()
  }, [userId, user])

  const loadServicesData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const profileId = userId || user?.id
      if (!profileId) {
        setError('No user ID provided')
        return
      }

      const profileData = await getProfile(profileId)

      if (!profileData) {
        setError('Profile not found')
        return
      }

      setUserRole(profileData.role as UserRole)

      // Load existing services data or initialize with defaults
      if (profileData.services_data && Object.keys(profileData.services_data).length > 0) {
        setServicesData(profileData.services_data as ServicesData)
      } else {
        const defaultData = getDefaultServicesData(profileData.role as UserRole)
        setServicesData(defaultData)
      }
    } catch (err) {
      console.error('Failed to load services data:', err)
      setError('Failed to load services information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!servicesData || !user?.id) return

    setIsSaving(true)
    setError('')
    setSuccess(false)

    try {
      await updateProfile(user.id, {
        services_data: servicesData
      })

      setSuccess(true)
      setIsEditing(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Failed to save services data:', err)
      setError(err.message || 'Failed to save services information')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    loadServicesData() // Reload original data
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading services...</span>
      </div>
    )
  }

  if (error && !servicesData) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!userRole || userRole === 'Organiser') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">
            Services page is only available for Freelancers, Vendors, and Venues.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit/Save buttons */}
      {isOwnProfile && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Services & Offerings
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Showcase what you offer, your pricing, and logistics
            </p>
          </div>

          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Services
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Services information saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Role-Specific Forms */}
      {servicesData && userRole === 'Freelancer' && (
        <FreelancerServicesForm
          data={servicesData}
          isEditing={isEditing}
          onChange={setServicesData}
        />
      )}

      {servicesData && userRole === 'Venue' && (
        <VenueServicesForm
          data={servicesData}
          isEditing={isEditing}
          onChange={setServicesData}
        />
      )}

      {servicesData && userRole === 'Vendor' && (
        <VendorServicesForm
          data={servicesData}
          isEditing={isEditing}
          onChange={setServicesData}
        />
      )}
    </div>
  )
}

export default ServicesPage
