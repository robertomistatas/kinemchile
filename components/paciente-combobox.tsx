"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Paciente } from "@/lib/data"

interface PacienteComboboxProps {
  pacientes: Paciente[]
  selectedPacienteId: string
  onSelect: (pacienteId: string) => void
  disabled?: boolean
  placeholder?: string
}

export function PacienteCombobox({
  pacientes,
  selectedPacienteId,
  onSelect,
  disabled = false,
  placeholder = "Buscar paciente...",
}: PacienteComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Encontrar el paciente seleccionado
  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId)

  // Filtrar pacientes según el término de búsqueda
  const filteredPacientes = pacientes.filter((paciente) => {
    const searchTerm = searchValue.toLowerCase()
    return (
      paciente.nombre.toLowerCase().includes(searchTerm) ||
      paciente.apellido.toLowerCase().includes(searchTerm) ||
      paciente.rut.toLowerCase().includes(searchTerm) ||
      `${paciente.nombre} ${paciente.apellido}`.toLowerCase().includes(searchTerm)
    )
  })

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
          <CommandInput placeholder={placeholder} value={searchValue} onValueChange={setSearchValue} />
          <CommandList>
            <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
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
                  {paciente.nombre} {paciente.apellido} - {paciente.rut}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
