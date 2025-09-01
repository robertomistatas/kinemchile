import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Volume2, Bell, Timer } from "lucide-react"

interface ConfiguracionColaProps {
  configuracion: {
    sonidosHabilitados: boolean
    volumen: number
    mostrarTiempos: boolean
    autoAvanzar: boolean
  }
  onActualizar: (nuevaConfig: any) => void
}

export function ConfiguracionCola({ configuracion, onActualizar }: ConfiguracionColaProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempConfig, setTempConfig] = useState(configuracion)

  const handleGuardar = () => {
    onActualizar(tempConfig)
    setIsOpen(false)
  }

  const handleCancelar = () => {
    setTempConfig(configuracion)
    setIsOpen(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>Configuración</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuración de Cola</span>
            </DialogTitle>
            <DialogDescription>
              Personaliza el comportamiento de la cola de espera
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Sonidos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificaciones de Audio</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sonidos">Habilitar sonidos</Label>
                  <Switch
                    id="sonidos"
                    checked={tempConfig.sonidosHabilitados}
                    onCheckedChange={(checked) => 
                      setTempConfig(prev => ({ ...prev, sonidosHabilitados: checked }))
                    }
                  />
                </div>
                
                {tempConfig.sonidosHabilitados && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm">Volumen: {Math.round(tempConfig.volumen * 100)}%</Label>
                    </div>
                    <Slider
                      value={[tempConfig.volumen]}
                      onValueChange={([value]) => 
                        setTempConfig(prev => ({ ...prev, volumen: value }))
                      }
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Display */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Timer className="h-4 w-4" />
                  <span>Visualización</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tiempos">Mostrar tiempos de espera</Label>
                  <Switch
                    id="tiempos"
                    checked={tempConfig.mostrarTiempos}
                    onCheckedChange={(checked) => 
                      setTempConfig(prev => ({ ...prev, mostrarTiempos: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoavanzar">Auto-avanzar estados</Label>
                  <Switch
                    id="autoavanzar"
                    checked={tempConfig.autoAvanzar}
                    onCheckedChange={(checked) => 
                      setTempConfig(prev => ({ ...prev, autoAvanzar: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
