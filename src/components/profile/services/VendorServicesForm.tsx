/**
 * VendorServicesForm Component
 * Amendment 8: Services form for Vendors (Equipment/Services providers)
 * 3 Sections: What I Offer, Pricing & Packages, Logistics & Requirements
 * Inspired by Surreal.live's clear, professional layout
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, DollarSign, Package as PackageIcon } from 'lucide-react'
import { useState } from 'react'
import type { VendorServices } from '../../../types/services'

interface VendorServicesFormProps {
  data: VendorServices
  isEditing: boolean
  onChange: (data: VendorServices) => void
}

const VendorServicesForm = ({ data, isEditing, onChange }: VendorServicesFormProps) => {
  const [newProductType, setNewProductType] = useState('')
  const [newPickupOption, setNewPickupOption] = useState('')

  // Helper to update nested data
  const updateField = (section: keyof VendorServices, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    })
  }

  // Array helpers
  const addItem = (section: keyof VendorServices, field: string, value: string) => {
    if (!value.trim()) return
    const currentArray = (data[section] as any)[field] || []
    updateField(section, field, [...currentArray, value.trim()])
  }

  const removeItem = (section: keyof VendorServices, field: string, index: number) => {
    const currentArray = (data[section] as any)[field] || []
    updateField(section, field, currentArray.filter((_: any, i: number) => i !== index))
  }

  // Hire fee helpers
  const addHireFee = () => {
    const newFee = {
      itemName: '',
      priceType: 'per_item' as const,
      price: 0
    }
    updateField('pricingPackages', 'hireFees', [...data.pricingPackages.hireFees, newFee])
  }

  const updateHireFee = (index: number, field: string, value: any) => {
    const updatedFees = [...data.pricingPackages.hireFees]
    updatedFees[index] = { ...updatedFees[index], [field]: value }
    updateField('pricingPackages', 'hireFees', updatedFees)
  }

  const removeHireFee = (index: number) => {
    const updatedFees = data.pricingPackages.hireFees.filter((_, i) => i !== index)
    updateField('pricingPackages', 'hireFees', updatedFees)
  }

  return (
    <div className="space-y-6">
      {/* Section 1: What I Offer */}
      <Card>
        <CardHeader>
          <CardTitle>1. What I Offer</CardTitle>
          <p className="text-sm text-gray-600">
            Describe your products and services
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Category */}
          <div>
            <Label className="required">Service Category</Label>
            <p className="text-sm text-gray-500 mb-2">
              Main category from your specialty (e.g., AV Equipment, Catering, Décor)
            </p>
            {isEditing ? (
              <Input
                value={data.whatIOffer.serviceCategory}
                onChange={(e) => updateField('whatIOffer', 'serviceCategory', e.target.value)}
                placeholder="e.g., AV Equipment Hire"
              />
            ) : (
              <p className="text-gray-700">{data.whatIOffer.serviceCategory || 'Not specified'}</p>
            )}
          </div>

          {/* Product Types */}
          <div>
            <Label className="required">Product Types</Label>
            <p className="text-sm text-gray-500 mb-2">
              Specific items or services you provide (e.g., PA Systems, Microphones, Mixing Desks)
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newProductType}
                  onChange={(e) => setNewProductType(e.target.value)}
                  placeholder="Add a product type..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('whatIOffer', 'productTypes', newProductType)
                      setNewProductType('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('whatIOffer', 'productTypes', newProductType)
                    setNewProductType('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.whatIOffer.productTypes.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('whatIOffer', 'productTypes', index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.whatIOffer.productTypes.length === 0 && (
                <span className="text-sm text-gray-500">No product types added yet</span>
              )}
            </div>
          </div>

          {/* Service Description */}
          <div>
            <Label>Service Description (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Tell clients about what makes your offerings special
            </p>
            {isEditing ? (
              <Textarea
                value={data.whatIOffer.serviceDescription || ''}
                onChange={(e) => updateField('whatIOffer', 'serviceDescription', e.target.value)}
                placeholder="Describe your products, quality, experience, unique selling points..."
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
            Set your hire fees and package deals
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hire Fees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label className="required">Hire Fees</Label>
                <p className="text-sm text-gray-500">Your rental/hire pricing per item or package</p>
              </div>
              {isEditing && (
                <Button type="button" onClick={addHireFee} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>

            {data.pricingPackages.hireFees.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hire fees added yet</p>
                {isEditing && (
                  <Button type="button" onClick={addHireFee} size="sm" className="mt-2">
                    Add Your First Item
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {data.pricingPackages.hireFees.map((fee, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 grid md:grid-cols-3 gap-3">
                            <div>
                              <Label>Item Name</Label>
                              <Input
                                value={fee.itemName}
                                onChange={(e) => updateHireFee(index, 'itemName', e.target.value)}
                                placeholder="e.g., PA System"
                              />
                            </div>
                            <div>
                              <Label>Price Type</Label>
                              <Select
                                value={fee.priceType}
                                onValueChange={(value) => updateHireFee(index, 'priceType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="per_item">Per Item</SelectItem>
                                  <SelectItem value="per_package">Per Package</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Price</Label>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <Input
                                  type="number"
                                  value={fee.price}
                                  onChange={(e) => updateHireFee(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHireFee(index)}
                            className="ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Minimum Hire Duration (Optional)</Label>
                          <Input
                            value={fee.minimumHireDuration || ''}
                            onChange={(e) => updateHireFee(index, 'minimumHireDuration', e.target.value || undefined)}
                            placeholder="e.g., 4 hours, 1 day, 1 weekend"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{fee.itemName}</h4>
                          <span className="text-lg font-semibold text-green-600">
                            ${fee.price} {data.pricingPackages.currency || 'AUD'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="capitalize">{fee.priceType.replace('_', ' ')}</span>
                          {fee.minimumHireDuration && (
                            <span> • Min: {fee.minimumHireDuration}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day/Project Rate */}
          <div>
            <Label>Day / Project Rate (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Alternative flat rate for full day or project hire
            </p>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <Input
                  type="number"
                  value={data.pricingPackages.dayProjectRate || ''}
                  onChange={(e) => updateField('pricingPackages', 'dayProjectRate', parseFloat(e.target.value) || undefined)}
                  placeholder="0"
                  min="0"
                />
                <span className="text-gray-500">{data.pricingPackages.currency || 'AUD'}</span>
              </div>
            ) : (
              <p className="text-gray-700">
                {data.pricingPackages.dayProjectRate
                  ? `$${data.pricingPackages.dayProjectRate} ${data.pricingPackages.currency || 'AUD'}`
                  : 'Not specified'
                }
              </p>
            )}
          </div>

          {/* Deposit Required */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="required">Deposit Required?</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.pricingPackages.depositRequired === true}
                        onChange={() => updateField('pricingPackages', 'depositRequired', true)}
                        className="w-4 h-4"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.pricingPackages.depositRequired === false}
                        onChange={() => {
                          updateField('pricingPackages', 'depositRequired', false)
                          updateField('pricingPackages', 'depositAmount', undefined)
                        }}
                        className="w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-2">
                    {data.pricingPackages.depositRequired ? 'Yes' : 'No'}
                  </p>
                )}
              </div>

              {data.pricingPackages.depositRequired && (
                <div>
                  <Label>Deposit Amount</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        value={data.pricingPackages.depositAmount || ''}
                        onChange={(e) => updateField('pricingPackages', 'depositAmount', parseFloat(e.target.value) || undefined)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-2">
                      {data.pricingPackages.depositAmount
                        ? `$${data.pricingPackages.depositAmount}`
                        : 'Not specified'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Bundle deals will be available in a future update. For now, mention any packages in your service description.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Logistics & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>3. Logistics & Requirements</CardTitle>
          <p className="text-sm text-gray-600">
            Delivery, setup, and operational details
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery & Setup */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="required">Delivery Available?</Label>
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.logisticsRequirements.deliveryAvailable === true}
                        onChange={() => updateField('logisticsRequirements', 'deliveryAvailable', true)}
                        className="w-4 h-4"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.logisticsRequirements.deliveryAvailable === false}
                        onChange={() => {
                          updateField('logisticsRequirements', 'deliveryAvailable', false)
                          updateField('logisticsRequirements', 'deliveryCost', undefined)
                        }}
                        className="w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {data.logisticsRequirements.deliveryAvailable && (
                    <Input
                      value={data.logisticsRequirements.deliveryCost || ''}
                      onChange={(e) => updateField('logisticsRequirements', 'deliveryCost', e.target.value || undefined)}
                      placeholder="e.g., $100 flat fee, $2/km"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-gray-700">{data.logisticsRequirements.deliveryAvailable ? 'Yes' : 'No'}</p>
                  {data.logisticsRequirements.deliveryAvailable && data.logisticsRequirements.deliveryCost && (
                    <p className="text-sm text-gray-600 mt-1">Cost: {data.logisticsRequirements.deliveryCost}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="required">Set-Up Available?</Label>
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.logisticsRequirements.setUpAvailable === true}
                        onChange={() => updateField('logisticsRequirements', 'setUpAvailable', true)}
                        className="w-4 h-4"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.logisticsRequirements.setUpAvailable === false}
                        onChange={() => {
                          updateField('logisticsRequirements', 'setUpAvailable', false)
                          updateField('logisticsRequirements', 'setUpCost', undefined)
                        }}
                        className="w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {data.logisticsRequirements.setUpAvailable && (
                    <Input
                      value={data.logisticsRequirements.setUpCost || ''}
                      onChange={(e) => updateField('logisticsRequirements', 'setUpCost', e.target.value || undefined)}
                      placeholder="e.g., Included, $150 flat fee"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-gray-700">{data.logisticsRequirements.setUpAvailable ? 'Yes' : 'No'}</p>
                  {data.logisticsRequirements.setUpAvailable && data.logisticsRequirements.setUpCost && (
                    <p className="text-sm text-gray-600 mt-1">Cost: {data.logisticsRequirements.setUpCost}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pickup Options */}
          <div>
            <Label className="required">Pickup Options</Label>
            <p className="text-sm text-gray-500 mb-2">
              How can clients collect/return equipment? (e.g., "Delivery & pickup", "Client pickup from warehouse")
            </p>
            {isEditing && (
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newPickupOption}
                  onChange={(e) => setNewPickupOption(e.target.value)}
                  placeholder="Add a pickup option..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('logisticsRequirements', 'pickupOptions', newPickupOption)
                      setNewPickupOption('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('logisticsRequirements', 'pickupOptions', newPickupOption)
                    setNewPickupOption('')
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.logisticsRequirements.pickupOptions.map((option, index) => (
                <Badge key={index} variant="outline">
                  {option}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem('logisticsRequirements', 'pickupOptions', index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.logisticsRequirements.pickupOptions.length === 0 && (
                <span className="text-sm text-gray-500">No pickup options added yet</span>
              )}
            </div>
          </div>

          {/* Travel Radius & Minimum Hire */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="required">Travel Radius (km)</Label>
              <p className="text-sm text-gray-500 mb-2">Maximum distance you'll deliver</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={data.logisticsRequirements.travelRadius}
                  onChange={(e) => updateField('logisticsRequirements', 'travelRadius', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 50"
                  min="0"
                />
              ) : (
                <p className="text-gray-700">{data.logisticsRequirements.travelRadius} km</p>
              )}
            </div>

            <div>
              <Label className="required">Minimum Hire Value</Label>
              <p className="text-sm text-gray-500 mb-2">Minimum order amount</p>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    value={data.logisticsRequirements.minimumHireValue}
                    onChange={(e) => updateField('logisticsRequirements', 'minimumHireValue', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ) : (
                <p className="text-gray-700">${data.logisticsRequirements.minimumHireValue}</p>
              )}
            </div>
          </div>

          {/* Equipment Specs */}
          <div>
            <Label>Equipment Specifications (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Technical details about your equipment
            </p>
            {isEditing ? (
              <Textarea
                value={data.logisticsRequirements.equipmentSpecs || ''}
                onChange={(e) => updateField('logisticsRequirements', 'equipmentSpecs', e.target.value || undefined)}
                placeholder="e.g., Power requirements, dimensions, weight, technical capabilities..."
                rows={3}
              />
            ) : (
              <p className="text-gray-700">{data.logisticsRequirements.equipmentSpecs || 'Not specified'}</p>
            )}
          </div>

          {/* Insurance Coverage */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label className="required">Insurance Coverage</Label>
            <p className="text-sm text-gray-500 mb-3">
              Do you have insurance for your equipment?
            </p>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={data.logisticsRequirements.insuranceCoverage === true}
                      onChange={() => updateField('logisticsRequirements', 'insuranceCoverage', true)}
                      className="w-4 h-4"
                    />
                    <span>Yes, fully insured</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={data.logisticsRequirements.insuranceCoverage === false}
                      onChange={() => {
                        updateField('logisticsRequirements', 'insuranceCoverage', false)
                        updateField('logisticsRequirements', 'insuranceDetails', undefined)
                      }}
                      className="w-4 h-4"
                    />
                    <span>No insurance</span>
                  </label>
                </div>
                {data.logisticsRequirements.insuranceCoverage && (
                  <div>
                    <Label>Insurance Details (Optional)</Label>
                    <Input
                      value={data.logisticsRequirements.insuranceDetails || ''}
                      onChange={(e) => updateField('logisticsRequirements', 'insuranceDetails', e.target.value || undefined)}
                      placeholder="e.g., Public liability $20M, Equipment replacement value"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-700">
                  {data.logisticsRequirements.insuranceCoverage ? 'Yes, fully insured' : 'No insurance'}
                </p>
                {data.logisticsRequirements.insuranceCoverage && data.logisticsRequirements.insuranceDetails && (
                  <p className="text-sm text-gray-600 mt-2">{data.logisticsRequirements.insuranceDetails}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VendorServicesForm
