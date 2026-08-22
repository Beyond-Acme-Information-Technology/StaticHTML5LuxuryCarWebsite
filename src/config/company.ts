export const COMPANY = {
  legalName: 'Awesome Luxury Services Group LLC',
  shortName: 'Awesome Luxury Services',
  tagline: 'Where luxury meets legacy',
  domain: 'https://www.awesomeservicesgroups.com',
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
  yelpUrl: 'https://www.yelp.com/biz/awesome-luxury-services-burlingame',
  yelpRating: '5.0',
  yelpReviewCount: 3,
} as const;

export const FULL_ADDRESS = `${COMPANY.addressLine1}, ${COMPANY.addressLine2}, ${COMPANY.country}`;

export const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.mapsQuery)}&z=15&output=embed`;

export const VEHICLE_OPTIONS = [
  { name: 'Mercedes-Benz S-Class', kind: 'Executive sedan', seats: 3 },
  { name: 'BMW 7 Series', kind: 'Luxury sedan', seats: 3 },
  { name: 'Audi A8', kind: 'Premium sedan', seats: 3 },
  { name: 'Range Rover Autobiography', kind: 'Luxury SUV', seats: 6 },
  { name: 'Tesla Model S', kind: 'Electric luxury', seats: 4 },
  { name: 'Cadillac Escalade ESV', kind: 'Executive SUV', seats: 7 },
  { name: 'Party Bus', kind: 'Nightlife / events', seats: 22 },
] as const;

export const VEHICLE_TYPES = VEHICLE_OPTIONS.map((vehicle) => vehicle.name);

export const RIDE_CATEGORIES = [
  { id: 'regular', label: 'Regular / luxury chauffeur' },
  { id: 'medical_non_urgent', label: 'Non-urgent medical transport' },
  { id: 'patient_equipment', label: 'Patient and equipment transport' },
] as const;

export const SERVICE_TYPES = [
  { id: 'airport', label: 'Airport Transfer', hint: 'SFO, SJC, or Oakland' },
  { id: 'point-to-point', label: 'Point to Point', hint: 'Address to address' },
  { id: 'hourly', label: 'Hourly / As Directed', hint: 'Chauffeur for the day' },
  { id: 'event', label: 'Wedding / Event', hint: 'Ceremonies, parties, party bus' },
  { id: 'corporate', label: 'Corporate Travel', hint: 'Meetings and executives' },
] as const;

export const CONTACT_SUBJECTS = [
  { id: 'booking', label: 'Booking Inquiry' },
  { id: 'general', label: 'General Question' },
  { id: 'corporate', label: 'Corporate Services' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'other', label: 'Other' },
] as const;

export const AIRPORTS = [
  {
    id: 'SFO',
    label: 'San Francisco International (SFO)',
    address: 'San Francisco International Airport (SFO), San Francisco, CA 94128',
  },
  {
    id: 'SJC',
    label: 'San Jose Mineta (SJC)',
    address: 'Norman Y. Mineta San Jose International Airport (SJC), San Jose, CA 95110',
  },
  {
    id: 'OAK',
    label: 'Oakland International (OAK)',
    address: 'Oakland International Airport (OAK), Oakland, CA 94621',
  },
] as const;
