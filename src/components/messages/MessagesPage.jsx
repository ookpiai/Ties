import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../../App'
import {
  getMyConversations,
  getConversation,
  sendMessage,
  markConversationAsRead,
  subscribeToConversation,
  subscribeToAllMessages,
  searchUsers
} from '../../api/messages'
import { getProfile } from '../../api/profiles'
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  X
} from 'lucide-react'

const MessagesPage = () => {
  const { user } = useAuth()
  const location = useLocation()
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
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)
  const allMessagesSubscriptionRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Capture the openConversationWithUserId from navigation state immediately
  useEffect(() => {
    const openUserId = location.state?.openConversationWithUserId
    if (openUserId) {
      setPendingOpenUserId(openUserId)
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
        setPendingOpenUserId(null) // Clear the pending ID
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
          }
        } catch (error) {
          console.error('Failed to load user profile:', error)
        }
        setPendingOpenUserId(null) // Clear the pending ID
      }
    }

    openConversation()
  }, [pendingOpenUserId, loading, conversations])

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
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)
    const result = await sendMessage(selectedConversation.otherUser.id, messageText)

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

  const getRoleColor = (role) => {
    const colors = {
      freelancer: 'bg-purple-100 text-purple-800',
      venue: 'bg-green-100 text-green-800',
      vendor: 'bg-orange-100 text-orange-800',
      organiser: 'bg-blue-100 text-blue-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view messages</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 bg-white border-r`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Messages</h1>
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
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-sm text-gray-500 mt-2">Start a conversation to connect with others</p>
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
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.otherUser.id === conv.otherUser.id ? 'bg-gray-100' : ''
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
                      <p className="font-semibold truncate">{conv.otherUser.display_name}</p>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
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
          <div className="p-4 border-b bg-white flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft size={20} />
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.otherUser.avatar_url} />
              <AvatarFallback>
                {selectedConversation.otherUser.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold">{selectedConversation.otherUser.display_name}</p>
              <Badge variant="outline" className={getRoleColor(selectedConversation.otherUser.role)}>
                {selectedConversation.otherUser.role}
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
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
                              : 'bg-white border'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.body}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            isMe ? 'text-white/70 justify-end' : 'text-gray-500'
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
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1"
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
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Select a conversation</p>
            <p className="text-sm text-gray-500 mt-2">Choose from your conversations or start a new one</p>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Message</h2>
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
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {userSearch ? 'No users found' : 'Search for users to start a conversation'}
                  </p>
                ) : (
                  searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      onClick={() => handleStartNewConversation(searchUser)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={searchUser.avatar_url} />
                        <AvatarFallback>
                          {searchUser.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{searchUser.display_name}</p>
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
    </div>
  )
}

export default MessagesPage
