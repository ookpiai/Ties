import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Building, MapPin, Users, Briefcase } from 'lucide-react';

const GuidedOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    userType: '',
    roles: [],
    categories: [],
    tools: [],
    location: '',
    availability: '',
    services: [],
    specializations: []
  });

  const steps = [
    {
      id: 'user-type',
      title: 'What best describes you?',
      subtitle: 'Help us understand your role in the creative industry'
    },
    {
      id: 'details',
      title: 'Tell us more about yourself',
      subtitle: 'This helps us personalize your experience'
    },
    {
      id: 'location',
      title: 'Where are you based?',
      subtitle: 'This helps others find you for local collaborations'
    },
    {
      id: 'final',
      title: 'You\'re all set!',
      subtitle: 'Welcome to the TIES Together community'
    }
  ];

  const userTypes = [
    {
      id: 'individual',
      title: 'Individual/Professional',
      description: 'Freelancer, artist, or creative professional',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 'vendor',
      title: 'Vendor or Supplier',
      description: 'Equipment rental, services, or supplies',
      icon: Building,
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
      id: 'client',
      title: 'Client / Commissioner / Brand',
      description: 'Looking to hire creative professionals',
      icon: Briefcase,
      color: 'bg-orange-500'
    },
    {
      id: 'collective',
      title: 'Collective or Team',
      description: 'Creative agency, band, or group',
      icon: Users,
      color: 'bg-pink-500'
    }
  ];

  const roleOptions = {
    individual: [
      'Photographer', 'Videographer', 'Graphic Designer', 'UI/UX Designer',
      'Musician', 'DJ', 'Producer', 'Sound Engineer', 'Writer', 'Copywriter',
      'Illustrator', 'Animator', 'Web Developer', 'Social Media Manager',
      'Marketing Specialist', 'Event Coordinator', 'Stylist', 'Makeup Artist'
    ],
    vendor: [
      'Audio Equipment Rental', 'Video Equipment Rental', 'Lighting Equipment',
      'Photography Equipment', 'Catering Services', 'Transportation',
      'Security Services', 'Cleaning Services', 'Technical Support',
      'Equipment Maintenance', 'Software Licensing', 'Hardware Sales'
    ],
    venue: [
      'Photography Studio', 'Recording Studio', 'Event Hall', 'Gallery Space',
      'Outdoor Location', 'Co-working Space', 'Rehearsal Space',
      'Conference Room', 'Theater', 'Warehouse', 'Rooftop', 'Private Residence'
    ],
    client: [
      'Startup', 'Small Business', 'Corporation', 'Non-profit', 'Government',
      'Educational Institution', 'Healthcare', 'Retail', 'Hospitality',
      'Technology', 'Fashion', 'Food & Beverage', 'Real Estate', 'Finance'
    ],
    collective: [
      'Creative Agency', 'Production Company', 'Band/Music Group',
      'Design Studio', 'Marketing Agency', 'Event Planning Company',
      'Photography Collective', 'Art Collective', 'Theater Group',
      'Dance Company', 'Film Crew', 'Podcast Network'
    ]
  };

  const toolsOptions = [
    'Adobe Creative Suite', 'Figma', 'Sketch', 'Canva', 'Final Cut Pro',
    'Premiere Pro', 'After Effects', 'Logic Pro', 'Pro Tools', 'Ableton Live',
    'WordPress', 'Shopify', 'React', 'Vue.js', 'Node.js', 'Python',
    'Camera Equipment', 'Audio Equipment', 'Lighting Equipment', 'Drones',
    'Social Media Tools', 'Project Management Tools', 'CRM Systems'
  ];

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setFormData(prev => ({ ...prev, userType: type }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const renderUserTypeSelection = () => (
    <div className="space-y-4">
      {userTypes.map((type) => {
        const IconComponent = type.icon;
        return (
          <div
            key={type.id}
            onClick={() => handleUserTypeSelect(type.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              userType === type.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${type.color} text-white`}>
                <IconComponent size={24} />
              </div>
              <div className="flex-1">
                <h3 className="card-title">{type.title}</h3>
                <p className="body-text text-muted-foreground mt-1">{type.description}</p>
              </div>
              {userType === type.id && (
                <Check className="text-primary" size={24} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      {/* Roles/Categories */}
      <div>
        <label className="form-label block mb-3">
          What {userType === 'individual' ? 'roles' : 'categories'} best describe you?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {roleOptions[userType]?.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleArrayToggle('roles', role)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                formData.roles.includes(role)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div>
        <label className="form-label block mb-3">
          What tools and technologies do you use?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {toolsOptions.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => handleArrayToggle('tools', tool)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                formData.tools.includes(tool)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="form-label block mb-3">Current availability</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Available now', 'Available in 1-2 weeks', 'Booked for next month', 'Not currently available'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, availability: option }))}
              className={`p-3 text-sm rounded-lg border transition-all ${
                formData.availability === option
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLocationForm = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label block mb-3">City and Country</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="e.g., London, UK"
          className="w-full p-3 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      
      <div className="bg-card p-4 rounded-lg border">
        <h4 className="card-title mb-2">Why location matters</h4>
        <ul className="body-text text-muted-foreground space-y-1">
          <li>• Helps others find you for local collaborations</li>
          <li>• Enables location-based search and filtering</li>
          <li>• Shows timezone for better scheduling</li>
          <li>• Connects you with nearby creative communities</li>
        </ul>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
        <Check className="text-primary-foreground" size={40} />
      </div>
      
      <div>
        <h3 className="section-header mb-2">Welcome to TIES Together!</h3>
        <p className="body-text text-muted-foreground">
          Your profile is set up and you're ready to start connecting with the creative community.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border text-left">
        <h4 className="card-title mb-4">What's next?</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">1</span>
            </div>
            <span className="body-text">Complete your profile with portfolio items</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">2</span>
            </div>
            <span className="body-text">Explore and connect with other creatives</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">3</span>
            </div>
            <span className="body-text">Start collaborating on exciting projects</span>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0: return userType !== '';
      case 1: return formData.roles.length > 0;
      case 2: return formData.location.trim() !== '';
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <Check size={20} /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-lg border p-8">
          <div className="text-center mb-8">
            <h1 className="page-title mb-2">{steps[currentStep].title}</h1>
            <p className="body-text text-muted-foreground">{steps[currentStep].subtitle}</p>
          </div>

          <div className="mb-8">
            {currentStep === 0 && renderUserTypeSelection()}
            {currentStep === 1 && renderDetailsForm()}
            {currentStep === 2 && renderLocationForm()}
            {currentStep === 3 && renderFinalStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedOnboarding;

