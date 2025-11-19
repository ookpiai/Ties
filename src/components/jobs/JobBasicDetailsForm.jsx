import { Calendar, MapPin, FileText, Tag } from 'lucide-react'

const JobBasicDetailsForm = ({ jobData, setJobData }) => {
  const handleChange = (field, value) => {
    setJobData({ ...jobData, [field]: value })
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Job Details</h2>
        <p className="text-gray-600">
          Provide the essential information about your event and job requirements
        </p>
      </div>

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Wedding DJ Needed, Corporate Event Staff"
          value={jobData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Describe your event, what you're looking for, any specific requirements..."
          value={jobData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Be specific about your expectations, event details, and requirements
        </p>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline h-4 w-4 mr-1" />
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Melbourne CBD, Sydney Opera House"
          value={jobData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
          required
        />
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="inline h-4 w-4 mr-1" />
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          value={jobData.event_type}
          onChange={(e) => handleChange('event_type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
          required
        >
          <option value="wedding">Wedding</option>
          <option value="corporate_event">Corporate Event</option>
          <option value="private_party">Private Party</option>
          <option value="conference">Conference</option>
          <option value="concert">Concert</option>
          <option value="festival">Festival</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Event Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Event Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={jobData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            min={today}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Event End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={jobData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            min={jobData.start_date || today}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Application Deadline (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline h-4 w-4 mr-1" />
          Application Deadline (Optional)
        </label>
        <input
          type="date"
          value={jobData.application_deadline}
          onChange={(e) => handleChange('application_deadline', e.target.value)}
          min={today}
          max={jobData.start_date || undefined}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          When should applications close? Leave blank to keep it open until event date
        </p>
      </div>
    </div>
  )
}

export default JobBasicDetailsForm
