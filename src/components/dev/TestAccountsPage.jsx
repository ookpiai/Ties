/**
 * Test Accounts Page
 *
 * Development-only page for quick login to test accounts.
 * All test accounts use password: TestPassword123!
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Music,
  Camera,
  Video,
  Mic,
  Store,
  Building2,
  Users,
  Briefcase,
  Search,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  PartyPopper,
} from 'lucide-react'

// Common password for all test users
const TEST_PASSWORD = 'TestPassword123!'

// Dev team password
const DEV_PASSWORD = 'DevTest123!'

// Australian cities for variety
const CITIES = [
  'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA',
  'Adelaide, SA', 'Gold Coast, QLD', 'Newcastle, NSW', 'Canberra, ACT',
  'Hobart, TAS', 'Darwin, NT'
]

// Test user data - matching seed script with realistic names
const TEST_USERS = [
  // DEV TEAM (3 users) - These use DEV_PASSWORD
  { email: 'oscar@tiestogether.com', name: 'Oscar (Dev)', username: 'oscar_dev', role: 'Organiser', specialty: null, city: 0, isDev: true },
  { email: 'charlie@tiestogether.com', name: 'Charlie (Dev)', username: 'charlie_dev', role: 'Organiser', specialty: null, city: 0, isDev: true },
  { email: 'holly@tiestogether.com', name: 'Holly (Dev)', username: 'holly_dev', role: 'Organiser', specialty: null, city: 0, isDev: true },

  // FREELANCERS (20 users)
  // DJs (5)
  { email: 'alex.thompson.dj@gmail.com', name: 'Alex Thompson', username: 'alexthompson', role: 'Artist', specialty: 'dj', city: 0 },
  { email: 'samuel.chen@outlook.com', name: 'Samuel Chen', username: 'samuelchen', role: 'Artist', specialty: 'dj', city: 1 },
  { email: 'maya.rodriguez.music@gmail.com', name: 'Maya Rodriguez', username: 'mayarodriguez', role: 'Artist', specialty: 'dj', city: 2 },
  { email: 'chris.wilson.vinyl@gmail.com', name: 'Chris Wilson', username: 'chriswilson', role: 'Artist', specialty: 'dj', city: 3 },
  { email: 'nina.patel.beats@outlook.com', name: 'Nina Patel', username: 'ninapatel', role: 'Artist', specialty: 'dj', city: 4 },

  // Photographers (5)
  { email: 'james.harrison.photo@gmail.com', name: 'James Harrison', username: 'jamesharrison', role: 'Artist', specialty: 'photographer', city: 0 },
  { email: 'emma.nguyen.photography@gmail.com', name: 'Emma Nguyen', username: 'emmanguyen', role: 'Artist', specialty: 'photographer', city: 1 },
  { email: 'david.martinez.shots@outlook.com', name: 'David Martinez', username: 'davidmartinez', role: 'Artist', specialty: 'photographer', city: 2 },
  { email: 'lisa.taylor.captures@gmail.com', name: 'Lisa Taylor', username: 'lisataylor', role: 'Artist', specialty: 'photographer', city: 5 },
  { email: 'michael.brown.lens@gmail.com', name: 'Michael Brown', username: 'michaelbrown', role: 'Artist', specialty: 'photographer', city: 6 },

  // Musicians (5)
  { email: 'sarah.campbell.violin@gmail.com', name: 'Sarah Campbell', username: 'sarahcampbell', role: 'Artist', specialty: 'musician', city: 0 },
  { email: 'tom.fitzgerald.keys@outlook.com', name: 'Tom Fitzgerald', username: 'tomfitzgerald', role: 'Artist', specialty: 'musician', city: 1 },
  { email: 'amy.lawrence.acoustic@gmail.com', name: 'Amy Lawrence', username: 'amylawrence', role: 'Artist', specialty: 'musician', city: 4 },
  { email: 'thegroovecollective@gmail.com', name: 'The Groove Collective', username: 'groovecollective', role: 'Artist', specialty: 'musician', city: 2 },
  { email: 'sydneyjazzquartet@outlook.com', name: 'Sydney Jazz Quartet', username: 'sydneyjazz', role: 'Artist', specialty: 'musician', city: 3 },

  // Videographers (3)
  { email: 'ryan.anderson.films@gmail.com', name: 'Ryan Anderson', username: 'ryananderson', role: 'Artist', specialty: 'videographer', city: 0 },
  { email: 'kate.morrison.video@gmail.com', name: 'Kate Morrison', username: 'katemorrison', role: 'Artist', specialty: 'videographer', city: 1 },
  { email: 'mark.stevens.production@outlook.com', name: 'Mark Stevens', username: 'markstevens', role: 'Artist', specialty: 'videographer', city: 5 },

  // MCs/Hosts (2)
  { email: 'joseph.kelly.mc@gmail.com', name: 'Joseph Kelly', username: 'josephkelly', role: 'Artist', specialty: 'mc', city: 0 },
  { email: 'grace.mitchell.presenter@outlook.com', name: 'Grace Mitchell', username: 'gracemitchell', role: 'Artist', specialty: 'mc', city: 1 },

  // VENDORS (10 users)
  { email: 'gourmeteventsco@gmail.com', name: 'Gourmet Events Catering', username: 'gourmetevents', role: 'Vendor', specialty: 'catering', city: 0 },
  { email: 'outbackbbqcatering@outlook.com', name: 'Outback BBQ Catering', username: 'outbackbbq', role: 'Vendor', specialty: 'catering', city: 2 },
  { email: 'sweettreatsmelb@gmail.com', name: 'Sweet Treats Melbourne', username: 'sweettreats', role: 'Vendor', specialty: 'catering', city: 1 },
  { email: 'prosoundrentals@gmail.com', name: 'Pro Sound Rentals', username: 'prosoundrentals', role: 'Vendor', specialty: 'av_equipment', city: 0 },
  { email: 'brilliantlighting@outlook.com', name: 'Brilliant Lighting Hire', username: 'brilliantlighting', role: 'Vendor', specialty: 'av_equipment', city: 1 },
  { email: 'eventstagehire@gmail.com', name: 'Event Stage Hire', username: 'eventstagehire', role: 'Vendor', specialty: 'av_equipment', city: 3 },
  { email: 'petalsandblooms@gmail.com', name: 'Petals & Blooms Florist', username: 'petalsandblooms', role: 'Vendor', specialty: 'florist', city: 0 },
  { email: 'eleganteventstyling@outlook.com', name: 'Elegant Event Styling', username: 'elegantstyling', role: 'Vendor', specialty: 'decor', city: 1 },
  { email: 'prestige.transport@gmail.com', name: 'Prestige Event Transport', username: 'prestigetransport', role: 'Vendor', specialty: 'transport', city: 0 },
  { email: 'shieldeventsecurity@gmail.com', name: 'Shield Event Security', username: 'shieldsecurity', role: 'Vendor', specialty: 'security', city: 2 },

  // VENUES (10 users)
  { email: 'grandballroom.syd@gmail.com', name: 'Grand Ballroom Sydney', username: 'grandballroomsyd', role: 'Venue', specialty: 'ballroom', city: 0 },
  { email: 'skyline.rooftop@outlook.com', name: 'Skyline Rooftop Venue', username: 'skylinerooftop', role: 'Venue', specialty: 'rooftop', city: 0 },
  { email: 'gardenpavilion.melb@gmail.com', name: 'Garden Pavilion Melbourne', username: 'gardenpavilion', role: 'Venue', specialty: 'garden', city: 1 },
  { email: 'industrialspace.melb@gmail.com', name: 'The Industrial Space', username: 'industrialspace', role: 'Venue', specialty: 'warehouse', city: 1 },
  { email: 'sunsetbeach.gc@outlook.com', name: 'Sunset Beach Club', username: 'sunsetbeachclub', role: 'Venue', specialty: 'beach', city: 5 },
  { email: 'valleyview.winery@gmail.com', name: 'Valley View Winery', username: 'valleyviewwinery', role: 'Venue', specialty: 'winery', city: 4 },
  { email: 'heritage.house.cbr@gmail.com', name: 'Heritage House Canberra', username: 'heritagehouse', role: 'Venue', specialty: 'historic', city: 7 },
  { email: 'crownconference@outlook.com', name: 'Crown Conference Centre', username: 'crownconference', role: 'Venue', specialty: 'hotel', city: 1 },
  { email: 'creativestudiosyd@gmail.com', name: 'Creative Studio Sydney', username: 'creativestudio', role: 'Venue', specialty: 'studio', city: 0 },
  { email: 'osteria.dining@gmail.com', name: 'Osteria Private Dining', username: 'osteriadining', role: 'Venue', specialty: 'restaurant', city: 1 },

  // MORE FREELANCERS (5 users - former agents converted to freelancers/venues/vendors)
  { email: 'rachel.hughes.talent@gmail.com', name: 'Rachel Hughes', username: 'rachelhughes', role: 'Freelancer', specialty: 'event_planner', city: 0 },
  { email: 'daniel.wong.agency@outlook.com', name: 'Daniel Wong', username: 'danielwong', role: 'Freelancer', specialty: 'dj', city: 1 },
  { email: 'stephanie.clarke.mgmt@gmail.com', name: 'Stephanie Clarke', username: 'stephanieclarke', role: 'Vendor', specialty: 'catering', city: 2 },
  { email: 'robert.james.talent@gmail.com', name: 'Robert James', username: 'robertjames', role: 'Venue', specialty: 'studio', city: 0 },
  { email: 'michelle.lee.artists@outlook.com', name: 'Michelle Lee', username: 'michellelee', role: 'Freelancer', specialty: 'photographer', city: 3 },

  // ORGANISERS/CLIENTS (5 users)
  { email: 'sarah.white.wedding@gmail.com', name: 'Sarah White', username: 'sarahwhite', role: 'Organiser', specialty: null, city: 0 },
  { email: 'corporate.events.techcorp@outlook.com', name: 'Jennifer Adams', username: 'jenniferadams', role: 'Organiser', specialty: null, city: 1 },
  { email: 'marcus.johnson.festival@gmail.com', name: 'Marcus Johnson', username: 'marcusjohnson', role: 'Organiser', specialty: null, city: 2 },
  { email: 'charity.gala.committee@gmail.com', name: 'Patricia Reynolds', username: 'patriciareynolds', role: 'Organiser', specialty: null, city: 0 },
  { email: 'emma.davis.party@outlook.com', name: 'Emma Davis', username: 'emmadavis', role: 'Organiser', specialty: null, city: 4 },
]

// Get icon for specialty
const getSpecialtyIcon = (specialty, role) => {
  if (role === 'Venue') return Building2
  if (role === 'Vendor') return Store
  if (role === 'Organiser') return PartyPopper

  const icons = {
    dj: Music,
    photographer: Camera,
    videographer: Video,
    musician: Music,
    mc: Mic,
    event_planner: Briefcase,
  }
  return icons[specialty] || User
}

// Get badge color for role
const getRoleBadgeClass = (role) => {
  const classes = {
    Artist: 'bg-purple-100 text-purple-800 border-purple-300',
    Freelancer: 'bg-purple-100 text-purple-800 border-purple-300',
    Vendor: 'bg-green-100 text-green-800 border-green-300',
    Venue: 'bg-blue-100 text-blue-800 border-blue-300',
    Organiser: 'bg-orange-100 text-orange-800 border-orange-300',
  }
  return classes[role] || 'bg-gray-100 text-gray-800 border-gray-300'
}

// Format specialty for display
const formatSpecialty = (specialty) => {
  if (!specialty) return null
  return specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Group users by category
const groupUsersByCategory = (users) => {
  const groups = {
    devTeam: users.filter(u => u.isDev),
    freelancers: users.filter(u => (u.role === 'Artist' || u.role === 'Freelancer') && !u.isDev),
    vendors: users.filter(u => u.role === 'Vendor'),
    venues: users.filter(u => u.role === 'Venue'),
    organisers: users.filter(u => u.role === 'Organiser' && !u.isDev),
  }
  return groups
}

export default function TestAccountsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [loggingIn, setLoggingIn] = useState(null)
  const [error, setError] = useState(null)
  const [copiedEmail, setCopiedEmail] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return TEST_USERS.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      (u.specialty && u.specialty.toLowerCase().includes(query)) ||
      CITIES[u.city].toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Group filtered users
  const groupedUsers = useMemo(() => groupUsersByCategory(filteredUsers), [filteredUsers])

  // Handle login
  const handleLogin = async (email, isDev = false) => {
    setLoggingIn(email)
    setError(null)

    try {
      // Sign out first to clear any existing session
      await supabase.auth.signOut()

      // Use dev password for dev accounts, test password for others
      const password = isDev ? DEV_PASSWORD : TEST_PASSWORD

      // Sign in with test credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(`Failed to login: ${err.message}`)
      setLoggingIn(null)
    }
  }

  // Copy email to clipboard
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  // Render user card
  const renderUserCard = (user) => {
    const Icon = getSpecialtyIcon(user.specialty, user.role)
    const isLoggingIn = loggingIn === user.email

    return (
      <Card key={user.email} className={`hover:shadow-md transition-shadow ${user.isDev ? 'border-red-300 bg-red-50/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${user.isDev ? 'bg-red-100' : user.role === 'Venue' ? 'bg-blue-100' : user.role === 'Vendor' ? 'bg-green-100' : user.role === 'Organiser' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                <Icon className={`h-5 w-5 ${user.isDev ? 'text-red-600' : user.role === 'Venue' ? 'text-blue-600' : user.role === 'Vendor' ? 'text-green-600' : user.role === 'Organiser' ? 'text-orange-600' : 'text-purple-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={user.isDev ? 'bg-red-100 text-red-800 border-red-300' : getRoleBadgeClass(user.role)}>
                    {user.isDev ? 'Dev Team' : user.role}
                  </Badge>
                  {user.specialty && (
                    <span className="text-xs text-muted-foreground">
                      {formatSpecialty(user.specialty)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {CITIES[user.city]}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => handleLogin(user.email, user.isDev)}
                disabled={isLoggingIn}
                className={user.isDev ? 'bg-red-600 hover:bg-red-700 whitespace-nowrap' : 'whitespace-nowrap'}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1" />
                    Login
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyEmail(user.email)}
                className="whitespace-nowrap"
              >
                {copiedEmail === user.email ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render user section
  const renderUserSection = (title, users, icon) => {
    if (users.length === 0) return null
    const Icon = icon

    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-2">{users.length}</Badge>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(renderUserCard)}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Test Accounts
          </CardTitle>
          <CardDescription>
            Quick login to test accounts for development and testing purposes.
            All accounts use the password: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">{TEST_PASSWORD}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, role, specialty, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="outline" className="whitespace-nowrap">
              {filteredUsers.length} accounts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="dev" className="text-red-600">Dev Team</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="organisers">Organisers</TabsTrigger>
        </TabsList>

        <TabsContent value="dev" className="mt-6">
          {renderUserSection('Dev Team (Password: DevTest123!)', groupedUsers.devTeam, User)}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {renderUserSection('Dev Team', groupedUsers.devTeam, User)}
          {renderUserSection('Freelancers', groupedUsers.freelancers, User)}
          {renderUserSection('Vendors', groupedUsers.vendors, Store)}
          {renderUserSection('Venues', groupedUsers.venues, Building2)}
          {renderUserSection('Organisers', groupedUsers.organisers, Briefcase)}
        </TabsContent>

        <TabsContent value="freelancers" className="mt-6">
          {renderUserSection('Freelancers', groupedUsers.freelancers, User)}
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          {renderUserSection('Vendors', groupedUsers.vendors, Store)}
        </TabsContent>

        <TabsContent value="venues" className="mt-6">
          {renderUserSection('Venues', groupedUsers.venues, Building2)}
        </TabsContent>

        <TabsContent value="organisers" className="mt-6">
          {renderUserSection('Organisers', groupedUsers.organisers, Briefcase)}
        </TabsContent>
      </Tabs>

      {/* No results */}
      {filteredUsers.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No test accounts found matching "{searchQuery}"
          </p>
        </Card>
      )}

      {/* Footer info */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Quick Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Freelancers</strong> - Can browse jobs, apply, receive bookings, build portfolio</li>
            <li>• <strong>Vendors</strong> - Equipment rentals, catering, event services</li>
            <li>• <strong>Venues</strong> - List spaces for events, manage bookings</li>
            <li>• <strong>Organisers</strong> - Create jobs, book talent, manage events</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
