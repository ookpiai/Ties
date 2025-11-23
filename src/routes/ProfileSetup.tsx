import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { createProfile } from '../api/profiles'
import { uploadAvatar } from '../api/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '../components/Toaster'
import { TitoLoader, useLoader } from '../components/TitoLoader'

export function ProfileSetup() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isLoading, withLoader } = useLoader()

  const [formData, setFormData] = useState({
    display_name: '',
    role: '' as 'Artist' | 'Crew' | 'Venue' | 'Organiser' | '',
    city: '',
    bio: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in')
      return
    }

    if (!formData.display_name || !formData.role) {
      setError('Please fill in all required fields')
      return
    }

    try {
      await withLoader(async () => {
        let avatar_url = null

        // Upload avatar if provided
        if (avatarFile) {
          avatar_url = await uploadAvatar(avatarFile, user.id)
        }

        // Create profile
        await createProfile({
          id: user.id,
          display_name: formData.display_name,
          role: formData.role as 'Artist' | 'Crew' | 'Venue' | 'Organiser',
          city: formData.city || null,
          bio: formData.bio || null,
          avatar_url
        })

        showToast('Profile created successfully!', 'success')
        navigate('/browse')
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
      showToast(err.message || 'Failed to create profile', 'error')
    }
  }

  return (
    <>
      <TitoLoader show={isLoading} />
      <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-black/5 p-8">
            <h1 className="text-3xl font-bold text-black mb-2">Complete Your Profile</h1>
            <p className="text-black/70 mb-6">Tell us about yourself to get started</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="display_name" className="text-black">Display Name *</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  required
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="How should we call you?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-black">I am a... *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freelancer">Freelancer (DJ, Photographer, Performer, etc.)</SelectItem>
                    <SelectItem value="Vendor">Vendor (Catering, Equipment, Services)</SelectItem>
                    <SelectItem value="Venue">Venue (Event Space, Location)</SelectItem>
                    <SelectItem value="Organiser">Organiser (Event Planner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city" className="text-black">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Sydney, Melbourne"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-black">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="avatar" className="text-black">Profile Picture</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E03131] hover:bg-[#F03E3E] text-white"
                disabled={isLoading}
              >
                Complete Profile
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
