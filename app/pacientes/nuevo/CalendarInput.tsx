"use client";
import { Calendar } from "@/components/ui/calendar";
import * as React from "react";

type CalendarInputProps = {
  id?: string;
  value?: string;
  onChange?: (date: Date | null) => void;
};

export function CalendarInput({ id, value, onChange }: CalendarInputProps) {
  // Convertir el valor DD-MM-AAAA a Date
  const parseDate = (str?: string) => {
    if (!str) return undefined;
    const [day, month, year] = str.split("-");
    if (!day || !month || !year) return undefined;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };
  const [selected, setSelected] = React.useState<Date | undefined>(parseDate(value));

  React.useEffect(() => {
    setSelected(parseDate(value));
  }, [value]);

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(date) => {
        setSelected(date ?? undefined);
        if (onChange) onChange(date ?? null);
      }}
      id={id}
    />
  );
}
