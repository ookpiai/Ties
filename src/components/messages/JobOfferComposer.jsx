import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Send,
  Info,
  User
} from 'lucide-react'
import { sendJobOffer } from '../../api/jobOffers'

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'party', label: 'Party' },
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
  { value: 'photoshoot', label: 'Photoshoot' },
  { value: 'conference', label: 'Conference' },
  { value: 'private', label: 'Private Event' },
  { value: 'other', label: 'Other' },
]

const ROLE_TYPES = [
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'venue', label: 'Venue' },
]

const COMMON_ROLES = [
  'Photographer',
  'Videographer',
  'DJ',
  'Makeup Artist',
  'Event Planner',
  'Caterer',
  'Florist',
  'Decorator',
  'MC / Host',
  'Musician',
  'Bartender',
  'Security',
  'Other'
]

const JobOfferComposer = ({
  open,
  onOpenChange,
  recipient,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    location: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    budgetType: 'fixed',
    budgetAmount: '',
    roleType: 'freelancer',
    roleTitle: '',
    expiresInDays: '7'
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title for your offer')
      return
    }
    if (!formData.description.trim()) {
      setError('Please describe the opportunity')
      return
    }

    setLoading(true)

    const result = await sendJobOffer({
      recipientId: recipient.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventType: formData.eventType || undefined,
      location: formData.location.trim() || undefined,
      eventDate: formData.eventDate || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      budgetType: formData.budgetType,
      budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : undefined,
      roleType: formData.roleType,
      roleTitle: formData.roleTitle || undefined,
      expiresInDays: formData.expiresInDays ? parseInt(formData.expiresInDays) : undefined
    })

    setLoading(false)

    if (result.success) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        eventType: '',
        location: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        budgetType: 'fixed',
        budgetAmount: '',
        roleType: 'freelancer',
        roleTitle: '',
        expiresInDays: '7'
      })
      onOpenChange(false)
      if (onSuccess) onSuccess(result.data)
    } else {
      setError(result.error || 'Failed to send offer')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Send Job Offer
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <User className="w-4 h-4" />
            To: {recipient?.display_name || 'User'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Wedding Photography"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the opportunity, requirements, and what you're looking for..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Event Type and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => handleChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role Needed</Label>
              <Select
                value={formData.roleTitle}
                onValueChange={(value) => handleChange('roleTitle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., Melbourne, VIC"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleChange('eventDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Start
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Budget Type
              </Label>
              <Select
                value={formData.budgetType}
                onValueChange={(value) => handleChange('budgetType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">Amount (AUD)</Label>
              <Input
                id="budgetAmount"
                type="number"
                min="0"
                step="50"
                placeholder="e.g., 2500"
                value={formData.budgetAmount}
                onChange={(e) => handleChange('budgetAmount', e.target.value)}
              />
            </div>
          </div>

          {/* Response Deadline */}
          <div className="space-y-2">
            <Label>Response Deadline</Label>
            <Select
              value={formData.expiresInDays}
              onValueChange={(value) => handleChange('expiresInDays', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No deadline</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This offer will be sent privately to <strong>{recipient?.display_name}</strong> only.
              It will not be visible to other users or appear on the public jobs page.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default JobOfferComposer
