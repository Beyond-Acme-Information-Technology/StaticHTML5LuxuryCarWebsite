export const COMPANY = {
  legalName: 'Awesome Luxury Services Group LLC',
  shortName: 'Awesome Luxury Services',
  tagline: 'Where luxury meets legacy',
  domain: 'https://awesomeservicesgroups.com',
  email: 'awesomeluxuryservices@gmail.com',
  phoneDisplay: '+1 (408) 805-4386',
  phoneTel: '+14088054386',
  addressLine1: '1505 Bayshore Hwy. Suite A',
  addressLine2: 'Burlingame, CA 94010',
  city: 'Burlingame',
  region: 'San Francisco Bay Area',
  country: 'United States',
  mapsQuery: '1505 Bayshore Hwy Suite A, Burlingame, CA 94010',
  timezone: 'Pacific Time',
  officeHours: 'Office Hours: 8:00 AM – 8:00 PM PT',
  serviceHours: 'Monday – Sunday: 24 Hours',
} as const;

export const FULL_ADDRESS = `${COMPANY.addressLine1}, ${COMPANY.addressLine2}, ${COMPANY.country}`;

export const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.mapsQuery)}&z=15&output=embed`;

export const VEHICLE_TYPES = [
  'Mercedes-Benz S-Class',
  'BMW 7 Series',
  'Audi A8',
  'Range Rover Autobiography',
  'Tesla Model S',
  'Cadillac Escalade ESV',
] as const;

export const SERVICE_TYPES = [
  { id: 'airport', label: 'Airport Transfer' },
  { id: 'point-to-point', label: 'Point to Point' },
  { id: 'hourly', label: 'Hourly / As Directed' },
  { id: 'event', label: 'Wedding / Special Event' },
  { id: 'corporate', label: 'Corporate Travel' },
] as const;

export const CONTACT_SUBJECTS = [
  { id: 'booking', label: 'Booking Inquiry' },
  { id: 'general', label: 'General Question' },
  { id: 'corporate', label: 'Corporate Services' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'other', label: 'Other' },
] as const;

export const AIRPORTS = [
  { id: 'SFO', label: 'San Francisco International (SFO)' },
  { id: 'SJC', label: 'San Jose Mineta (SJC)' },
  { id: 'OAK', label: 'Oakland International (OAK)' },
] as const;
