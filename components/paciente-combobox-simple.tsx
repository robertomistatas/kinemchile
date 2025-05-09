"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserPlus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Paciente } from "@/lib/data"

interface PacienteComboboxSimpleProps {
  pacientes: Paciente[]
  selectedPacienteId: string
  onSelect: (pacienteId: string) => void
  onCreateNew?: () => void
  disabled?: boolean
  placeholder?: string
}

export function PacienteComboboxSimple({
  pacientes,
  selectedPacienteId,
  onSelect,
  onCreateNew,
  disabled = false,
  placeholder = "Buscar paciente...",
}: PacienteComboboxSimpleProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Encontrar el paciente seleccionado
  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId)

  // Filtrar pacientes según el término de búsqueda
  const filteredPacientes = React.useMemo(() => {
    if (!searchValue.trim()) return pacientes

    const searchTerm = searchValue.toLowerCase().trim()

    return pacientes.filter((paciente) => {
      // Buscar en nombre completo
      const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase()
      if (nombreCompleto.includes(searchTerm)) return true

      // Buscar en RUT (sin puntos ni guiones)
      const rutLimpio = paciente.rut.replace(/\./g, "").replace(/-/g, "").toLowerCase()
      if (rutLimpio.includes(searchTerm)) return true

      // Buscar en teléfono
      if (paciente.telefono && paciente.telefono.toLowerCase().includes(searchTerm)) return true

      // Buscar en email
      if (paciente.email && paciente.email.toLowerCase().includes(searchTerm)) return true

      return false
    })
  }, [pacientes, searchValue])

  // Verificar datos al montar el componente
  React.useEffect(() => {
    console.log("PacienteComboboxSimple - Pacientes disponibles:", pacientes.length)
    if (pacientes.length > 0) {
      console.log("Primer paciente:", pacientes[0].nombre, pacientes[0].apellido, pacientes[0].rut)
    }
  }, [pacientes])

  return (
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
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
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
                    console.log("Seleccionando paciente:", paciente.id)
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
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
