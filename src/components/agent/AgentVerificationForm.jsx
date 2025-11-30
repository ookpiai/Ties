/**
 * AGENT VERIFICATION FORM
 * Per agent.md spec - Website + Manual Review verification
 *
 * Requirements:
 * - Primary Website URL (mandatory)
 * - Contact Email + Phone
 * - Short Agent Bio (50-200 chars)
 * - Industry Tags
 * - Talent Representation Evidence (at least 1 URL)
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Globe,
  Phone,
  FileText,
  Link as LinkIcon,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { submitAgentVerification, AGENT_INDUSTRY_TAGS } from '../../api/agents'

const AgentVerificationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    bio: '',
    phone: '',
    industryTags: [],
    evidenceUrls: ['']
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Validate form
  const validate = () => {
    const newErrors = {}

    // Website URL (required)
    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required'
    } else if (!isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL'
    }

    // Bio (required, 50-200 chars)
    if (!formData.bio.trim()) {
      newErrors.bio = 'Agent bio is required'
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters'
    } else if (formData.bio.length > 200) {
      newErrors.bio = 'Bio must be 200 characters or less'
    }

    // Phone (required)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    // Industry tags (at least 1)
    if (formData.industryTags.length === 0) {
      newErrors.industryTags = 'Select at least one industry'
    }

    // Evidence URLs (at least 1 valid URL)
    const validEvidenceUrls = formData.evidenceUrls.filter(url => url.trim() && isValidUrl(url))
    if (validEvidenceUrls.length === 0) {
      newErrors.evidenceUrls = 'At least one evidence URL is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      // Filter out empty evidence URLs
      const validEvidenceUrls = formData.evidenceUrls.filter(url => url.trim() && isValidUrl(url))

      await submitAgentVerification({
        websiteUrl: formData.websiteUrl.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        industryTags: formData.industryTags,
        evidenceUrls: validEvidenceUrls
      })

      onSuccess?.()
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit verification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleIndustryTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      industryTags: prev.industryTags.includes(tag)
        ? prev.industryTags.filter(t => t !== tag)
        : [...prev.industryTags, tag]
    }))
    // Clear error when user selects
    if (errors.industryTags) {
      setErrors(prev => ({ ...prev, industryTags: null }))
    }
  }

  const addEvidenceUrl = () => {
    setFormData(prev => ({
      ...prev,
      evidenceUrls: [...prev.evidenceUrls, '']
    }))
  }

  const removeEvidenceUrl = (index) => {
    if (formData.evidenceUrls.length > 1) {
      setFormData(prev => ({
        ...prev,
        evidenceUrls: prev.evidenceUrls.filter((_, i) => i !== index)
      }))
    }
  }

  const updateEvidenceUrl = (index, value) => {
    setFormData(prev => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.map((url, i) => i === index ? value : url)
    }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Agent Verification
        </CardTitle>
        <CardDescription>
          Complete this form to verify your agent status. All applications are reviewed manually by our team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No government ID required. We verify based on your public web presence and evidence of talent representation.
            </AlertDescription>
          </Alert>

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Primary Website URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://your-agency.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
              className={errors.websiteUrl ? 'border-red-500' : ''}
            />
            {errors.websiteUrl && (
              <p className="text-sm text-red-500">{errors.websiteUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your website should clearly show your agency, roster, or representation activity
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+61 400 000 000"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agent Bio <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Describe your agency and the talent you represent..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className={errors.bio ? 'border-red-500' : ''}
              rows={3}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.bio ? (
                <p className="text-red-500">{errors.bio}</p>
              ) : (
                <span>50-200 characters</span>
              )}
              <span className={formData.bio.length < 50 || formData.bio.length > 200 ? 'text-red-500' : ''}>
                {formData.bio.length}/200
              </span>
            </div>
          </div>

          {/* Industry Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Industry Tags <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select the categories of freelancers you represent
            </p>
            <div className="flex flex-wrap gap-2">
              {AGENT_INDUSTRY_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={formData.industryTags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    formData.industryTags.includes(tag)
                      ? 'bg-primary hover:bg-primary/90'
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => toggleIndustryTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {errors.industryTags && (
              <p className="text-sm text-red-500">{errors.industryTags}</p>
            )}
          </div>

          {/* Evidence URLs */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Talent Representation Evidence <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Provide links showing you represent talent (roster page, social media, flyers, etc.)
            </p>
            <div className="space-y-2">
              {formData.evidenceUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/roster"
                    value={url}
                    onChange={(e) => updateEvidenceUrl(index, e.target.value)}
                  />
                  {formData.evidenceUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEvidenceUrl(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.evidenceUrls && (
              <p className="text-sm text-red-500">{errors.evidenceUrls}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEvidenceUrl}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Link
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Verification usually takes 1-2 business days. We'll notify you once reviewed.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default AgentVerificationForm
