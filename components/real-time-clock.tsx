"use client"

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function RealTimeClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    
    return `${dayName} ${day} de ${month}`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg border border-border/50">
      <Clock className="h-4 w-4 text-primary" />
      <div className="flex flex-col text-xs leading-tight">
        <span className="font-medium text-foreground">
          {formatDate(time)}
        </span>
        <span className="font-mono text-muted-foreground">
          {formatTime(time)}
        </span>
      </div>
    </div>
  )
}
