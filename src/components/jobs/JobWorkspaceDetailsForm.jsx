import { Lock, FileText, Clock, MapPin, Phone, AlertCircle, Wrench, Shirt, Car } from 'lucide-react'

const JobWorkspaceDetailsForm = ({ workspaceData, setWorkspaceData }) => {
  const handleChange = (field, value) => {
    setWorkspaceData({ ...workspaceData, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Details</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          This information is <strong>only visible to accepted team members</strong> in the Studio workspace.
          Use this to share detailed briefs, schedules, and private information with your team.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800 dark:text-purple-300">
            <p className="font-medium mb-1">Private Information</p>
            <p className="text-purple-700 dark:text-purple-400">
              These details won't appear in the public job listing. Only team members you've accepted
              will see this information in their Studio workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Brief */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FileText className="inline h-4 w-4 mr-1" />
          Detailed Brief
        </label>
        <textarea
          placeholder="Provide a comprehensive brief for your team. Include the event vision, specific expectations, key deliverables, and any important context they need to know."
          value={workspaceData.detailed_brief}
          onChange={(e) => handleChange('detailed_brief', e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This is the main document your team will reference. Be as detailed as possible.
        </p>
      </div>

      {/* Schedule Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Clock className="inline h-4 w-4 mr-1" />
          Schedule & Timeline Notes
        </label>
        <textarea
          placeholder="e.g., Setup begins at 2pm, event starts 6pm, breakdown by 11pm. Sound check at 5pm. Catering arrives at 4pm."
          value={workspaceData.schedule_notes}
          onChange={(e) => handleChange('schedule_notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Venue Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="inline h-4 w-4 mr-1" />
          Venue Details & Access
        </label>
        <textarea
          placeholder="e.g., Enter through the loading dock on Smith Street. Security code: 1234. Contact venue manager John on arrival. Lift access available."
          value={workspaceData.venue_details}
          onChange={(e) => handleChange('venue_details', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Contact Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Phone className="inline h-4 w-4 mr-1" />
          Contact Information
        </label>
        <textarea
          placeholder="e.g., Day-of coordinator: Sarah (0412 345 678). Venue contact: John (0498 765 432). Emergency contact: Event manager Mike."
          value={workspaceData.contact_info}
          onChange={(e) => handleChange('contact_info', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Two Column Layout for smaller fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Special Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            Special Requirements
          </label>
          <textarea
            placeholder="e.g., Must have Working with Children check. Public liability insurance required. Quiet setup due to nearby residents."
            value={workspaceData.special_requirements}
            onChange={(e) => handleChange('special_requirements', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Equipment Provided */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Wrench className="inline h-4 w-4 mr-1" />
            Equipment Provided
          </label>
          <textarea
            placeholder="e.g., PA system provided. Tables and chairs included. Power available at multiple points. No kitchen facilities."
            value={workspaceData.equipment_provided}
            onChange={(e) => handleChange('equipment_provided', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Dress Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Shirt className="inline h-4 w-4 mr-1" />
            Dress Code
          </label>
          <input
            type="text"
            placeholder="e.g., All black attire, Smart casual, Formal"
            value={workspaceData.dress_code}
            onChange={(e) => handleChange('dress_code', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Parking Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Car className="inline h-4 w-4 mr-1" />
            Parking Information
          </label>
          <input
            type="text"
            placeholder="e.g., Free parking in basement, Street parking only, Loading zone available"
            value={workspaceData.parking_info}
            onChange={(e) => handleChange('parking_info', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Optional Note */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> All fields are optional. You can always add or update these details
          later from the Studio workspace once you've accepted team members.
        </p>
      </div>
    </div>
  )
}

export default JobWorkspaceDetailsForm
