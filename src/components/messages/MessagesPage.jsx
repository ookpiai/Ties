import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../../App'
import {
  getMyConversations,
  getConversation,
  getConversationJobContext,
  sendMessage,
  markConversationAsRead,
  subscribeToConversation,
  subscribeToAllMessages,
  searchUsers
} from '../../api/messages'
import { getProfile } from '../../api/profiles'
import { getConversationBriefs } from '../../api/briefs'
import BriefCard from './BriefCard'
import BriefComposer from './BriefComposer'
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  X,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  FileText
} from 'lucide-react'

const MessagesPage = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [pendingOpenUserId, setPendingOpenUserId] = useState(null)
  const [pendingJobContext, setPendingJobContext] = useState(null) // Job context when starting from job page
  const [conversationJobContext, setConversationJobContext] = useState(null) // Current conversation's job context
  const [showBriefComposer, setShowBriefComposer] = useState(false)
  const [briefsCache, setBriefsCache] = useState({}) // Cache for loaded briefs
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)
  const allMessagesSubscriptionRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Capture the openConversationWithUserId and jobContext from navigation state immediately
  useEffect(() => {
    const openUserId = location.state?.openConversationWithUserId
    const jobContext = location.state?.jobContext

    if (openUserId) {
      setPendingOpenUserId(openUserId)
      if (jobContext) {
        setPendingJobContext(jobContext)
      }
      // Clear the navigation state so it doesn't persist on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
      // Subscribe to all messages for conversation list updates
      allMessagesSubscriptionRef.current = subscribeToAllMessages(() => {
        loadConversations()
      })
    }

    return () => {
      if (allMessagesSubscriptionRef.current) {
        allMessagesSubscriptionRef.current.unsubscribe()
      }
    }
  }, [user])

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.otherUser.id)
      markConversationAsRead(selectedConversation.otherUser.id)

      // Load job context for this conversation
      loadJobContext(selectedConversation.otherUser.id)

      // Subscribe to new messages in this conversation
      subscriptionRef.current = subscribeToConversation(
        selectedConversation.otherUser.id,
        (newMessage) => {
          setMessages(prev => [...prev, newMessage])
          scrollToBottom()
        }
      )
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle opening a conversation when we have a pending user ID
  // This runs after conversations are loaded OR immediately for new conversations
  useEffect(() => {
    if (!pendingOpenUserId || loading) return

    const openConversation = async () => {
      // Check if conversation already exists in loaded conversations
      const existing = conversations.find(c => c.otherUser.id === pendingOpenUserId)

      if (existing) {
        setSelectedConversation(existing)
        // If we have pending job context, set it
        if (pendingJobContext) {
          setConversationJobContext(pendingJobContext)
        }
        setPendingOpenUserId(null)
        setPendingJobContext(null)
      } else {
        // No existing conversation - load user profile and create new conversation
        try {
          const profile = await getProfile(pendingOpenUserId)
          if (profile) {
            const otherUser = {
              id: profile.id,
              display_name: profile.display_name || 'Unknown User',
              avatar_url: profile.avatar_url,
              role: profile.role
            }
            // Create new conversation preview (conversation is created when first message is sent)
            setSelectedConversation({
              otherUser,
              lastMessage: null,
              unreadCount: 0
            })
            setMessages([])
            // If we have pending job context, set it
            if (pendingJobContext) {
              setConversationJobContext(pendingJobContext)
            }
          }
        } catch (error) {
          console.error('Failed to load user profile:', error)
        }
        setPendingOpenUserId(null)
        setPendingJobContext(null)
      }
    }

    openConversation()
  }, [pendingOpenUserId, loading, conversations, pendingJobContext])

  const loadConversations = async () => {
    setLoading(true)
    const result = await getMyConversations()
    if (result.success) {
      setConversations(result.data)
    }
    setLoading(false)
  }

  const loadConversationMessages = async (otherUserId) => {
    const result = await getConversation(otherUserId)
    if (result.success) {
      setMessages(result.data)
    }

    // Load briefs for this conversation separately
    const briefsResult = await getConversationBriefs(otherUserId)
    if (briefsResult.success && briefsResult.data.length > 0) {
      const newBriefs = {}
      briefsResult.data.forEach(brief => {
        newBriefs[brief.id] = brief
      })
      setBriefsCache(prev => ({ ...prev, ...newBriefs }))
    }
  }

  const loadJobContext = async (otherUserId) => {
    // If we already have pending job context (from navigation), use that
    if (pendingJobContext) {
      setConversationJobContext(pendingJobContext)
      return
    }

    // Otherwise, check if this conversation has job context in messages
    const result = await getConversationJobContext(otherUserId)
    if (result.success && result.data) {
      setConversationJobContext(result.data)
    } else {
      setConversationJobContext(null)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)

    // Build message options
    const options = {}

    // If this is a new conversation with job context, attach it to the first message
    if (conversationJobContext && messages.length === 0) {
      options.jobId = conversationJobContext.id
      options.contextType = 'job'
    }

    const result = await sendMessage(
      selectedConversation.otherUser.id,
      messageText,
      Object.keys(options).length > 0 ? options : undefined
    )

    if (result.success) {
      setMessages([...messages, result.data])
      setMessageText('')
      scrollToBottom()
    }

    setSending(false)
  }

  const handleStartNewConversation = async (otherUser) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.otherUser.id === otherUser.id)

    if (existing) {
      setSelectedConversation(existing)
    } else {
      // Create new conversation preview
      setSelectedConversation({
        otherUser,
        lastMessage: null,
        unreadCount: 0
      })
      setMessages([])
    }

    // Clear job context for manual new conversations
    setConversationJobContext(null)

    setShowNewMessage(false)
    setUserSearch('')
    setSearchResults([])
  }

  const handleUserSearch = async (query) => {
    setUserSearch(query)
    if (query.trim().length > 0) {
      const result = await searchUsers(query)
      if (result.success) {
        setSearchResults(result.data)
      }
    } else {
      setSearchResults([])
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    if (diff < 604800000) return date.toLocaleDateString('en-AU', { weekday: 'short' })
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      freelancer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      venue: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      vendor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      organiser: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  // Handle brief updates (accept/decline/withdraw)
  const handleBriefUpdate = (updatedBrief) => {
    setBriefsCache(prev => ({
      ...prev,
      [updatedBrief.id]: updatedBrief
    }))
  }

  // Handle successful brief sent
  const handleBriefSent = (newBrief) => {
    // Add to cache
    setBriefsCache(prev => ({
      ...prev,
      [newBrief.id]: newBrief
    }))
    // Reload messages to show the new brief message
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.otherUser.id)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view messages</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-[#0B0B0B]">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 bg-white dark:bg-gray-900 border-r dark:border-gray-800`}>
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold dark:text-white">Messages</h1>
            <Button
              onClick={() => setShowNewMessage(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              New
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Start a conversation to connect with others</p>
              <Button
                onClick={() => setShowNewMessage(true)}
                className="mt-4"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                New Message
              </Button>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.otherUser.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedConversation?.otherUser.id === conv.otherUser.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.otherUser.avatar_url} />
                    <AvatarFallback>
                      {conv.otherUser.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate dark:text-white">{conv.otherUser.display_name}</p>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    {/* Show job context indicator in conversation list */}
                    {conv.jobContext && (
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase size={12} className="text-blue-500" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 truncate">
                          {conv.jobContext.title}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {conv.lastMessage ? conv.lastMessage.body : 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages View */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Conversation Header */}
          <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => {
                setSelectedConversation(null)
                setConversationJobContext(null)
              }}
            >
              <ArrowLeft size={20} />
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.otherUser.avatar_url} />
              <AvatarFallback>
                {selectedConversation.otherUser.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-semibold dark:text-white">{selectedConversation.otherUser.display_name}</p>
              <Badge variant="outline" className={getRoleColor(selectedConversation.otherUser.role)}>
                {selectedConversation.otherUser.role}
              </Badge>
            </div>

            {/* Send Brief Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBriefComposer(true)}
              className="hidden sm:flex items-center gap-2"
            >
              <FileText size={16} />
              Send Brief
            </Button>
          </div>

          {/* Job Context Banner - Facebook Marketplace Style */}
          {conversationJobContext && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-0.5">
                    Messaging about job
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {conversationJobContext.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {conversationJobContext.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {conversationJobContext.location}
                      </span>
                    )}
                    {conversationJobContext.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(conversationJobContext.start_date)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => navigate('/jobs')}
                >
                  <ExternalLink size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#0B0B0B]">
            {messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full">
                {conversationJobContext ? (
                  <>
                    <Briefcase size={48} className="text-blue-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Start the conversation about this job</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 text-center max-w-sm">
                      Introduce yourself, ask questions about the role, or express your interest!
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show briefs at the top if any */}
                {Object.values(briefsCache).length > 0 && (
                  <div className="space-y-3 mb-4">
                    {Object.values(briefsCache).map((brief) => (
                      <div key={brief.id} className="max-w-md mx-auto">
                        <BriefCard
                          brief={brief}
                          currentUserId={user.id}
                          onUpdate={handleBriefUpdate}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg) => {
                  const isMe = msg.from_id === user.id

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-primary text-white'
                              : 'bg-white dark:bg-gray-800 border dark:border-gray-700'
                          }`}
                        >
                          <p className={`text-sm break-words ${!isMe && 'dark:text-white'}`}>{msg.body}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            isMe ? 'text-white/70 justify-end' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isMe && (
                              msg.read ? <CheckCheck size={14} /> : <Check size={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={conversationJobContext ? `Ask about "${conversationJobContext.title}"...` : "Type a message..."}
                className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-[#0B0B0B]">
          <div className="text-center">
            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Select a conversation</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Choose from your conversations or start a new one</p>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md dark:bg-gray-900 dark:border-gray-800">
            <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">New Message</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewMessage(false)
                  setUserSearch('')
                  setSearchResults([])
                }}
              >
                <X size={20} />
              </Button>
            </div>

            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {userSearch ? 'No users found' : 'Search for users to start a conversation'}
                  </p>
                ) : (
                  searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      onClick={() => handleStartNewConversation(searchUser)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={searchUser.avatar_url} />
                        <AvatarFallback>
                          {searchUser.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{searchUser.display_name}</p>
                        <Badge variant="outline" className={getRoleColor(searchUser.role)}>
                          {searchUser.role}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Brief Composer Modal */}
      {showBriefComposer && selectedConversation && (
        <BriefComposer
          recipientId={selectedConversation.otherUser.id}
          recipientName={selectedConversation.otherUser.display_name}
          onClose={() => setShowBriefComposer(false)}
          onSent={handleBriefSent}
        />
      )}
    </div>
  )
}

export default MessagesPage
