import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfDay, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarPickerProps {
  onDateTimeSelect: (date: string, time: string) => void;
  availableHours?: string[]; // e.g., ["09:00", "10:00", "14:00", "15:00"]
  blockedDates?: string[]; // e.g., ["2026-05-15", "2026-05-16"]
  isLoading?: boolean;
}

export function CalendarPicker({
  onDateTimeSelect,
  availableHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  blockedDates = [],
  isLoading = false,
}: CalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);

  // Gerar slots de horário
  const timeSlots: TimeSlot[] = useMemo(() => {
    return availableHours.map((hour) => ({
      time: hour,
      available: true,
    }));
  }, [availableHours]);

  // Validar se data pode ser selecionada
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const dateStr = format(date, "yyyy-MM-dd");

    // Não permitir datas passadas
    if (isBefore(date, today)) {
      return true;
    }

    // Não permitir datas bloqueadas
    if (blockedDates.includes(dateStr)) {
      return true;
    }

    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      onDateTimeSelect(dateStr, selectedTime);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecione uma Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>
          {selectedDate && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Data selecionada:</p>
              <p className="font-semibold text-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione um Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  className={`${
                    selectedTime === slot.time
                      ? "bg-primary hover:bg-primary/90"
                      : slot.available
                        ? "hover:bg-muted"
                        : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.available || isLoading}
                >
                  {slot.time}
                </Button>
              ))}
            </div>

            {selectedTime && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Horário selecionado:</p>
                <p className="font-semibold text-foreground">{selectedTime}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      {selectedDate && selectedTime && (
        <Button
          onClick={handleConfirm}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Confirmando..." : "Confirmar Agendamento"}
        </Button>
      )}
    </div>
  );
}
