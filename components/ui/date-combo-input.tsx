"use client";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

function formatDate(date?: Date): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function parseDate(str?: string): Date | undefined {
  if (!str) return undefined;
  const [day, month, year] = str.split("-");
  if (!day || !month || !year) return undefined;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export type DateComboInputProps = {
  id?: string;
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
};

export const DateComboInput: React.FC<DateComboInputProps> = ({ id, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = React.useState(value || "");
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(parseDate(value));

  React.useEffect(() => {
    setInputValue(value || "");
    setSelectedDate(parseDate(value));
  }, [value]);

  // Manejo de input con máscara DD-MM-AAAA
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = val;
    if (val.length > 4) formatted = `${val.slice(0,2)}-${val.slice(2,4)}-${val.slice(4)}`;
    else if (val.length > 2) formatted = `${val.slice(0,2)}-${val.slice(2)}`;
    setInputValue(formatted);
    if (formatted.length === 10) {
      onChange?.(formatted);
      setSelectedDate(parseDate(formatted));
    }
  };

  const handleCalendarSelect = (date?: Date) => {
    if (date) {
      const formatted = formatDate(date);
      setInputValue(formatted);
      setSelectedDate(date);
      onChange?.(formatted);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || "DD-MM-AAAA"}
          maxLength={10}
          autoComplete="off"
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              tabIndex={-1}
              aria-label="Abrir calendario"
            >
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              initialFocus
            />
            <div className="flex justify-end p-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (selectedDate) handleCalendarSelect(selectedDate);
                  else setCalendarOpen(false);
                }}
              >Aceptar</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <span className="text-xs text-muted-foreground">Puedes escribir la fecha o seleccionarla en el calendario</span>
    </div>
  );
};
