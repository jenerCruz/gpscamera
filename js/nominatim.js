const BASE = "https://nominatim.openstreetmap.org/reverse";
const EMAIL = "pamecoaxaca.telcel@gmail.com";

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat, lon,
    "accept-language": "es",
    email: EMAIL
  });

  const res = await fetch(`${BASE}?${params}`);
  const data = await res.json();

  const addr = data.address || {};

  const parts = [
    addr.road,
    addr.suburb,
    addr.city,
    addr.state,
    addr.postcode
  ].filter(Boolean);

  return {
    line1: parts.length ? parts.join(", ") : data.display_name,
    full: data
  };
}
