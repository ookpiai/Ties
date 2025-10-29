import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '../../App'
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Star,
  Archive,
  Trash2,
  Flag,
  Users,
  Calendar,
  FileText,
  Image as ImageIcon,
  Download,
  X
} from 'lucide-react'

const MessagesPage = () => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessage, setShowNewMessage] = useState(false)
  const messagesEndRef = useRef(null)

  // Mock conversations data
  const [conversations, setConversations] = useState([
    {
      id: 1,
      participants: [
        { id: 2, name: 'Sarah Chen', avatar: null, role: 'freelancer', online: true },
        { id: 1, name: user?.first_name + ' ' + user?.last_name, avatar: null, role: user?.role }
      ],
      lastMessage: {
        id: 15,
        senderId: 2,
        text: 'Perfect! I\'ll send over the initial concepts by Friday. Looking forward to working together!',
        timestamp: '2024-01-20T14:30:00Z',
        read: false,
        type: 'text'
      },
      unreadCount: 2,
      starred: false,
      archived: false,
      projectId: 101,
      projectTitle: 'Brand Identity Design'
    },
    {
      id: 2,
      participants: [
        { id: 3, name: 'Marcus Rodriguez', avatar: null, role: 'freelancer', online: false },
        { id: 1, name: user?.first_name + ' ' + user?.last_name, avatar: null, role: user?.role }
      ],
      lastMessage: {
        id: 28,
        senderId: 1,
        text: 'Thanks for the video samples. When can we schedule a call to discuss the project timeline?',
        timestamp: '2024-01-20T11:15:00Z',
        read: true,
        type: 'text'
      },
      unreadCount: 0,
      starred: true,
      archived: false,
      projectId: 102,
      projectTitle: 'Product Launch Video'
    },
    {
      id: 3,
      participants: [
        { id: 4, name: 'The Creative Collective', avatar: null, role: 'collective', online: true },
        { id: 1, name: user?.first_name + ' ' + user?.last_name, avatar: null, role: user?.role }
      ],
      lastMessage: {
        id: 42,
        senderId: 4,
        text: 'We have availability next week for the photoshoot. Shall we book Tuesday afternoon?',
        timestamp: '2024-01-19T16:45:00Z',
        read: false,
        type: 'text'
      },
      unreadCount: 1,
      starred: false,
      archived: false,
      projectId: null,
      projectTitle: null
    },
    {
      id: 4,
      participants: [
        { id: 5, name: 'Emma Thompson', avatar: null, role: 'organiser', online: false },
        { id: 1, name: user?.first_name + ' ' + user?.last_name, avatar: null, role: user?.role }
      ],
      lastMessage: {
        id: 55,
        senderId: 5,
        text: 'Event planning document attached. Please review and let me know your thoughts.',
        timestamp: '2024-01-19T09:20:00Z',
        read: true,
        type: 'file'
      },
      unreadCount: 0,
      starred: false,
      archived: false,
      projectId: 103,
      projectTitle: 'Creative Conference 2024'
    }
  ])

  // Mock messages for selected conversation
  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        senderId: 1,
        text: 'Hi Sarah! I saw your portfolio and I\'m really impressed with your design work. I have a brand identity project that might be perfect for you.',
        timestamp: '2024-01-20T10:00:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 2,
        senderId: 2,
        text: 'Thank you so much! I\'d love to hear more about the project. What kind of brand are you working on?',
        timestamp: '2024-01-20T10:15:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 3,
        senderId: 1,
        text: 'It\'s for a sustainable fashion startup. They need a complete brand identity including logo, color palette, and brand guidelines. The budget is £3,500.',
        timestamp: '2024-01-20T10:30:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 4,
        senderId: 2,
        text: 'That sounds fantastic! Sustainable fashion is something I\'m really passionate about. I\'d love to take this on.',
        timestamp: '2024-01-20T11:00:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 5,
        senderId: 1,
        text: 'Excellent! I\'ll send over the project brief and we can discuss the timeline. When would you be available to start?',
        timestamp: '2024-01-20T11:15:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 6,
        senderId: 2,
        text: 'I can start next week. My usual process is 2-3 weeks for a complete brand identity project.',
        timestamp: '2024-01-20T14:00:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 15,
        senderId: 2,
        text: 'Perfect! I\'ll send over the initial concepts by Friday. Looking forward to working together!',
        timestamp: '2024-01-20T14:30:00Z',
        read: false,
        type: 'text'
      }
    ],
    2: [
      {
        id: 20,
        senderId: 1,
        text: 'Hi Marcus! I need a product launch video for our new app. Are you available for a project?',
        timestamp: '2024-01-20T09:00:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 21,
        senderId: 3,
        text: 'Absolutely! I specialize in product launch videos. What\'s the scope and timeline?',
        timestamp: '2024-01-20T09:30:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 22,
        senderId: 1,
        text: 'We need a 60-90 second video showcasing the app features. Launch is in 6 weeks.',
        timestamp: '2024-01-20T10:00:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 23,
        senderId: 3,
        text: 'Perfect timing! Here are some samples of my recent work:',
        timestamp: '2024-01-20T10:15:00Z',
        read: true,
        type: 'text'
      },
      {
        id: 24,
        senderId: 3,
        text: 'video_sample_1.mp4',
        timestamp: '2024-01-20T10:16:00Z',
        read: true,
        type: 'file',
        fileName: 'video_sample_1.mp4',
        fileSize: '15.2 MB'
      },
      {
        id: 25,
        senderId: 3,
        text: 'video_sample_2.mp4',
        timestamp: '2024-01-20T10:17:00Z',
        read: true,
        type: 'file',
        fileName: 'video_sample_2.mp4',
        fileSize: '22.8 MB'
      },
      {
        id: 28,
        senderId: 1,
        text: 'Thanks for the video samples. When can we schedule a call to discuss the project timeline?',
        timestamp: '2024-01-20T11:15:00Z',
        read: true,
        type: 'text'
      }
    ]
  })

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== user?.id)
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get other participant in conversation
  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== user?.id)
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // Send message
  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return

    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      text: messageText,
      timestamp: new Date().toISOString(),
      read: true,
      type: 'text'
    }

    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage]
    }))

    // Update last message in conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: newMessage }
        : conv
    ))

    setMessageText('')
  }

  // Mark conversation as read
  const markAsRead = (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, read: true } }
        : conv
    ))
  }

  // Toggle star
  const toggleStar = (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, starred: !conv.starred }
        : conv
    ))
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedConversation])

  // Select first conversation by default
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0])
      markAsRead(conversations[0].id)
    }
  }, [conversations])

  const selectedMessages = selectedConversation ? messages[selectedConversation.id] || [] : []
  const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">
            Communicate with creative professionals and manage your projects
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Conversations</span>
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowNewMessage(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-9"
                  />
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const participant = getOtherParticipant(conversation)
                    const isSelected = selectedConversation?.id === conversation.id
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          markAsRead(conversation.id)
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-500' 
                            : conversation.unreadCount > 0
                            ? 'border-blue-200'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback>
                                {getInitials(participant.name)}
                              </AvatarFallback>
                            </Avatar>
                            {participant.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-sm font-medium truncate ${
                                conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {participant.name}
                              </h3>
                              <div className="flex items-center space-x-1">
                                {conversation.starred && (
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessage.timestamp)}
                                </span>
                              </div>
                            </div>

                            {conversation.projectTitle && (
                              <p className="text-xs text-blue-600 mb-1">
                                {conversation.projectTitle}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate ${
                                conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                              }`}>
                                {conversation.lastMessage.type === 'file' ? (
                                  <span className="flex items-center">
                                    <Paperclip className="w-3 h-3 mr-1" />
                                    File attachment
                                  </span>
                                ) : (
                                  conversation.lastMessage.text
                                )}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={otherParticipant.avatar} />
                          <AvatarFallback>
                            {getInitials(otherParticipant.name)}
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{otherParticipant.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {otherParticipant.role} • {otherParticipant.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleStar(selectedConversation.id)}
                      >
                        <Star className={`w-4 h-4 ${selectedConversation.starred ? 'text-yellow-500 fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedConversation.projectTitle && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Project: {selectedConversation.projectTitle}
                        </span>
                      </div>
                    </div>
                  )}
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedMessages.map((message) => {
                    const isOwn = message.senderId === user.id
                    const sender = selectedConversation.participants.find(p => p.id === message.senderId)
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                          {!isOwn && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={sender.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(sender.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{sender.name}</span>
                            </div>
                          )}
                          
                          <div className={`rounded-lg px-4 py-2 ${
                            isOwn 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.type === 'file' ? (
                              <div className="flex items-center space-x-2">
                                <Paperclip className="w-4 h-4" />
                                <div>
                                  <p className="text-sm font-medium">{message.fileName}</p>
                                  <p className="text-xs opacity-75">{message.fileSize}</p>
                                </div>
                                <Button size="sm" variant={isOwn ? "secondary" : "outline"}>
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm">{message.text}</p>
                            )}
                          </div>
                          
                          <div className={`flex items-center space-x-1 mt-1 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                            {isOwn && (
                              <div className="text-gray-500">
                                {message.read ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="pr-10"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button onClick={sendMessage} disabled={!messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage

