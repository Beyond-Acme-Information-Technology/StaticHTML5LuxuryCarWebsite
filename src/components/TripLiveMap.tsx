type Ping = { lat: number; lon: number; at?: string } | null | undefined;

export default function TripLiveMap({ ping, label, ended }: { ping?: Ping; label?: string; ended?: boolean }) {
  if (ended) {
    return (
      <p className="text-gray-400">
        This trip has ended. Live tracking is off.
        {ping ? ` Last GPS ${ping.lat.toFixed(5)}, ${ping.lon.toFixed(5)}.` : ''}
      </p>
    );
  }
  if (!ping) {
    return <p className="text-gray-500">Live map starts when the chauffeur is on the way.</p>;
  }
  const { lat, lon } = ping;
  const delta = 0.025;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lon}`;
  return (
    <div>
      {label && <p className="text-[#D4AF37] text-sm mb-2">{label}</p>}
      <iframe title={label || 'Live trip map'} src={src} className="w-full h-64 border border-[#D4AF37]/30 bg-black" />
      <p className="text-gray-500 text-sm mt-2">
        {lat.toFixed(5)}, {lon.toFixed(5)}
        {ping.at ? ` · ${new Date(ping.at).toLocaleTimeString()}` : ''}
      </p>
    </div>
  );
}
