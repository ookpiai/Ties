import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listServices } from '../api/services'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function Browse() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', debouncedQuery],
    queryFn: () => listServices(debouncedQuery || undefined)
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedQuery(searchQuery)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Services</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-[#E03131] hover:bg-[#F03E3E]">
              Search
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading services...</p>
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  {service.profiles?.avatar_url ? (
                    <img
                      src={service.profiles.avatar_url}
                      alt={service.profiles.display_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E03131] flex items-center justify-center text-white font-bold">
                      {service.profiles?.display_name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{service.profiles?.display_name}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                
                {(service.price_min || service.price_max) && (
                  <p className="text-gray-600 mb-3">
                    ${service.price_min || 0} - ${service.price_max || 0}
                  </p>
                )}

                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No services found. Be the first to create one!</p>
            <Link to="/profile">
              <Button className="mt-4 bg-[#E03131] hover:bg-[#F03E3E]">
                Create Service
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
