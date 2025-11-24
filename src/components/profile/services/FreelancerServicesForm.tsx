/**
 * FreelancerServicesForm Component
 * Amendment 8: Services form specifically for Freelancers
 * 3 Sections: What I Offer, Pricing & Packages, Logistics & Requirements
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { FreelancerServices } from '../../../types/services'

interface FreelancerServicesFormProps {
  data: FreelancerServices
  isEditing: boolean
  onChange: (data: FreelancerServices) => void
}

const FreelancerServicesForm = ({ data, isEditing, onChange }: FreelancerServicesFormProps) => {
  const [newSkillArea, setNewSkillArea] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newIndustry, setNewIndustry] = useState('')

  // Helper to update nested data
  const updateField = (section: keyof FreelancerServices, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    })
  }

  // Array helpers
  const addItem = (section: keyof FreelancerServices, field: string, value: string) => {
    if (!value.trim()) return
    const currentArray = (data[section] as any)[field] || []
    updateField(section, field, [...currentArray, value.trim()])
  }

  const removeItem = (section: keyof FreelancerServices, field: string, index: number) => {
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
            Tell clients about your skills and expertise
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role / Skill Areas */}
          <div>
            <Label className="required">Role / Skill Areas</Label>
            <p className="text-sm text-gray-500 mb-2">
              Main areas you work in (e.g., Photography, Videography, DJ)
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newSkillArea}
                  onChange={(e) => setNewSkillArea(e.target.value)}
                  placeholder="Add a skill area..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('whatIOffer', 'roleSkillAreas', newSkillArea)
                      setNewSkillArea('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('whatIOffer', 'roleSkillAreas', newSkillArea)
                    setNewSkillArea('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.whatIOffer.roleSkillAreas.map((area, index) => (
                <Badge key={index} variant="secondary">
                  {area}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('whatIOffer', 'roleSkillAreas', index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.whatIOffer.roleSkillAreas.length === 0 && (
                <span className="text-sm text-gray-500">No skill areas added yet</span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="required">Skills</Label>
            <p className="text-sm text-gray-500 mb-2">
              Specific technical skills (e.g., Adobe Photoshop, Final Cut Pro)
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('whatIOffer', 'skills', newSkill)
                      setNewSkill('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('whatIOffer', 'skills', newSkill)
                    setNewSkill('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.whatIOffer.skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('whatIOffer', 'skills', index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.whatIOffer.skills.length === 0 && (
                <span className="text-sm text-gray-500">No skills added yet</span>
              )}
            </div>
          </div>

          {/* Industries / Genres */}
          <div>
            <Label className="required">Industries / Genres</Label>
            <p className="text-sm text-gray-500 mb-2">
              Industries you serve (e.g., Wedding, Corporate, Fashion)
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Add an industry..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('whatIOffer', 'industriesGenres', newIndustry)
                      setNewIndustry('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('whatIOffer', 'industriesGenres', newIndustry)
                    setNewIndustry('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.whatIOffer.industriesGenres.map((industry, index) => (
                <Badge key={index} variant="default">
                  {industry}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('whatIOffer', 'industriesGenres', index)}
                      className="ml-2 text-white hover:text-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.whatIOffer.industriesGenres.length === 0 && (
                <span className="text-sm text-gray-500">No industries added yet</span>
              )}
            </div>
          </div>

          {/* Service Description */}
          <div>
            <Label>Service Description (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Detailed description of what you offer
            </p>
            {isEditing ? (
              <Textarea
                value={data.whatIOffer.serviceDescription || ''}
                onChange={(e) => updateField('whatIOffer', 'serviceDescription', e.target.value)}
                placeholder="Tell potential clients about your services..."
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
            Set your rates and package options
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rate Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="required">Rate Type</Label>
              <p className="text-sm text-gray-500 mb-2">How do you charge?</p>
              {isEditing ? (
                <Select
                  value={data.pricingPackages.rateType}
                  onValueChange={(value) => updateField('pricingPackages', 'rateType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Per Day</SelectItem>
                    <SelectItem value="project">Per Project</SelectItem>
                    <SelectItem value="set">Per Set</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 capitalize">{data.pricingPackages.rateType}</p>
              )}
            </div>

            {/* Base Rate */}
            <div>
              <Label className="required">Base Rate</Label>
              <p className="text-sm text-gray-500 mb-2">Your standard rate</p>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    type="number"
                    value={data.pricingPackages.baseRate}
                    onChange={(e) => updateField('pricingPackages', 'baseRate', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="10"
                  />
                  <span className="text-gray-500">{data.pricingPackages.currency || 'AUD'}</span>
                </div>
              ) : (
                <p className="text-gray-700">
                  ${data.pricingPackages.baseRate} {data.pricingPackages.currency || 'AUD'}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Package options and add-ons will be available in a future update.
              For now, you can mention them in your service description above.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Logistics & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>3. Logistics & Requirements</CardTitle>
          <p className="text-sm text-gray-600">
            Let clients know about travel, equipment, and availability
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Travel Availability */}
          <div>
            <Label className="required">Travel Availability</Label>
            <p className="text-sm text-gray-500 mb-2">Can you travel to client locations?</p>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={data.logisticsRequirements.travelAvailable === true}
                      onChange={() => updateField('logisticsRequirements', 'travelAvailable', true)}
                      className="w-4 h-4"
                    />
                    <span>Yes, I can travel</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={data.logisticsRequirements.travelAvailable === false}
                      onChange={() => updateField('logisticsRequirements', 'travelAvailable', false)}
                      className="w-4 h-4"
                    />
                    <span>No, location only</span>
                  </label>
                </div>

                {data.logisticsRequirements.travelAvailable && (
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Max Travel Distance (km)</Label>
                      <Input
                        type="number"
                        value={data.logisticsRequirements.maxTravelDistance || ''}
                        onChange={(e) => updateField('logisticsRequirements', 'maxTravelDistance', parseInt(e.target.value) || undefined)}
                        placeholder="e.g., 100"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Travel Cost</Label>
                      <Input
                        value={data.logisticsRequirements.travelCost || ''}
                        onChange={(e) => updateField('logisticsRequirements', 'travelCost', e.target.value)}
                        placeholder="e.g., Included or $1/km"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-700">
                  {data.logisticsRequirements.travelAvailable ? 'Yes, can travel' : 'No, location only'}
                </p>
                {data.logisticsRequirements.travelAvailable && (
                  <div className="mt-2 text-sm text-gray-600">
                    {data.logisticsRequirements.maxTravelDistance && (
                      <p>Max distance: {data.logisticsRequirements.maxTravelDistance} km</p>
                    )}
                    {data.logisticsRequirements.travelCost && (
                      <p>Travel cost: {data.logisticsRequirements.travelCost}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Equipment Provided */}
          <div>
            <Label className="required">Equipment Provided</Label>
            <p className="text-sm text-gray-500 mb-2">Do you bring your own equipment?</p>
            {isEditing ? (
              <div className="flex items-center space-x-4 mb-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={data.logisticsRequirements.equipmentProvided === true}
                    onChange={() => updateField('logisticsRequirements', 'equipmentProvided', true)}
                    className="w-4 h-4"
                  />
                  <span>Yes, I provide equipment</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={data.logisticsRequirements.equipmentProvided === false}
                    onChange={() => updateField('logisticsRequirements', 'equipmentProvided', false)}
                    className="w-4 h-4"
                  />
                  <span>No equipment provided</span>
                </label>
              </div>
            ) : (
              <p className="text-gray-700">
                {data.logisticsRequirements.equipmentProvided ? 'Yes, equipment provided' : 'No equipment provided'}
              </p>
            )}

            {data.logisticsRequirements.equipmentProvided && isEditing && (
              <div className="mt-3">
                <Label>Equipment List (Optional)</Label>
                <p className="text-sm text-gray-500 mb-2">List the equipment you provide</p>
                <Textarea
                  value={data.logisticsRequirements.equipmentList?.join('\n') || ''}
                  onChange={(e) => {
                    const items = e.target.value.split('\n').filter(item => item.trim())
                    updateField('logisticsRequirements', 'equipmentList', items.length > 0 ? items : undefined)
                  }}
                  placeholder="One item per line&#10;e.g.,&#10;DSLR Camera&#10;Lighting Kit&#10;Tripods"
                  rows={4}
                />
              </div>
            )}

            {data.logisticsRequirements.equipmentProvided && !isEditing && data.logisticsRequirements.equipmentList && (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                {data.logisticsRequirements.equipmentList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Online/Remote Work */}
          <div>
            <Label>Online / Remote Work (Optional)</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={data.logisticsRequirements.onlineRemoteWork || false}
                  onChange={(e) => updateField('logisticsRequirements', 'onlineRemoteWork', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>I can work remotely/online</span>
              </div>
            ) : (
              <p className="text-gray-700">
                {data.logisticsRequirements.onlineRemoteWork ? 'Yes, can work remotely' : 'No remote work'}
              </p>
            )}
          </div>

          {/* Response Time */}
          <div>
            <Label>Response Time Expectation (Optional)</Label>
            {isEditing ? (
              <Input
                value={data.logisticsRequirements.responseTimeExpectation || ''}
                onChange={(e) => updateField('logisticsRequirements', 'responseTimeExpectation', e.target.value || undefined)}
                placeholder="e.g., Within 24 hours, Same day"
              />
            ) : (
              <p className="text-gray-700">
                {data.logisticsRequirements.responseTimeExpectation || 'Not specified'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FreelancerServicesForm
