export function getGeoLocationReal() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(new Error('Geoloc no soportada'));

    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }),
      err => reject(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  });
}
