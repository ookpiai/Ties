import React, { useState } from 'react'
import { User, Building, MapPin, Briefcase, Users, Camera, Star, Clock, DollarSign, Globe, Shield, CheckCircle } from 'lucide-react'

const EnhancedOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: User type selection
    userType: '',
    
    // Step 2: Basic profile
    skills: [],
    experience: '',
    location: '',
    timezone: '',
    
    // Step 3: Business details (role-specific)
    companyName: '',
    businessType: '',
    hourlyRate: '',
    dailyRate: '',
    projectRate: '',
    currency: 'AUD',
    
    // Step 4: Preferences and verification
    preferredProjectTypes: [],
    travelRadius: '',
    remoteWork: true,
    portfolioItems: [],
    socialLinks: {
      instagram: '',
      linkedin: '',
      behance: '',
      youtube: '',
      tiktok: ''
    }
  })

  const totalSteps = 4

  const userTypes = [
    {
      id: 'freelancer',
      title: 'Individual/Professional',
      description: 'Freelancer, artist, or creative professional',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 'vendor',
      title: 'Vendor or Supplier',
      description: 'Equipment rental, services, or supplies',
      icon: Briefcase,
      color: 'bg-green-500'
    },
    {
      id: 'venue',
      title: 'Venue or Space Owner',
      description: 'Studios, event spaces, or locations',
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      id: 'organiser',
      title: 'Client / Commissioner / Brand',
      description: 'Looking to hire creative professionals',
      icon: Building,
      color: 'bg-orange-500'
    },
    {
      id: 'collective',
      title: 'Collective or Team',
      description: 'Creative agency, band, or group',
      icon: Users,
      color: 'bg-pink-500'
    }
  ]

  const skillCategories = {
    freelancer: [
      'Photography', 'Videography', 'Graphic Design', 'Web Design', 'Music Production',
      'Audio Engineering', 'Writing', 'Animation', 'Illustration', 'Social Media',
      'Marketing', 'Event Planning', 'Makeup Artist', 'Styling', 'DJ/Music'
    ],
    vendor: [
      'Camera Equipment', 'Lighting Equipment', 'Audio Equipment', 'Staging',
      'Catering', 'Transportation', 'Security', 'Cleaning', 'Decoration',
      'Technical Support', 'Software Services', 'Printing', 'Merchandise'
    ],
    venue: [
      'Photo Studio', 'Recording Studio', 'Event Space', 'Concert Venue',
      'Gallery Space', 'Outdoor Location', 'Warehouse', 'Theater',
      'Conference Room', 'Rooftop', 'Beach Location', 'Historic Building'
    ],
    organiser: [
      'Corporate Events', 'Weddings', 'Concerts', 'Festivals', 'Conferences',
      'Product Launches', 'Fashion Shows', 'Art Exhibitions', 'Film Production',
      'Marketing Campaigns', 'Brand Activations', 'Social Events'
    ],
    collective: [
      'Band/Music Group', 'Creative Agency', 'Production Company', 'Art Collective',
      'Dance Troupe', 'Theater Company', 'Film Crew', 'Design Studio',
      'Marketing Team', 'Event Planning Company'
    ]
  }

  const projectTypes = {
    freelancer: [
      'One-time Projects', 'Ongoing Retainer', 'Event Coverage', 'Creative Campaigns',
      'Product Photography', 'Portrait Sessions', 'Music Production', 'Video Content'
    ],
    vendor: [
      'Equipment Rental', 'Service Provision', 'Installation', 'Maintenance',
      'Consultation', 'Training', 'Support Services'
    ],
    venue: [
      'Event Hosting', 'Studio Rental', 'Location Shoots', 'Workshops',
      'Exhibitions', 'Performances', 'Private Events'
    ],
    organiser: [
      'Corporate Events', 'Marketing Campaigns', 'Product Launches', 'Conferences',
      'Social Events', 'Brand Activations', 'Content Creation'
    ],
    collective: [
      'Collaborative Projects', 'Large Productions', 'Multi-disciplinary Work',
      'Team-based Services', 'Creative Partnerships'
    ]
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Calculate profile completion score
    let completionScore = 0
    
    // Basic info (30 points)
    if (formData.userType) completionScore += 10
    if (formData.skills.length > 0) completionScore += 10
    if (formData.location) completionScore += 10
    
    // Business details (40 points)
    if (formData.experience) completionScore += 10
    if (formData.hourlyRate || formData.dailyRate || formData.projectRate) completionScore += 15
    if (formData.preferredProjectTypes.length > 0) completionScore += 15
    
    // Additional details (30 points)
    if (formData.timezone) completionScore += 10
    if (Object.values(formData.socialLinks).some(link => link)) completionScore += 10
    if (formData.travelRadius) completionScore += 10

    const onboardingData = {
      ...formData,
      role: formData.userType,
      onboarding_completed: true,
      profile_completion_score: completionScore,
      last_profile_update: new Date().toISOString()
    }

    onComplete(onboardingData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What best describes you?</h2>
              <p className="text-gray-600">Help us understand your role in the creative industry</p>
            </div>
            
            <div className="space-y-3">
              {userTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => handleInputChange('userType', type.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      formData.userType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${type.color} text-white`}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{type.title}</h3>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your expertise</h2>
              <p className="text-gray-600">Select your skills and experience level</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Skills/Services
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(skillCategories[formData.userType] || []).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleArrayToggle('skills', skill)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        formData.skills.includes(skill)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years (Beginner)</option>
                    <option value="2-5">2-5 years (Intermediate)</option>
                    <option value="6-10">6-10 years (Experienced)</option>
                    <option value="10+">10+ years (Expert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State/Country"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select your timezone</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                  <option value="Australia/Melbourne">Australia/Melbourne (AEDT)</option>
                  <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                  <option value="Australia/Perth">Australia/Perth (AWST)</option>
                  <option value="Pacific/Auckland">New Zealand (NZDT)</option>
                  <option value="America/Los_Angeles">US Pacific (PST)</option>
                  <option value="America/New_York">US Eastern (EST)</option>
                  <option value="Europe/London">UK (GMT)</option>
                  <option value="Europe/Berlin">Central Europe (CET)</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h2>
              <p className="text-gray-600">Set up your pricing and business information</p>
            </div>

            <div className="space-y-4">
              {(formData.userType === 'vendor' || formData.userType === 'venue' || formData.userType === 'collective') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your business name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <input
                      type="text"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      placeholder="e.g., Photography Studio, Equipment Rental"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {formData.userType !== 'organiser' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                        placeholder="Hourly rate"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Per hour</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                        placeholder="Daily rate"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Per day</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.projectRate}
                        onChange={(e) => handleInputChange('projectRate', e.target.value)}
                        placeholder="Project rate"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Per project</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Project Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(projectTypes[formData.userType] || []).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleArrayToggle('preferredProjectTypes', type)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        formData.preferredProjectTypes.includes(type)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Details</h2>
              <p className="text-gray-600">Complete your profile setup</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Radius (km)
                  </label>
                  <input
                    type="number"
                    value={formData.travelRadius}
                    onChange={(e) => handleInputChange('travelRadius', e.target.value)}
                    placeholder="How far will you travel?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="remoteWork"
                    checked={formData.remoteWork}
                    onChange={(e) => handleInputChange('remoteWork', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="remoteWork" className="text-sm font-medium text-gray-700">
                    Available for remote work
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Links (Optional)
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                    { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username' },
                    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/channel/...' },
                    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' }
                  ].map((social) => (
                    <div key={social.key}>
                      <input
                        type="url"
                        value={formData.socialLinks[social.key]}
                        onChange={(e) => handleSocialLinkChange(social.key, e.target.value)}
                        placeholder={social.placeholder}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-900">Profile Verification</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You can verify your profile later by uploading professional credentials, 
                      insurance documents, or portfolio samples to increase trust with clients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step <= currentStep
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle size={20} />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Back
          </button>

          {currentStep === totalSteps ? (
            <button
              onClick={handleComplete}
              disabled={!formData.userType}
              className={`px-8 py-3 rounded-lg font-medium ${
                !formData.userType
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              Complete Setup
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !formData.userType}
              className={`px-6 py-3 rounded-lg font-medium ${
                (currentStep === 1 && !formData.userType)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedOnboarding

