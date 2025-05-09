"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserPlus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Paciente } from "@/lib/data"

interface PacienteComboboxProps {
  pacientes: Paciente[]
  selectedPacienteId: string
  onSelect: (pacienteId: string) => void
  onCreateNew?: () => void
  disabled?: boolean
  placeholder?: string
}

export function PacienteCombobox({
  pacientes,
  selectedPacienteId,
  onSelect,
  onCreateNew,
  disabled = false,
  placeholder = "Buscar paciente...",
}: PacienteComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [debugMode, setDebugMode] = React.useState(false)

  // Encontrar el paciente seleccionado
  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId)

  // Normalizar texto para búsqueda (eliminar acentos, convertir a minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "") // Eliminar caracteres especiales
      .trim()
  }

  // Filtrar pacientes según el término de búsqueda
  const filteredPacientes = React.useMemo(() => {
    if (!searchValue.trim()) return pacientes

    const searchTerm = normalizeText(searchValue)

    return pacientes.filter((paciente) => {
      // Buscar en nombre completo
      const nombreCompleto = normalizeText(`${paciente.nombre} ${paciente.apellido}`)
      if (nombreCompleto.includes(searchTerm)) return true

      // Buscar en apellido + nombre (formato inverso)
      const apellidoNombre = normalizeText(`${paciente.apellido} ${paciente.nombre}`)
      if (apellidoNombre.includes(searchTerm)) return true

      // Buscar en RUT (sin puntos ni guiones para facilitar la búsqueda)
      const rutLimpio = paciente.rut.replace(/\./g, "").replace(/-/g, "").toLowerCase()
      const searchTermLimpio = searchTerm.replace(/\./g, "").replace(/-/g, "")
      if (rutLimpio.includes(searchTermLimpio)) return true

      // Buscar en teléfono (eliminar espacios y símbolos)
      if (paciente.telefono) {
        const telefonoLimpio = paciente.telefono.replace(/[\s\-+]/g, "").toLowerCase()
        const searchTermTelefono = searchTerm.replace(/[\s\-+]/g, "")
        if (telefonoLimpio.includes(searchTermTelefono)) return true
      }

      // Buscar en email
      if (paciente.email) {
        const emailLimpio = paciente.email.toLowerCase()
        if (emailLimpio.includes(searchTerm)) return true
      }

      return false
    })
  }, [pacientes, searchValue])

  // Para depuración
  React.useEffect(() => {
    if (debugMode) {
      console.log("Pacientes disponibles:", pacientes.length)
      console.log("Término de búsqueda:", searchValue)
      console.log("Pacientes filtrados:", filteredPacientes.length)

      if (searchValue.trim() && filteredPacientes.length === 0) {
        console.log("No se encontraron coincidencias para:", searchValue)
        console.log(
          "Primeros 5 pacientes disponibles:",
          pacientes.slice(0, 5).map((p) => ({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            rut: p.rut,
            telefono: p.telefono,
            email: p.email,
          })),
        )
      }
    }
  }, [pacientes, searchValue, filteredPacientes, debugMode])

  // Activar modo debug con doble clic en el botón de búsqueda
  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
    console.log("Modo debug:", !debugMode)
    if (!debugMode) {
      console.log("Pacientes totales:", pacientes.length)
      if (pacientes.length > 0) {
        console.log("Ejemplo de paciente:", pacientes[0])
      }
    }
  }

  return (
    <div className="relative w-full">
      {debugMode && (
        <div className="absolute -top-6 left-0 right-0 bg-yellow-100 text-xs p-1 rounded">
          Modo debug: {pacientes.length} pacientes | Filtrados: {filteredPacientes.length}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedPaciente
              ? `${selectedPaciente.nombre} ${selectedPaciente.apellido} - ${selectedPaciente.rut}`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" onDoubleClick={toggleDebugMode} />
              <CommandInput
                placeholder={placeholder}
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex-1"
              />
            </div>
            <CommandList>
              <CommandEmpty>
                <div className="py-3 px-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No se encontraron pacientes.</p>
                  {debugMode && (
                    <div className="text-xs text-left bg-gray-100 p-2 mb-2 rounded">
                      <p>Término de búsqueda: "{searchValue}"</p>
                      <p>Total pacientes: {pacientes.length}</p>
                      <p>Intente buscar por: nombre, apellido, RUT, teléfono o email</p>
                    </div>
                  )}
                  {onCreateNew && (
                    <Button variant="outline" size="sm" onClick={onCreateNew} className="w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Paciente nuevo
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {filteredPacientes.map((paciente) => (
                  <CommandItem
                    key={paciente.id}
                    value={`${paciente.nombre} ${paciente.apellido} ${paciente.rut}`}
                    onSelect={() => {
                      onSelect(paciente.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedPacienteId === paciente.id ? "opacity-100" : "opacity-0")}
                    />
                    <div className="flex flex-col">
                      <span>
                        {paciente.nombre} {paciente.apellido} - {paciente.rut}
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {paciente.telefono && <span>Tel: {paciente.telefono}</span>}
                        {paciente.email && <span>Email: {paciente.email}</span>}
                        {paciente.prevision && <span>Previsión: {paciente.prevision}</span>}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
