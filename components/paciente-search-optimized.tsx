"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserPlus, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Paciente } from "@/lib/data"

interface PacienteSearchOptimizedProps {
  pacientes: Paciente[]
  selectedPacienteId: string
  onSelect: (pacienteId: string) => void
  onCreateNew?: () => void
  disabled?: boolean
  placeholder?: string
  loading?: boolean
}

export function PacienteSearchOptimized({
  pacientes,
  selectedPacienteId,
  onSelect,
  onCreateNew,
  disabled = false,
  placeholder = "Buscar paciente...",
  loading = false,
}: PacienteSearchOptimizedProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [filteredPacientes, setFilteredPacientes] = React.useState<Paciente[]>([])
  const [isFiltering, setIsFiltering] = React.useState(false)
  const [showAll, setShowAll] = React.useState(false)

  // Encontrar el paciente seleccionado
  const selectedPaciente = React.useMemo(() => {
    return pacientes.find((p) => p.id === selectedPacienteId)
  }, [pacientes, selectedPacienteId])

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
  React.useEffect(() => {
    if (!searchValue.trim() && !showAll) {
      setFilteredPacientes([])
      return
    }

    setIsFiltering(true)

    // Usar setTimeout para no bloquear la UI durante la búsqueda
    const timeoutId = setTimeout(() => {
      try {
        const searchTerm = normalizeText(searchValue)
        console.log("Buscando término:", searchTerm)

        let results: Paciente[] = []

        if (showAll) {
          // Mostrar todos los pacientes, pero limitar a 100 para rendimiento
          results = pacientes.slice(0, 100)
        } else if (searchTerm.length >= 2) {
          // Solo buscar si hay al menos 2 caracteres
          results = pacientes.filter((paciente) => {
            // Verificar que el paciente tenga los campos necesarios
            if (!paciente || !paciente.nombre || !paciente.apellido) {
              return false
            }

            try {
              // Buscar en nombre completo
              const nombreCompleto = normalizeText(`${paciente.nombre} ${paciente.apellido}`)
              if (nombreCompleto.includes(searchTerm)) return true

              // Buscar en apellido + nombre (formato inverso)
              const apellidoNombre = normalizeText(`${paciente.apellido} ${paciente.nombre}`)
              if (apellidoNombre.includes(searchTerm)) return true

              // Buscar en RUT (sin puntos ni guiones para facilitar la búsqueda)
              if (paciente.rut) {
                const rutLimpio = paciente.rut.replace(/\./g, "").replace(/-/g, "").toLowerCase()
                const searchTermLimpio = searchTerm.replace(/\./g, "").replace(/-/g, "")
                if (rutLimpio.includes(searchTermLimpio)) return true
              }

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
            } catch (error) {
              console.error("Error al filtrar paciente:", error, paciente)
              return false
            }
          })
        }

        console.log(`Búsqueda completada: ${results.length} resultados`)
        setFilteredPacientes(results)
      } catch (error) {
        console.error("Error en la búsqueda:", error)
        setFilteredPacientes([])
      } finally {
        setIsFiltering(false)
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchValue, pacientes, showAll])

  // Manejar la apertura del popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Al cerrar, resetear el estado
      setSearchValue("")
      setFilteredPacientes([])
      setShowAll(false)
    }
  }

  // Manejar el clic en "Mostrar todos"
  const handleShowAll = () => {
    setShowAll(true)
    setSearchValue("")
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedPaciente ? (
              <span className="truncate">
                {selectedPaciente.nombre} {selectedPaciente.apellido} - {selectedPaciente.rut}
              </span>
            ) : (
              <span>{loading ? "Cargando pacientes..." : placeholder}</span>
            )}
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={placeholder}
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex-1"
              />
              {isFiltering && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </div>
            <CommandList>
              <CommandEmpty>
                <div className="py-3 px-4 text-center">
                  {searchValue.trim().length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">No se encontraron pacientes.</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Intenta con otro término o verifica que el paciente esté registrado.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        Escribe para buscar o haz clic en "Mostrar todos".
                      </p>
                      <Button variant="outline" size="sm" onClick={handleShowAll} className="mb-2">
                        Mostrar todos los pacientes
                      </Button>
                    </>
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
                    value={`${paciente.nombre} ${paciente.apellido} ${paciente.rut || ""}`}
                    onSelect={() => {
                      console.log("Seleccionando paciente:", paciente.id, paciente.nombre, paciente.apellido)
                      onSelect(paciente.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedPacienteId === paciente.id ? "opacity-100" : "opacity-0")}
                    />
                    <div className="flex flex-col">
                      <span>
                        {paciente.nombre} {paciente.apellido} {paciente.rut ? `- ${paciente.rut}` : ""}
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {paciente.telefono && <span>Tel: {paciente.telefono}</span>}
                        {paciente.email && <span>Email: {paciente.email}</span>}
                        {paciente.prevision && <span>Previsión: {paciente.prevision}</span>}
                      </div>
                    </div>
                  </CommandItem>
                ))}
                {filteredPacientes.length > 0 && filteredPacientes.length === 100 && showAll && (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    Mostrando los primeros 100 pacientes. Usa la búsqueda para resultados más específicos.
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
