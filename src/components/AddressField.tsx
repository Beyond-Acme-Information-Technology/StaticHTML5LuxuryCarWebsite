import { useEffect, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { apiUrl } from '@/utils/siteUrl';
import { searchCaliforniaPlaces, type PlaceSuggestion } from '@/data/californiaPlaces';

type Place = PlaceSuggestion;

const fieldClass =
  'w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none';

function readSession(query: string): Place[] | null {
  try {
    const raw = sessionStorage.getItem(`alsPlace:${query.toLowerCase()}`);
    if (!raw) return null;
    return JSON.parse(raw) as Place[];
  } catch {
    return null;
  }
}

function writeSession(query: string, places: Place[]) {
  try {
    sessionStorage.setItem(`alsPlace:${query.toLowerCase()}`, JSON.stringify(places));
  } catch {
    // quota
  }
}

type AddressFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  'aria-label'?: string;
};

export default function AddressField({
  value,
  onChange,
  placeholder,
  required,
  className,
  'aria-label': ariaLabel,
}: AddressFieldProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (pickedRef.current) {
      pickedRef.current = false;
      setPlaces([]);
      setOpen(false);
      return;
    }
    if (query.length < 2) {
      setPlaces([]);
      setOpen(false);
      return;
    }

    const local = searchCaliforniaPlaces(query, 8);
    const cached = readSession(query);
    const first = cached?.length ? cached : local;
    if (first.length) {
      setPlaces(first);
      setOpen(true);
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl('/api/places')}?q=${encodeURIComponent(query)}`);
        const json = await res.json().catch(() => ({ places: [] }));
        const next = Array.isArray(json.places) ? json.places : local;
        setPlaces(next);
        if (next.length) {
          writeSession(query, next);
          setOpen(true);
        }
        setActive(0);
      } catch {
        setPlaces(cached || local);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(handle);
  }, [value]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function choose(place: Place) {
    pickedRef.current = true;
    onChange(place.label);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className={`relative ${className || ''}`}>
      <input
        value={value}
        onChange={(e) => {
          pickedRef.current = false;
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => places.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !places.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % places.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i - 1 + places.length) % places.length);
          } else if (e.key === 'Enter' && places[active]) {
            e.preventDefault();
            choose(places[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        required={required}
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        role="combobox"
        className={fieldClass}
        placeholder={placeholder}
      />
      {open && (places.length > 0 || loading) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[80] left-0 right-0 mt-1 max-h-64 overflow-auto bg-[#111] border border-[#D4AF37] shadow-xl"
        >
          {loading && !places.length && (
            <li className="px-4 py-3 text-gray-400 text-sm">Looking up California addresses…</li>
          )}
          {places.map((place, index) => (
            <li key={`${place.label}-${index}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`w-full text-left px-4 py-3 flex items-start gap-2 ${
                  index === active ? 'bg-[#D4AF37]/20 text-white' : 'text-gray-200 hover:bg-[#D4AF37]/10'
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(place)}
              >
                <MapPin size={16} className="text-[#D4AF37] mt-1 shrink-0" />
                <span>
                  <span className="block">{place.label}</span>
                  {place.hint && <span className="block text-xs text-gray-500 mt-0.5">{place.hint}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
