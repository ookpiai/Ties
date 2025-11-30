/**
 * Package Editor Modal
 *
 * Modal for creating/editing service packages with tiered pricing
 * Based on Fiverr's package creation flow
 *
 * Sources:
 * - https://help.fiverr.com/hc/en-us/articles/4410009235601-Standardized-Gig-packages
 * - https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Zap,
  Star,
  Crown,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  DollarSign,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import {
  createServicePackage,
  updateServicePackage,
  deleteServicePackage,
  createDefaultPackages,
  getTierInfo,
} from '../../../api/servicePackages'

const TIER_ICONS = {
  basic: Zap,
  standard: Star,
  premium: Crown,
}

const DELIVERY_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 5, label: '5 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 30, label: '30 days' },
]

const DEFAULT_FEATURES = [
  'Basic service included',
  'Email support',
  'Phone support',
  'Priority booking',
  'Extended hours',
  'Setup included',
  'Travel included',
  'Equipment provided',
  'Same-day delivery',
  'Rush delivery available',
]

const PackageEditorModal = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  editPackage = null,
  tier = 'basic',
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuickSetup, setShowQuickSetup] = useState(!editPackage)

  const tierInfo = getTierInfo(tier)
  const TierIcon = TIER_ICONS[tier]

  const [formData, setFormData] = useState({
    name: editPackage?.name || getDefaultName(tier),
    description: editPackage?.description || '',
    price: editPackage?.price || getDefaultPrice(tier),
    original_price: editPackage?.original_price || '',
    delivery_time_days: editPackage?.delivery_time_days || getDefaultDelivery(tier),
    revisions_included: editPackage?.revisions_included || getDefaultRevisions(tier),
    unlimited_revisions: editPackage?.unlimited_revisions || false,
    features: editPackage?.features || getDefaultFeatures(tier),
    is_popular: editPackage?.is_popular || tier === 'standard',
    is_recommended: editPackage?.is_recommended || tier === 'premium',
  })

  const [newFeature, setNewFeature] = useState('')

  function getDefaultName(t) {
    const names = { basic: 'Starter', standard: 'Professional', premium: 'Enterprise' }
    return names[t]
  }

  function getDefaultPrice(t) {
    const prices = { basic: 150, standard: 300, premium: 500 }
    return prices[t]
  }

  function getDefaultDelivery(t) {
    const delivery = { basic: 7, standard: 5, premium: 3 }
    return delivery[t]
  }

  function getDefaultRevisions(t) {
    const revisions = { basic: 1, standard: 2, premium: 5 }
    return revisions[t]
  }

  function getDefaultFeatures(t) {
    const features = {
      basic: [
        { feature: 'Basic service included', included: true },
        { feature: 'Email support', included: true },
        { feature: 'Phone support', included: false },
        { feature: 'Priority booking', included: false },
      ],
      standard: [
        { feature: 'Full service included', included: true },
        { feature: 'Email support', included: true },
        { feature: 'Phone support', included: true },
        { feature: 'Priority booking', included: false },
      ],
      premium: [
        { feature: 'Full service included', included: true },
        { feature: '24/7 support', included: true },
        { feature: 'Phone support', included: true },
        { feature: 'Priority booking', included: true },
      ],
    }
    return features[t]
  }

  // Handle quick setup - create all 3 tiers at once
  const handleQuickSetup = async () => {
    setIsSubmitting(true)
    try {
      await createDefaultPackages(serviceId, serviceName, formData.price)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create packages:', error)
      alert('Failed to create packages. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle single package submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a package name')
      return
    }
    if (!formData.price || formData.price <= 0) {
      alert('Please enter a valid price')
      return
    }

    setIsSubmitting(true)
    try {
      const packageData = {
        service_id: serviceId,
        tier,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        delivery_time_days: parseInt(formData.delivery_time_days),
        revisions_included: parseInt(formData.revisions_included),
        unlimited_revisions: formData.unlimited_revisions,
        features: formData.features,
        is_popular: formData.is_popular,
        is_recommended: formData.is_recommended,
      }

      if (editPackage) {
        await updateServicePackage(editPackage.id, packageData)
      } else {
        await createServicePackage(packageData)
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save package:', error)
      alert('Failed to save package. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!editPackage) return
    if (!confirm('Are you sure you want to delete this package?')) return

    setIsSubmitting(true)
    try {
      await deleteServicePackage(editPackage.id)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to delete package:', error)
      alert('Failed to delete package. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add feature
  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [
          ...formData.features,
          { feature: newFeature.trim(), included: true },
        ],
      })
      setNewFeature('')
    }
  }

  // Toggle feature
  const toggleFeature = (index) => {
    const updated = [...formData.features]
    updated[index].included = !updated[index].included
    setFormData({ ...formData, features: updated })
  }

  // Remove feature
  const removeFeature = (index) => {
    const updated = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: updated })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${tierInfo.bgColor}`}>
              <TierIcon className={`w-5 h-5 ${tierInfo.color}`} />
            </div>
            {editPackage ? 'Edit Package' : `Create ${tierInfo.label} Package`}
          </DialogTitle>
          <DialogDescription>
            Set up your {tierInfo.label.toLowerCase()} tier pricing and features
            for {serviceName}.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Setup Option */}
        {showQuickSetup && !editPackage && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Quick Setup
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Create all three tiers (Basic, Standard, Premium) automatically
                  with recommended settings. You can customize them later.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleQuickSetup} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create All 3 Tiers
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQuickSetup(false)}
                  >
                    Customize Manually
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(!showQuickSetup || editPackage) && (
          <div className="space-y-6 py-4">
            {/* Package Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Starter, Professional, Enterprise"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what's included in this package..."
                rows={2}
              />
            </div>

            {/* Price and Original Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (AUD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">
                  Original Price (optional)
                  <span className="text-xs text-slate-500 ml-1">
                    Shows as crossed out
                  </span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="original_price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Time and Revisions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Select
                  value={String(formData.delivery_time_days)}
                  onValueChange={(value) =>
                    setFormData({ ...formData, delivery_time_days: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Revisions</Label>
                <div className="flex items-center gap-4">
                  <Select
                    value={
                      formData.unlimited_revisions
                        ? 'unlimited'
                        : String(formData.revisions_included)
                    }
                    onValueChange={(value) => {
                      if (value === 'unlimited') {
                        setFormData({
                          ...formData,
                          unlimited_revisions: true,
                        })
                      } else {
                        setFormData({
                          ...formData,
                          unlimited_revisions: false,
                          revisions_included: parseInt(value),
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 5, 10].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} revision{num !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label>What's Included</Label>

              {/* Add Feature */}
              <div className="flex gap-2">
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (
                      value &&
                      !formData.features.find((f) => f.feature === value)
                    ) {
                      setFormData({
                        ...formData,
                        features: [
                          ...formData.features,
                          { feature: value, included: true },
                        ],
                      })
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add a feature..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_FEATURES.filter(
                      (f) => !formData.features.find((ff) => ff.feature === f)
                    ).map((feature) => (
                      <SelectItem key={feature} value={feature}>
                        {feature}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Custom feature..."
                    className="w-48"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addFeature}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Feature List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFeature(index)}
                        className={`p-1 rounded ${
                          feature.included
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                            : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                        }`}
                      >
                        {feature.included ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={
                          feature.included
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500 line-through'
                        }
                      >
                        {feature.feature}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_popular: checked })
                  }
                />
                <Label htmlFor="is_popular" className="cursor-pointer">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    Most Popular
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_recommended"
                  checked={formData.is_recommended}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_recommended: checked })
                  }
                />
                <Label htmlFor="is_recommended" className="cursor-pointer">
                  <Badge variant="outline" className="bg-purple-100 border-purple-300 dark:bg-purple-900/30">
                    Recommended
                  </Badge>
                </Label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {editPackage && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            {(!showQuickSetup || editPackage) && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editPackage ? (
                  'Save Changes'
                ) : (
                  'Create Package'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PackageEditorModal
