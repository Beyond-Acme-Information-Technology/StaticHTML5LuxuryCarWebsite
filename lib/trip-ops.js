const { randomUUID } = require('crypto');
const { listLeads, patchLead, getLead } = require('./leads-store');
const { sendMail } = require('./mail');
const { siteOrigin } = require('./stripe');
const { getDriver } = require('./drivers-store');

const TRIP_STATUSES = [
  'assigned',
  'accepted',
  'on_my_way',
  'on_location',
  'on_board',
  'completed',
];

const LABELS = {
  assigned: 'Assigned',
  accepted: 'Accepted',
  on_my_way: 'On my Way',
  on_location: 'On Location',
  on_board: 'On Board',
  completed: 'Dropped off',
};

const NEXT = {
  assigned: 'accepted',
  accepted: 'on_my_way',
  on_my_way: 'on_location',
  on_location: 'on_board',
  on_board: 'completed',
};

function liveStatuses() {
  return ['on_my_way', 'on_location', 'on_board'];
}

function isLive(status) {
  return liveStatuses().includes(status);
}

function trackUrl(token) {
  return `${siteOrigin()}/#/track?t=${encodeURIComponent(token)}`;
}

function publicTrip(lead) {
  const trip = lead.meta?.trip || null;
  if (!trip) return null;
  return {
    leadId: lead.id,
    status: trip.status,
    statusLabel: LABELS[trip.status] || trip.status,
    driverName: trip.driverName || '',
    driverPhone: trip.driverPhone || '',
    driverVehicle: trip.driverVehicle || '',
    pickup: lead.meta?.pickup || '',
    dropoff: lead.meta?.dropoff || '',
    guestName: lead.name,
    lastPing: trip.lastPing || null,
    onLocation: trip.onLocation || null,
    dropoffGps: trip.dropoffGps || null,
    live: isLive(trip.status),
    messages: trip.messages || [],
    luggagePhoto: Boolean(trip.luggagePhoto),
    trackToken: trip.trackToken,
    assignedAt: trip.assignedAt,
    completedAt: trip.completedAt,
  };
}

async function notify(email, subject, text) {
  if (!email) return;
  try {
    await sendMail({ to: email, subject, text });
  } catch (err) {
    console.error('trip mail:', err.message);
  }
}

async function assignDriver(leadId, driverId) {
  if (!leadId) throw new Error('Booking is missing');
  if (!String(driverId || '').trim()) {
    throw new Error('Select a chauffeur from the list before assigning');
  }
  const lead = await getLead(leadId);
  const driver = await getDriver(driverId);
  if (!lead) throw new Error('Booking not found');
  if (!driver) throw new Error('Chauffeur not found. Save them on the Chauffeurs tab, then Refresh.');
  const paid = lead.meta?.paymentStatus === 'paid';
  if (!['accepted', 'confirmed'].includes(lead.status) && !paid) {
    throw new Error('Accept or confirm the booking before assigning a chauffeur');
  }
  const trackToken = lead.meta?.trip?.trackToken || randomUUID();
  const trip = {
    ...(lead.meta?.trip || {}),
    status: 'assigned',
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverVehicle: driver.vehicle || '',
    trackToken,
    assignedAt: new Date().toISOString(),
    messages: Array.isArray(lead.meta?.trip?.messages) ? lead.meta.trip.messages : [],
  };
  const updated = await patchLead(leadId, { meta: { ...lead.meta, trip } });
  const link = trackUrl(trackToken);
  await notify(
    lead.email,
    'Your chauffeur was assigned',
    `Hello ${lead.name || ''},\n\n${driver.name} is assigned to your trip.\nVehicle: ${driver.vehicle || 'Luxury vehicle'}\nTrack live once they are on the way:\n${link}\n\n— Awesome Luxury Services Group LLC`
  );
  if (driver.email) {
    await notify(
      driver.email,
      'New trip assigned',
      `You have a new trip for ${lead.name}.\nPickup: ${lead.meta?.pickup}\nDrop-off: ${lead.meta?.dropoff}\nSign in at ${siteOrigin()}/#/login and open Chauffeur.\n\n— Dispatch`
    );
  }
  return updated;
}

