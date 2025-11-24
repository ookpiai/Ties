import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for navigation and common actions
 *
 * Shortcuts:
 * - g + d: Go to Discovery
 * - g + b: Go to Bookings
 * - g + m: Go to Messages
 * - g + p: Go to Profile
 * - g + h: Go to Home (Dashboard)
 * - g + j: Go to Jobs
 * - g + s: Go to Services
 * - ?: Show shortcuts help modal
 * - /: Focus search (if available)
 * - Escape: Clear focus/close modals
 */
export const useKeyboardShortcuts = (options = {}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { onShowHelp, onFocusSearch, disabled = false } = options

  useEffect(() => {
    if (disabled) return

    let sequenceBuffer = ''
    let sequenceTimeout = null

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = e.target
      const isInput = target.tagName === 'INPUT' ||
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable

      // Special case: Allow '/' in any context for search focus
      if (e.key === '/' && !isInput && onFocusSearch) {
        e.preventDefault()
        onFocusSearch()
        return
      }

      // Special case: Allow '?' in any context for help
      if (e.key === '?' && !isInput && onShowHelp) {
        e.preventDefault()
        onShowHelp()
        return
      }

      // Don't process other shortcuts when in input fields
      if (isInput) return

      // Handle escape key
      if (e.key === 'Escape') {
        // Clear any focused element
        if (document.activeElement) {
          document.activeElement.blur()
        }
        return
      }

      // Clear previous timeout
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout)
      }

      // Add key to buffer
      sequenceBuffer += e.key.toLowerCase()

      // Set timeout to clear buffer after 1 second
      sequenceTimeout = setTimeout(() => {
        sequenceBuffer = ''
      }, 1000)

      // Check for two-key sequences (g + x)
      if (sequenceBuffer.length === 2 && sequenceBuffer[0] === 'g') {
        const secondKey = sequenceBuffer[1]
        let targetPath = null

        switch (secondKey) {
          case 'h':
            targetPath = '/dashboard'
            break
          case 'd':
            targetPath = '/discover'
            break
          case 'b':
            targetPath = '/bookings'
            break
          case 'm':
            targetPath = '/messages'
            break
          case 'p':
            targetPath = '/profile'
            break
          case 'j':
            targetPath = '/jobs'
            break
          case 's':
            targetPath = '/services'
            break
          default:
            break
        }

        if (targetPath && location.pathname !== targetPath) {
          e.preventDefault()
          navigate(targetPath)
        }

        // Clear buffer after handling
        sequenceBuffer = ''
      }

      // Clear buffer if it gets too long (invalid sequence)
      if (sequenceBuffer.length > 2) {
        sequenceBuffer = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout)
      }
    }
  }, [navigate, location, disabled, onShowHelp, onFocusSearch])
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['g', 'h'], description: 'Go to Home (Dashboard)' },
      { keys: ['g', 'd'], description: 'Go to Discovery' },
      { keys: ['g', 'b'], description: 'Go to Bookings' },
      { keys: ['g', 'm'], description: 'Go to Messages' },
      { keys: ['g', 'p'], description: 'Go to Profile' },
      { keys: ['g', 'j'], description: 'Go to Jobs' },
      { keys: ['g', 's'], description: 'Go to Services' },
    ]
  },
  {
    category: 'Actions',
    shortcuts: [
      { keys: ['/'], description: 'Focus search' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Clear focus / Close modals' },
    ]
  }
]

export default useKeyboardShortcuts
