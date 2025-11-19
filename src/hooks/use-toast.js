/**
 * Simple Toast Hook
 * Temporary implementation using browser alerts
 * TODO: Replace with proper toast UI component in Phase 6
 */

export const useToast = () => {
  const toast = ({ title, description, variant }) => {
    const message = description ? `${title}\n${description}` : title

    if (variant === 'destructive') {
      console.error('Error:', message)
      alert(`Error: ${message}`)
    } else {
      console.log('Success:', message)
      alert(message)
    }
  }

  return { toast }
}
