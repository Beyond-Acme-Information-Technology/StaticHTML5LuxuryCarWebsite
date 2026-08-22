import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import 'react-day-picker/dist/style.css';
import './DatePicker.css';

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromISODate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function formatPickupDate(value: string) {
  const date = fromISODate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function DatePicker({ value, onChange, error }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = startOfToday();
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  const selected = value ? fromISODate(value) : undefined;

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Choose pickup date"
            aria-expanded={open}
            className={`w-full bg-black border ${
              error ? 'border-red-500' : 'border-[#D4AF37]/30'
            } px-4 py-3 text-left text-white hover:border-[#D4AF37] focus:border-[#D4AF37] focus:outline-none transition-colors flex items-center justify-between gap-3`}
          >
            <span className={value ? 'text-white' : 'text-gray-500'}>
              {value ? formatPickupDate(value) : 'Tap to open calendar'}
            </span>
            <CalendarIcon size={20} className="text-[#D4AF37] shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto bg-[#111] text-white border-[#D4AF37] z-[80] p-3 rounded-none shadow-2xl"
        >
          <DayPicker
            mode="single"
            className="als-daypicker"
            selected={selected}
            defaultMonth={selected || today}
            onSelect={(date) => {
              if (!date) return;
              onChange(toISODate(date));
              setOpen(false);
            }}
            disabled={{ before: today }}
            fromDate={today}
            toDate={maxDate}
            captionLayout="dropdown"
            fromYear={today.getFullYear()}
            toYear={maxDate.getFullYear()}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
