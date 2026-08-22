const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ['00', '15', '30', '45'];
const QUICK_TIMES = [
  { label: '5:00 AM', value: '05:00' },
  { label: '6:30 AM', value: '06:30' },
  { label: '8:00 AM', value: '08:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
];

const selectClass =
  'flex-1 bg-black border border-[#D4AF37]/30 px-3 py-3 text-white focus:border-[#D4AF37] focus:outline-none';

function parseTime(value: string) {
  const [hourPart, minutePart] = (value || '').split(':');
  const hour24 = Number(hourPart);
  if (!Number.isFinite(hour24) || !minutePart) {
    return { hour12: '', minute: '', period: '' as '' | 'AM' | 'PM' };
  }
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12: String(hour12), minute: minutePart, period };
}

function toValue(hour12: string, minute: string, period: 'AM' | 'PM') {
  let hour = Number(hour12) % 12;
  if (period === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}

export function formatPickupTime(value: string) {
  const parsed = parseTime(value);
  if (!parsed.hour12 || !parsed.period) return '';
  return `${parsed.hour12}:${parsed.minute} ${parsed.period}`;
}

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function TimePicker({ value, onChange, error }: TimePickerProps) {
  const parsed = parseTime(value);

  function update(next: { hour12?: string; minute?: string; period?: 'AM' | 'PM' }) {
    const hour12 = next.hour12 ?? parsed.hour12;
    const minute = next.minute ?? parsed.minute;
    const period = next.period || parsed.period;
    if (!hour12 || !minute || !period) return;
    onChange(toValue(hour12, minute, period));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_TIMES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`px-3 py-1.5 text-sm border transition-colors ${
              value === item.value
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'border-[#D4AF37]/40 text-gray-300 hover:border-[#D4AF37] hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          aria-label="Hour"
          className={selectClass}
          value={parsed.hour12}
          onChange={(e) => update({ hour12: e.target.value, minute: parsed.minute || '00', period: parsed.period || 'AM' })}
        >
          <option value="">Hour</option>
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <select
          aria-label="Minutes"
          className={selectClass}
          value={parsed.minute}
          onChange={(e) => update({ minute: e.target.value, hour12: parsed.hour12 || '10', period: parsed.period || 'AM' })}
        >
          <option value="">Min</option>
          {MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
        <select
          aria-label="AM or PM"
          className={selectClass}
          value={parsed.period}
          onChange={(e) =>
            update({
              period: e.target.value as 'AM' | 'PM',
              hour12: parsed.hour12 || '10',
              minute: parsed.minute || '00',
            })
          }
        >
          <option value="">AM/PM</option>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
