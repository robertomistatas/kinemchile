import { useEffect, useRef } from 'react'

interface NotificationSoundProps {
  enabled: boolean
  volume?: number
}

export function NotificationSound({ enabled, volume = 0.5 }: NotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Crear el elemento de audio para notificaciones
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
      // Usar un sonido de notificación simple (puedes reemplazar por tu propio archivo)
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+L1umkfCaWF'
      audioRef.current.volume = volume
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null
      }
    }
  }, [volume])

  const playNotification = () => {
    if (enabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    }
  }

  return {
    playNotification
  }
}
