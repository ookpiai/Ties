/**
 * VenueServicesForm Component
 * Amendment 8: Services form for Venues
 * 3 Sections: What I Offer, Pricing & Packages, Logistics & Requirements
 * Inspired by Surreal.live's venue management features
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, X, DollarSign, Users, Building2, MapPin, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import type { VenueServices } from '../../../types/services'

interface VenueServicesFormProps {
  data: VenueServices
  isEditing: boolean
  onChange: (data: VenueServices) => void
}

const VenueServicesForm = ({ data, isEditing, onChange }: VenueServicesFormProps) => {
  const [newSuitabilityTag, setNewSuitabilityTag] = useState('')
  const [newFeature, setNewFeature] = useState('')

  // Helper to update nested data
  const updateField = (section: keyof VenueServices, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    })
  }

  // Helper for deeply nested fields (venueRules, accessibility)
  const updateNestedField = (section: keyof VenueServices, parent: string, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [parent]: {
          ...(data[section] as any)[parent],
          [field]: value
        }
      }
    })
  }

  // Array helpers
  const addItem = (section: keyof VenueServices, field: string, value: string) => {
    if (!value.trim()) return
    const currentArray = (data[section] as any)[field] || []
    updateField(section, field, [...currentArray, value.trim()])
  }

  const removeItem = (section: keyof VenueServices, field: string, index: number) => {
    const currentArray = (data[section] as any)[field] || []
    updateField(section, field, currentArray.filter((_: any, i: number) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Section 1: What I Offer */}
      <Card>
        <CardHeader>
          <CardTitle>1. What I Offer</CardTitle>
          <p className="text-sm text-gray-600">
            Describe your venue and its ideal uses
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Venue Type */}
          <div>
            <Label className="required">Venue Type</Label>
            <p className="text-sm text-gray-500 mb-2">
              Primary venue category from your specialty (e.g., Studio, Gallery, Event Hall)
            </p>
            {isEditing ? (
              <Input
                value={data.whatIOffer.venueType}
                onChange={(e) => updateField('whatIOffer', 'venueType', e.target.value)}
                placeholder="e.g., Photography Studio"
              />
            ) : (
              <p className="text-gray-700">{data.whatIOffer.venueType || 'Not specified'}</p>
            )}
          </div>

          {/* Suitability Tags */}
          <div>
            <Label className="required">Suitability Tags</Label>
            <p className="text-sm text-gray-500 mb-2">
              What is your venue best suited for? (e.g., photoshoots, events, workshops, meetings)
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newSuitabilityTag}
                  onChange={(e) => setNewSuitabilityTag(e.target.value)}
                  placeholder="Add a suitability tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('whatIOffer', 'suitabilityTags', newSuitabilityTag)
                      setNewSuitabilityTag('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('whatIOffer', 'suitabilityTags', newSuitabilityTag)
                    setNewSuitabilityTag('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.whatIOffer.suitabilityTags.map((tag, index) => (
                <Badge key={index} variant="default">
                  {tag}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('whatIOffer', 'suitabilityTags', index)}
                      className="ml-2 text-white hover:text-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.whatIOffer.suitabilityTags.length === 0 && (
                <span className="text-sm text-gray-500">No suitability tags added yet</span>
              )}
            </div>
          </div>

          {/* Service Description */}
          <div>
            <Label>Service Description (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Describe your venue's atmosphere, unique features, and what makes it special
            </p>
            {isEditing ? (
              <Textarea
                value={data.whatIOffer.serviceDescription || ''}
                onChange={(e) => updateField('whatIOffer', 'serviceDescription', e.target.value)}
                placeholder="Tell potential clients about your venue - atmosphere, location advantages, recent renovations, unique selling points..."
                rows={4}
              />
            ) : (
              <p className="text-gray-700">{data.whatIOffer.serviceDescription || 'No description provided'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Pricing & Packages */}
      <Card>
        <CardHeader>
          <CardTitle>2. Pricing & Packages</CardTitle>
          <p className="text-sm text-gray-600">
            Set your hire rates and packages
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rates */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="required">Hourly Rate</Label>
              <p className="text-sm text-gray-500 mb-2">Per hour rate</p>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    value={data.pricingPackages.hourlyRate}
                    onChange={(e) => updateField('pricingPackages', 'hourlyRate', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ) : (
                <p className="text-gray-700">
                  ${data.pricingPackages.hourlyRate} {data.pricingPackages.currency || 'AUD'}/hr
                </p>
              )}
            </div>

            <div>
              <Label>Half-Day Rate (Optional)</Label>
              <p className="text-sm text-gray-500 mb-2">~4 hours</p>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    value={data.pricingPackages.halfDayRate || ''}
                    onChange={(e) => updateField('pricingPackages', 'halfDayRate', parseFloat(e.target.value) || undefined)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ) : (
                <p className="text-gray-700">
                  {data.pricingPackages.halfDayRate
                    ? `$${data.pricingPackages.halfDayRate}`
                    : 'Not set'
                  }
                </p>
              )}
            </div>

            <div>
              <Label>Full-Day Rate (Optional)</Label>
              <p className="text-sm text-gray-500 mb-2">~8-10 hours</p>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    value={data.pricingPackages.fullDayRate || ''}
                    onChange={(e) => updateField('pricingPackages', 'fullDayRate', parseFloat(e.target.value) || undefined)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ) : (
                <p className="text-gray-700">
                  {data.pricingPackages.fullDayRate
                    ? `$${data.pricingPackages.fullDayRate}`
                    : 'Not set'
                  }
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Pricing Tip:</strong> Consider offering discounted rates for half-day and full-day bookings to encourage longer hires.
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> Package deals (weekend, recurring hire) will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Logistics & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>3. Logistics & Requirements</CardTitle>
          <p className="text-sm text-gray-600">
            Capacity, features, rules, and accessibility information
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Capacity */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="required flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Maximum Capacity
                </Label>
                <p className="text-sm text-gray-500 mb-2">Standing capacity</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={data.logisticsRequirements.capacity}
                    onChange={(e) => updateField('logisticsRequirements', 'capacity', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 100"
                    min="0"
                  />
                ) : (
                  <p className="text-gray-700">{data.logisticsRequirements.capacity} people</p>
                )}
              </div>

              <div>
                <Label>Seated Capacity (Optional)</Label>
                <p className="text-sm text-gray-500 mb-2">With seating</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={data.logisticsRequirements.capacitySeated || ''}
                    onChange={(e) => updateField('logisticsRequirements', 'capacitySeated', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 60"
                    min="0"
                  />
                ) : (
                  <p className="text-gray-700">
                    {data.logisticsRequirements.capacitySeated
                      ? `${data.logisticsRequirements.capacitySeated} people`
                      : 'Not specified'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Features & Amenities */}
          <div>
            <Label className="required flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Features & Amenities
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              What's included? (e.g., lighting, sound system, AC, mirrors, kitchen, WiFi)
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature or amenity..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('logisticsRequirements', 'featuresAmenities', newFeature)
                      setNewFeature('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('logisticsRequirements', 'featuresAmenities', newFeature)
                    setNewFeature('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.logisticsRequirements.featuresAmenities.map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('logisticsRequirements', 'featuresAmenities', index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.logisticsRequirements.featuresAmenities.length === 0 && (
                <span className="text-sm text-gray-500">No features added yet</span>
              )}
            </div>
          </div>

          {/* Venue Rules */}
          <Card className="border-2 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Venue Rules
              </CardTitle>
              <p className="text-sm text-gray-600">Important rules and restrictions</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="required">Operating Hours</Label>
                {isEditing ? (
                  <Input
                    value={data.logisticsRequirements.venueRules.operatingHours}
                    onChange={(e) => updateNestedField('logisticsRequirements', 'venueRules', 'operatingHours', e.target.value)}
                    placeholder="e.g., 9am - 11pm daily, Mon-Sat 8am-10pm"
                  />
                ) : (
                  <p className="text-gray-700">{data.logisticsRequirements.venueRules.operatingHours || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label>Noise Restrictions (Optional)</Label>
                {isEditing ? (
                  <Input
                    value={data.logisticsRequirements.venueRules.noiseRestrictions || ''}
                    onChange={(e) => updateNestedField('logisticsRequirements', 'venueRules', 'noiseRestrictions', e.target.value || undefined)}
                    placeholder="e.g., No loud music after 10pm, 80dB limit"
                  />
                ) : (
                  <p className="text-gray-700">{data.logisticsRequirements.venueRules.noiseRestrictions || 'None specified'}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="required">Bond Required?</Label>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={data.logisticsRequirements.venueRules.bondRequired === true}
                            onChange={() => updateNestedField('logisticsRequirements', 'venueRules', 'bondRequired', true)}
                            className="w-4 h-4"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={data.logisticsRequirements.venueRules.bondRequired === false}
                            onChange={() => {
                              updateNestedField('logisticsRequirements', 'venueRules', 'bondRequired', false)
                              updateNestedField('logisticsRequirements', 'venueRules', 'bondAmount', undefined)
                            }}
                            className="w-4 h-4"
                          />
                          <span>No</span>
                        </label>
                      </div>
                      {data.logisticsRequirements.venueRules.bondRequired && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <Input
                            type="number"
                            value={data.logisticsRequirements.venueRules.bondAmount || ''}
                            onChange={(e) => updateNestedField('logisticsRequirements', 'venueRules', 'bondAmount', parseFloat(e.target.value) || undefined)}
                            placeholder="Bond amount"
                            min="0"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-gray-700">
                        {data.logisticsRequirements.venueRules.bondRequired ? 'Yes' : 'No'}
                      </p>
                      {data.logisticsRequirements.venueRules.bondRequired && data.logisticsRequirements.venueRules.bondAmount && (
                        <p className="text-sm text-gray-600">${data.logisticsRequirements.venueRules.bondAmount}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="required">Alcohol Allowed?</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-4 mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={data.logisticsRequirements.venueRules.alcoholAllowed === true}
                          onChange={() => updateNestedField('logisticsRequirements', 'venueRules', 'alcoholAllowed', true)}
                          className="w-4 h-4"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={data.logisticsRequirements.venueRules.alcoholAllowed === false}
                          onChange={() => updateNestedField('logisticsRequirements', 'venueRules', 'alcoholAllowed', false)}
                          className="w-4 h-4"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-2">
                      {data.logisticsRequirements.venueRules.alcoholAllowed ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="required">Smoking Allowed?</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.logisticsRequirements.venueRules.smokingAllowed === true}
                        onChange={() => updateNestedField('logisticsRequirements', 'venueRules', 'smokingAllowed', true)}
                        className="w-4 h-4"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.logisticsRequirements.venueRules.smokingAllowed === false}
                        onChange={() => updateNestedField('logisticsRequirements', 'venueRules', 'smokingAllowed', false)}
                        className="w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-2">
                    {data.logisticsRequirements.venueRules.smokingAllowed ? 'Yes' : 'No'}
                  </p>
                )}
              </div>

              <div>
                <Label>Other Rules (Optional)</Label>
                {isEditing ? (
                  <Textarea
                    value={data.logisticsRequirements.venueRules.otherRules || ''}
                    onChange={(e) => updateNestedField('logisticsRequirements', 'venueRules', 'otherRules', e.target.value || undefined)}
                    placeholder="Any other important rules or restrictions clients should know about..."
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-700">{data.logisticsRequirements.venueRules.otherRules || 'None specified'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Accessibility
              </CardTitle>
              <p className="text-sm text-gray-600">Help clients understand accessibility features</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="required">Wheelchair Accessible</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-4 mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.logisticsRequirements.accessibility.wheelchairAccessible}
                          onChange={(e) => updateNestedField('logisticsRequirements', 'accessibility', 'wheelchairAccessible', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span>Wheelchair accessible</span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-2">
                      {data.logisticsRequirements.accessibility.wheelchairAccessible ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="required">Lift/Elevator Access</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-4 mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.logisticsRequirements.accessibility.liftElevatorAccess}
                          onChange={(e) => updateNestedField('logisticsRequirements', 'accessibility', 'liftElevatorAccess', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span>Lift/Elevator available</span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-2">
                      {data.logisticsRequirements.accessibility.liftElevatorAccess ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="required">Parking Available</Label>
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.logisticsRequirements.accessibility.parkingAvailable}
                          onChange={(e) => {
                            updateNestedField('logisticsRequirements', 'accessibility', 'parkingAvailable', e.target.checked)
                            if (!e.target.checked) {
                              updateNestedField('logisticsRequirements', 'accessibility', 'parkingSpaces', undefined)
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span>Parking available</span>
                      </label>
                    </div>
                    {data.logisticsRequirements.accessibility.parkingAvailable && (
                      <Input
                        type="number"
                        value={data.logisticsRequirements.accessibility.parkingSpaces || ''}
                        onChange={(e) => updateNestedField('logisticsRequirements', 'accessibility', 'parkingSpaces', parseInt(e.target.value) || undefined)}
                        placeholder="Number of spaces"
                        min="0"
                      />
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-gray-700">
                      {data.logisticsRequirements.accessibility.parkingAvailable ? 'Yes' : 'No'}
                    </p>
                    {data.logisticsRequirements.accessibility.parkingAvailable && data.logisticsRequirements.accessibility.parkingSpaces && (
                      <p className="text-sm text-gray-600">{data.logisticsRequirements.accessibility.parkingSpaces} spaces</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="required">Public Transport Nearby</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.logisticsRequirements.accessibility.publicTransportNearby}
                        onChange={(e) => updateNestedField('logisticsRequirements', 'accessibility', 'publicTransportNearby', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Close to public transport</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-2">
                    {data.logisticsRequirements.accessibility.publicTransportNearby ? 'Yes' : 'No'}
                  </p>
                )}
              </div>

              <div>
                <Label>Other Accessibility Features (Optional)</Label>
                {isEditing ? (
                  <Input
                    value={data.logisticsRequirements.accessibility.otherAccessibility || ''}
                    onChange={(e) => updateNestedField('logisticsRequirements', 'accessibility', 'otherAccessibility', e.target.value || undefined)}
                    placeholder="e.g., Disabled toilets, ramps, hearing loop"
                  />
                ) : (
                  <p className="text-gray-700">{data.logisticsRequirements.accessibility.otherAccessibility || 'None specified'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Floor Plan Upload */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label>Floor Plan (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Upload a floor plan to help clients visualize your space
            </p>
            <p className="text-sm text-amber-600">
              <strong>Note:</strong> Floor plan upload feature coming in a future update. For now, you can mention floor plan availability in your venue description.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VenueServicesForm