function requireGps(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Turn on location so we can capture GPS');
  }
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('GPS reading looks invalid');
  }
  return { lat: latitude, lon: longitude, at: new Date().toISOString() };
}

async function driverAction(leadId, driverId, { action, lat, lon, message, photo }) {
  const lead = await getLead(leadId);
  if (!lead?.meta?.trip || lead.meta.trip.driverId !== driverId) {
    throw new Error('This trip is not assigned to you');
  }
  let trip = { ...lead.meta.trip };
  const now = new Date().toISOString();

  if (action === 'ping') {
    if (!isLive(trip.status)) throw new Error('Live tracking has ended');
    trip.lastPing = requireGps(lat, lon);
  } else if (action === 'message') {
    const text = String(message || '').trim().slice(0, 500);
    if (!text) throw new Error('Type a short message for the guest');
    trip.messages = [...(trip.messages || []), { at: now, text, from: 'driver' }];
    await notify(
      lead.email,
      'Message from your chauffeur',
      `${trip.driverName}: ${text}\n\nTrack the car: ${trackUrl(trip.trackToken)}\n\n— Awesome Luxury Services Group LLC`
    );
  } else if (action === 'accept') {
    if (trip.status !== 'assigned') throw new Error('This trip was already accepted');
    trip.status = 'accepted';
    trip.acceptedAt = now;
  } else if (action === 'on_my_way') {
    if (trip.status !== 'accepted') throw new Error('Accept the trip first');
    trip.status = 'on_my_way';
    trip.onMyWayAt = now;
    trip.lastPing = lat != null ? requireGps(lat, lon) : trip.lastPing;
    await notify(
      lead.email,
      'Your chauffeur is on the way',
      `${trip.driverName} is on the way to ${lead.meta?.pickup}.\nWatch live: ${trackUrl(trip.trackToken)}\n\n— Awesome Luxury Services Group LLC`
    );
  } else if (action === 'on_location') {
    if (trip.status !== 'on_my_way') throw new Error('Mark On my Way before On Location');
    trip.status = 'on_location';
    trip.onLocation = requireGps(lat, lon);
    trip.lastPing = trip.onLocation;
    await notify(
      lead.email,
      'Your chauffeur is on location',
      `${trip.driverName} has arrived at pickup and captured GPS.\nThey may call or message you in the app now.\nWatch live: ${trackUrl(trip.trackToken)}\n\n— Awesome Luxury Services Group LLC`
    );
  } else if (action === 'on_board') {
    if (trip.status !== 'on_location') throw new Error('Arrive on location before boarding');
    const data = String(photo || '');
    if (!data.startsWith('data:image/')) {
      throw new Error('Take a luggage photo in the app before marking On Board');
    }
    if (data.length > 450000) {
      throw new Error('Luggage photo is too large. Use the phone camera at normal quality.');
    }
    trip.status = 'on_board';
    trip.onBoardAt = now;
    trip.luggagePhoto = data;
    trip.lastPing = lat != null ? requireGps(lat, lon) : trip.lastPing;
  } else if (action === 'complete') {
    if (trip.status !== 'on_board') throw new Error('Mark On Board before drop-off');
    trip.status = 'completed';
    trip.dropoffGps = requireGps(lat, lon);
    trip.lastPing = trip.dropoffGps;
    trip.completedAt = now;
    await notify(
      lead.email,
      'You have been dropped off',
      `Drop-off GPS was captured and live tracking has ended.\nThank you for riding with Awesome Luxury Services.\n\n— Awesome Luxury Services Group LLC`
    );
  } else {
    throw new Error('Unknown chauffeur action');
  }

  return patchLead(leadId, { meta: { ...lead.meta, trip } });
}

async function tripsForDriver(driverId) {
  const leads = await listLeads();
  return leads.filter((lead) => lead.meta?.trip?.driverId === driverId && lead.meta.trip.status !== 'completed');
}

async function tripByTrackToken(token) {
  if (!token) return null;
  const leads = await listLeads();
  return leads.find((lead) => lead.meta?.trip?.trackToken === token) || null;
}

module.exports = {
  TRIP_STATUSES,
  LABELS,
  NEXT,
  isLive,
  publicTrip,
  assignDriver,
  driverAction,
  tripsForDriver,
  tripByTrackToken,
  trackUrl,
};
