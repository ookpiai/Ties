/**
 * VENUE PORTFOLIO
 * Surreal-style entertainer contact management for venues
 *
 * Features:
 * - Track regular entertainers/vendors
 * - Quick booking from contact list
 * - Favorites and tags for organization
 * - Booking history per entertainer
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Calendar,
  DollarSign,
  Search,
  Star,
  StarOff,
  Plus,
  Tag,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Building2,
  Music,
  Clock,
  MapPin,
  CheckCircle,
  CalendarCheck,
  History,
  UserPlus,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { format, formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { useAuth } from '../../App'
import {
  getVenuePortfolioStats,
  getEntertainerContacts,
  addEntertainerContact,
  updateEntertainerContact,
  toggleFavorite,
  removeEntertainerContact,
  getEntertainerBookingHistory,
  getAllTags
} from '../../api/venuePortfolio'
import ScheduleGridView from '../calendar/ScheduleGridView'
import CheckAvailabilityButton from '../bookings/CheckAvailabilityButton'

const VenuePortfolio = () => {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('contacts')
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])
  const [allTags, setAllTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Add contact modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContactId, setNewContactId] = useState('')
  const [newContactNotes, setNewContactNotes] = useState('')
  const [newContactTags, setNewContactTags] = useState([])
  const [newContactRate, setNewContactRate] = useState('')
  const [newContactRateType, setNewContactRateType] = useState('hourly')
  const [isAddingContact, setIsAddingContact] = useState(false)

  // Booking history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyContact, setHistoryContact] = useState(null)
  const [bookingHistory, setBookingHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (user && profile?.role === 'venue') {
      loadPortfolioData()
    }
  }, [user, profile])

  const loadPortfolioData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [statsData, contactsData, tagsData] = await Promise.all([
        getVenuePortfolioStats(),
        getEntertainerContacts({ status: 'active' }),
        getAllTags()
      ])
      setStats(statsData)
      setContacts(contactsData)
      setAllTags(tagsData)
    } catch (err) {
      console.error('Failed to load portfolio data:', err)
      setError('Failed to load portfolio data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async (contactId) => {
    try {
      await toggleFavorite(contactId)
      await loadPortfolioData()
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      setError('Failed to update favorite status')
    }
  }

  const handleRemoveContact = async (contactId) => {
    if (!confirm('Remove this entertainer from your contacts?')) return

    try {
      await removeEntertainerContact(contactId)
      await loadPortfolioData()
    } catch (err) {
      console.error('Failed to remove contact:', err)
      setError('Failed to remove contact')
    }
  }

  const handleViewHistory = async (contact) => {
    setHistoryContact(contact)
    setShowHistoryModal(true)
    setIsLoadingHistory(true)

    try {
      const history = await getEntertainerBookingHistory(contact.entertainer_id)
      setBookingHistory(history)
    } catch (err) {
      console.error('Failed to load history:', err)
      setBookingHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleAddContact = async () => {
    if (!newContactId) return

    setIsAddingContact(true)
    try {
      await addEntertainerContact({
        entertainer_id: newContactId,
        is_favorite: false,
        preferred_rate: newContactRate ? parseFloat(newContactRate) : undefined,
        preferred_rate_type: newContactRateType,
        internal_notes: newContactNotes || undefined,
        tags: newContactTags.length > 0 ? newContactTags : undefined
      })
      setShowAddModal(false)
      resetAddModal()
      await loadPortfolioData()
    } catch (err) {
      console.error('Failed to add contact:', err)
      setError(err.message || 'Failed to add contact')
    } finally {
      setIsAddingContact(false)
    }
  }

  const resetAddModal = () => {
    setNewContactId('')
    setNewContactNotes('')
    setNewContactTags([])
    setNewContactRate('')
    setNewContactRateType('hourly')
  }

  // Filter contacts
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = !searchQuery ||
      c.entertainer_profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.entertainer_profile?.specialty?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFavorites = !showFavoritesOnly || c.is_favorite

    const matchesTag = filterTag === 'all' || (c.tags && c.tags.includes(filterTag))

    return matchesSearch && matchesFavorites && matchesTag
  })

  // Check if user is a venue
  if (profile?.role !== 'venue') {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Venue Portfolio</h2>
            <p className="text-muted-foreground mb-4">
              This dashboard is only available for venue accounts.
            </p>
            <p className="text-sm text-muted-foreground">
              If you book entertainment for a venue, update your profile role to "Venue" to access this feature.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Venue Portfolio</h1>
          <p className="text-muted-foreground">Manage your entertainer contacts and bookings</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entertainer Contacts</p>
                <p className="text-2xl font-bold">{stats?.total_contacts || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.favorite_contacts || 0} favorites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookings This Month</p>
                <p className="text-2xl font-bold">{stats?.total_bookings_this_month || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.upcoming_bookings || 0} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{stats?.pending_availability_requests || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500 opacity-80" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              Awaiting responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent This Month</p>
                <p className="text-2xl font-bold">
                  ${(stats?.total_spent_this_month || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              On entertainment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Entertainer Contacts</CardTitle>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Tag Filter */}
                  {allTags.length > 0 && (
                    <Select value={filterTag} onValueChange={setFilterTag}>
                      <SelectTrigger className="w-40">
                        <Tag className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {allTags.map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Favorites Toggle */}
                  <Button
                    variant={showFavoritesOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  >
                    <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery || showFavoritesOnly || filterTag !== 'all'
                      ? 'No contacts match your filters'
                      : 'No entertainer contacts yet'}
                  </p>
                  {!searchQuery && !showFavoritesOnly && filterTag === 'all' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Browse the Discover page to find and add entertainers to your contacts.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      {/* Favorite Star */}
                      <button
                        onClick={() => handleToggleFavorite(contact.id)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        {contact.is_favorite ? (
                          <Star className="w-5 h-5 fill-current" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.entertainer_profile?.avatar_url} />
                        <AvatarFallback>
                          {contact.entertainer_profile?.display_name?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {contact.entertainer_profile?.display_name || 'Unknown'}
                          </h3>
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex gap-1">
                              {contact.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {contact.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{contact.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.entertainer_profile?.specialty_display_name ||
                            contact.entertainer_profile?.specialty || 'Entertainer'}
                          {contact.entertainer_profile?.city && (
                            <span className="ml-2">
                              <MapPin className="w-3 h-3 inline" /> {contact.entertainer_profile.city}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{contact.total_bookings || 0} bookings</span>
                          {contact.last_booked_at && (
                            <span>
                              Last booked {formatDistanceToNow(new Date(contact.last_booked_at), { addSuffix: true })}
                            </span>
                          )}
                          {contact.preferred_rate && (
                            <span className="text-primary font-medium">
                              ${contact.preferred_rate}/{contact.preferred_rate_type || 'hr'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <CheckAvailabilityButton
                          freelancerId={contact.entertainer_id}
                          freelancerName={contact.entertainer_profile?.display_name}
                          size="sm"
                        />

                        <Link to={`/profile/${contact.entertainer_id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewHistory(contact)}>
                              <History className="w-4 h-4 mr-2" />
                              Booking History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="w-4 h-4 mr-2" />
                              Manage Tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRemoveContact(contact.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <ScheduleGridView
            userId={user?.id}
            onEventClick={(event) => {
              console.log('Event clicked:', event)
            }}
            onDateClick={(date) => {
              console.log('Date clicked:', date)
            }}
            showAddButton={true}
          />
        </TabsContent>
      </Tabs>

      {/* Add Contact Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open)
        if (!open) resetAddModal()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Entertainer Contact
            </DialogTitle>
            <DialogDescription>
              Add an entertainer to your portfolio for quick access and booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Entertainer ID - In production, this would be a search/select */}
            <div>
              <Label className="text-sm font-medium">Entertainer Profile ID</Label>
              <Input
                value={newContactId}
                onChange={(e) => setNewContactId(e.target.value)}
                placeholder="Enter profile ID"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Find entertainers on the Discover page
              </p>
            </div>

            {/* Preferred Rate */}
            <div>
              <Label className="text-sm font-medium">Preferred Rate (Optional)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  value={newContactRate}
                  onChange={(e) => setNewContactRate(e.target.value)}
                  placeholder="0.00"
                  className="flex-1"
                />
                <Select value={newContactRateType} onValueChange={setNewContactRateType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">per hour</SelectItem>
                    <SelectItem value="daily">per day</SelectItem>
                    <SelectItem value="flat">flat rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium">Internal Notes (Private)</Label>
              <Textarea
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                placeholder="Notes about this entertainer..."
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isAddingContact}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={isAddingContact || !newContactId}>
              {isAddingContact ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Booking History
            </DialogTitle>
            {historyContact && (
              <DialogDescription>
                Booking history with {historyContact.entertainer_profile?.display_name}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="py-4">
            {isLoadingHistory ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookingHistory.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No booking history yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {bookingHistory.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(booking.start_date), 'PPP')}
                        </span>
                      </div>
                      <Badge variant={
                        booking.status === 'completed' ? 'default' :
                        booking.status === 'paid' ? 'success' :
                        booking.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                    {booking.service_description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {booking.service_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                      </span>
                      <span className="font-semibold text-primary">
                        ${booking.total_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VenuePortfolio
